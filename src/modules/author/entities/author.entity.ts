import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BookAuthor } from '../../book/entities/book-author.entity';

@Entity('authors')
export class Author {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.author, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ length: 100, nullable: true }) 
  name?: string;

  @Column({ nullable: true })
  bio?: string;

  @OneToMany(() => BookAuthor, (bookAuthor) => bookAuthor.author)
  bookAuthors?: BookAuthor[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
