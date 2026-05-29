// src/modules/users/providers/create-google-user.provider.ts
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateGoogleUserDto } from '../dto/create-google-user.dto';

@Injectable()
export class CreateGoogleUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createGoogleUser(dto: CreateGoogleUserDto): Promise<User> {
    const user = this.usersRepository.create({
      email: dto.email, // ← Yeh zaroori tha
      googleId: dto.googleId,
      role: dto.role || 'MEMBER', // fallback
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      console.error('Create Google User Error:', error);
      throw new RequestTimeoutException('Could not create Google user');
    }
  }
}
