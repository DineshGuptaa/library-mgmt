import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipCard } from './entities/membership-card.entity';
import { MembershipCardService } from './services/membership-card.service';
import { MembershipCardController } from '../membership-card/membership-card.controller';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MembershipCard]),
    MemberModule, 
  ],
  providers: [MembershipCardService],
  controllers: [MembershipCardController],
})
export class MembershipCardModule {}