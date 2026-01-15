import { User } from '@prisma/client';

// Public user type (excludes sensitive fields)
export type PublicUser = Omit<User, 'password'>;

// User creation data
export interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// User update data
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}
