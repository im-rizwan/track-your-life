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
  email?: string;
  password?: string;
  displayName?: string;
  age?: number;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isOnboarded?: boolean;
  isEmailVerified?: boolean;
  // Legacy fields (for backward compatibility)
  firstName?: string;
  lastName?: string;
}
