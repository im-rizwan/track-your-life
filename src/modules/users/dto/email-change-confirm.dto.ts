import { z } from 'zod';

export const emailChangeConfirmSchema = z.object({
  body: z.object({
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
  }),
});

export type EmailChangeConfirmDto = z.infer<typeof emailChangeConfirmSchema>['body'];
