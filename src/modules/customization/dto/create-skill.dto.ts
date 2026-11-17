import { z } from 'zod';
import { createSanitizedString } from '../../../core/utils/common-schemas';

export const createSkillSchema = z.object({
  body: z.object({
    name: createSanitizedString(2, 100),
  }),
});

export type CreateSkillDto = z.infer<typeof createSkillSchema>['body'];
