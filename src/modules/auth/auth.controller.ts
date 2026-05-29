import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express'; // ← Yeh change kiya (import type)

import { AuthService } from './providers/auth.service';

import { RegisterMemberDto } from './dto/register-member.dto';
import { RegisterAuthorDto } from './dto/register-author.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { GoogleTokenDto } from './social/dtos/google-token.dto';

import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { GetActiveUser } from './get-active-user.decorator';
import type { ActiveUserData } from './guards/active-user-data.interface';

@ApiTags('Auth')
@Auth(AuthType.None)
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ════════════════════════════
  // MEMBER — REGISTER
  // ════════════════════════════
  @Post('member/register')
  @ApiOperation({ summary: 'Register/Login new Member (email + password)' })
  registerMember(
    @Body() dto: RegisterMemberDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.registerMember(dto, response);
  }

  @Post('member/register/google')
  @ApiOperation({ summary: 'Register/Login Member via Google OAuth' })
  registerMemberGoogle(
    @Body() dto: GoogleTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.registerMemberGoogle(dto, response);
  }

  // ════════════════════════════
  // MEMBER — LOGIN
  // ════════════════════════════
  // @Post('member/login')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Member login (email + password)' })
  // loginMember(
  //   @Body() dto: LoginMemberDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   return this.authService.loginMember(dto, response);
  // }

  // @Post('member/login/google')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Member login via Google OAuth' })
  // loginMemberGoogle(
  //   @Body() dto: GoogleTokenDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   return this.authService.loginMemberGoogle(dto, response);
  // }

  // ════════════════════════════
  // AUTHOR — REGISTER
  // ════════════════════════════
  @Post('author/register')
  @ApiOperation({ summary: 'Register/Login new Author (email + password)' })
  registerAuthor(
    @Body() dto: RegisterAuthorDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.registerAuthor(dto, response);
  }

  @Post('author/register/google')
  @ApiOperation({ summary: 'Register/Login new Author via Google OAuth' })
  registerAuthorGoogle(
    @Body() dto: GoogleTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.registerAuthorGoogle(dto, response);
  }

  // ════════════════════════════
  // AUTHOR — LOGIN
  // ════════════════════════════
  // @Post('author/login')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Author login (email + password)' })
  // loginAuthor(
  //   @Body() dto: LoginAuthorDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   return this.authService.loginAuthor(dto, response);
  // }

  // @Post('author/login/google')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Author login via Google OAuth' })
  // loginAuthorGoogle(
  //   @Body() dto: GoogleTokenDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   return this.authService.loginAuthorGoogle(dto, response);
  // }



  // ════════════════════════════
  // ADMIN — LOGIN
  // ════════════════════════════
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login (email + password)' })
  loginAdmin(
    @Body() dto: RegisterAdminDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginAdmin(dto, response);
  }

  // ════════════════════════════
  // LOGOUT
  // ════════════════════════════
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and clear auth cookies' })
  @Auth(AuthType.Bearer) // ← This overrides AuthType.None, protecting this specific route
  async logout(
    @GetActiveUser() user: ActiveUserData,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('Received logout request with DTO:', user.sub); // Debug log to check incoming data
    await this.authService.logout(user.sub, response);
    return { message: 'Logged out successfully' };
  }
}
