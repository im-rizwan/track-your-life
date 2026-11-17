import { z } from 'zod';
import { emailSchema } from '../../../core/utils/common-schemas';

export const resendOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export type ResendOtpDto = z.infer<typeof resendOtpSchema>['body'];
