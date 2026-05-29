import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Member } from '../../member/entities/member.entity';

@Entity('membership_cards')
export class MembershipCard {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  issueDate!: Date;

  @Column()
  expiryDate!: Date;

  @OneToOne(() => Member, (member) => member.membershipCard)
  @JoinColumn()
  member!: Member;

  @CreateDateColumn()
  createdAt!: Date;
}
