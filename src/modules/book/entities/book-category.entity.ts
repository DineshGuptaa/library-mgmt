import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('book_categories')
export class BookCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @ManyToOne(() => BookCategory, (category) => category.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: BookCategory;

  @OneToMany(() => BookCategory, (category) => category.parent)
  children?: BookCategory[];

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
