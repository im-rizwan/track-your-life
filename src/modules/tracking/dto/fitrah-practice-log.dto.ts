import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createFitrahPracticeLogSchema = z.object({
  body: z.object({
    practices: z.array(cuidSchema).min(1, 'At least one practice must be provided'),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateFitrahPracticeLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    practices: z.array(cuidSchema).min(1).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listFitrahPracticeLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateFitrahPracticeLogDto = z.infer<typeof createFitrahPracticeLogSchema>['body'];
export type UpdateFitrahPracticeLogDto = z.infer<typeof updateFitrahPracticeLogSchema>['body'];
