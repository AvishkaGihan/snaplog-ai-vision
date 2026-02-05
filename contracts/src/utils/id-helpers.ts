import { randomBytes } from 'crypto';

/**
 * Generate a unique ID with prefix
 * @param prefix - ID prefix (e.g., 'item', 'export')
 * @returns Prefixed unique ID
 */
export function generateId(prefix: string): string {
  const randomPart = randomBytes(8).toString('hex');
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Generate item ID
 */
export function generateItemId(): string {
  return generateId('item');
}

/**
 * Generate export ID
 */
export function generateExportId(): string {
  return generateId('export');
}

/**
 * Validate ID format
 */
export function isValidId(id: string, prefix: string): boolean {
  const pattern = new RegExp(`^${prefix}_[a-z0-9]+_[a-f0-9]{16}$`);
  return pattern.test(id);
}
