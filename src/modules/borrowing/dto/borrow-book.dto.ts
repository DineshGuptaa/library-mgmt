import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BorrowBookDto {
  @ApiProperty({
    description: 'ID of the member who is borrowing the book',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  memberId!: number;

  @ApiProperty({
    description: 'ID of the book being borrowed',
    example: 42,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  bookId!: number;
}