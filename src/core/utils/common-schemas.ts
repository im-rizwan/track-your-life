import { z } from 'zod';

// Common reusable schemas
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Email is too long')
  .email('Invalid email address');

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

// Date string for tracking logs: YYYY-MM-DD, must be ≤ today and ≥ 1 year ago.
//
// "Today" is computed from the server's UTC clock, but clients send their own
// local calendar date. For any timezone ahead of UTC (UTC+1 through UTC+14 —
// most of Europe, Asia, Australia, the Pacific), there's a window every day
// (up to 14 hours, e.g. Kiribati) where the user's real "today" is still "the
// future" from the server's UTC point of view. Since no timezone is ahead of
// UTC+14, allowing one extra day on the upper bound covers every real-world
// offset without needing per-user timezone context at the validation layer
// (the user's stored IANA timezone isn't available here — this schema runs
// before the request reaches a user-aware handler).
export const trackingDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const tomorrowUtc = new Date();
    tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
    const maxDate = tomorrowUtc.toISOString().split('T')[0];

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

    return date <= maxDate && date >= oneYearAgoStr;
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
