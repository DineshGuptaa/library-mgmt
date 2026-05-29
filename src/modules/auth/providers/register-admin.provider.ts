import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { RegisterAdminDto } from '../dto/register-admin.dto';
import { UsersService } from '../../users/service/users.service';
import { HashProvider } from './hash.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { Role } from '../../../common/enum/roles.enum';

@Injectable()
export class RegisterAdminProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashProvider: HashProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
  ) {}

  async loginByEmail(dto: RegisterAdminDto, response?: Response) {
    if (!dto.password) {
      throw new BadRequestException('Password is required');
    }

    const user = await this.usersService.findUserByEmailOrNull(dto.email);

    if (!user) {
      throw new UnauthorizedException('Admin account not found');
    }

    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException(
        `This email is registered as ${user.role}, not as Admin`,
      );
    }

    const isValid = await this.hashProvider.comparePassword(
      dto.password,
      user.password!,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokenProvider.generateTokens(
      user,
      response,
    );

    return {
      success: true,
      message: 'Admin logged in successfully',
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  private sanitizeUser(user: any) {
    return { id: user.id, email: user.email, role: user.role };
  }
}
