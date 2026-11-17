import { z } from 'zod';

// Validation for adjustment values (-15 to +15 minutes)
const adjustmentValue = z
  .number()
  .int('Adjustment must be an integer')
  .min(-15, 'Adjustment cannot be less than -15 minutes')
  .max(15, 'Adjustment cannot be more than +15 minutes');

// Inner body schema for prayer time adjustments
const updateAdjustmentsBodySchema = z.object({
  fajrAdjustment: adjustmentValue.optional(),
  zuhrAdjustment: adjustmentValue.optional(),
  asrAdjustment: adjustmentValue.optional(),
  maghribAdjustment: adjustmentValue.optional(),
  ishaAdjustment: adjustmentValue.optional(),
});

// Wrapped schema matching validator middleware format: { body, query, params }
export const updateAdjustmentsSchema = z.object({
  body: updateAdjustmentsBodySchema,
});

export type UpdateAdjustmentsDto = z.infer<typeof updateAdjustmentsSchema>['body'];
