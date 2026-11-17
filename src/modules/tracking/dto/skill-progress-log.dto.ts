import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createSkillProgressLogSchema = z.object({
  body: z.object({
    skillId: cuidSchema,
    skillTopicId: cuidSchema.optional(),
    progress: z.number().int().min(0).max(100),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateSkillProgressLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    skillId: cuidSchema.optional(),
    skillTopicId: cuidSchema.optional(),
    progress: z.number().int().min(0).max(100).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listSkillProgressLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateSkillProgressLogDto = z.infer<typeof createSkillProgressLogSchema>['body'];
export type UpdateSkillProgressLogDto = z.infer<typeof updateSkillProgressLogSchema>['body'];
