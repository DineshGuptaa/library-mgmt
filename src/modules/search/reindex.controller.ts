import { Controller, Post, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../book/entities/book.entity';
import { Author } from '../author/entities/author.entity';
import { Member } from '../member/entities/member.entity';
import { EsIndexService } from './services/es-index.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enum/roles.enum';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('api/v1/search')
export class ReindexController {
  private readonly logger = new Logger(ReindexController.name);

  constructor(
    private readonly esIndexService: EsIndexService,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  @Post('reindex')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reindex all data into Elasticsearch (ADMIN only)' })
  async reindex() {
    const books = await this.bookRepository.find({
      relations: ['author', 'category', 'publisher'],
    });
    const authors = await this.authorRepository.find({
      relations: ['user'],
    });
    const members = await this.memberRepository.find({
      relations: ['user'],
    });

    const bookDocs = books.map((b) => ({
      id: b.id,
      title: b.title,
      isbn: b.isbn,
      authorId: b.author?.id,
      authorName: b.author?.name,
      categoryId: b.category?.id,
      categoryName: b.category?.name,
      publisherId: b.publisher?.id,
      publisherName: b.publisher?.name,
      publishYear: b.publishYear,
      imageUrlS: b.imageUrlS,
      imageUrlM: b.imageUrlM,
      imageUrlL: b.imageUrlL,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

    const authorDocs = authors.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.user?.email,
      bio: a.bio,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    const memberDocs = members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.user?.email,
      phone: m.phone,
      address: m.address,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    await this.esIndexService.reindexAll(bookDocs, authorDocs, memberDocs);

    return {
      success: true,
      message: `Reindexed ${bookDocs.length} books, ${authorDocs.length} authors, ${memberDocs.length} members`,
    };
  }
}
