import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { RegisterAuthorDto } from '../dto/register-author.dto';
import { GoogleTokenDto } from '../social/dtos/google-token.dto';
import { UsersService } from '../../users/service/users.service';
import { AuthorService } from '../../author/services/author.service';
import { HashProvider } from './hash.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { GoogleAuthService } from '../social/providers/google-auth.service';
import { Role } from '../../../common/enum/roles.enum';

@Injectable()
export class RegisterAuthorProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly authorService: AuthorService,
    private readonly hashProvider: HashProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async registerByEmail(dto: RegisterAuthorDto, response?: Response) {
    let user = await this.usersService.findUserByEmailOrNull(dto.email);

    // ================= LOGIN =================
    if (user) {
      if (user.role !== Role.AUTHOR) {
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
      role: Role.AUTHOR,
    });

    const author = await this.authorService.createForUser(user);

    const tokens = await this.generateTokenProvider.generateTokens(
      user,
      response,
    );

    return {
      success: true,
      message: 'Account created and logged in successfully',
      data: {
        user: this.sanitizeUser(user),
        author: { id: author.id },
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
      if (user.role !== Role.AUTHOR) {
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
      role: googleTokenDto.role || Role.AUTHOR,
      name: googleUser.name || '',
    });

    const author = await this.authorService.createForUser(user);

    const tokens = await this.generateTokenProvider.generateTokens(
      user,
      response,
    );

    return {
      success: true,
      message: 'Registered via Google successfully',
      data: {
        user: this.sanitizeUser(user),
        author: {
          id: author.id,
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

  

  /**
   * Logs out a user by invalidating their refresh token in the database
   * and clearing authentication cookies from the client browser.
   * * @param userId The unique ID/subject identifier extracted from the JWT payload
   * @param response The Express Response object injected from the controller
   */
  async logout(userId: string | number, response?: Response) {
    // 1. Safety Check: Verify that the response object is defined before interacting with cookies
    if (!response) {
      throw new BadRequestException('HTTP response context is missing.');
    }

    // 2. Database Layer: Set the user's active refresh token to null to invalidate their session
    // This blocks malicious actors from using old refresh tokens even if they stole them
    await this.usersService.updateRefreshToken(userId, null);

    // 3. Cookie Options Configuration
    const clearCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production, false in local development
      sameSite: 'strict' as const,                    // Prevents CSRF attacks; cast to literal type for TS compilation
      path: '/',                                     // Ensures the cookie is removed globally across all backend API paths
    };

    // 4. Client Cleanup: Tell the browser to instantly drop the tracking cookies
    response.clearCookie('accessToken', clearCookieOptions);
    response.clearCookie('refreshToken', clearCookieOptions);

    // 5. Return success payload
    return {
      success: true,
      message: 'Logged out successfully.',
    };
  }

}
