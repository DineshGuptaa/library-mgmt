import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../../common/enum/roles.enum';

export class GoogleTokenDto {
  @ApiProperty({
    description: 'Google ID token',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
