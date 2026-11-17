import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createOtherPrayerSchema = z.object({
  body: z.object({
    otherPrayerTypeId: cuidSchema,
    rakahs: z.number().int().min(2).max(12).optional(),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateOtherPrayerSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    otherPrayerTypeId: cuidSchema.optional(),
    rakahs: z.number().int().min(2).max(12).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listOtherPrayerSchema = z.object({ query: trackingPaginationSchema });

export type CreateOtherPrayerDto = z.infer<typeof createOtherPrayerSchema>['body'];
export type UpdateOtherPrayerDto = z.infer<typeof updateOtherPrayerSchema>['body'];
