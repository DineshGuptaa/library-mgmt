import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id: number;
}
