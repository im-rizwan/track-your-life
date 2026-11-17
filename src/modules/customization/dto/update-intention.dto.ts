import { z } from 'zod';
import { cuidSchema, createSanitizedString } from '../../../core/utils/common-schemas';

export const updateIntentionSchema = z.object({
  params: z.object({
    id: cuidSchema,
  }),
  body: z.object({
    name: createSanitizedString(2, 200),
  }),
});

export type UpdateIntentionDto = z.infer<typeof updateIntentionSchema>['body'];
