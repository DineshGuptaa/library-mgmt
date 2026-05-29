// src/modules/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { Author } from '../../author/entities/author.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  MEMBER = 'MEMBER',
  AUTHOR = 'AUTHOR',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty()
  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ type: 'enum', enum: Role })
  role!: Role;

  @Column({ default: false })
  isProfileCompleted!: boolean;

  @ApiProperty()
  @OneToOne(() => Member, (member) => member.user, { cascade: true })
  member?: Member;

  @OneToOne(() => Author, (author) => author.user, { cascade: true })
  author?: Author;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}