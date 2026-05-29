import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class SearchMembersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by member name, email, or phone' })
  @IsString()
  @IsOptional()
  search?: string;
}
