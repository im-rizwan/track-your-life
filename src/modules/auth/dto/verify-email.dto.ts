import { z } from 'zod';
import { emailSchema } from '../../../core/utils/common-schemas';

export const verifyEmailSchema = z.object({
  body: z.object({
    email: emailSchema,
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
  }),
});

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>['body'];
