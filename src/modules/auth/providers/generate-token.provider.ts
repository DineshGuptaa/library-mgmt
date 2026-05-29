import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { ActiveUser } from '../interface/active-user.interface';
import { User } from '../../users/entities/user.entity';
import { Response } from 'express';   // ← Yeh add kiya

@Injectable()
export class GenerateTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signToken<T>(
    userId: number,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, ...payload },
      { 
        secret: this.jwtConfiguration.secret, 
        expiresIn 
      },
    );
  }

  /**
   * Updated generateTokens - Cookies + Response Body dono support
   */
  async generateTokens(
    user: User,
    response?: Response,           // ← Optional for cookie support
  ): Promise<{ accessToken: string; refreshToken: string }> {
    
    const payload: ActiveUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user.id, this.jwtConfiguration.accessTokenTtl, payload),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);

    // ================== COOKIE SETUP (Development) ==================
    if (response) {
      // Access Token Cookie
      response.cookie('access_token', accessToken, {
        httpOnly: false,           // Browser JS se access kar sakein (dev)
        secure: false,             // HTTP ke liye false
        sameSite: 'lax',
        maxAge: this.jwtConfiguration.accessTokenTtl * 1000,
      });

      // Refresh Token Cookie
      response.cookie('refresh_token', refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: this.jwtConfiguration.refreshTokenTtl * 1000,
      });
    }

    return { accessToken, refreshToken };
  }
}