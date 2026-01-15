import { User } from '@prisma/client';

// Public user type without password
export type PublicUser = Omit<User, 'password'>;

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      correlationId?: string;
    }
  }
}
