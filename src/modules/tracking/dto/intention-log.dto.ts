import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

const optionalDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .optional();

export const createIntentionLogSchema = z.object({
  body: z.object({
    intentionId: cuidSchema,
    startDate: optionalDateString,
    endDate: optionalDateString,
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateIntentionLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    intentionId: cuidSchema.optional(),
    startDate: optionalDateString,
    endDate: optionalDateString,
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listIntentionLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateIntentionLogDto = z.infer<typeof createIntentionLogSchema>['body'];
export type UpdateIntentionLogDto = z.infer<typeof updateIntentionLogSchema>['body'];
