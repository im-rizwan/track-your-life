import { z } from 'zod';
import { emailSchema, passwordSchema } from '../../../core/utils/common-schemas';

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export type RegisterDto = z.infer<typeof registerSchema>['body'];
