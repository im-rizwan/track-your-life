import { z } from 'zod';
import { emailSchema, passwordSchema } from '../../../core/utils/common-schemas';

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
    newPassword: passwordSchema,
  }),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>['body'];
