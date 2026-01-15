import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
  }),
});

export type RegisterDto = z.infer<typeof registerSchema>['body'];
