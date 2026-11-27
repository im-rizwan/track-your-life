import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

// A duplicate ID in `practices` would otherwise reach
// fitrahPracticeOnLog.createMany() and throw a Prisma P2002 mid-transaction,
// surfacing as a misleading 409 "already exists" instead of a clear
// validation error for what's actually a client input mistake.
const noDuplicatePractices = (practices: string[]) =>
  new Set(practices).size === practices.length;

export const createFitrahPracticeLogSchema = z.object({
  body: z.object({
    practices: z
      .array(cuidSchema)
      .min(1, 'At least one practice must be provided')
      .refine(noDuplicatePractices, 'practices must not contain duplicate IDs'),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateFitrahPracticeLogSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    practices: z
      .array(cuidSchema)
      .min(1)
      .refine(noDuplicatePractices, 'practices must not contain duplicate IDs')
      .optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listFitrahPracticeLogSchema = z.object({ query: trackingPaginationSchema });

export type CreateFitrahPracticeLogDto = z.infer<typeof createFitrahPracticeLogSchema>['body'];
export type UpdateFitrahPracticeLogDto = z.infer<typeof updateFitrahPracticeLogSchema>['body'];
