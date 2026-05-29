import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowingController } from './borrowing.controller';
import { BorrowingService } from './services/borrowing.service';
import { Borrowing } from './entities/borrowing.entity';
import { Member } from '../member/entities/member.entity';
import { Book } from '../book/entities/book.entity';
import { MemberModule } from '../member/member.module';
import { BookModule } from '../book/book.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrowing, Member, Book]),
    MemberModule,
    BookModule,
  ],
  controllers: [BorrowingController],
  providers: [BorrowingService],
  exports: [BorrowingService],
})
export class BorrowingModule {}
