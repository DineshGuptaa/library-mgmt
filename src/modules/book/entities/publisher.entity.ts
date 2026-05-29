import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Book } from './book.entity';

@Entity('publishers')
export class Publisher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150, unique: true })
  name: string;

  @Column({ length: 255, nullable: true })
  website?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Book, (book) => book.publisher)
  books?: Book[];
}
