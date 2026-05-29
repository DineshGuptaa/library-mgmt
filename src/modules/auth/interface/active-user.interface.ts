import { Role } from "../../../common/enum/roles.enum";

export interface ActiveUser {
  sub: number;
  email: string;
  role: Role;
}
