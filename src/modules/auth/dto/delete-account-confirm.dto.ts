import { z } from 'zod';

export const deleteAccountConfirmSchema = z.object({
  body: z.object({
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
  }),
});

export type DeleteAccountConfirmDto = z.infer<typeof deleteAccountConfirmSchema>['body'];
