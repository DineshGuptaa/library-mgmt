import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Role } from "../../../common/enum/roles.enum";

export class CreateUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "hashedPassword" })
  @IsString()
  password?: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role, { message: 'Invalid role chosen' })
  role!: Role;

  googleId?: string;

  isProfileCompleted?: boolean;
}
