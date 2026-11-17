import { z } from 'zod';
import { createSanitizedString } from '../../../core/utils/common-schemas';

export const createIntentionSchema = z.object({
  body: z.object({
    name: createSanitizedString(2, 200),
  }),
});

export type CreateIntentionDto = z.infer<typeof createIntentionSchema>['body'];
