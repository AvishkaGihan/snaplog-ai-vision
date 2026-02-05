import { z } from 'zod';
import { ItemCategory } from '../enums/taxonomy.enum';

// AI response schema - strict JSON validation
export const AiResponseSchema = z.object({
  schemaVersion: z.string(),
  taxonomyVersion: z.string(),
  model: z.string(),
  extractedFields: z.object({
    title: z.string().optional(),
    brand: z.string().optional(),
    category: z.nativeEnum(ItemCategory).optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    condition: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
  confidence: z.number().min(0).max(1).optional(),
});

export type AiResponse = z.infer<typeof AiResponseSchema>;

// Validation helper for AI output
export function validateAiResponse(data: unknown): {
  success: boolean;
  data?: AiResponse;
  error?: z.ZodError;
} {
  const result = AiResponseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
