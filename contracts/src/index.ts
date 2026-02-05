// Shared contracts entry point

// Enums
export { ItemStatus } from './enums/item-status.enum';
export { ItemCategory } from './enums/taxonomy.enum';

// Schemas
export { ItemSchema } from './schemas/item.schema';
export type { Item } from './schemas/item.schema';

export { AiResponseSchema, validateAiResponse } from './schemas/ai.schema';
export type { AiResponse } from './schemas/ai.schema';

export { ExportSchema, ExportRecordSchema } from './schemas/export.schema';
export type { ExportRow, ExportRecord } from './schemas/export.schema';

export {
  AnalyzeItemRequestSchema,
  AnalyzeItemResponseSchema,
  ExportInventoryCsvRequestSchema,
  ExportInventoryCsvResponseSchema,
  RequestAccountDeletionRequestSchema,
  RequestAccountDeletionResponseSchema,
} from './schemas/callable.schema';
export type {
  AnalyzeItemRequest,
  AnalyzeItemResponse,
  ExportInventoryCsvRequest,
  ExportInventoryCsvResponse,
  RequestAccountDeletionRequest,
  RequestAccountDeletionResponse,
} from './schemas/callable.schema';

// Utils
export { strictObject, validateOrThrow, validate } from './utils/zod-helpers';
export { generateId, generateItemId, generateExportId, isValidId } from './utils/id-helpers';
