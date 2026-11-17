import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createCharityLogSchema = z.object({
  body: z.object({
    charityTypeId: cuidSchema,
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateCharityLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    charityTypeId: cuidSchema.optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listCharityLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateCharityLogDto = z.infer<typeof createCharityLogSchema>['body'];
export type UpdateCharityLogDto = z.infer<typeof updateCharityLogSchema>['body'];
