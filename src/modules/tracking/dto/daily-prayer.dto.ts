import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createDailyPrayerSchema = z.object({
  body: z.object({
    prayerName: z.enum(['FAJR', 'ZUHR', 'ASR', 'MAGHRIB', 'ISHA', 'JUMMAH']),
    prayerStatusId: cuidSchema,
    prayerLocationId: cuidSchema.optional(),
    khushuRating: z.number().int().min(1).max(5).optional(),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateDailyPrayerSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    prayerName: z.enum(['FAJR', 'ZUHR', 'ASR', 'MAGHRIB', 'ISHA', 'JUMMAH']).optional(),
    prayerStatusId: cuidSchema.optional(),
    prayerLocationId: cuidSchema.optional(),
    khushuRating: z.number().int().min(1).max(5).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listDailyPrayerSchema = z.object({ query: trackingPaginationSchema });
export const idParamSchema = z.object({ params: z.object({ id: cuidSchema }) });

export type CreateDailyPrayerDto = z.infer<typeof createDailyPrayerSchema>['body'];
export type UpdateDailyPrayerDto = z.infer<typeof updateDailyPrayerSchema>['body'];
