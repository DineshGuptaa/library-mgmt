import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { RegisterMemberDto } from '../dto/register-member.dto';
import { GoogleTokenDto } from '../social/dtos/google-token.dto';
import { UsersService } from '../../users/service/users.service';
import { MemberService } from '../../member/services/member.service';
import { HashProvider } from './hash.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { GoogleAuthService } from '../social/providers/google-auth.service';
import { Role } from '../../../common/enum/roles.enum';

@Injectable()
export class RegisterMemberProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly memberService: MemberService,
    private readonly hashProvider: HashProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  // =========================
  // 🔥 EMAIL LOGIN / REGISTER
  // =========================
  async registerByEmail(dto: RegisterMemberDto, response?: Response) {
    let user = await this.usersService.findUserByEmailOrNull(dto.email);

    // ================= LOGIN =================
    if (user) {
      // 🔥 ROLE CHECK
      if (user.role !== Role.MEMBER) {
        throw new UnauthorizedException(
          `This email is already registered as ${user.role}`,
        );
      }
      if (!dto.password) {
        throw new BadRequestException('Password is required to login');
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

      return this.buildResponse('Logged in successfully', user, tokens);
    }

    // ================= REGISTER =================
    if (!dto.password) {
      throw new BadRequestException('Password is required for registration');
    }

    const hashedPassword = await this.hashProvider.hashPassword(dto.password);

    user = await this.usersService.createUser({
      email: dto.email,
      password: hashedPassword,
      role: Role.MEMBER,
    });

    const member = await this.memberService.createForUser(user);

    const tokens = await this.generateTokenProvider.generateTokens(
      user,
      response,
    );

    return {
      success: true,
      message: 'Account created and logged in successfully',
      data: {
        user: this.sanitizeUser(user),
        member: { id: member.id },
        ...tokens,
      },
    };
  }

  // =========================
  // 🔥 GOOGLE LOGIN / REGISTER
  // =========================
  async registerByGoogle(googleTokenDto: GoogleTokenDto, response?: Response) {
    const googleUser = await this.googleAuthService.verifyToken(
      googleTokenDto.token,
    );

    let user = await this.usersService.findUserByEmailOrNull(googleUser.email);

    // ================= LOGIN =================
    if (user) {
      // 🔥 ROLE CHECK
      if (user.role !== Role.MEMBER) {
        throw new UnauthorizedException(
          `This email is already registered as ${user.role}`,
        );
      }

      const tokens = await this.generateTokenProvider.generateTokens(
        user,
        response,
      );

      return this.buildResponse('Logged in via Google', user, tokens);
    }

    // ================= REGISTER =================
    user = await this.usersService.createGoogleUser({
      email: googleUser.email,
      googleId: googleUser.googleId,
      role: googleTokenDto.role || Role.MEMBER,
      name: googleUser.name || '',
    });

    const member = await this.memberService.createForUser(user);

    const tokens = await this.generateTokenProvider.generateTokens(
      user,
      response,
    );

    return {
      success: true,
      message: 'Registered via Google successfully',
      data: {
        user: this.sanitizeUser(user),
        member: {
          id: member.id,
          membershipCard: member.membershipCard,
        },
        ...tokens,
      },
    };
  }

  // =========================
  // 🧠 HELPERS (CLEAN CODE)
  // =========================

  private sanitizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private buildResponse(message: string, user: any, tokens: any) {
    return {
      success: true,
      message,
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }
}
