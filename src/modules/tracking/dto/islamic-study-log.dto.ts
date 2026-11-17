import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createIslamicStudyLogSchema = z.object({
  body: z.object({
    subjectId: cuidSchema,
    studyModeId: cuidSchema,
    durationMins: z.number().int().min(1),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateIslamicStudyLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    subjectId: cuidSchema.optional(),
    studyModeId: cuidSchema.optional(),
    durationMins: z.number().int().min(1).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listIslamicStudyLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateIslamicStudyLogDto = z.infer<typeof createIslamicStudyLogSchema>['body'];
export type UpdateIslamicStudyLogDto = z.infer<typeof updateIslamicStudyLogSchema>['body'];
