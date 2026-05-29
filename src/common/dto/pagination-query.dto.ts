import { IsOptional, isPositive, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  limit?: number;
  
  @IsOptional()
  @IsPositive()
  page?: number;
}
