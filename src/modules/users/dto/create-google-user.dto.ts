import { Role } from '../../../common/enum/roles.enum';

export class CreateGoogleUserDto {
  name!: string;
  email!: string;
  googleId!: string;
  role!: Role;
}