import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createFitnessLogSchema = z.object({
  body: z.object({
    fitnessActivityId: cuidSchema,
    fitnessIntensityId: cuidSchema.optional(),
    quantity: z.number().int().min(1),
    quantityUnit: z.string().max(20).optional(),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateFitnessLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    fitnessActivityId: cuidSchema.optional(),
    fitnessIntensityId: cuidSchema.optional(),
    quantity: z.number().int().min(1).optional(),
    quantityUnit: z.string().max(20).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listFitnessLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateFitnessLogDto = z.infer<typeof createFitnessLogSchema>['body'];
export type UpdateFitnessLogDto = z.infer<typeof updateFitnessLogSchema>['body'];
