import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createFastingLogSchema = z.object({
  body: z.object({
    fastingTypeId: cuidSchema,
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateFastingLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    fastingTypeId: cuidSchema.optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listFastingLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateFastingLogDto = z.infer<typeof createFastingLogSchema>['body'];
export type UpdateFastingLogDto = z.infer<typeof updateFastingLogSchema>['body'];
