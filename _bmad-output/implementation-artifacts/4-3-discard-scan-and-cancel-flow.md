# Story 4.3: Discard Scan & Cancel Flow

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to abandon a scan and return to the dashboard without saving,
So that I can skip items I don't want to catalog.

## Acceptance Criteria

**AC1 — Discard from Camera Screen (Close Button):**

- **Given** the user is on the Camera screen (live viewfinder, captured preview, or error overlay)
- **When** the user taps the close button (X icon, top-left)
- **Then** the camera modal is dismissed and the user returns to the Dashboard (FR15)
- **And** no data is persisted to Firestore or Cloud Storage
- **And** any temporary compressed image created during the session is cleaned up from local storage
- **And** all in-progress state (captured image URI, processing data, analysis states) is discarded
- **And** no confirmation dialog is shown (consistent with no-modal pattern per UX spec)

**AC2 — Discard from Review Form Screen (Back Button):**

- **Given** the user is on the Review Form screen (AI-populated or manual entry)
- **When** the user taps the back/discard button
- **Then** the user returns to the Dashboard (not back to Camera) via `navigation.reset()`
- **And** the current scan is discarded without saving (FR15)
- **And** no data is persisted to Firestore
- **And** if an image was uploaded to Cloud Storage during AI analysis, it is cleaned up (deleted) to avoid orphaned files
- **And** the temporary compressed image is cleaned up from local storage
- **And** no confirmation dialog is shown (consistent with no-modal save pattern)

**AC3 — Temporary Image Cleanup Utility:**

- **Given** compressed images are created by `imageService.compressImage()` as temporary files
- **When** a scan is discarded (from Camera or Review Form)
- **Then** the compressed image file at the local URI is deleted using `expo-file-system`
- **And** cleanup failures are silently caught and logged (never crash the app — NFR-R1)
- **And** cleanup is best-effort — the user experience is never blocked by cleanup operations

**AC4 — Orphaned Cloud Storage Cleanup:**

- **Given** during the AI analysis flow, an image was uploaded to Cloud Storage (storagePath exists in nav params or processingData ref)
- **When** the user discards from Camera screen (after AI upload) or from Review Form
- **Then** the uploaded Cloud Storage image is deleted via `storageService.deleteItemImage(storagePath)`
- **And** deletion failures are silently caught and logged (best-effort cleanup)
- **And** the deletion does not block the user from returning to the Dashboard

**AC5 — Android Hardware Back Button:**

- **Given** the user is on the Camera screen or Review Form screen
- **When** the user presses the Android hardware back button
- **Then** the same discard behavior occurs as tapping the close/back button (AC1 or AC2)
- **And** React Navigation's default back behavior handles this — no custom `BackHandler` needed since `navigation.goBack()` and `navigation.reset()` already work with hardware back

**AC6 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (no functions changes, but verify no regression)

## Tasks / Subtasks

- [x] **Task 1: Create `cleanupTempImage` utility in `imageService.ts`** (AC: 3)
  - [x] Add `cleanupTempImage(uri: string): Promise<void>` function to `src/services/imageService.ts`
  - [x] Use `expo-file-system`'s `File` class (already imported in imageService.ts) to delete the temp file
  - [x] Wrap in try/catch — log warning on failure, never throw
  - [x] Export the function for use in screens

- [x] **Task 2: Update `CameraScreen.tsx` close button to clean up resources** (AC: 1, 3, 4)
  - [x] Create a `handleDiscard` function that:
    1. Calls `cleanupTempImage(processingData.current.compressedUri)` if a compressed image exists
    2. Calls `deleteItemImage(processingData.current.storagePath)` if an uploaded image exists
    3. Calls `navigation.goBack()` to dismiss the camera modal
  - [x] Replace both close button `onPress={() => navigation.goBack()}` handlers (viewfinder and preview states) with `onPress={handleDiscard}`
  - [x] Ensure cleanup is fire-and-forget (don't await — user sees immediate navigation)

- [x] **Task 3: Update `ReviewFormScreen.tsx` back/discard button to clean up and reset** (AC: 2, 3, 4)
  - [x] Modify `handleBack` to become `handleDiscard`:
    1. Call `cleanupTempImage(imageUri)` to delete the local compressed image
    2. If `existingStoragePath` (from nav params) exists, call `deleteItemImage(existingStoragePath)` to clean up orphaned Cloud Storage image
    3. Use `navigation.reset({ index: 0, routes: [{ name: 'Main' }] })` instead of `navigation.goBack()` to return directly to Dashboard
  - [x] Import `cleanupTempImage` from `@/services/imageService`
  - [x] Import `deleteItemImage` from `@/services/storageService`
  - [x] Update the back button `onPress` to call `handleDiscard`
  - [x] Ensure cleanup is fire-and-forget

- [x] **Task 4: Build verification** (AC: 6)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                               | Current State                                                                                                                                                                                                                                                                              | This Story's Action                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `src/screens/CameraScreen.tsx`     | 887 lines — has close button (X icon) with `navigation.goBack()` in TWO places (viewfinder state line 697 and preview state line 606); has `processingData` ref tracking `compressedUri`, `storagePath`, `downloadUrl`; has `handleRetake` which resets state but doesn't clean temp files | **MODIFY** — add `handleDiscard` that cleans up temp image + Cloud Storage before navigating back     |
| `src/screens/ReviewFormScreen.tsx` | 388 lines — has `handleBack` that just calls `navigation.goBack()`; has `existingStoragePath` and `existingDownloadUrl` from route.params                                                                                                                                                  | **MODIFY** — rename `handleBack` → `handleDiscard`, add cleanup logic, change to `navigation.reset()` |
| `src/services/imageService.ts`     | 97 lines — `compressImage()` creates temp files using `expo-image-manipulator`; imports `File` from `expo-file-system`                                                                                                                                                                     | **MODIFY** — add `cleanupTempImage()` function                                                        |
| `src/services/storageService.ts`   | 41 lines — has `deleteItemImage(storagePath)` that deletes from Cloud Storage with error handling                                                                                                                                                                                          | **NO CHANGES** — reuse existing `deleteItemImage`                                                     |
| `src/types/navigation.types.ts`    | Navigation types with `ReviewForm: { imageUri, aiResult?, storagePath?, downloadUrl? }`                                                                                                                                                                                                    | **NO CHANGES**                                                                                        |
| `src/constants/config.ts`          | App constants                                                                                                                                                                                                                                                                              | **NO CHANGES**                                                                                        |
| `src/constants/theme.ts`           | Theme tokens                                                                                                                                                                                                                                                                               | **NO CHANGES**                                                                                        |
| `src/stores/useItemStore.ts`       | Item store                                                                                                                                                                                                                                                                                 | **NO CHANGES**                                                                                        |
| `src/stores/useAuthStore.ts`       | Auth store                                                                                                                                                                                                                                                                                 | **NO CHANGES**                                                                                        |

#### What NEEDS TO BE MODIFIED

| File                               | Purpose                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `src/services/imageService.ts`     | **MODIFY** — add `cleanupTempImage(uri)` function                            |
| `src/screens/CameraScreen.tsx`     | **MODIFY** — add `handleDiscard` with cleanup, replace close button handlers |
| `src/screens/ReviewFormScreen.tsx` | **MODIFY** — update `handleBack` to clean up and use `navigation.reset()`    |

---

### Key Implementation Details

#### `cleanupTempImage` in `imageService.ts` (ADD TO EXISTING FILE)

```typescript
/**
 * Best-effort cleanup of a temporary compressed image file.
 * Silently catches errors — never blocks the user or crashes.
 */
export async function cleanupTempImage(uri?: string | null): Promise<void> {
  if (!uri) return;

  try {
    const file = new File(uri);
    if (file.exists) {
      await file.delete();
    }
  } catch (error) {
    console.warn("Failed to clean up temp image:", uri, error);
  }
}
```

> **⚠️ IMPORTANT**: The `File` class from `expo-file-system` is already imported at line 1 of `imageService.ts`. Use the same `File` class for the cleanup operation. The `File` API uses `.delete()` method and `.exists` property — verify these are available in the current Expo SDK 54 version of `expo-file-system`. If `.delete()` is not available on the `File` class, use the classic `deleteAsync` from `expo-file-system` instead: `import { deleteAsync } from 'expo-file-system'; await deleteAsync(uri, { idempotent: true });`

---

#### CameraScreen `handleDiscard` (ADD TO EXISTING FILE)

```typescript
const handleDiscard = useCallback(() => {
  // Fire-and-forget cleanup — don't block navigation
  const { compressedUri, storagePath } = processingData.current;

  if (compressedUri) {
    void cleanupTempImage(compressedUri);
  }
  if (storagePath) {
    void deleteItemImage(storagePath);
  }

  navigation.goBack();
}, [navigation]);
```

**New imports to add to CameraScreen.tsx:**

```typescript
import { cleanupTempImage } from "@/services/imageService";
// deleteItemImage is already imported from storageService
```

> **⚠️ IMPORTANT**: `deleteItemImage` is NOT currently imported in CameraScreen.tsx. Check line 28 — only `uploadItemImage` is imported. You need to add `deleteItemImage` to the import from `@/services/storageService`.

**Replace both close button handlers:**

1. **Viewfinder state** (around line 697): Replace `onPress={() => navigation.goBack()}` with `onPress={handleDiscard}`
2. **Preview state** (around line 606): Replace `onPress={() => navigation.goBack()}` with `onPress={handleDiscard}`

---

#### ReviewFormScreen `handleDiscard` (MODIFY EXISTING `handleBack`)

```typescript
const handleDiscard = useCallback(() => {
  // Fire-and-forget cleanup — don't block navigation
  void cleanupTempImage(imageUri);

  if (existingStoragePath) {
    void deleteItemImage(existingStoragePath);
  }

  // Reset to Dashboard — don't go back to Camera
  navigation.reset({ index: 0, routes: [{ name: "Main" }] });
}, [navigation, imageUri, existingStoragePath]);
```

**New imports to add to ReviewFormScreen.tsx:**

```typescript
import { cleanupTempImage } from "@/services/imageService";
import { deleteItemImage } from "@/services/storageService";
```

**Update the back button:**

Replace `onPress={handleBack}` with `onPress={handleDiscard}` and update the button's `accessibilityLabel` to `"Discard and return to dashboard"`.

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Awaiting cleanup before navigation
await cleanupTempImage(imageUri);    // DON'T await — blocks user
await deleteItemImage(storagePath);  // DON'T await — blocks user
navigation.goBack();
// DO: Use void to fire-and-forget:
void cleanupTempImage(imageUri);
void deleteItemImage(storagePath);
navigation.goBack();  // User navigates immediately

// ❌ WRONG: Showing a confirmation dialog before discard
Alert.alert("Discard?", "Are you sure?", [...]);
// DO: Discard immediately. UX spec explicitly says NO confirmation dialogs for discards.

// ❌ WRONG: Using navigation.goBack() from ReviewForm
navigation.goBack();  // Goes back to Camera, not Dashboard
// DO: Use navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
// This ensures user lands on Dashboard, not back on the Camera screen

// ❌ WRONG: Throwing on cleanup failure
if (!file.exists) {
  throw new Error("File not found");  // DON'T throw — cleanup is best-effort
}
// DO: Silently log and return. Cleanup failures must never crash.

// ❌ WRONG: Creating a new service file for cleanup
// src/services/cleanupService.ts — WRONG location
// DO: Add cleanupTempImage to existing imageService.ts — it's related to image operations

// ❌ WRONG: Using FileSystem.deleteAsync without checking import
import * as FileSystem from "expo-file-system";
await FileSystem.deleteAsync(uri);
// DO: Use the `File` class already imported in imageService.ts, OR use named import
// { deleteAsync } from "expo-file-system" if the File class doesn't support .delete()

// ❌ WRONG: Not cleaning up Cloud Storage images on discard from ReviewForm
// The AI flow uploads the image BEFORE showing ReviewForm
// If user discards from ReviewForm, that Cloud Storage file becomes orphaned
// DO: Delete it using deleteItemImage(existingStoragePath) from storageService
```

---

### Previous Story Intelligence

**From Story 4.2 (Confirm & Save Item to Cloud):**

1. **`existingStoragePath` and `existingDownloadUrl`** are extracted from `route.params` in ReviewFormScreen. When AI analysis is used, CameraScreen uploads the image first, then passes `storagePath` and `downloadUrl` via navigation params. These are the keys needed for cleanup.

2. **`deleteItemImage`** already exists in `storageService.ts` (added during 4.2's code review fix for orphaned images). It handles errors gracefully with `console.warn`.

3. **Navigation reset pattern**: `navigation.reset({ index: 0, routes: [{ name: 'Main' }] })` is already used in the save flow to return to Dashboard. Use the same pattern for discard from ReviewForm.

4. **Snackbar timing fix**: Story 4.2 revealed that navigating immediately hides the snackbar. For discard, this isn't an issue since there's no snackbar — just immediate navigation.

**From Story 4.1 (Review Form Screen):**

1. **`handleBack` function** currently just calls `navigation.goBack()`. This goes back to the Camera screen, NOT the Dashboard. For discard, we want to go to Dashboard.

2. **Back button** is rendered in ReviewFormScreen with `onPress={handleBack}` — update reference to `handleDiscard`.

**From Story 3.3/3.4 (AI Service & Failure Handling):**

1. **CameraScreen uploads image during AI flow** — `processingData.current` stores `compressedUri`, `storagePath`, and `downloadUrl`. All three need cleanup consideration on discard.

2. **The `handleRetake` function** resets state but does NOT clean up temp files or Cloud Storage — this is a partial cleanup. The new `handleDiscard` must do full cleanup.

---

### Git Intelligence

Recent commits show work on `develop` branch with stories 4.1 and 4.2 completed. Codebase conventions:

- `void` prefix for fire-and-forget async calls (already used in CameraScreen for `handleUsePhoto` and `handleRetryAnalysis`)
- `useCallback` for all handler functions with proper dependency arrays
- `processingData` ref pattern in CameraScreen for tracking intermediate data
- Modular Firebase imports
- `testID` and `accessibilityLabel` on all interactive elements

---

### Dependency Check

**No new dependencies required.**

All needed packages are already installed:

- `expo-file-system` — File class already used in `imageService.ts`
- `@/services/storageService` — `deleteItemImage` already exists
- React Navigation — `navigation.reset()` already used in ReviewFormScreen

---

### Project Structure Notes

- No new files created — this story only modifies existing files
- `cleanupTempImage` is added to `imageService.ts` because it's an image-related utility — fits the existing responsibility of that service
- Architecture boundary rules are maintained: cleanup calls go through service layer functions, not raw Firebase/file system calls from screens
- The `void` keyword before fire-and-forget async calls is the established codebase pattern (see CameraScreen line 579, 640)

### References

- Story 4.3 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.3 section]
- FR15: "User can discard a scan and return to the dashboard without saving"
- UX spec discard pattern: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — "No confirmation dialogs for saves; only for destructive actions (delete)"]
- CameraScreen close buttons: [Source: `src/screens/CameraScreen.tsx` — lines 602-615 (preview) and 693-703 (viewfinder)]
- ReviewFormScreen handleBack: [Source: `src/screens/ReviewFormScreen.tsx` — lines 66-68]
- processingData ref: [Source: `src/screens/CameraScreen.tsx` — lines 51-55]
- deleteItemImage: [Source: `src/services/storageService.ts` — lines 33-40]
- File class usage: [Source: `src/services/imageService.ts` — line 1]
- Navigation reset pattern: [Source: `src/screens/ReviewFormScreen.tsx` — used in handleConfirmSave]
- Architecture boundary rules: [Source: `_bmad-output/planning-artifacts/architecture.md` — UI → Stores → Services pattern]
- Previous story 4.2: [Source: `_bmad-output/implementation-artifacts/4-2-confirm-and-save-item-to-cloud.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Updated sprint tracking in `_bmad-output/implementation-artifacts/sprint-status.yaml` from `ready-for-dev` → `in-progress`, and then to `review` after completion.
- Completed required verification commands: `npx tsc --noEmit` (root) and `Set-Location functions; npx tsc --noEmit`.

### Completion Notes List

- Added `cleanupTempImage(uri?: string | null)` in `src/services/imageService.ts` using Expo `File` deletion with best-effort error handling.
- Added Camera discard flow via `handleDiscard` to fire-and-forget cleanup of temporary local compressed image and uploaded storage object before `navigation.goBack()`.
- Replaced both Camera close-button handlers to use discard cleanup logic in preview and live viewfinder states.
- Updated Review Form discard flow to perform fire-and-forget local/cloud cleanup and reset navigation directly to Dashboard with `navigation.reset({ index: 0, routes: [{ name: 'Main' }] })`.
- Updated Review Form discard button accessibility label to `Discard and return to dashboard`.
- Fixed resource leak on hardware/swipe back by adding `beforeRemove` listener in `ReviewFormScreen.tsx` and `CameraScreen.tsx`.
- Fixed race condition during Save by disabling the Back button while `isSaving` in `ReviewFormScreen.tsx`.
- Fixed storage leak on Retake by triggering cleanup in `handleRetake` within `CameraScreen.tsx`.
- Fixed race condition during Upload by disabling the Close button in `CameraScreen.tsx` during `isCompressing` or `isAnalyzing`.

### File List

- src/services/imageService.ts
- src/screens/CameraScreen.tsx
- src/screens/ReviewFormScreen.tsx
- \_bmad-output/implementation-artifacts/sprint-status.yaml
- \_bmad-output/implementation-artifacts/4-3-discard-scan-and-cancel-flow.md

### Change Log

- 2026-03-04: Implemented Story 4.3 discard/cancel flow and resource cleanup behavior across Camera and Review Form; verified with root and functions TypeScript checks.
- 2026-03-04: Fixed 4 issues (2 HIGH, 2 MEDIUM) identified in code review regarding race conditions and component cleanup bypasses. Review complete and status marked as done.
