// interfaces/active-user-data.interface.ts
import { Role } from '../../../common/enum/roles.enum'; // Adjust path to your Roles enum

export interface ActiveUserData {
  /**
   * The subject ID of the user (User ID in database)
   */
  sub: number | string;
  
  /**
   * The user's registered email
   */
  email: string;

  /**
   * The role assigned to the user (e.g., AUTHOR, MEMBER)
   */
  role: Role;
}