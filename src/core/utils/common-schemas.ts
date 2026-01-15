import { z } from 'zod';

// Common reusable schemas
export const emailSchema = z.string().email('Invalid email address').trim().toLowerCase();

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
