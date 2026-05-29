import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import { REQUEST_USER_KEY } from '../constants/auth.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found.');
    }

    try {
      // 1. Check if the current incoming request is targeting the logout route
      const isLogoutRoute = request.url.includes('/auth/logout');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtConfiguration.secret,
        ignoreExpiration: isLogoutRoute, // 👈 Set to true if the incoming request URL is '/auth/logout'
      });
      request[REQUEST_USER_KEY] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
