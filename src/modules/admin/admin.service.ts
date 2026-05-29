import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/service/users.service';
import { Author } from '../author/entities/author.entity';
import { HashProvider } from '../auth/providers/hash.provider';
import { EmailService } from '../email/email.service';
import { CreateAuthorAdminDto } from './dto/create-author-admin.dto';
import { Role } from '../../common/enum/roles.enum';

const DEFAULT_PASSWORD = 'password123';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly emailService: EmailService,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async createAuthor(dto: CreateAuthorAdminDto) {
    const existing = await this.usersService.findUserByEmailOrNull(dto.email);
    if (existing) {
      throw new ConflictException(
        `A user with email "${dto.email}" already exists`,
      );
    }

    const hashedPassword = await this.hashProvider.hashPassword(DEFAULT_PASSWORD);

    const user = await this.usersService.createUser({
      email: dto.email,
      password: hashedPassword,
      role: Role.AUTHOR,
      isProfileCompleted: true,
    });

    const author = this.authorRepository.create({
      user,
      name: dto.name,
      ...(dto.bio ? { bio: dto.bio } : {}),
    });
    const savedAuthor = await this.authorRepository.save(author);

    try {
      await this.emailService.sendPasswordEmail(dto.email, dto.name, DEFAULT_PASSWORD);
    } catch {
      console.warn(
        `Failed to send email to ${dto.email}. Default password: ${DEFAULT_PASSWORD}`,
      );
    }

    return {
      success: true,
      message: 'Author account created successfully',
      data: {
        user: { id: user.id, email: user.email, role: user.role },
        author: { id: savedAuthor.id, name: dto.name },
      },
    };
  }
}
