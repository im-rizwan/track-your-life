import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createDhikrLogSchema = z.object({
  body: z.object({
    dhikrTypeId: cuidSchema,
    count: z.number().int().min(1),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateDhikrLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    dhikrTypeId: cuidSchema.optional(),
    count: z.number().int().min(1).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listDhikrLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateDhikrLogDto = z.infer<typeof createDhikrLogSchema>['body'];
export type UpdateDhikrLogDto = z.infer<typeof updateDhikrLogSchema>['body'];
