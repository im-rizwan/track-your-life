import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createQuranLogSchema = z.object({
  body: z.object({
    surahName: z.string().min(1).max(100),
    surahNumber: z.number().int().min(1).max(114),
    quranActivityTypeId: cuidSchema,
    versesCount: z.number().int().min(1),
    juzzNumber: z.number().int().min(1).max(30).optional(),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateQuranLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    surahName: z.string().min(1).max(100).optional(),
    surahNumber: z.number().int().min(1).max(114).optional(),
    quranActivityTypeId: cuidSchema.optional(),
    versesCount: z.number().int().min(1).optional(),
    juzzNumber: z.number().int().min(1).max(30).optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listQuranLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateQuranLogDto = z.infer<typeof createQuranLogSchema>['body'];
export type UpdateQuranLogDto = z.infer<typeof updateQuranLogSchema>['body'];
