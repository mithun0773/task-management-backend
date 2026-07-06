import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: Role;
}

// The user object attached to the request (req.user)
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  first_name?: string;
  last_name?: string;
}
