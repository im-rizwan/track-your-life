import { z } from 'zod';
import { cuidSchema, createSanitizedString } from '../../../core/utils/common-schemas';

export const updateSkillSchema = z.object({
  params: z.object({
    id: cuidSchema,
  }),
  body: z.object({
    name: createSanitizedString(2, 100),
  }),
});

export type UpdateSkillDto = z.infer<typeof updateSkillSchema>['body'];
