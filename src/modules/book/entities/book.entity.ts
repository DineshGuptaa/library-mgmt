import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookCategory } from './book-category.entity';
import { Publisher } from './publisher.entity';
import { Author } from '../../author/entities/author.entity';
import { BookAuthor } from './book-author.entity';
import { Borrowing } from '../../borrowing/entities/borrowing.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 13, unique: true, nullable: true })
  isbn?: string;

  @ManyToOne(() => BookCategory, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: BookCategory;

  @ManyToOne(() => Publisher, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'publisher_id' })
  publisher?: Publisher;

  @ManyToOne(() => Author, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id' })
  author?: Author;

  @Column({ name: 'publish_year', nullable: true })
  publishYear?: number;

  @Column({ type: 'text', name: 'image_url_s', nullable: true })
  imageUrlS?: string;

  @Column({ type: 'text', name: 'image_url_m', nullable: true })
  imageUrlM?: string;

  @Column({ type: 'text', name: 'image_url_l', nullable: true })
  imageUrlL?: string;

  @OneToMany(() => BookAuthor, (bookAuthor) => bookAuthor.book)
  bookAuthors?: BookAuthor[];

  @OneToMany(() => Borrowing, (borrowing) => borrowing.book)
  borrowings?: Borrowing[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
