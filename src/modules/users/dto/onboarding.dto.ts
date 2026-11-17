import { z } from 'zod';

export const onboardingSchema = z.object({
  body: z.object({
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(50, 'Display name must be at most 50 characters')
      .regex(/^[a-zA-Z\s-]+$/, 'Display name can only contain letters, spaces, and hyphens')
      .transform((val) => val.replace(/\s+/g, ' ')),
    age: z.number().int().min(6).max(120),
    city: z
      .string()
      .trim()
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must be at most 100 characters')
      .transform((val) => val.replace(/\s+/g, ' ')),
    country: z
      .string()
      .trim()
      .min(2, 'Country must be at least 2 characters')
      .max(100, 'Country must be at most 100 characters')
      .transform((val) => val.replace(/\s+/g, ' ')),
    latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90).optional(),
    longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180).optional(),
  }),
});

export type OnboardingDto = z.infer<typeof onboardingSchema>['body'];
