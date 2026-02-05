import { z } from 'zod';

// CSV export column contract
export const ExportSchema = z.object({
  itemId: z.string(),
  title: z.string(),
  brand: z.string().optional(),
  category: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  condition: z.string().optional(),
  description: z.string().optional(),
  tags: z.string(), // comma-separated
  imageUrl: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ExportRow = z.infer<typeof ExportSchema>;

// Export record schema
export const ExportRecordSchema = z.object({
  id: z.string(),
  ownerUid: z.string(),
  createdAt: z.string().datetime(),
  status: z.enum(['pending', 'completed', 'failed']),
  itemCount: z.number().int().min(0),
  signedUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
  failureReason: z.string().optional(),
});

export type ExportRecord = z.infer<typeof ExportRecordSchema>;
