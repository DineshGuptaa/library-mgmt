import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { CreateUserProvider } from '../providers/create-user.provider';
import { FindUserByEmailProvider } from '../providers/find-user-by-email.provider';
import { FindUserByIdProvider } from '../providers/find-user-by-id.provider';
import { CreateGoogleUserProvider } from '../providers/create-google-user.provider';
import { CreateGoogleUserDto } from '../dto/create-google-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserProvider: CreateUserProvider,
    private readonly findUserByEmailProvider: FindUserByEmailProvider,
    private readonly findUserByIdProvider: FindUserByIdProvider,
    private readonly createGoogleUserProvider: CreateGoogleUserProvider,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.createUserProvider.createUser(createUserDto);
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.findUserByEmailProvider.findUserByEmail(email);
  }

  async findUserByEmailOrNull(email: string): Promise<User | null> {
    return this.findUserByEmailProvider.findUserByEmailOrNull(email);
  }

  async findUserById(id: number): Promise<User> {
    return this.findUserByIdProvider.findUserById(id);
  }

  async createGoogleUser(dto: CreateGoogleUserDto): Promise<User> {
    return this.createGoogleUserProvider.createGoogleUser(dto);
  }

  async updateRefreshToken(userId: string | number, refreshToken: string | null): Promise<void> {
    // Implementation for updating refresh token
  }
}
