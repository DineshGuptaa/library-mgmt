import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateBookDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  publishYear?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  authorId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  publisherId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrlS?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrlM?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrlL?: string;
}
