import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterAdminDto {
  @ApiProperty({ example: 'admin@library.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
