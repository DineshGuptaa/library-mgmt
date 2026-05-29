import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserProvider {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // check if user with same email already exists
    let existingUser: User | null = null;

    try {
      existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });
    } catch {
      throw new RequestTimeoutException('Could not fetch user. Try again.');
    }

    if (existingUser) {
      throw new BadRequestException(
        'A user with this email already exists.',
      );
    }

    // create new user (password hashing done in Auth module)
    const user = this.usersRepository.create(createUserDto);

    try {
      return await this.usersRepository.save(user);
    } catch {
      throw new RequestTimeoutException('Could not save user. Try again.');
    }
  }
}
