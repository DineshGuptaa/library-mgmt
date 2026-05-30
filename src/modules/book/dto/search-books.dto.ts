import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class SearchBooksDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Search by title or ISBN" })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: "Filter by publisher ID" })
  @IsNumber()
  @IsOptional()
  publisherId?: number;

  @ApiPropertyOptional({ description: "Filter by publish year" })
  @IsNumber()
  @IsOptional()
  publishYear?: number;

  @ApiPropertyOptional({ description: "Filter by author ID" })
  @IsNumber()
  @IsOptional()
  authorId?: number;
}
