import { z } from 'zod';
import { createSanitizedString } from '../../../core/utils/common-schemas';

export const createOtherPrayerTypeSchema = z.object({
  body: z.object({
    name: createSanitizedString(2, 100),
    requiresRakahCount: z.boolean(),
  }),
});

export type CreateOtherPrayerTypeDto = z.infer<typeof createOtherPrayerTypeSchema>['body'];
