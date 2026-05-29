import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMemberDto {
  @ApiProperty({ example: "member@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "+1234567890", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: "123 Main St", required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
