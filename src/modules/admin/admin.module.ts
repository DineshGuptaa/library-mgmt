import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/user.module';
import { Author } from '../author/entities/author.entity';
import { HashProvider } from '../auth/providers/hash.provider';
import { BcryptProvider } from '../auth/providers/bcrypt.provider';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Author]),
    UsersModule,
    EmailModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: HashProvider,
      useClass: BcryptProvider,
    },
  ],
})
export class AdminModule {}
