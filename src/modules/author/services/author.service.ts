import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '../entities/author.entity';
import { User } from '../../users/entities/user.entity';
import { UpdateAuthorDto } from '../dto/update-author.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { EsIndexService } from '../../search/services/es-index.service';
import { SearchAuthorsDto } from '../../search/dto/search-authors.dto';
import type { SearchStrategy } from '../../searchdb/providers/search-strategy.provider';
import { SEARCH_STRATEGY } from '../../searchdb/providers/search-strategy.provider';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly esIndexService: EsIndexService,
    @Inject(SEARCH_STRATEGY)
    private readonly searchStrategy: SearchStrategy,
  ) {}

  async createForUser(user: User): Promise<Author> {
    try {
      const existingAuthor = await this.authorRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user'],
      });

      if (existingAuthor) {
        return existingAuthor;
      }

      const author = this.authorRepository.create({
        user: user,
      });

      const saved = await this.authorRepository.save(author);
      await this.indexAuthor(saved);
      return saved;
    } catch (error: any) {
      console.error('AUTHOR CREATE ERROR:', error);

      if (error.code === '23505') {
        throw new ConflictException('Author already exists for this user');
      }

      throw new InternalServerErrorException(
        'Something went wrong while creating author',
      );
    }
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const page = paginationQuery.page ?? 1;
    const limit = paginationQuery.limit ?? 10;

    const searchDto = paginationQuery as SearchAuthorsDto;
    if (searchDto.search) {
      const result = await this.searchStrategy.searchAuthors({
        search: searchDto.search,
        page,
        limit,
      });
      return {
        data: result.data,
        meta: result.meta,
      };
    }

    const [data, total] = await this.authorRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
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

  async findByUserId(userId: number): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!author) {
      throw new NotFoundException(`Author not found for user ID ${userId}`);
    }

    return author;
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  async updateAuthor(id: number, dto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    if (dto.name !== undefined) author.name = dto.name;
    if (dto.bio !== undefined) author.bio = dto.bio;
    const updated = await this.authorRepository.save(author);
    await this.indexAuthor(updated);
    return updated;
  }

  async deleteAuthor(id: number): Promise<void> {
    const author = await this.findOne(id);
    const user = author.user;
    await this.authorRepository.remove(author);
    await this.esIndexService.removeAuthor(id);
    if (user) {
      await this.userRepository.remove(user);
    }
  }

  private async indexAuthor(author: Author) {
    const full = await this.authorRepository.findOne({
      where: { id: author.id },
      relations: ['user'],
    });
    if (!full) return;
    await this.esIndexService.indexAuthor({
      id: full.id,
      name: full.name,
      email: full.user?.email,
      bio: full.bio,
      createdAt: full.createdAt,
      updatedAt: full.updatedAt,
    });
  }
}
