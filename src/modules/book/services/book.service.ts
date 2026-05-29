import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { BookAuthor } from '../entities/book-author.entity';
import { BookCategory } from '../entities/book-category.entity';
import { Publisher } from '../entities/publisher.entity';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { SearchBooksDto } from '../dto/search-books.dto';
import { AuthorService } from '../../author/services/author.service';
import { PaginationProvider } from '../../../common/provider/pagination.provider';
import { EsIndexService } from '../../search/services/es-index.service';
import type { SearchStrategy } from '../../searchdb/providers/search-strategy.provider';
import { SEARCH_STRATEGY } from '../../searchdb/providers/search-strategy.provider';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BookAuthor)
    private readonly bookAuthorRepository: Repository<BookAuthor>,
    @InjectRepository(BookCategory)
    private readonly bookCategoryRepository: Repository<BookCategory>,
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    private readonly authorService: AuthorService,
    private readonly paginationProvider: PaginationProvider,
    private readonly esIndexService: EsIndexService,
    @Inject(SEARCH_STRATEGY)
    private readonly searchStrategy: SearchStrategy,
  ) {}

  async create(createBookDto: CreateBookDto, user: any): Promise<any> {
    try {
      if (!user || !user.sub) {
        throw new UnauthorizedException('Invalid user token');
      }

      const existing = await this.bookRepository.findOne({
        where: { isbn: createBookDto.isbn },
      });
      if (existing) {
        throw new ConflictException(
          `A book with ISBN "${createBookDto.isbn}" already exists`,
        );
      }

      let author: any;

      if (createBookDto.authorId) {
        author = await this.authorService.findOne(createBookDto.authorId);
      } else {
        author = await this.authorService.findByUserId(user.sub);
      }

      const bookData: Partial<Book> = {
        title: createBookDto.title,
        isbn: createBookDto.isbn,
        publishYear: createBookDto.publishYear,
        imageUrlS: createBookDto.imageUrlS,
        imageUrlM: createBookDto.imageUrlM,
        imageUrlL: createBookDto.imageUrlL,
        author: author,
      };

      if (createBookDto.categoryId) {
        bookData.category = { id: createBookDto.categoryId } as any;
      }
      if (createBookDto.publisherId) {
        bookData.publisher = { id: createBookDto.publisherId } as any;
      }

      const book = this.bookRepository.create(bookData);
      const savedBook = await this.bookRepository.save(book);

      await this.indexBook(savedBook);

      return {
        id: savedBook.id,
        title: savedBook.title,
        isbn: savedBook.isbn,
        publishYear: savedBook.publishYear,
        authorId: savedBook.author?.id,
        imageUrlS: savedBook.imageUrlS,
        imageUrlM: savedBook.imageUrlM,
        imageUrlL: savedBook.imageUrlL,
        createdAt: savedBook.createdAt,
        updatedAt: savedBook.updatedAt,
      };
    } catch (error: any) {
      console.error('CREATE BOOK ERROR:', error);

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      if (error.code === '23505') {
        throw new ConflictException(
          'Duplicate entry — the book ID sequence may be out of sync. Run: SELECT setval(\'books_id_seq\', (SELECT MAX(id) FROM books))',
        );
      }

      throw new InternalServerErrorException(
        error.message || 'Something went wrong while creating book',
      );
    }
  }

  async findAll(paginationQuery: SearchBooksDto): Promise<any> {
    try {
      const page = paginationQuery.page ?? 1;
      const limit = paginationQuery.limit ?? 10;

      if (paginationQuery.search || paginationQuery.publisherId || paginationQuery.publishYear) {
        const result = await this.searchStrategy.searchBooks({
          search: paginationQuery.search,
          publisherId: paginationQuery.publisherId,
          publishYear: paginationQuery.publishYear,
          page,
          limit,
        });

        return {
          data: result.data,
          meta: result.meta,
        };
      }

      const query = this.bookRepository
        .createQueryBuilder('book')
        .leftJoinAndSelect('book.author', 'author')
        .leftJoinAndSelect('book.category', 'category')
        .leftJoinAndSelect('book.publisher', 'publisher')
        .orderBy('book.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

      const [data, total] = await query.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        data: data.map((book) => ({
          id: book.id,
          title: book.title,
          isbn: book.isbn,
          publishYear: book.publishYear,
          author: book.author
            ? { id: book.author.id, name: book.author.name }
            : null,
          category: book.category
            ? { id: book.category.id, name: book.category.name }
            : null,
          publisher: book.publisher
            ? { id: book.publisher.id, name: book.publisher.name }
            : null,
          imageUrlS: book.imageUrlS,
          imageUrlM: book.imageUrlM,
          imageUrlL: book.imageUrlL,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
        })),
        meta: { totalPages, totalItems: total, itemsPerPage: limit, currentPage: page },
      };
    } catch (error: any) {
      console.log(error);

      throw new InternalServerErrorException('Failed to fetch books');
    }
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: [
        'author',
        'category',
        'publisher',
        'bookAuthors',
        'bookAuthors.author',
      ],
    });
    if (!book) {
      throw new NotFoundException('Book with ID ' + id + ' not found');
    }
    return book;
  }

  async updateBook(id: number, dto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    if (dto.title !== undefined) book.title = dto.title;
    if (dto.isbn !== undefined) book.isbn = dto.isbn;
    if (dto.publishYear !== undefined) book.publishYear = dto.publishYear;
    if (dto.imageUrlS !== undefined) book.imageUrlS = dto.imageUrlS;
    if (dto.imageUrlM !== undefined) book.imageUrlM = dto.imageUrlM;
    if (dto.imageUrlL !== undefined) book.imageUrlL = dto.imageUrlL;
    if (dto.categoryId !== undefined) book.category = { id: dto.categoryId } as any;
    if (dto.publisherId !== undefined) book.publisher = { id: dto.publisherId } as any;
    if (dto.authorId !== undefined) book.author = { id: dto.authorId } as any;
    const updated = await this.bookRepository.save(book);
    await this.indexBook(updated);
    return updated;
  }

  async deleteBook(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
    await this.esIndexService.removeBook(id);
  }

  private async indexBook(book: Book) {
    const full = await this.bookRepository.findOne({
      where: { id: book.id },
      relations: ['author', 'category', 'publisher'],
    });
    if (!full) return;
    await this.esIndexService.indexBook({
      id: full.id,
      title: full.title,
      isbn: full.isbn,
      authorId: full.author?.id,
      authorName: full.author?.name,
      categoryId: full.category?.id,
      categoryName: full.category?.name,
      publisherId: full.publisher?.id,
      publisherName: full.publisher?.name,
      publishYear: full.publishYear,
      imageUrlS: full.imageUrlS,
      imageUrlM: full.imageUrlM,
      imageUrlL: full.imageUrlL,
      createdAt: full.createdAt,
      updatedAt: full.updatedAt,
    });
  }

  async findAllCategories(): Promise<BookCategory[]> {
    return this.bookCategoryRepository.find();
  }

  async findAllPublishers(): Promise<Publisher[]> {
    return this.publisherRepository.find();
  }
}
