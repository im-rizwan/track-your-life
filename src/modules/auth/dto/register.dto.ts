import { z } from 'zod';
import { emailSchema, passwordSchema, createSanitizedString } from '../../../core/utils/common-schemas';

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: createSanitizedString(1, 50).optional(),
    lastName: createSanitizedString(1, 50).optional(),
  }),
});

export type RegisterDto = z.infer<typeof registerSchema>['body'];
