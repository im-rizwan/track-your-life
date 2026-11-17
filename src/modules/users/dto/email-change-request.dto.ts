import { z } from 'zod';
import { emailSchema } from '../../../core/utils/common-schemas';

export const emailChangeRequestSchema = z.object({
  body: z.object({
    newEmail: emailSchema,
  }),
});

export type EmailChangeRequestDto = z.infer<typeof emailChangeRequestSchema>['body'];
