import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../book/entities/book.entity';
import { BookAuthor } from '../book/entities/book-author.entity';
import { BookCategory } from '../book/entities/book-category.entity';
import { Publisher } from '../book/entities/publisher.entity';
import { Author } from '../author/entities/author.entity';
import { Member } from '../member/entities/member.entity';
import { User } from '../users/entities/user.entity';
import { SearchModule } from '../search/es.module';
import { DatabaseSearchStrategy } from './strategies/database-search.strategy';
import { ElasticsearchSearchStrategy } from './strategies/elasticsearch-search.strategy';
import { searchStrategyProvider } from './providers/search-strategy.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BookAuthor, BookCategory, Publisher, Author, Member, User]),
    SearchModule,
  ],
  providers: [
    DatabaseSearchStrategy,
    ElasticsearchSearchStrategy,
    searchStrategyProvider,
  ],
  exports: [searchStrategyProvider],
})
export class SearchdbModule {}
