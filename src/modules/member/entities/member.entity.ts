// src/modules/member/entities/member.entity.ts
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
import { MembershipCard } from '../../membership-card/entities/membership-card.entity';
import { Borrowing } from '../../borrowing/entities/borrowing.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty()
  @OneToOne(() => User, (user) => user.member)
  @JoinColumn()
  user!: User;

  @Column({ length: 100, nullable: true }) 
  name?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @OneToOne(() => MembershipCard, (card) => card.member, { cascade: true })
  membershipCard?: MembershipCard;

  @OneToMany(() => Borrowing, (borrowing) => borrowing.member)
  borrowings?: Borrowing[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
