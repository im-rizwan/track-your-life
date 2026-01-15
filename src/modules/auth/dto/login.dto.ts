import { z } from 'zod';
import { emailSchema } from '../../../core/utils/common-schemas';

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

export type LoginDto = z.infer<typeof loginSchema>['body'];
