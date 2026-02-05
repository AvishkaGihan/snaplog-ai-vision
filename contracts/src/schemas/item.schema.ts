import { z } from 'zod';
import { ItemStatus } from '../enums/item-status.enum';
import { ItemCategory } from '../enums/taxonomy.enum';

// Item record schema for Firestore
export const ItemSchema = z.object({
  // Identity/audit
  id: z.string(),
  ownerUid: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Status tracking
  status: z.nativeEnum(ItemStatus),
  failureStage: z.string().optional(),
  failureReason: z.string().optional(),
  retryCount: z.number().int().min(0).default(0),

  // Image references
  localUri: z.string().optional(),
  storagePath: z.string().optional(),
  sha256: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),

  // AI result metadata
  schemaVersion: z.string().optional(),
  taxonomyVersion: z.string().optional(),
  attempts: z.number().int().min(0).default(0),
  lastModel: z.string().optional(),
  rawJson: z.string().optional(),

  // Human-editable fields (from AI or manual input)
  title: z.string().optional(),
  brand: z.string().optional(),
  category: z.nativeEnum(ItemCategory).optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  condition: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),

  // Export tracking
  lastExportedAt: z.string().datetime().optional(),
});

export type Item = z.infer<typeof ItemSchema>;
