import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
} from 'class-validator';

export class RegisterMemberDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
