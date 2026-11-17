import { z } from 'zod';
import { cuidSchema, createSanitizedString } from '../../../core/utils/common-schemas';

export const updateSimpleItemSchema = z.object({
  params: z.object({
    id: cuidSchema,
  }),
  body: z.object({
    name: createSanitizedString(2, 100),
  }),
});

export type UpdateSimpleItemDto = z.infer<typeof updateSimpleItemSchema>['body'];
