import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import type { ItemDocument, LocalDraft } from "@/types/item.types";

const CSV_HEADER = "Title,Category,Color,Condition,Tags,Notes,Created Date";

function escapeCsvField(value: unknown): string {
  const strValue = String(value ?? "");
  if (
    strValue.includes(",") ||
    strValue.includes('"') ||
    strValue.includes("\n") ||
    strValue.includes("\r")
  ) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }

  return strValue;
}

function formatDate(value: unknown): string {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) {
      return value.toISOString().split("T")[0] ?? "";
    }
    return "";
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as any).toDate === "function"
  ) {
    const parsed = (value as { toDate: () => Date }).toDate();
    return parsed.toISOString().split("T")[0] ?? "";
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0] ?? "";
    }
  }

  return "";
}

function buildItemRow(item: Partial<ItemDocument>, createdAt: unknown): string {
  const tags = Array.isArray(item.tags) ? item.tags.join(", ") : "";

  return [
    escapeCsvField(item.title ?? ""),
    escapeCsvField(item.category ?? ""),
    escapeCsvField(item.color ?? ""),
    escapeCsvField(item.condition ?? ""),
    escapeCsvField(tags),
    escapeCsvField(item.notes ?? ""),
    escapeCsvField(formatDate(createdAt)),
  ].join(",");
}

export function generateCsvContent(
  items: ItemDocument[],
  drafts: LocalDraft[],
): string {
  const rows: string[] = [CSV_HEADER];

  for (const item of items) {
    rows.push(buildItemRow(item, item.createdAt));
  }

  for (const draft of drafts) {
    rows.push(
      buildItemRow(draft.item, draft.item.createdAt ?? draft.createdAt),
    );
  }

  return rows.join("\n");
}

export async function exportAndShareCsv(
  items: ItemDocument[],
  drafts: LocalDraft[],
): Promise<void> {
  const csvContent = generateCsvContent(items, drafts);
  const date = new Date().toISOString().split("T")[0] ?? "";
  const fileName = `snaplog-export-${date}.csv`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isSharingAvailable = await Sharing.isAvailableAsync();
  if (!isSharingAvailable) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(filePath, {
    mimeType: "text/csv",
    dialogTitle: "Share SnapLog Export",
    UTI: "public.comma-separated-values-text",
  });
}
