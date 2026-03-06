import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { ItemDocument, LocalDraft } from '@/types/item.types';

const CSV_HEADER = 'Title,Category,Color,Condition,Tags,Notes,Created Date';

/**
 * Escapes a single CSV field value so it is safe to embed in a comma-separated row.
 * Wraps the value in double quotes and escapes any internal double quotes when the
 * value contains a comma, double quote, or newline character.
 *
 * @param value - Any value; will be coerced to string via `String()`.
 * @returns A safe CSV field string, quoted if necessary.
 */
function escapeCsvField(value: unknown): string {
  const strValue = String(value ?? '');
  if (
    strValue.includes(',') ||
    strValue.includes('"') ||
    strValue.includes('\n') ||
    strValue.includes('\r')
  ) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }

  return strValue;
}

/**
 * Normalises a date-like value to an ISO 8601 date string (`YYYY-MM-DD`).
 * Handles three input shapes: `Date` objects, Firestore `Timestamp` objects
 * (which have a `.toDate()` method), and ISO date strings.
 *
 * @param value - A `Date`, Firestore `Timestamp`, ISO string, or anything else.
 * @returns `"YYYY-MM-DD"` on success, or `""` if the value is absent or unparseable.
 */
function formatDate(value: unknown): string {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return value.toISOString().split('T')[0] ?? '';
    }
    return '';
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as any).toDate === 'function'
  ) {
    const parsed = (value as { toDate: () => Date }).toDate();
    return parsed.toISOString().split('T')[0] ?? '';
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0] ?? '';
    }
  }

  return '';
}

/**
 * Builds a single CSV data row from a partial `ItemDocument`.
 * Field order matches the header row defined by `CSV_HEADER`.
 *
 * @param item - Partial item data (title, category, color, condition, tags, notes).
 * @param createdAt - The item's creation timestamp (any shape accepted by `formatDate`).
 * @returns A comma-separated row string, with all fields properly escaped.
 */
function buildItemRow(item: Partial<ItemDocument>, createdAt: unknown): string {
  const tags = Array.isArray(item.tags) ? item.tags.join(', ') : '';

  return [
    escapeCsvField(item.title ?? ''),
    escapeCsvField(item.category ?? ''),
    escapeCsvField(item.color ?? ''),
    escapeCsvField(item.condition ?? ''),
    escapeCsvField(tags),
    escapeCsvField(item.notes ?? ''),
    escapeCsvField(formatDate(createdAt)),
  ].join(',');
}

/**
 * Generates a complete CSV string for the given items and offline drafts.
 * The first row is a fixed header; subsequent rows are one item/draft per line.
 *
 * @param items - Synced `ItemDocument` records fetched from Firestore.
 * @param drafts - Pending `LocalDraft` records from the offline queue.
 * @returns A newline-separated CSV string ready to be written to a file.
 */
export function generateCsvContent(items: ItemDocument[], drafts: LocalDraft[]): string {
  const rows: string[] = [CSV_HEADER];

  for (const item of items) {
    rows.push(buildItemRow(item, item.createdAt));
  }

  for (const draft of drafts) {
    rows.push(buildItemRow(draft.item, draft.item.createdAt ?? draft.createdAt));
  }

  return rows.join('\n');
}

/**
 * Generates a CSV file from `items` and `drafts`, writes it to the device's
 * document directory, and triggers the native share sheet so the user can
 * send the file via email, AirDrop, or any other app.
 *
 * The file is named `snaplog-export-YYYY-MM-DD.csv` using today's date.
 *
 * @param items - Synced items to include in the export.
 * @param drafts - Pending drafts to include in the export.
 * @throws {Error} If writing the file fails or sharing is not available on the device.
 */
export async function exportAndShareCsv(
  items: ItemDocument[],
  drafts: LocalDraft[]
): Promise<void> {
  const csvContent = generateCsvContent(items, drafts);
  const date = new Date().toISOString().split('T')[0] ?? '';
  const fileName = `snaplog-export-${date}.csv`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isSharingAvailable = await Sharing.isAvailableAsync();
  if (!isSharingAvailable) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(filePath, {
    mimeType: 'text/csv',
    dialogTitle: 'Share SnapLog Export',
    UTI: 'public.comma-separated-values-text',
  });
}
