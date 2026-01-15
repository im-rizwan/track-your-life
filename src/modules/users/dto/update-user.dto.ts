import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.email('Invalid email address').optional(),
  }),
  params: z.object({
    id: z.string().cuid('Invalid user ID'),
  }),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>['body'];
export type UpdateUserParams = z.infer<typeof updateUserSchema>['params'];
