import { z } from 'zod';
import { cuidSchema, createSanitizedString } from '../../../core/utils/common-schemas';

export const updateSkillTopicSchema = z.object({
  params: z.object({
    skillId: cuidSchema,
    topicId: cuidSchema,
  }),
  body: z.object({
    name: createSanitizedString(2, 100).optional(),
    isPending: z.boolean().optional(),
  }),
});

export type UpdateSkillTopicDto = z.infer<typeof updateSkillTopicSchema>['body'];
