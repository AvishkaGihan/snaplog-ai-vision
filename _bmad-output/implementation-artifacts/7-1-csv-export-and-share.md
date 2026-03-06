# Story 7.1: CSV Export & Share

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to export my full inventory as a CSV file and share it,
So that I can send my catalog to insurance agents, buyers, or other tools.

## Acceptance Criteria

**AC1 — Export CSV Button on Settings Screen:**

- **Given** the user is on the Settings screen
- **When** the screen loads
- **Then** an "Export CSV" button is visible between the user card and app version sections
- **And** the button follows the dark theme design system consistently
- **And** the button has `testID="settings-export-csv-button"` and `accessibilityLabel="Export CSV"`

**AC2 — CSV Generation with All Items:**

- **Given** the user has cataloged items (synced or pending drafts)
- **When** the user taps "Export CSV"
- **Then** `services/csvService.ts` generates a CSV file containing all items — synced Firestore items AND pending local drafts with available data (FR26)
- **And** the CSV includes columns: Title, Category, Color, Condition, Tags, Notes, Created Date
- **And** `Tags` are joined as a comma-separated string within the cell (e.g., `"tag1, tag2"`)
- **And** `Created Date` is formatted as a human-readable date string (e.g., `"2026-03-05"`)
- **And** CSV special characters (commas, double quotes, newlines) in field values are properly escaped per RFC 4180

**AC3 — File Save and Share Sheet:**

- **Given** the CSV file has been generated
- **When** the file is ready
- **Then** the file is saved locally via `expo-file-system` to the app's document directory
- **And** the native OS share sheet opens via `expo-sharing` (FR27)
- **And** the user can share via email, AirDrop, Slack, or any installed app
- **And** the file is named `snaplog-export-YYYY-MM-DD.csv` with the current date

**AC4 — Empty State Handling:**

- **Given** the user has zero cataloged items AND zero drafts
- **When** the user taps "Export CSV"
- **Then** a snackbar shows: "No items to export" for 3 seconds
- **And** no file is generated or share sheet opened

**AC5 — Loading State During Export:**

- **Given** the user taps "Export CSV"
- **When** the CSV is being generated and the share sheet is being prepared
- **Then** the button shows a loading indicator (disabled state) until the share sheet opens or the process completes
- **And** the user cannot double-tap to trigger multiple exports

**AC6 — Error Handling:**

- **Given** the export process fails (filesystem error, sharing not available, etc.)
- **When** the error occurs
- **Then** a snackbar shows a friendly error message: "Couldn't export items. Please try again."
- **And** the app does not crash (NFR-R1)
- **And** the button returns to its normal enabled state

**AC7 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (regression check)

## Tasks / Subtasks

- [x] **Task 1: Create `src/services/csvService.ts`** (AC: 2, 3, 4, 6)
  - [x] Create the file at `src/services/csvService.ts`
  - [x] Implement `generateCsvContent(items: ItemDocument[], drafts: LocalDraft[]): string` — builds CSV string from items + drafts
  - [x] Include CSV header row: `Title,Category,Color,Condition,Tags,Notes,Created Date`
  - [x] Escape CSV fields per RFC 4180 (wrap in double quotes if contains comma/quote/newline, escape `"` as `""`)
  - [x] Format `createdAt` as `YYYY-MM-DD` date string — handle both `Timestamp` and ISO string formats
  - [x] Join `tags` array as comma-separated within the cell (e.g., `"tag1, tag2"`)
  - [x] For drafts: extract available fields from `draft.item` (Partial<ItemDocument>), use empty string for missing fields
  - [x] Implement `exportAndShareCsv(items: ItemDocument[], drafts: LocalDraft[]): Promise<void>` — orchestrates generate → save → share
  - [x] Save file to `${FileSystem.documentDirectory}snaplog-export-YYYY-MM-DD.csv` via `expo-file-system`
  - [x] Open native share sheet via `expo-sharing` (`shareAsync`)
  - [x] If `Sharing.isAvailableAsync()` returns false, throw error with user-friendly message
  - [x] Named exports: `generateCsvContent`, `exportAndShareCsv`

- [x] **Task 2: Modify `src/screens/SettingsScreen.tsx`** (AC: 1, 4, 5, 6)
  - [x] Import `exportAndShareCsv` from `@/services/csvService`
  - [x] Import `useItemStore` for reading `items` and `drafts`
  - [x] Import `Snackbar` from `react-native-paper`
  - [x] Add `isExporting` local state (boolean) for button loading
  - [x] Add `snackbar` local state for message display
  - [x] Add "Export CSV" button between the Divider and app version text
  - [x] Style the button with an appropriate icon (e.g., `icon="file-export"` or `icon="download"`)
  - [x] On press: check if items + drafts are empty → show "No items to export" snackbar
  - [x] On press: if items exist → set isExporting=true, call `exportAndShareCsv`, catch errors → show error snackbar, finally set isExporting=false
  - [x] Disable button and show loading spinner while `isExporting` is true
  - [x] Add `testID` and `accessibilityLabel` to all new interactive elements
  - [x] Add `Snackbar` component at the bottom of the screen

- [x] **Task 3: Build verification** (AC: 7)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                               | Current State                                                                                                                                                                                                                   | This Story's Action                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/stores/useItemStore.ts`       | 126 lines — Has `items: ItemDocument[]`, `drafts: LocalDraft[]`, `addItem`, `addDraft`, `removeDraft`, `updateDraftStatus`, `setItems`, `setSyncProgress`. Persist middleware partializes `drafts` only.                        | **NO CHANGES** — read `items` and `drafts` from store for CSV generation |
| `src/stores/useAuthStore.ts`       | Auth state + `user` object with `uid`.                                                                                                                                                                                          | **NO CHANGES**                                                           |
| `src/types/item.types.ts`          | 28 lines — `ItemDocument` (title, category, color, condition, tags, notes, imageUrl, imagePath, aiGenerated, syncStatus, createdAt, updatedAt) and `LocalDraft` (localId, userId, item, localImageUri, syncStatus, retryCount). | **NO CHANGES** — types already define everything needed                  |
| `src/services/firestoreService.ts` | 88 lines — `saveItem`, `updateItem`, `deleteItem`, `fetchItems`.                                                                                                                                                                | **NO CHANGES** — items already loaded via fetchItems on dashboard load   |
| `src/screens/SettingsScreen.tsx`   | 195 lines — User card (avatar, name, email), Google Sign-In / Sign Out, app version. Uses `SafeAreaView`, `Dialog`, `Portal`.                                                                                                   | **MODIFY** — Add Export CSV button, snackbar, and export handler         |
| `src/constants/config.ts`          | 13 constants — Includes `SNACKBAR_DURATION_MS = 3000`.                                                                                                                                                                          | **NO CHANGES** — reuse `SNACKBAR_DURATION_MS` for snackbar duration      |
| `src/constants/theme.ts`           | 116 lines — Full dark theme with colors, spacing, borderRadius, typography, semanticColors.                                                                                                                                     | **NO CHANGES** — use theme tokens for all styling                        |

#### What NEEDS TO BE CREATED

| File                         | Purpose                                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/services/csvService.ts` | **NEW** — CSV generation logic: builds CSV string from items + drafts, saves file, triggers native share sheet |

#### Dependencies Already Installed (Do NOT Install Again)

| Package              | Version | Purpose                                  |
| -------------------- | ------- | ---------------------------------------- |
| `expo-file-system`   | ~18.0.8 | Write CSV file to app document directory |
| `expo-sharing`       | ~14.0.x | Open native OS share sheet with the file |
| `react-native-paper` | 5.15.x  | `Snackbar`, `Button` with loading/icon   |

**No new npm dependencies required.**

---

### Key Implementation Details

#### `csvService.ts` — The CSV Export Engine

```typescript
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import type { ItemDocument, LocalDraft } from "@/types/item.types";

/**
 * Escapes a CSV field per RFC 4180:
 * - Wraps in double quotes if field contains comma, double quote, or newline
 * - Escapes internal double quotes by doubling them ("")
 */
function escapeCsvField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Formats a date value (Timestamp or ISO string) to YYYY-MM-DD.
 */
function formatDate(dateValue: unknown): string {
  if (!dateValue) return "";

  try {
    // Handle Firestore Timestamp objects (have toDate method)
    if (
      typeof dateValue === "object" &&
      dateValue !== null &&
      "toDate" in dateValue
    ) {
      const d = (dateValue as { toDate: () => Date }).toDate();
      return d.toISOString().split("T")[0];
    }

    // Handle ISO string
    if (typeof dateValue === "string") {
      const d = new Date(dateValue);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
      }
    }
  } catch {
    // Fallback: return empty string
  }
  return "";
}

const CSV_HEADER = "Title,Category,Color,Condition,Tags,Notes,Created Date";

/**
 * Generates CSV string content from synced items and local drafts.
 * Includes ALL items regardless of sync status.
 */
export function generateCsvContent(
  items: ItemDocument[],
  drafts: LocalDraft[],
): string {
  const rows: string[] = [CSV_HEADER];

  // Add synced items
  for (const item of items) {
    const row = [
      escapeCsvField(item.title),
      escapeCsvField(item.category),
      escapeCsvField(item.color),
      escapeCsvField(item.condition),
      escapeCsvField(item.tags.join(", ")),
      escapeCsvField(item.notes),
      escapeCsvField(formatDate(item.createdAt)),
    ].join(",");
    rows.push(row);
  }

  // Add drafts (pending/error — not yet synced)
  for (const draft of drafts) {
    const item = draft.item;
    const row = [
      escapeCsvField(item.title ?? ""),
      escapeCsvField(item.category ?? ""),
      escapeCsvField(item.color ?? ""),
      escapeCsvField(item.condition ?? ""),
      escapeCsvField((item.tags ?? []).join(", ")),
      escapeCsvField(item.notes ?? ""),
      escapeCsvField(formatDate(draft.createdAt)),
    ].join(",");
    rows.push(row);
  }

  return rows.join("\n");
}

/**
 * Generates CSV, saves to local file, opens native share sheet.
 * Throws on error — caller is responsible for error handling + user feedback.
 */
export async function exportAndShareCsv(
  items: ItemDocument[],
  drafts: LocalDraft[],
): Promise<void> {
  const csvContent = generateCsvContent(items, drafts);

  // Generate filename with current date
  const today = new Date().toISOString().split("T")[0];
  const fileName = `snaplog-export-${today}.csv`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  // Write CSV to file
  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Check if sharing is available
  const sharingAvailable = await Sharing.isAvailableAsync();
  if (!sharingAvailable) {
    throw new Error("Sharing is not available on this device");
  }

  // Open native share sheet
  await Sharing.shareAsync(filePath, {
    mimeType: "text/csv",
    dialogTitle: "Share SnapLog Export",
    UTI: "public.comma-separated-values-text",
  });
}
```

> **⚠️ CRITICAL**: Named exports (`generateCsvContent`, `exportAndShareCsv`) — project convention for service files. Default exports for components/screens only.

> **⚠️ IMPORTANT**: The `generateCsvContent` function includes BOTH synced items AND drafts (per FR26 + AC2: "the export covers all items regardless of sync status"). Drafts use `draft.item` (Partial) so missing fields default to empty string.

> **⚠️ IMPORTANT**: Use `FileSystem.documentDirectory` (not `cacheDirectory`) — this ensures the file persists long enough for the share sheet interaction.

> **⚠️ IMPORTANT**: The `UTI` property is for iOS share sheet to recognize CSV files correctly. The `mimeType` is for Android.

> **⚠️ IMPORTANT**: CSV escaping follows RFC 4180 — fields with commas, quotes, or newlines are wrapped in double quotes; internal quotes are doubled.

---

#### SettingsScreen Modifications

```typescript
// NEW imports to add:
import { Snackbar } from "react-native-paper";
import { ScrollView } from "react-native";
import { useItemStore } from "@/stores/useItemStore";
import { exportAndShareCsv } from "@/services/csvService";
import { SNACKBAR_DURATION_MS } from "@/constants/config";

// NEW state inside SettingsScreen:
const [isExporting, setIsExporting] = useState(false);
const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

// Read items and drafts from store:
const { items, drafts } = useItemStore(
  useShallow((state) => ({ items: state.items, drafts: state.drafts })),
);

// NEW handler:
const handleExportCsv = async () => {
  if (isExporting) return; // Double-tap guard

  if (items.length === 0 && drafts.length === 0) {
    setSnackbar({ visible: true, message: "No items to export" });
    return;
  }

  setIsExporting(true);
  try {
    await exportAndShareCsv(items, drafts);
  } catch {
    setSnackbar({
      visible: true,
      message: "Couldn't export items. Please try again.",
    });
  } finally {
    setIsExporting(false);
  }
};

// NEW JSX — Add between <Divider> and app version text:
<Button
  mode="contained"
  onPress={handleExportCsv}
  loading={isExporting}
  disabled={isExporting}
  icon="file-export"
  testID="settings-export-csv-button"
  accessibilityLabel="Export CSV"
  style={styles.exportButton}
>
  Export CSV
</Button>

// NEW JSX — Add Snackbar at the bottom (inside SafeAreaView, after Portal):
<Snackbar
  visible={snackbar.visible}
  onDismiss={() => setSnackbar({ visible: false, message: "" })}
  duration={SNACKBAR_DURATION_MS}
  testID="settings-snackbar"
  accessibilityLabel={snackbar.message}
>
  {snackbar.message}
</Snackbar>

// NEW style:
exportButton: {
  borderRadius: theme.borderRadius.buttons,
  marginBottom: theme.spacing.space4,
},
```

> **⚠️ IMPORTANT**: The export button goes BETWEEN the Divider and the app version text. This is the logical location per the Settings screen layout (user card → divider → export → version).

> **⚠️ IMPORTANT**: Use `useShallow` for the store selector (same pattern as existing `useAuthStore` selector in SettingsScreen). This prevents unnecessary re-renders.

> **⚠️ IMPORTANT**: The `icon="file-export"` uses MaterialCommunityIcons which is included by default in React Native Paper. Verify this icon exists, otherwise use `"export"` or `"download"`.

> **⚠️ CRITICAL**: Wrap the entire handler in try/catch per project error handling rules. Never let an unhandled promise rejection crash the app (NFR-R1).

> **⚠️ IMPORTANT**: Consider wrapping the screen content in a `ScrollView` if the content might overflow on smaller screens after adding the export button. The current screen has enough breathing room, but verify on a 320dp width device.

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Building CSV by simple string concatenation without escaping
const csv = items.map(i => `${i.title},${i.category}`).join("\n");
// DO: Use escapeCsvField() for EVERY field — titles can contain commas, quotes, etc.

// ❌ WRONG: Only exporting synced items
const itemsToExport = items.filter(i => i.syncStatus === "synced");
// DO: Include ALL items AND drafts. The AC says "all items regardless of sync status."

// ❌ WRONG: Using FileSystem.cacheDirectory for the CSV file
const filePath = `${FileSystem.cacheDirectory}export.csv`;
// DO: Use FileSystem.documentDirectory — cache can be cleared by OS during share sheet.

// ❌ WRONG: Not checking Sharing.isAvailableAsync() first
await Sharing.shareAsync(filePath);
// DO: Check availability first. Some Android emulators / restricted devices may not support sharing.

// ❌ WRONG: Using useState for global state or calling Firebase directly from UI
const [items, setItems] = useState<Item[]>([]);
await getDocs(collection(db, "users", userId, "items"));
// DO: Read from useItemStore (items are already loaded). Never call Firebase in UI.

// ❌ WRONG: Hardcoding colors or spacing
const styles = StyleSheet.create({
  button: { backgroundColor: '#7C6EF8', padding: 16 },
});
// DO: Use theme.colors.primary, theme.spacing.space4, etc.

// ❌ WRONG: Not handling errors
await exportAndShareCsv(items, drafts); // No try/catch
// DO: Always wrap in try/catch. Show friendly snackbar on error.

// ❌ WRONG: Missing testID/accessibilityLabel on interactive elements
<Button onPress={handleExport}>Export</Button>
// DO: Always include testID and accessibilityLabel on every interactive element.

// ❌ WRONG: Default export for service file
export default function exportCsv() { ... }
// DO: Named exports for services/hooks/utils. Only components/screens use default exports.
```

---

### Dependency Check

**No new npm dependencies required.**

All needed packages are already installed:

- `expo-file-system` (~18.0.8) — write CSV file to document directory
- `expo-sharing` (~14.0.x) — open native OS share sheet
- `react-native-paper` (5.15.x) — `Snackbar`, `Button` components
- All theme constants already available in `@/constants/theme`
- `SNACKBAR_DURATION_MS` already defined in `@/constants/config`

---

### Previous Story Intelligence

**From Story 6.3 (Background Sync Engine) — Most Recent:**

1. **`useItemStore.getState()` pattern** — For imperative code outside React components, use `useItemStore.getState()` to read state. For the Settings screen (React component), use the `useShallow` hook selector pattern instead.

2. **Module-level concurrency guard** — Story 6.3 used `isSyncing` flag to prevent concurrent sync runs. Apply the same pattern: `isExporting` state prevents double-tap export.

3. **Named exports for services** — `syncService.ts` uses named exports (`syncAllDrafts`). Follow the same pattern for `csvService.ts`.

4. **`void` prefix for fire-and-forget** — Story 6.3 used `void syncAllDrafts(userId)`. Not needed here since export is user-initiated and awaited with loading state.

5. **`useItemStore` already has `items` and `drafts`** — Both arrays are populated from previous stories. The CSV service reads these directly, no need to re-fetch from Firestore.

**From Story 6.2 (Local Draft Save & Offline Cataloging):**

1. **`LocalDraft.item` is `Partial<ItemDocument>`** — When generating CSV from drafts, expect any field to be undefined. Use nullish coalescing (`??`) to default to empty strings.

2. **`LocalDraft.userId` field exists** — Added in 6.2 code review. Not needed for CSV export (we export all user's drafts regardless).

**From Story 5.1 (Dashboard Item List):**

1. **Items loaded on dashboard mount** — `useItemStore.items` is populated via `fetchItems` on dashboard load. By the time user navigates to Settings, items are already in the store.

---

### Git Intelligence

Recent commits (from develop branch):

```
05b4fee (HEAD -> develop) ...
adefb57 Merge pull request
933d2b7 (origin/feat/background-sync-engine) ...
```

**Codebase conventions from recent work:**

- Feature branches: `feat/{story-key}` (e.g., `feat/7-1-csv-export-and-share`)
- `StyleSheet.create` with all values from `theme.ts`
- `testID` and `accessibilityLabel` on all interactive elements
- Default exports for component/screen files, named exports for hooks/services/utils
- `@/` path alias for all src imports
- `useCallback` wrapping handlers in screens with FlatList (not strictly needed here since Settings doesn't have a list)
- `useShallow` from `zustand/react/shallow` used for multi-field selectors (see existing SettingsScreen pattern)

---

### Project Structure Notes

- New service: `src/services/csvService.ts` — camelCase, `.ts` extension, named exports ✓
- Modified: `src/screens/SettingsScreen.tsx` — add Export CSV button, snackbar, export handler ✓
- No new directories needed — all files placed in existing directories
- Architecture boundaries maintained: UI (SettingsScreen) → Stores (useItemStore) → Services (csvService) ✓
- No Firestore calls from UI — items already in store ✓

### References

- Story 7.1 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7.1, lines 656-672]
- FR26: Export item list as CSV [Source: `epics.md`, line 44]
- FR27: Share CSV via native OS share sheet [Source: `epics.md`, line 45]
- Epic 7 overview: "Export & Sharing" [Source: `epics.md`, lines 170-172]
- Architecture csvService mapping: [Source: `architecture.md`, line 659]
- Architecture project structure — `services/csvService.ts`: [Source: `architecture.md`, line 659]
- Architecture export requirements mapping: [Source: `architecture.md`, line 726]
- Architecture boundary rules — UI → Stores only, Stores → Services: [Source: `architecture.md`, lines 709-715]
- ItemDocument interface: [Source: `src/types/item.types.ts`, lines 3-17]
- LocalDraft interface: [Source: `src/types/item.types.ts`, lines 19-27]
- Existing useItemStore: [Source: `src/stores/useItemStore.ts` — 126 lines, items + drafts + sync state]
- Existing SettingsScreen: [Source: `src/screens/SettingsScreen.tsx` — 195 lines, user card + auth + version]
- Existing firestoreService fetchItems: [Source: `src/services/firestoreService.ts`, lines 69-87]
- Existing config constants: [Source: `src/constants/config.ts` — SNACKBAR_DURATION_MS]
- Project context — architectural boundary rules: [Source: `project-context.md`, lines 94-100]
- Project context — error handling patterns: [Source: `project-context.md`, lines 102-109]
- Project context — no hardcoded colors: [Source: `project-context.md`, lines 72-74]
- Project context — naming conventions: [Source: `project-context.md`, lines 152-172]
- Previous story 6-3: [Source: `_bmad-output/implementation-artifacts/6-3-background-sync-engine.md`]
- Previous story 6-2: [Source: `_bmad-output/implementation-artifacts/6-2-local-draft-save-and-offline-cataloging.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Updated sprint tracker to set `7-1-csv-export-and-share` to `in-progress`
- Implemented CSV generation + share orchestration in `src/services/csvService.ts`
- Added export button, loading guard, and snackbar UX in `src/screens/SettingsScreen.tsx`
- Fixed Expo FileSystem API typing by using `expo-file-system/legacy`
- Verified workspace diagnostics with `get_errors` (no errors found)
- Ran AC7 build checks: `npx tsc --noEmit` and `cd functions && npx tsc --noEmit`

### Completion Notes List

- Implemented named exports `generateCsvContent` and `exportAndShareCsv` in `src/services/csvService.ts`.
- CSV output now includes both synced items and local drafts, with RFC 4180 escaping and `YYYY-MM-DD` date formatting.
- Export flow writes `snaplog-export-YYYY-MM-DD.csv` to app document storage and opens native share sheet with CSV metadata.
- Added Settings screen export action with `isExporting` concurrency guard, empty-state snackbar, and friendly error snackbar.
- Added required `testID` and `accessibilityLabel` values for new export interaction elements.
- Type checks pass with zero current diagnostics for both root app and functions package.
- [AI Code Review Fix] Fixed date formatting bug for standard Date objects in csvService.ts.
- [AI Code Review Fix] Wrapped SettingsScreen content in ScrollView to prevent UI overflow on smaller devices.
- [AI Code Review Fix] Added safe string casting in escapeCsvField to prevent potential crashes from non-string values.

### File List

- src/services/csvService.ts
- src/screens/SettingsScreen.tsx
- \_bmad-output/implementation-artifacts/sprint-status.yaml
- \_bmad-output/implementation-artifacts/7-1-csv-export-and-share.md

## Change Log

- 2026-03-05: Story context created for 7-1-csv-export-and-share — comprehensive developer guide with CSV export engine, Settings screen integration, and share sheet workflow.
- 2026-03-05: Implemented Story 7.1 CSV export + share flow; updated Settings screen UI/UX, created csvService, completed typecheck verification, and moved story to review.
- 2026-03-06: Completed adversarial code review. Fixed date formatting, string escaping, and UI overflow issues. Story marked as done.
