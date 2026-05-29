import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterAuthorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 8, nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
