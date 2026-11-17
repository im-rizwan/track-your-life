import { z } from 'zod';

// Common reusable schemas
export const emailSchema = z.string().trim().toLowerCase().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const cuidSchema = z.string().cuid('Invalid ID format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Helper function to create sanitized string with custom validations
export const createSanitizedString = (minLength = 1, maxLength = 255) => {
  return z
    .string()
    .trim()
    .min(minLength, `Must be at least ${minLength} character(s)`)
    .max(maxLength, `Must be at most ${maxLength} characters`)
    .transform((val) => val.replace(/\s+/g, ' ')); // Replace multiple spaces with single space
};

// Date string for tracking logs: YYYY-MM-DD, must be ≤ today and ≥ 1 year ago
export const trackingDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const today = new Date().toISOString().split('T')[0];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
    return date <= today && date >= oneYearAgoStr;
  }, 'Date must be between 1 year ago and today');

// Pagination + date filter for tracking list endpoints
export const trackingPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD')
    .optional(),
});
