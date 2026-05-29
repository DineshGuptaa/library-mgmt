import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class SearchAuthorsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by author name or bio' })
  @IsString()
  @IsOptional()
  search?: string;
}
