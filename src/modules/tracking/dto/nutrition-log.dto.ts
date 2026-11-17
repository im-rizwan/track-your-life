import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createNutritionLogSchema = z.object({
  body: z.object({
    nutritionFoodId: cuidSchema,
    quantity: z.string().max(50).optional(),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateNutritionLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    nutritionFoodId: cuidSchema.optional(),
    quantity: z.string().max(50).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listNutritionLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateNutritionLogDto = z.infer<typeof createNutritionLogSchema>['body'];
export type UpdateNutritionLogDto = z.infer<typeof updateNutritionLogSchema>['body'];
