import { z } from 'zod';

// Inner body schema for prayer time configuration
const updateConfigBodySchema = z
  .object({
    calculationMode: z.enum(['AUTOMATIC', 'MANUAL']),
    apiMethod: z
      .enum(['MWL', 'ISNA', 'EGYPT', 'MAKKAH', 'KARACHI', 'TEHRAN'])
      .optional()
      .nullable(),
    manualTimes: z
      .object({
        fajr: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM'),
        zuhr: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM'),
        asr: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM'),
        maghrib: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM'),
        isha: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM'),
      })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // If AUTOMATIC mode, apiMethod is required
      if (data.calculationMode === 'AUTOMATIC' && !data.apiMethod) {
        return false;
      }
      // If MANUAL mode, manualTimes is required
      if (data.calculationMode === 'MANUAL' && !data.manualTimes) {
        return false;
      }
      return true;
    },
    {
      message:
        'For AUTOMATIC mode, apiMethod is required. For MANUAL mode, manualTimes is required.',
    }
  );

// Wrapped schema matching validator middleware format: { body, query, params }
export const updateConfigSchema = z.object({
  body: updateConfigBodySchema,
});

export type UpdateConfigDto = z.infer<typeof updateConfigSchema>['body'];
