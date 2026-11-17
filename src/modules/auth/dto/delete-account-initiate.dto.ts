import { z } from 'zod';
import { passwordSchema } from '../../../core/utils/common-schemas';

export const deleteAccountInitiateSchema = z.object({
  body: z.object({
    password: passwordSchema,
    confirmation: z.string().refine((val) => val === 'DELETE', {
      message: 'Confirmation must be exactly "DELETE" (case-sensitive)',
    }),
  }),
});

export type DeleteAccountInitiateDto = z.infer<typeof deleteAccountInitiateSchema>['body'];
