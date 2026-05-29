import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuthorAdminDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'author@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: 'A passionate writer...' })
  @IsString()
  @IsOptional()
  bio?: string;
}
