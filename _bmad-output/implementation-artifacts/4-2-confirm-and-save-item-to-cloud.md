# Story 4.2: Confirm & Save Item to Cloud

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to tap one button to save my item with a satisfying confirmation,
So that I feel accomplished and can quickly move to the next item.

## Acceptance Criteria

**AC1 — Save Button Activation & Validation:**

- **Given** the user is on the Review Form with valid data (at minimum a non-empty Title)
- **When** the "Confirm & Save" button is enabled
- **Then** the button is full-width, primary/contained style, positioned at the bottom of the form
- **And** the button is disabled if the Title field is empty (minimum required field)
- **And** the button shows a loading indicator while saving (replace label with circular progress)

**AC2 — Image Upload to Cloud Storage:**

- **Given** the user taps "Confirm & Save"
- **When** the save flow begins
- **Then** if `storagePath` and `downloadUrl` are already provided via nav params (image was uploaded during AI analysis), skip the upload step and reuse those values
- **And** if no `storagePath`/`downloadUrl` exist (manual entry path), upload the image via `storageService.uploadItemImage(imageUri, userId)` to `users/{userId}/items/{imageId}` (FR17)
- **And** upload errors are caught and shown as a snackbar error message

**AC3 — Firestore Document Save:**

- **Given** the image is uploaded (or already was)
- **When** the item document is created
- **Then** `firestoreService.saveItem(userId, itemData)` saves to Firestore at `users/{userId}/items/{itemId}` (FR16)
- **And** the document follows the `ItemDocument` interface: id, title, category, color, condition, tags (string[]), notes, imageUrl, imagePath, aiGenerated, syncStatus ("synced"), createdAt, updatedAt
- **And** `tags` is parsed from comma-separated string → `string[]` (trim whitespace, filter empty)
- **And** `aiGenerated` is `true` if `aiResult` was provided in nav params, `false` otherwise
- **And** `createdAt` and `updatedAt` use `Timestamp.now()` (Firestore server timestamp)
- **And** save errors are caught and shown as a snackbar error message

**AC4 — Haptic Feedback:**

- **Given** the save is initiated
- **When** the user taps "Confirm & Save"
- **Then** haptic feedback (medium intensity) fires immediately on tap via `expo-haptics`
- **And** `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`

**AC5 — Success Animation & Navigation:**

- **Given** the item is successfully saved to Firestore
- **When** save completes
- **Then** the new item is added to the Zustand store via `useItemStore.addItem()`
- **And** a snackbar shows "Item saved" for 3 seconds (`SNACKBAR_DURATION_MS` from config)
- **And** navigation resets to Dashboard: `navigation.reset({ index: 0, routes: [{ name: 'Main' }] })` so the user lands on the Dashboard with the new item visible at the top
- **And** no confirmation dialog is shown (one-tap only save)

**AC6 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (no functions changes, but verify no regression)

## Tasks / Subtasks

- [x] **Task 1: Create `firestoreService.ts`** (AC: 3)
  - [x] Create `src/services/firestoreService.ts`
  - [x] Implement `saveItem(userId: string, itemData: Omit<ItemDocument, 'id'>): Promise<ItemDocument>` — generates doc ref with auto-ID, saves to `users/{userId}/items/{itemId}`, returns the full document with `id` set
  - [x] Import `collection, doc, setDoc, Timestamp` from `firebase/firestore`
  - [x] Import `db` from `@/services/firebaseConfig`
  - [x] Wrap in try/catch with descriptive error message

- [x] **Task 2: Install `expo-haptics`** (AC: 4)
  - [x] Run `npx expo install expo-haptics`
  - [x] Verify it's compatible with Expo SDK 54

- [x] **Task 3: Implement save flow in `ReviewFormScreen.tsx`** (AC: 1, 2, 3, 4, 5)
  - [x] Add imports: `expo-haptics`, `firestoreService`, `storageService`, `useAuthStore`, `useItemStore`, `Snackbar` from react-native-paper, `Timestamp` from firebase/firestore
  - [x] Extract `storagePath` and `downloadUrl` from `route.params`
  - [x] Add `isSaving` state (`useState<boolean>(false)`)
  - [x] Add `snackbarVisible` state + `snackbarMessage` state for Snackbar
  - [x] Compute `isFormValid` = `title.trim().length > 0`
  - [x] Enable "Confirm & Save" button: `disabled={!isFormValid || isSaving}`
  - [x] Show loading state on button when `isSaving` (use `loading` prop on Paper Button)
  - [x] Implement `handleConfirmSave` async function:
    1. Set `isSaving = true`
    2. Fire haptic: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`
    3. Get `userId` from `useAuthStore.getState().user?.uid` — if null, show error snackbar and return
    4. If `storagePath && downloadUrl` exist in params, use them; else call `uploadItemImage(imageUri, userId)` for both
    5. Parse tags: `tags.split(',').map(t => t.trim()).filter(Boolean)`
    6. Build `ItemDocument` (without `id`) from form state + upload results
    7. Call `firestoreService.saveItem(userId, itemData)` → returns full doc with `id`
    8. Call `useItemStore.getState().addItem(savedItem)`
    9. Show snackbar: "Item saved"
    10. Navigate: `navigation.reset({ index: 0, routes: [{ name: 'Main' }] })`
    11. On error: set `isSaving = false`, show error snackbar

- [x] **Task 4: Add Snackbar component to ReviewFormScreen** (AC: 5)
  - [x] Add `<Snackbar>` outside `ScrollView` but inside `KeyboardAvoidingView`
  - [x] Duration: `SNACKBAR_DURATION_MS` (3000ms from config)
  - [x] Use `testID="review-form-snackbar"` and `accessibilityLabel`

- [x] **Task 5: Build verification** (AC: 6)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                               | Current State                                                                                                                                           | This Story's Action                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------- |
| `src/screens/ReviewFormScreen.tsx` | 268 lines — has Title, Category, Color, Condition, Tags, Notes fields with AIFieldBadge; KeyboardAvoidingView; Back button; **disabled** Confirm & Save | **MODIFY** — enable save button, implement save flow, add Snackbar |
| `src/services/storageService.ts`   | Complete — `uploadItemImage(localUri, userId)` returns `{ downloadUrl, storagePath }`                                                                   | **NO CHANGES** — reuse existing                                    |
| `src/services/firebaseConfig.ts`   | Exports `app`, `auth`, `db`, `storage`, `functions`                                                                                                     | **NO CHANGES**                                                     |
| `src/stores/useItemStore.ts`       | 103 lines — has `addItem(item)`, `addDraft(draft)`, `deleteItem(id)`, etc.                                                                              | **NO CHANGES** — call `addItem()` from screen                      |
| `src/stores/useAuthStore.ts`       | Has `user: AuthUser                                                                                                                                     | null`with`uid` field                                               | **NO CHANGES** — read `user.uid` |
| `src/types/item.types.ts`          | `ItemDocument` interface with all fields; `LocalDraft` interface                                                                                        | **NO CHANGES**                                                     |
| `src/types/navigation.types.ts`    | `ReviewForm: { imageUri, aiResult?, storagePath?, downloadUrl? }`                                                                                       | **NO CHANGES** — params already include storagePath/downloadUrl    |
| `src/types/api.types.ts`           | `AnalyzeItemResponseData` (title, category, color, condition)                                                                                           | **NO CHANGES**                                                     |
| `src/constants/config.ts`          | `SNACKBAR_DURATION_MS=3000`, `MIN_TOUCH_TARGET=44`                                                                                                      | **NO CHANGES**                                                     |
| `src/constants/theme.ts`           | Full MD3 dark theme tokens                                                                                                                              | **NO CHANGES**                                                     |
| `src/components/AIFieldBadge.tsx`  | Sparkle icon badge                                                                                                                                      | **NO CHANGES**                                                     |
| `src/screens/CameraScreen.tsx`     | 887 lines — uploads image to Cloud Storage during AI flow, passes `storagePath` + `downloadUrl` to ReviewForm                                           | **NO CHANGES**                                                     |

#### What NEEDS TO BE CREATED

| File                               | Purpose                                          |
| ---------------------------------- | ------------------------------------------------ |
| `src/services/firestoreService.ts` | **[NEW]** — Firestore CRUD operations (saveItem) |

#### What NEEDS TO BE MODIFIED

| File                               | Purpose                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/screens/ReviewFormScreen.tsx` | **MODIFY** — enable "Confirm & Save", implement save flow with haptics, snackbar, and navigation reset |

---

### Key Implementation Details

#### `firestoreService.ts` (NEW FILE)

```typescript
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import type { ItemDocument } from "@/types/item.types";

export async function saveItem(
  userId: string,
  itemData: Omit<ItemDocument, "id">,
): Promise<ItemDocument> {
  try {
    const itemsRef = collection(db, "users", userId, "items");
    const newDocRef = doc(itemsRef); // Auto-generate ID
    const itemWithId: ItemDocument = { ...itemData, id: newDocRef.id };
    await setDoc(newDocRef, itemWithId);
    return itemWithId;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to save item to Firestore: ${message}`);
  }
}
```

> **⚠️ IMPORTANT**: Use modular Firestore imports (`firebase/firestore`), NOT `firebase/compat`. The `db` instance is already exported from `firebaseConfig.ts`. Use `doc(collection(db, ...))` for auto-ID generation, then `setDoc` to write the document.

---

#### ReviewFormScreen Save Flow

**New imports to add:**

```typescript
import * as Haptics from "expo-haptics";
import { Snackbar } from "react-native-paper";
import { Timestamp } from "firebase/firestore";

import { saveItem } from "@/services/firestoreService";
import { uploadItemImage } from "@/services/storageService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemStore } from "@/stores/useItemStore";
import { SNACKBAR_DURATION_MS } from "@/constants/config";
```

**New state to add:**

```typescript
const [isSaving, setIsSaving] = useState(false);
const [snackbarVisible, setSnackbarVisible] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
```

**Extract additional nav params:**

```typescript
const {
  imageUri,
  aiResult,
  storagePath: existingStoragePath,
  downloadUrl: existingDownloadUrl,
} = route.params;
```

**Validation:**

```typescript
const isFormValid = title.trim().length > 0;
```

**Handler function:**

```typescript
const handleConfirmSave = async () => {
  if (!isFormValid || isSaving) return;

  setIsSaving(true);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  try {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) {
      setSnackbarMessage("Please sign in to save items");
      setSnackbarVisible(true);
      setIsSaving(false);
      return;
    }

    // Step 1: Get image URLs (reuse existing or upload new)
    let finalStoragePath = existingStoragePath;
    let finalDownloadUrl = existingDownloadUrl;

    if (!finalStoragePath || !finalDownloadUrl) {
      const uploadResult = await uploadItemImage(imageUri, userId);
      finalStoragePath = uploadResult.storagePath;
      finalDownloadUrl = uploadResult.downloadUrl;
    }

    // Step 2: Parse tags from comma-separated string
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Step 3: Build item document
    const now = Timestamp.now();
    const itemData: Omit<ItemDocument, "id"> = {
      title: title.trim(),
      category: category.trim(),
      color: color.trim(),
      condition: (condition.trim() || "Good") as ItemDocument["condition"],
      tags: parsedTags,
      notes: notes.trim(),
      imageUrl: finalDownloadUrl,
      imagePath: finalStoragePath,
      aiGenerated: Boolean(aiResult),
      syncStatus: "synced",
      createdAt: now,
      updatedAt: now,
    };

    // Step 4: Save to Firestore
    const savedItem = await saveItem(userId, itemData);

    // Step 5: Add to local store
    useItemStore.getState().addItem(savedItem);

    // Step 6: Show success and navigate
    setSnackbarMessage("Item saved");
    setSnackbarVisible(true);
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save item";
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    setIsSaving(false);
  }
};
```

**Modify the Confirm & Save button:**

```tsx
<Button
  mode="contained"
  disabled={!isFormValid || isSaving}
  loading={isSaving}
  onPress={handleConfirmSave}
  style={styles.confirmButton}
  contentStyle={styles.buttonContent}
  testID="review-form-confirm-save"
  accessibilityLabel="Confirm and save"
>
  Confirm & Save
</Button>
```

**Add Snackbar (after ScrollView, before closing KeyboardAvoidingView):**

```tsx
<Snackbar
  visible={snackbarVisible}
  onDismiss={() => setSnackbarVisible(false)}
  duration={SNACKBAR_DURATION_MS}
  testID="review-form-snackbar"
  accessibilityLabel="Save status notification"
>
  {snackbarMessage}
</Snackbar>
```

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Creating a new store for save state
// Form save state is LOCAL (useState) — not Zustand. Only the saved item goes to Zustand.

// ❌ WRONG: Using firebase/compat imports
import firebase from "firebase/compat/app"  // NEVER DO THIS
// DO: Use modular imports: import { doc, setDoc } from "firebase/firestore"

// ❌ WRONG: Calling Firestore directly from the screen
await setDoc(doc(db, "users", userId, "items", itemId), data);
// DO: Call firestoreService.saveItem(userId, data) — architecture boundary rule

// ❌ WRONG: Hardcoding snackbar duration
duration={3000}
// DO: Use SNACKBAR_DURATION_MS from @/constants/config

// ❌ WRONG: Using navigation.navigate to go to Dashboard
navigation.navigate("Main")  // Doesn't clear the Camera/ReviewForm from stack
// DO: Use navigation.reset() to clear the full stack and land on Dashboard clean

// ❌ WRONG: Forgetting to handle the case where storagePath/downloadUrl already exist
const upload = await uploadItemImage(imageUri, userId);  // DON'T always upload
// DO: Check route.params for existing storagePath/downloadUrl first (they come from AI flow)

// ❌ WRONG: Storing tags as string in Firestore
tags: tags  // String — but ItemDocument.tags is string[]
// DO: Parse: tags.split(',').map(t => t.trim()).filter(Boolean)

// ❌ WRONG: Forgetting haptic feedback
// DO: Call Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) immediately on button press

// ❌ WRONG: Using useAuthStore hook in handleConfirmSave
const { user } = useAuthStore();  // Can't use hooks inside handlers
// DO: Use useAuthStore.getState().user?.uid — getState() works outside React lifecycle

// ❌ WRONG: Missing try/catch on save flow
const savedItem = await saveItem(userId, itemData); // If this throws, app crashes
// DO: Wrap entire flow in try/catch, show snackbar on error, set isSaving=false

// ✅ CORRECT: Using type assertion for condition
condition: (condition.trim() || "Good") as ItemDocument["condition"]
// Condition is typed as union: 'Excellent' | 'Good' | 'Fair' | 'Poor'
```

---

### Previous Story Intelligence

**From Story 4.1 (Review Form Screen):**

1. **Tags stored as comma-separated string** — `useState<string>('')`. This story must parse to `string[]` on save: `tags.split(',').map(t => t.trim()).filter(Boolean)`.

2. **Confirm & Save button is currently disabled (`disabled` prop)** — This story enables it with `disabled={!isFormValid || isSaving}` and adds `onPress={handleConfirmSave}` and `loading={isSaving}`.

3. **KeyboardAvoidingView + ScrollView structure** — Snackbar should be placed OUTSIDE ScrollView but INSIDE KeyboardAvoidingView so it renders above the scroll content.

4. **Code Review findings applied** — ScrollView padding fix, AIFieldBadge spacing, accessibility labels on all field labels, keyboardVerticalOffset added.

**From Story 3.3 (AI Service Client & Loading Experience):**

1. **CameraScreen uploads image during AI flow** — When AI is used, `storagePath` and `downloadUrl` are set and passed as nav params to ReviewForm. When manual entry is used, these are undefined. The save flow must handle both cases.

2. **Navigation params structure** — `ReviewForm: { imageUri, aiResult?, storagePath?, downloadUrl? }`. All optional params are set during AI flow in CameraScreen.

**From Story 3.4 (AI Failure Handling):**

1. **Manual entry path** — When "Fill Manually" is tapped, navigation to ReviewForm happens WITHOUT `aiResult`, `storagePath`, or `downloadUrl`. The save flow must upload the image in this case.

---

### Git Intelligence

Recent commits show completed work on stories 3.x and 4.1 on `develop` branch. Codebase conventions:

- `import { theme } from '@/constants/theme'` pattern
- `StyleSheet.create` with theme tokens
- `testID` and `accessibilityLabel` on all interactive elements
- `react-native-paper` components (`TextInput`, `Button`, `Text`, `Snackbar`)
- Modular Firebase imports (`firebase/firestore`, `firebase/storage`)
- Services pattern: all Firebase calls in `src/services/*.ts`

---

### Dependency Check

**New dependency required:**

```bash
npx expo install expo-haptics
```

This is needed for haptic feedback on save confirmation. It's a standard Expo managed package compatible with SDK 54.

**Existing dependencies used (no install needed):**

- `firebase/firestore` — `doc`, `collection`, `setDoc`, `Timestamp` (already in package.json via Firebase JS SDK)
- `react-native-paper` — `Snackbar` (already installed)
- `@/services/storageService` — `uploadItemImage` (exists)
- `@/stores/useItemStore` — `addItem` action (exists)
- `@/stores/useAuthStore` — `user.uid` (exists)

---

### Project Structure Notes

- `src/services/firestoreService.ts` is a **[NEW]** file — placed in `src/services/` per architecture structure
- All Firebase SDK calls go through `src/services/` — never directly from screens (boundary rule)
- Form state remains `useState` (local/screen-level) — correct per architecture
- `useItemStore.getState().addItem()` is called outside React lifecycle in the handler — this is the correct pattern for Zustand
- The Snackbar appears briefly before `navigation.reset()` clears the screen — this is acceptable UX per the AC

### References

- Story 4.2 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.2 section]
- ItemDocument interface: [Source: `src/types/item.types.ts`]
- Navigation params: [Source: `src/types/navigation.types.ts` — `ReviewForm: { imageUri, aiResult?, storagePath?, downloadUrl? }`]
- Cloud Storage upload: [Source: `src/services/storageService.ts` — `uploadItemImage(localUri, userId)`]
- Firestore config: [Source: `src/services/firebaseConfig.ts` — exports `db`]
- Item store: [Source: `src/stores/useItemStore.ts` — `addItem(item: ItemDocument)`]
- Auth store: [Source: `src/stores/useAuthStore.ts` — `user: AuthUser | null` with `uid`]
- Config constants: [Source: `src/constants/config.ts` — `SNACKBAR_DURATION_MS=3000`]
- Architecture boundary rules: [Source: `_bmad-output/planning-artifacts/architecture.md` — UI → Stores → Services pattern]
- Naming conventions: [Source: `_bmad-output/project-context.md`]
- Haptic feedback requirement: [Source: `_bmad-output/planning-artifacts/epics.md` — "haptic feedback (medium intensity) fires on confirm tap"]
- Current ReviewFormScreen: [Source: `src/screens/ReviewFormScreen.tsx` — 268 lines]
- Previous story 4.1: [Source: `_bmad-output/implementation-artifacts/4-1-review-form-screen.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npx expo install expo-haptics`
- `npx tsc --noEmit`
- `powershell -NoProfile -Command "Set-Location functions; npx tsc --noEmit"`
- `Set-Location functions; npm test -- --runInBand`
- `npx eslint src/screens/ReviewFormScreen.tsx src/services/firestoreService.ts`
- `npm run lint` (functions)

### Completion Notes List

- Added `saveItem` in `src/services/firestoreService.ts` using modular Firestore APIs with auto-ID document generation and explicit error wrapping.
- Implemented Review Form save flow in `src/screens/ReviewFormScreen.tsx` with title validation, haptic feedback, conditional image upload reuse/upload, tag parsing, Firestore save, Zustand update, snackbar feedback, and navigation reset.
- Installed `expo-haptics` with Expo SDK 54 compatible version.
- Completed verification checks: root and functions typecheck passed; functions Jest tests passed.

### File List

- `src/services/firestoreService.ts` (new)
- `src/services/storageService.ts` (modified)
- `src/screens/ReviewFormScreen.tsx` (modified)
- `package.json` (modified)
- `package-lock.json` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

- 2026-03-04: Implemented Story 4.2 confirm-and-save flow, added Firestore save service, installed haptics dependency, and completed validation checks.

### Senior Developer Review (AI)

**Review Date:** 2026-03-04
**Outcome:** Fixed
**Findings resolved:**
1. **[HIGH] Snackbar flash bug**: Success notification is never seen because navigation resets instantly. Fixed by adding a 1500ms timeout before `.reset()`.
2. **[MEDIUM] Orphaned Cloud Storage Image**: Uploaded image wasn't deleted if Firestore save failed. Fixed by implementing `deleteItemImage` in `storageService` and wrapping the save in a secondary try-catch with fallback deletion.
3. **[LOW] Haptic Feedback Promise**: `Haptics.impactAsync` discarded the promise. Fixed by adding `await`.
 *(Note: Medium issue regarding automated tests was skipped as the client-side test suite is not currently configured).*
