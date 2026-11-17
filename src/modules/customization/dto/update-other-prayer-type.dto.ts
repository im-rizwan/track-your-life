import { z } from 'zod';
import { cuidSchema, createSanitizedString } from '../../../core/utils/common-schemas';

export const updateOtherPrayerTypeSchema = z.object({
  params: z.object({
    id: cuidSchema,
  }),
  body: z
    .object({
      name: createSanitizedString(2, 100).optional(),
      requiresRakahCount: z.boolean().optional(),
    })
    .refine((data) => data.name !== undefined || data.requiresRakahCount !== undefined, {
      message: 'At least one field must be provided',
    }),
});

export type UpdateOtherPrayerTypeDto = z.infer<typeof updateOtherPrayerTypeSchema>['body'];
