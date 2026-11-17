import { z } from 'zod';
import { emailSchema } from '../../../core/utils/common-schemas';

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>['body'];
