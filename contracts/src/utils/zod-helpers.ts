import { z } from 'zod';

// Shared Zod validation utilities

/**
 * Helper to create a strict object schema that rejects unknown keys
 */
export function strictObject<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).strict();
}

/**
 * Helper to validate and parse data with detailed error messages
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}

/**
 * Helper to validate and return result object
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  error?: string;
} {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
  return { success: false, error: errors };
}
