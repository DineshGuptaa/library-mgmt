import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './user.controller';
import { UsersService } from './service/users.service';
import { CreateUserProvider } from './providers/create-user.provider';
import { FindUserByEmailProvider } from './providers/find-user-by-email.provider';
import { FindUserByIdProvider } from './providers/find-user-by-id.provider';
import { CreateGoogleUserProvider } from './providers/create-google-user.provider';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserProvider,
    FindUserByEmailProvider,
    FindUserByIdProvider,
    CreateGoogleUserProvider,
  ],
  exports: [UsersService], // ← Auth module use karega
})
export class UsersModule {}
