import { z } from 'zod';
import { cuidSchema, createSanitizedString } from '../../../core/utils/common-schemas';

export const createSkillTopicSchema = z.object({
  params: z.object({
    skillId: cuidSchema,
  }),
  body: z.object({
    name: createSanitizedString(2, 100),
  }),
});

export type CreateSkillTopicDto = z.infer<typeof createSkillTopicSchema>['body'];
