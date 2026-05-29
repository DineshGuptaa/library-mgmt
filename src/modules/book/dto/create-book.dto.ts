import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: '0195153448', description: 'ISBN of the book' })
  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @ApiProperty({ example: 'Clean Code', description: 'Title of the book' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 2008, description: 'Year of publication' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  publishYear?: number;

  @ApiPropertyOptional({ example: 1, description: 'Publisher ID' })
  @IsNumber()
  @IsOptional()
  publisherId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Category ID' })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Author ID to assign (admin only)' })
  @IsNumber()
  @IsOptional()
  authorId?: number;

  @ApiPropertyOptional({ example: 'http://images.amazon.com/images/s.jpg', description: 'Small image URL' })
  @IsString()
  @IsOptional()
  imageUrlS?: string;

  @ApiPropertyOptional({ example: 'http://images.amazon.com/images/m.jpg', description: 'Medium image URL' })
  @IsString()
  @IsOptional()
  imageUrlM?: string;

  @ApiPropertyOptional({ example: 'http://images.amazon.com/images/l.jpg', description: 'Large image URL' })
  @IsString()
  @IsOptional()
  imageUrlL?: string;
}
