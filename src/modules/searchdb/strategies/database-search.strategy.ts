import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../../book/entities/book.entity';
import { Author } from '../../author/entities/author.entity';
import { Member } from '../../member/entities/member.entity';
import { User } from '../../users/entities/user.entity';
import {
  SearchStrategy,
  BookSearchQuery,
  AuthorSearchQuery,
  MemberSearchQuery,
  SearchResult,
} from '../interfaces/search-strategy.interface';

@Injectable()
export class DatabaseSearchStrategy implements SearchStrategy {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async searchBooks(query: BookSearchQuery): Promise<SearchResult<any>> {
    const page = query.page;
    const limit = query.limit;
    const from = (page - 1) * limit;

    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.category', 'category')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .orderBy('book.createdAt', 'DESC')
      .skip(from)
      .take(limit);

    if (query.search) {
      qb.andWhere(
        '(book.title ILIKE :search OR book.isbn ILIKE :search OR publisher.name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.publisherId) {
      qb.andWhere('publisher.id = :publisherId', {
        publisherId: query.publisherId,
      });
    }

    if (query.publishYear) {
      qb.andWhere('book.publishYear = :publishYear', {
        publishYear: query.publishYear,
      });
    }

    if (query.authorId) {
      qb.andWhere('author.id = :authorId', {
        authorId: query.authorId,
      });
    }

    const [data, total] = await qb.getManyAndCount();
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
  }

  async searchAuthors(query: AuthorSearchQuery): Promise<SearchResult<any>> {
    const page = query.page;
    const limit = query.limit;
    const from = (page - 1) * limit;

    const qb = this.authorRepository
      .createQueryBuilder('author')
      .leftJoinAndSelect('author.user', 'user')
      .orderBy('author.createdAt', 'DESC')
      .skip(from)
      .take(limit);

    if (query.search) {
      qb.andWhere(
        '(author.name ILIKE :search OR author.bio ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.user?.email,
        bio: a.bio,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      meta: { totalPages, totalItems: total, itemsPerPage: limit, currentPage: page },
    };
  }

  async searchMembers(query: MemberSearchQuery): Promise<SearchResult<any>> {
    const page = query.page;
    const limit = query.limit;
    const from = (page - 1) * limit;

    const qb = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.membershipCard', 'membershipCard')
      .orderBy('member.createdAt', 'DESC')
      .skip(from)
      .take(limit);

    if (query.search) {
      qb.andWhere(
        '(member.name ILIKE :search OR user.email ILIKE :search OR member.phone ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.user?.email,
        phone: m.phone,
        address: m.address,
        membershipCard: m.membershipCard,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
      meta: { totalPages, totalItems: total, itemsPerPage: limit, currentPage: page },
    };
  }
}
