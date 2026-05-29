import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Book } from '../book/entities/book.entity';
import { User } from '../users/entities/user.entity';
import { AuthorService } from './services/author.service';
import { AuthorController } from './author.controller';
import { PaginationModule } from '../../common/pagination.module';
import { SearchModule } from '../search/es.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Author, Book, User]),
    PaginationModule,
    SearchModule,
  ],
  providers: [AuthorService],
  controllers: [AuthorController],
  exports: [AuthorService],
})
export class AuthorModule {}
