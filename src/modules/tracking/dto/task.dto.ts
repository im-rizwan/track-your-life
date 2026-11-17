import { z } from 'zod';
import {
  cuidSchema,
  trackingDateSchema,
  trackingPaginationSchema,
} from '../../../core/utils/common-schemas';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    intentionId: cuidSchema.optional(),
    taskPriorityId: cuidSchema.optional(),
    taskStatusId: cuidSchema.optional(),
    date: trackingDateSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: cuidSchema }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    intentionId: cuidSchema.optional(),
    taskPriorityId: cuidSchema.optional(),
    taskStatusId: cuidSchema.optional(),
    date: trackingDateSchema.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const listTaskSchema = z.object({ query: trackingPaginationSchema });

export type CreateTaskDto = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>['body'];
