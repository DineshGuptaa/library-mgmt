import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { Book } from '../../book/entities/book.entity';

@Entity('borrowings')
export class Borrowing {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Member, (member) => member.borrowings, { nullable: false })
  member!: Member;

  @ManyToOne(() => Book, (book) => book.borrowings, { nullable: false })
  book!: Book;

  @Column()
  borrowDate!: Date;

  @Column({ nullable: true })
  returnDate?: Date ;

  @CreateDateColumn()
  createdAt!: Date;
}