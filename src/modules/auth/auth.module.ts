import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';

import { RegisterMemberProvider } from './providers/register-member.provider';
import { RegisterAdminProvider } from './providers/register-admin.provider';

import { GenerateTokenProvider } from './providers/generate-token.provider';
import { HashProvider } from './providers/hash.provider';
import { BcryptProvider } from './providers/bcrypt.provider';

import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthenticationGuard } from './guards/authentication.guard';
import { RolesGuard } from './guards/roles.guard';

import jwtConfig from './config/jwt.config';
import { UsersModule } from '../users/user.module';
import { MemberModule } from '../member/member.module';
import { GoogleAuthModule } from './social/google.module';
import { AuthorModule } from '../author/author.module';
// import { LoginMemberProvider } from "./providers/login-member.provider";
import { RegisterAuthorProvider } from './providers/register-author.provider';
// import { LoginAuthorProvider } from "./providers/login-author.provider";

@Module({
  imports: [
    UsersModule,
    MemberModule,
    AuthorModule,
    GoogleAuthModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,

    // ── Role-based providers ──
    RegisterMemberProvider,
    RegisterAuthorProvider,
    RegisterAdminProvider,

    GenerateTokenProvider,
    AccessTokenGuard,
    AuthenticationGuard,
    RolesGuard,
    {
      provide: HashProvider,
      useClass: BcryptProvider,
    },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService, HashProvider, GenerateTokenProvider, AccessTokenGuard],
})
export class AuthModule {}
