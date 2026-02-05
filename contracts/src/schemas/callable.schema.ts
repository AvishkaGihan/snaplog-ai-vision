import { z } from 'zod';

// Callable function payloads

// analyzeItem
export const AnalyzeItemRequestSchema = z.object({
  itemId: z.string(),
  storagePath: z.string(),
});

export const AnalyzeItemResponseSchema = z.object({
  success: z.boolean(),
  itemId: z.string(),
  extractedFields: z
    .object({
      title: z.string().optional(),
      brand: z.string().optional(),
      category: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      condition: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
    })
    .optional(),
  error: z.string().optional(),
});

// exportInventoryCsv
export const ExportInventoryCsvRequestSchema = z.object({
  filterCategory: z.string().optional(),
  filterTags: z.array(z.string()).optional(),
});

export const ExportInventoryCsvResponseSchema = z.object({
  success: z.boolean(),
  exportId: z.string().optional(),
  signedUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
  error: z.string().optional(),
});

// requestAccountDeletion
export const RequestAccountDeletionRequestSchema = z.object({
  confirmEmail: z.string().email(),
});

export const RequestAccountDeletionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
});

export type AnalyzeItemRequest = z.infer<typeof AnalyzeItemRequestSchema>;
export type AnalyzeItemResponse = z.infer<typeof AnalyzeItemResponseSchema>;
export type ExportInventoryCsvRequest = z.infer<typeof ExportInventoryCsvRequestSchema>;
export type ExportInventoryCsvResponse = z.infer<typeof ExportInventoryCsvResponseSchema>;
export type RequestAccountDeletionRequest = z.infer<typeof RequestAccountDeletionRequestSchema>;
export type RequestAccountDeletionResponse = z.infer<typeof RequestAccountDeletionResponseSchema>;
