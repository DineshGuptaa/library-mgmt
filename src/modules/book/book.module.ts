import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './services/book.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { BookAuthor } from './entities/book-author.entity';
import { BookCategory } from './entities/book-category.entity';
import { Publisher } from './entities/publisher.entity';
import { Author } from '../author/entities/author.entity';
import { AuthorModule } from '../author/author.module';
import { PaginationModule } from '../../common/pagination.module';
import { SearchdbModule } from '../searchdb/searchdb.module';
import { SearchModule } from '../search/es.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BookAuthor, BookCategory, Publisher, Author]),
    AuthorModule,
    PaginationModule,
    SearchdbModule,
    SearchModule,
  ],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
