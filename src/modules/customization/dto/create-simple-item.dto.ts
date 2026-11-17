import { z } from 'zod';
import { createSanitizedString } from '../../../core/utils/common-schemas';

export const createSimpleItemSchema = z.object({
  body: z.object({
    name: createSanitizedString(2, 100),
  }),
});

export type CreateSimpleItemDto = z.infer<typeof createSimpleItemSchema>['body'];
