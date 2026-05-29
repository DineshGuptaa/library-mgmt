import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../entities/member.entity";
import { MembershipCard } from "../../membership-card/entities/membership-card.entity";
import { User } from "../../users/entities/user.entity";
import { UsersService } from "../../users/service/users.service";
import { HashProvider } from "../../auth/providers/hash.provider";
import { Role } from "../../../common/enum/roles.enum";
import { CreateMemberDto } from "../dto/create-member.dto";
import { UpdateMemberDto } from "../dto/update-member.dto";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { EsSearchService } from "../../search/services/es-search.service";
import { EsIndexService } from "../../search/services/es-index.service";
import { SearchMembersDto } from "../../search/dto/search-members.dto";

const DEFAULT_PASSWORD = "password123";

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(MembershipCard)
    private readonly cardRepository: Repository<MembershipCard>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly usersService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly esSearchService: EsSearchService,
    private readonly esIndexService: EsIndexService,
  ) {}

  // Auth register ke baad auto-call hoga
  async createForUser(user: User): Promise<Member> {
    try {
      const issueDate = new Date();
      const expiryDate = new Date(issueDate);
      expiryDate.setFullYear(issueDate.getFullYear() + 1);

      const member = this.memberRepository.create({
        user,
        membershipCard: {
          issueDate,
          expiryDate,
        },
      });

      const saved = await this.memberRepository.save(member);
      await this.indexMember(saved);
      return saved;
    } catch (error: any) {
      if (error.code === "23505") {
        throw new ConflictException("Member already exists for this user");
      }
      throw new InternalServerErrorException(
        "Something went wrong while creating member",
      );
    }
  }

  async createByAdmin(dto: CreateMemberDto): Promise<Member> {
    const existingUser = await this.usersService.findUserByEmailOrNull(dto.email);
    if (existingUser) {
      throw new ConflictException(
        `A user with email "${dto.email}" already exists`,
      );
    }

    const hashedPassword = await this.hashProvider.hashPassword(DEFAULT_PASSWORD);

    const user = await this.usersService.createUser({
      email: dto.email,
      password: hashedPassword,
      role: Role.MEMBER,
      isProfileCompleted: true,
    });

    const issueDate = new Date();
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(issueDate.getFullYear() + 1);

    const member = this.memberRepository.create({
      user,
      name: dto.name,
      phone: dto.phone,
      address: dto.address,
      membershipCard: {
        issueDate,
        expiryDate,
      },
    });

    const saved = await this.memberRepository.save(member);
    await this.indexMember(saved);
    return saved;
  }

  async updateMember(id: number, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id);
    if (dto.name !== undefined) member.name = dto.name;
    if (dto.phone !== undefined) member.phone = dto.phone;
    if (dto.address !== undefined) member.address = dto.address;
    const updated = await this.memberRepository.save(member);
    await this.indexMember(updated);
    return updated;
  }

  async deleteMember(id: number): Promise<void> {
    const member = await this.findOne(id);
    const user = member.user;
    await this.memberRepository.remove(member);
    await this.esIndexService.removeMember(id);
    if (user) {
      await this.userRepository.remove(user);
    }
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 10;

    const searchDto = paginationQuery as SearchMembersDto;
    if (searchDto.search) {
      const esResult = await this.esSearchService.searchMembers({
        search: searchDto.search,
        page,
        limit,
      });
      return {
        data: esResult.data,
        meta: esResult.meta,
      };
    }

    const [data, total] = await this.memberRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ["user", "membershipCard"],
      order: { createdAt: "DESC" },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        currentPage: page,
      },
    };
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ["user", "membershipCard", "borrowings"],
    });
    if (!member) {
      throw new NotFoundException("Member with ID " + id + " not found");
    }
    return member;
  }

  async findByUserId(userId: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user", "membershipCard"],
    });
    if (!member) {
      throw new NotFoundException("No member profile found for this user");
    }
    return member;
  }

  private async indexMember(member: Member) {
    const full = await this.memberRepository.findOne({
      where: { id: member.id },
      relations: ['user'],
    });
    if (!full) return;
    await this.esIndexService.indexMember({
      id: full.id,
      name: full.name,
      email: full.user?.email,
      phone: full.phone,
      address: full.address,
      createdAt: full.createdAt,
      updatedAt: full.updatedAt,
    });
  }
}
