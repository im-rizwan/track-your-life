import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createSleepLogSchema = z.object({
  body: z.object({
    bedtime: z.string().datetime({ message: 'bedtime must be a valid ISO 8601 datetime' }),
    wakeupTime: z.string().datetime({ message: 'wakeupTime must be a valid ISO 8601 datetime' }),
    sleepQuality: z.number().int().min(1).max(5).optional(),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateSleepLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    bedtime: z
      .string()
      .datetime({ message: 'bedtime must be a valid ISO 8601 datetime' })
      .optional(),
    wakeupTime: z
      .string()
      .datetime({ message: 'wakeupTime must be a valid ISO 8601 datetime' })
      .optional(),
    sleepQuality: z.number().int().min(1).max(5).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listSleepLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateSleepLogDto = z.infer<typeof createSleepLogSchema>['body'];
export type UpdateSleepLogDto = z.infer<typeof updateSleepLogSchema>['body'];
