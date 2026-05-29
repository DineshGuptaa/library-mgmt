import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Book } from './book.entity';
import { Author } from '../../author/entities/author.entity';

@Entity('book_authors')
export class BookAuthor {
  @PrimaryColumn({ name: 'book_id' })
  bookId: number;

  @PrimaryColumn({ name: 'author_id' })
  authorId: number;

  @ManyToOne(() => Book, (book) => book.bookAuthors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => Author, (author) => author.bookAuthors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: Author;
}
