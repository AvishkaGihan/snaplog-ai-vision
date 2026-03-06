# Story 3.4: AI Failure Handling & Manual Entry Fallback

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a clean manual entry option when AI analysis fails,
So that I can still catalog items regardless of AI or network issues.

## Acceptance Criteria

**AC1 — Timeout Error State with CTAs:**

- **Given** the AI analysis is in progress on the CameraScreen
- **When** the AI analysis times out after `AI_TIMEOUT_MS` (currently 20s in `config.ts`)
- **Then** the `ScanLoadingOverlay` stops and an inline error state appears on CameraScreen with two CTAs: "Try Again" (primary button) and "Fill Manually" (secondary/outlined button)
- **And** a friendly toast message appears: "Couldn't analyze image. Fill in details manually or retry."
- **And** the error state replaces the loading overlay on the captured image preview
- **And** the app does NOT crash (NFR-R1)

**AC2 — AI Response Failure Error State:**

- **Given** the AI analysis completed but returned `{ success: false }`
- **When** the CameraScreen receives the failed response
- **Then** the same inline error state appears with "Try Again" and "Fill Manually" CTAs (identical to AC1)
- **And** a friendly toast/snackbar message shows: "Couldn't analyze image. Fill in details manually or retry."
- **And** the specific error code is logged to console for debugging: `RATE_LIMITED`, `AI_PARSE_FAILURE`, `AI_TIMEOUT`, `INVALID_IMAGE`

**AC3 — "Fill Manually" Flow:**

- **Given** the error state is displayed with CTAs
- **When** the user taps "Fill Manually"
- **Then** the user is navigated to the ReviewFormScreen with `imageUri` only (no `aiResult`)
- **And** the ReviewFormScreen shows all fields blank (Title, Category, Color, Condition) — no `AIFieldBadge` shown
- **And** the form is otherwise identical in layout and behavior to the AI-populated form (FR9)
- **And** `storagePath` and `downloadUrl` are passed if the upload had already completed before the failure

**AC4 — "Try Again" Flow:**

- **Given** the error state is displayed with CTAs
- **When** the user taps "Try Again"
- **Then** the AI analysis retries from the **same already-uploaded image** (re-uses `downloadUrl` from the initial upload)
- **And** the `ScanLoadingOverlay` reappears during the retry
- **And** if the image was never successfully uploaded (upload failed), then "Try Again" re-uploads + re-analyzes
- **And** the retry uses the same timeout protection (`ScanLoadingOverlay` with `onTimeout`)
- **And** on success, the user navigates to the ReviewFormScreen with AI-populated fields
- **And** on repeated failure, the error state reappears again (user can retry or fill manually indefinitely)

**AC5 — Zod safeParse Failure Handling:**

- **Given** the Cloud Function returns data but Zod `.safeParse()` fails on the response
- **When** the client receives the AI response
- **Then** the `aiService.ts` catches the parse failure and returns `{ success: false, error: { code: 'AI_PARSE_FAILURE', message: '...' } }`
- **And** manual entry is presented (same as AC2/AC3)
- **And** this is **already handled** by the existing `aiService.ts` — no client-side changes needed for Zod handling itself

**AC6 — Zero-Crash Guarantee:**

- **Given** any AI failure mode (timeout, network error, invalid response, rate limit, Zod parse failure)
- **When** the failure occurs
- **Then** the app NEVER crashes (NFR-R1)
- **And** the user always has a path forward (retry or manual entry)
- **And** all error paths use try/catch to prevent unhandled exceptions

**AC7 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (no functions changes, but verify no regression)

## Tasks / Subtasks

- [x] **Task 1: Modify CameraScreen to show error state with CTAs** (AC: 1, 2, 4, 6)
  - [x] Add new state: `analysisError: boolean` — tracks whether to show the error state vs the loading overlay
  - [x] Add state: `hasUploadedData: boolean` — tracks whether upload completed before failure (determines retry behavior)
  - [x] Modify `handleAnalysisTimeout` callback to set `analysisError = true` instead of auto-navigating to ReviewForm
  - [x] Modify `handleUsePhoto` catch block to set `analysisError = true` instead of auto-navigating to ReviewForm
  - [x] Handle AI response failure (`success: false`) by setting `analysisError = true` instead of silently navigating
  - [x] Create inline error state UI in the captured image preview: error icon, friendly message, "Try Again" + "Fill Manually" buttons
  - [x] Implement `handleRetryAnalysis` callback: if `downloadUrl` exists → only re-analyze; otherwise → re-upload + re-analyze
  - [x] Implement `handleFillManually` callback: navigate to ReviewForm with `imageUri` (+ `storagePath`/`downloadUrl` if available)
  - [x] Show `Snackbar` toast with "Couldn't analyze image. Fill in details manually or retry."
  - [x] Log error code with `console.warn` for debugging
  - [x] Ensure all error states use try/catch — no unhandled promise rejections

- [x] **Task 2: Update ReviewFormScreen to ensure manual entry works identically** (AC: 3)
  - [x] Verify the ReviewFormScreen already handles `aiResult` being `undefined` (all fields blank, no `AIFieldBadge`)
  - [x] **Note: This is already implemented correctly from Story 3.3 — verify but no changes expected**

- [x] **Task 3: Build verification** (AC: 7)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

The following files exist from Stories 3.1–3.3 and earlier epics. Most are **unchanged** in this story:

| File                                    | Current State                                                                                                       | This Story's Action                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/screens/CameraScreen.tsx`          | Complete camera + gallery + compression + upload + AI analysis flow with ScanLoadingOverlay and timeout handling    | **MODIFY** — add error state UI with "Try Again" / "Fill Manually" CTAs; modify timeout/failure behavior |
| `src/screens/ReviewFormScreen.tsx`      | Full form with AI-populated fields, AIFieldBadge, back button, disabled Confirm & Save                              | **NO CHANGES** — already handles `aiResult` being `undefined`                                            |
| `src/services/aiService.ts`             | Complete — calls `analyzeItem` Cloud Function, returns `{ success, data, error }` on all paths                      | **NO CHANGES** — already handles all error codes gracefully                                              |
| `src/services/storageService.ts`        | Complete — `uploadItemImage(localUri, userId)` returns `{ downloadUrl, storagePath }`                               | **NO CHANGES**                                                                                           |
| `src/services/imageService.ts`          | Complete — `compressImage()` returns `{ uri, width, height, size }`                                                 | **NO CHANGES**                                                                                           |
| `src/services/firebaseConfig.ts`        | Complete — exports `app`, `auth`, `db`, `storage`, `functions`                                                      | **NO CHANGES**                                                                                           |
| `src/components/ScanLoadingOverlay.tsx` | Complete — overlay with ring animation, cycling copy, `onTimeout` callback, `AI_TIMEOUT_MS` timer                   | **NO CHANGES**                                                                                           |
| `src/components/AIFieldBadge.tsx`       | Complete — sparkle icon badge for AI-populated fields                                                               | **NO CHANGES**                                                                                           |
| `src/components/index.ts`               | Exports: `PermissionCard`, `ScanLoadingOverlay`, `AIFieldBadge`                                                     | **NO CHANGES**                                                                                           |
| `src/types/api.types.ts`                | Complete — `AnalyzeItemRequest`, `AnalyzeItemResponse`, `AnalyzeItemResponseData`, `AnalyzeItemErrorCode`           | **NO CHANGES**                                                                                           |
| `src/types/navigation.types.ts`         | Complete — `ReviewForm: { imageUri, aiResult?, storagePath?, downloadUrl? }`                                        | **NO CHANGES**                                                                                           |
| `src/constants/config.ts`               | All constants defined: `AI_TIMEOUT_MS=20000`, `AI_LOADING_COPY_INTERVAL_MS=1500`, `SNACKBAR_DURATION_MS=3000`, etc. | **NO CHANGES**                                                                                           |
| `src/constants/theme.ts`                | Full theme with `semanticColors.aiAccent`, `colors.error`, etc.                                                     | **NO CHANGES**                                                                                           |
| `src/stores/useAuthStore.ts`            | Auth state with `user`                                                                                              | **NO CHANGES** — read `user.uid` from here                                                               |

#### What NEEDS TO BE MODIFIED

| File                           | Purpose                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `src/screens/CameraScreen.tsx` | **MODIFY** — Add error state with retry/manual-fill CTAs; change timeout/failure behavior |

---

### Key Implementation Details

#### Current CameraScreen Behavior (Pre-Modification)

From the existing code in `CameraScreen.tsx` (654 lines):

**Current timeout behavior (lines 107–123):**

```typescript
const handleAnalysisTimeout = useCallback(() => {
  if (!capturedImageUri || isNavigating.current || analysisTimedOut.current)
    return;
  analysisTimedOut.current = true;
  setIsAnalyzing(false);
  setIsCompressing(false);
  const { compressedUri, storagePath, downloadUrl } = processingData.current;
  navigateToReviewForm(
    compressedUri || capturedImageUri,
    undefined,
    storagePath,
    downloadUrl,
  );
}, [capturedImageUri, navigateToReviewForm]);
```

**Problem:** On timeout, it silently navigates to ReviewForm with blank fields. The user has NO option to retry. Same for AI failure — on `success: false`, it also silently navigates. **This story fixes that by showing an error state with explicit "Try Again" / "Fill Manually" CTAs.**

**Current AI failure behavior (lines 176–206):**

```typescript
if (aiResponse.success && aiResponse.data) {
  navigateToReviewForm(
    compressed.uri,
    aiResponse.data,
    storagePath,
    downloadUrl,
  );
  return;
}
// AI failed — navigate to manual entry silently
navigateToReviewForm(compressed.uri, undefined, storagePath, downloadUrl);
```

**Problem:** Same silent fallback. User doesn't even know AI failed.

---

#### Target CameraScreen Behavior (Post-Modification)

**New states to add:**

```typescript
const [analysisError, setAnalysisError] = useState(false);
```

**Modified timeout handler (`handleAnalysisTimeout`):**

```typescript
const handleAnalysisTimeout = useCallback(() => {
  if (!capturedImageUri || isNavigating.current || analysisTimedOut.current)
    return;

  analysisTimedOut.current = true;
  setIsAnalyzing(false);
  setIsCompressing(false);
  setAnalysisError(true); // Show error state with CTAs instead of auto-navigating
}, [capturedImageUri]);
```

**Modified `handleUsePhoto` — AI failure path:**

```typescript
// INSTEAD OF:
navigateToReviewForm(compressed.uri, undefined, storagePath, downloadUrl);

// DO:
console.warn(
  "AI analysis failed:",
  aiResponse.error?.code,
  aiResponse.error?.message,
);
setIsAnalyzing(false);
setAnalysisError(true); // Show error state with CTAs
```

**Modified `handleUsePhoto` — catch block:**

```typescript
} catch (error) {
  console.warn("Image analysis flow failed", error);
  if (!isMounted.current) return;
  setIsCompressing(false);
  setIsAnalyzing(false);

  if (!analysisTimedOut.current) {
    setAnalysisError(true); // Show error state with CTAs instead of auto-navigating
  }
}
```

**New callback: `handleFillManually`:**

```typescript
const handleFillManually = useCallback(() => {
  if (isNavigating.current) return;

  const { compressedUri, storagePath, downloadUrl } = processingData.current;
  navigateToReviewForm(
    compressedUri || capturedImageUri!,
    undefined,
    storagePath,
    downloadUrl,
  );
}, [capturedImageUri, navigateToReviewForm]);
```

**New callback: `handleRetryAnalysis`:**

```typescript
const handleRetryAnalysis = useCallback(async () => {
  if (!capturedImageUri || isNavigating.current) return;
  if (!user?.uid) {
    Alert.alert("Not Signed In", "You must be signed in to analyze items.");
    return;
  }

  setAnalysisError(false);
  analysisTimedOut.current = false;

  try {
    const { downloadUrl, storagePath, compressedUri } = processingData.current;

    // If upload already completed, skip re-upload — just re-analyze
    if (downloadUrl) {
      setIsAnalyzing(true);
      const aiResponse = await analyzeItem(downloadUrl);

      if (!isMounted.current || analysisTimedOut.current) return;
      setIsAnalyzing(false);

      if (aiResponse.success && aiResponse.data) {
        navigateToReviewForm(
          compressedUri || capturedImageUri,
          aiResponse.data,
          storagePath,
          downloadUrl,
        );
        return;
      }

      console.warn(
        "AI retry failed:",
        aiResponse.error?.code,
        aiResponse.error?.message,
      );
      setAnalysisError(true);
      return;
    }

    // Upload never completed — re-compress + re-upload + re-analyze
    setIsCompressing(true);
    const compressed = await compressImage(capturedImageUri);
    processingData.current.compressedUri = compressed.uri;

    if (!isMounted.current) return;

    const uploadResult = await uploadItemImage(compressed.uri, user.uid);
    processingData.current.storagePath = uploadResult.storagePath;
    processingData.current.downloadUrl = uploadResult.downloadUrl;

    if (!isMounted.current || analysisTimedOut.current) return;

    setIsCompressing(false);
    setIsAnalyzing(true);

    const aiResponse = await analyzeItem(uploadResult.downloadUrl);

    if (!isMounted.current || analysisTimedOut.current) return;
    setIsAnalyzing(false);

    if (aiResponse.success && aiResponse.data) {
      navigateToReviewForm(
        compressed.uri,
        aiResponse.data,
        uploadResult.storagePath,
        uploadResult.downloadUrl,
      );
      return;
    }

    console.warn(
      "AI retry failed:",
      aiResponse.error?.code,
      aiResponse.error?.message,
    );
    setAnalysisError(true);
  } catch (error) {
    console.warn("Retry analysis failed", error);
    if (!isMounted.current) return;
    setIsCompressing(false);
    setIsAnalyzing(false);
    if (!analysisTimedOut.current) {
      setAnalysisError(true);
    }
  }
}, [capturedImageUri, navigateToReviewForm, user]);
```

**New error state UI in the captured image preview section (insert after `ScanLoadingOverlay`, before `previewActions`):**

```tsx
{
  analysisError && !isAnalyzing && (
    <View
      style={styles.errorOverlay}
      testID="analysis-error-state"
      accessibilityLabel="AI analysis failed"
      accessibilityRole="alert"
    >
      <IconButton
        icon="alert-circle-outline"
        size={48}
        iconColor={theme.colors.error}
        testID="analysis-error-icon"
        accessibilityLabel="Error icon"
      />
      <Text style={styles.errorMessage} testID="analysis-error-message">
        Couldn't analyze image.{"\n"}Fill in details manually or retry.
      </Text>
      <View style={styles.errorActions}>
        <Button
          mode="contained"
          onPress={() => void handleRetryAnalysis()}
          style={styles.retryButton}
          contentStyle={styles.previewButtonContent}
          testID="analysis-retry-button"
          accessibilityLabel="Try again"
        >
          Try Again
        </Button>
        <Button
          mode="outlined"
          onPress={handleFillManually}
          style={styles.fillManuallyButton}
          contentStyle={styles.previewButtonContent}
          testID="analysis-fill-manually-button"
          accessibilityLabel="Fill in manually"
        >
          Fill Manually
        </Button>
      </View>
    </View>
  );
}
```

> **⚠️ IMPORTANT**: The `Snackbar` from `react-native-paper` should be rendered at the bottom of the `CameraScreen` return when `analysisError` first becomes `true`. Use `SNACKBAR_DURATION_MS` (3000ms) from config for auto-dismiss. Example:

```tsx
<Snackbar
  visible={showErrorSnackbar}
  onDismiss={() => setShowErrorSnackbar(false)}
  duration={SNACKBAR_DURATION_MS}
  style={styles.snackbar}
  testID="analysis-error-snackbar"
>
  Couldn't analyze image. Fill in details manually or retry.
</Snackbar>
```

You'll need an additional state `showErrorSnackbar` that is set to `true` whenever `analysisError` is set to `true`.

**New styles to add:**

```typescript
errorOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(15, 15, 19, 0.85)',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  padding: theme.spacing.space4,
},
errorMessage: {
  ...theme.typography.bodyLarge,
  color: theme.colors.onBackground,
  textAlign: 'center',
  marginBottom: theme.spacing.space4,
},
errorActions: {
  width: '100%',
  gap: theme.spacing.space3,
},
retryButton: {
  borderRadius: theme.borderRadius.buttons,
},
fillManuallyButton: {
  borderRadius: theme.borderRadius.buttons,
},
snackbar: {
  backgroundColor: theme.colors.surface,
},
```

**Modify `handleRetake` to also clear error state:**

```typescript
const handleRetake = useCallback(() => {
  setCapturedImageUri(null);
  setAnalysisError(false);
  analysisTimedOut.current = false;
  processingData.current = {};
}, []);
```

**Hide the existing retake/use-photo previewActions when error state or analyzing is active:**
The existing `previewActions` View (lines 426–467) should be hidden when `analysisError` is `true` or `isAnalyzing` is `true`, since the error overlay or loading overlay takes precedence.

---

#### Complete Flow Summary

```
                    ┌─────────────────────────┐
                    │ User taps "Use Photo"   │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────▼───────────┐
                    │ Compress image          │
                    │ Upload to Cloud Storage │
                    │ Call analyzeItem()      │
                    │ (ScanLoadingOverlay)    │
                    └─────┬───────┬───────────┘
                          │       │
                 Timeout  │       │ Response received
                 (20s)    │       │
                          │       ├─── success:true ──► Navigate to ReviewForm (AI-populated)
                          │       │
                          │       └─── success:false ──► Show error state with CTAs
                          │
                          └──────────────────────────► Show error state with CTAs
                                                           │
                                           ┌───────────────┼───────────────┐
                                           │                               │
                                  "Try Again"                     "Fill Manually"
                                           │                               │
                                  Re-show overlay              Navigate to ReviewForm
                                  Re-call analyzeItem()        with blank fields
                                  (if downloadUrl exists,
                                   skip re-upload)
```

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Silently navigating to manual entry on failure
if (!aiResponse.success) {
  navigateToReviewForm(imageUri); // DON'T — user gets no retry option
}

// ❌ WRONG: Showing a blocking Alert dialog for error
Alert.alert("Error", "AI failed", [{ text: "OK" }]); // DON'T — use inline error state

// ❌ WRONG: Re-uploading image on retry when downloadUrl already exists
const result = await uploadItemImage(uri, uid); // DON'T — reuse existing downloadUrl

// ❌ WRONG: Creating a new component file for error state
// The error state is part of CameraScreen — keep it inline

// ❌ WRONG: Adding client-side retry logic in aiService.ts
// Server-side retry already exists in Cloud Function (withRetry, max 2 retries)
// The "Try Again" CTA is a USER-initiated full re-request, not automatic retry

// ❌ WRONG: Forgetting to reset analysisError on retake
handleRetake(); // MUST also clear analysisError state

// ❌ WRONG: Not wrapping retry in try/catch
const result = await analyzeItem(url); // Must be in try/catch

// ✅ CORRECT: Showing inline error state with explicit CTAs
setAnalysisError(true);

// ✅ CORRECT: Reusing downloadUrl on retry
if (processingData.current.downloadUrl) {
  await analyzeItem(processingData.current.downloadUrl); // Re-use, don't re-upload
}

// ✅ CORRECT: Calm, helpful error message
("Couldn't analyze image. Fill in details manually or retry.");
```

---

### Previous Story Intelligence

**From Story 3.3 (AI Service Client & Loading Experience):**

1. **CameraScreen flow is established** — compress → upload → analyze → navigate. This story modifies only the failure path — adding error state with CTAs between "analyze fails" and "navigate."

2. **`processingData` ref already exists** — The CameraScreen uses `processingData.current` to store `compressedUri`, `storagePath`, and `downloadUrl` across async boundaries. The retry handler can read from this ref to determine whether to re-upload.

3. **`analysisTimedOut` ref already exists** — Used to prevent race conditions where the analysis response arrives after timeout. This story's changes must respect this guard.

4. **`ScanLoadingOverlay` with `onTimeout` already works** — The overlay fires `onTimeout` after `AI_TIMEOUT_MS`. Currently this auto-navigates. This story changes it to show error state instead.

5. **`navigateToReviewForm` helper already exists** — Takes `(imageUri, aiResult?, storagePath?, downloadUrl?)`. Reuse this for both "Fill Manually" and successful retry paths.

6. **ReviewFormScreen already handles blank fields** — When `aiResult` is `undefined`, all fields show blank and no `AIFieldBadge` appears. This was verified by reading the current `ReviewFormScreen.tsx`. No changes needed.

7. **`isNavigating` ref guard already exists** — Prevents double navigation. Must be respected in retry and fill-manually handlers.

8. **`isMounted` ref guard already exists** — All async callbacks check `isMounted.current` before state updates. Follow this pattern in new handlers.

**From Story 3.2 (Rate Limiting & Error Logging):**

1. **Error codes from aiService** — Returns `RATE_LIMITED`, `AI_PARSE_FAILURE`, `AI_TIMEOUT`, `INVALID_IMAGE`. Log these in console.warn for debugging.

2. **Server-side retry exists** — The Cloud Function has `withRetry()` (max 2 retries with 1s/2s backoff). The "Try Again" CTA is a user-initiated new request, not an automatic retry.

---

### Dependency Check

**No new dependencies needed.** Everything required is already installed:

- `react-native-paper` — `Snackbar`, `Button`, `IconButton`, `Text` (already used in CameraScreen)
- `@/components` — `ScanLoadingOverlay` (already imported in CameraScreen)
- `@/services/aiService` — `analyzeItem` (already imported)
- `@/services/storageService` — `uploadItemImage` (already imported)
- `@/services/imageService` — `compressImage` (already imported)
- `@/constants/config` — `SNACKBAR_DURATION_MS` (already defined)
- `@/constants/theme` — theme tokens (already imported)

**New imports to add in CameraScreen:**

```typescript
import { Snackbar } from "react-native-paper"; // Add to existing import
import { SNACKBAR_DURATION_MS } from "@/constants/config"; // New import
```

---

### Files to Create / Modify

| File                           | Action     | Notes                                                                                            |
| ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------ |
| `src/screens/CameraScreen.tsx` | **MODIFY** | Add error state, retry handler, fill-manually handler, snackbar, modify timeout/failure behavior |

**DO NOT MODIFY:**

- `src/screens/ReviewFormScreen.tsx` — Already handles manual entry correctly
- `src/services/aiService.ts` — Already handles all error codes
- `src/services/storageService.ts` — No changes needed
- `src/services/imageService.ts` — No changes needed
- `src/services/firebaseConfig.ts` — No changes needed
- `src/components/ScanLoadingOverlay.tsx` — No changes needed
- `src/components/AIFieldBadge.tsx` — No changes needed
- `src/components/index.ts` — No changes needed
- `src/types/api.types.ts` — No changes needed
- `src/types/navigation.types.ts` — No changes needed
- `src/constants/config.ts` — No changes needed
- `src/constants/theme.ts` — No changes needed
- `functions/*` — No Cloud Function changes

**DO NOT CREATE:**

- Any new component files — the error state is inline in CameraScreen
- `src/services/firestoreService.ts` — Story 4.2
- `src/services/syncService.ts` — Epic 6
- `src/components/SyncStatusBar.tsx` — Epic 6

---

### Project Structure Notes

- All changes are confined to `src/screens/CameraScreen.tsx` — a single file modification
- The error state UI is inline within the existing captured image preview section, not a separate component (keeping CameraScreen self-contained for this flow)
- Follows the existing pattern of state management within the CameraScreen component using `useState` (local UI state, not global state — appropriate for Zustand boundary rules)

### References

- Story 3.4 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.4 section]
- Error handling patterns: [Source: `_bmad-output/planning-artifacts/architecture.md` — Process Patterns, Error Handling]
- Error message tone: [Source: `_bmad-output/planning-artifacts/architecture.md` — "calm, helpful friend"]
- NFR-R1 (0% crash rate): [Source: `_bmad-output/planning-artifacts/architecture.md` — NFR Coverage]
- FR9 (manual entry fallback): [Source: `_bmad-output/planning-artifacts/epics.md` — FR Coverage Map]
- Loading state patterns: [Source: `_bmad-output/planning-artifacts/architecture.md` — Loading State Patterns]
- API error codes: [Source: `_bmad-output/planning-artifacts/architecture.md` — API & Communication Patterns]
- Previous story 3.3: [Source: `_bmad-output/implementation-artifacts/3-3-ai-service-client-and-loading-experience.md`]
- Project context: [Source: `_bmad-output/project-context.md`]
- Current CameraScreen source: [Source: `src/screens/CameraScreen.tsx`]
- Current ReviewFormScreen source: [Source: `src/screens/ReviewFormScreen.tsx`]
- Current aiService source: [Source: `src/services/aiService.ts`]
- Current config constants: [Source: `src/constants/config.ts`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Updated `CameraScreen` failure handling to render inline retry/manual fallback state instead of silent navigation.
- Verified `ReviewFormScreen` manual-entry behavior remains correct when `aiResult` is undefined.
- Validation run: root and functions TypeScript checks passed, and functions Jest regression suite passed.
- [Code Review Addressed]: Fixed Issue "[HIGH] AC4 Not Fully Implemented (UI Flash Bug during Retry)" by ensuring `isAnalyzing(true)` is set *before* upload/compression during a retry.
- [Code Review Addressed]: Fixed Issue "[HIGH] Cache Leak and Performance Hit during Full Retry" by correctly reusing the existing `compressedUri` in `processingData.current` if it exists.
- [Code Review Addressed]: Fixed Issue "[MEDIUM] State Cleanup on Navigation" by resetting `analysisError` to false before navigating to ReviewForm in `handleFillManually`.
- [Code Review Addressed]: Fixed Issue "[LOW] Missing Retake Button in Error State" by displaying the "Retake" button alongside the "Use Photo" button even during the `analysisError` state.

### Completion Notes List

- Added `analysisError`, `hasUploadedData`, and `showErrorSnackbar` state handling in `CameraScreen`.
- Timeout and AI failure paths now set error state and show friendly snackbar: "Couldn't analyze image. Fill in details manually or retry."
- Added inline error overlay with `Try Again` and `Fill Manually` CTAs in captured image preview.
- Implemented retry flow to reuse existing `downloadUrl` when present, otherwise recompress/re-upload/reanalyze.
- Corrected retry flow to skip recompression if a previous compression exists.
- Modified retry flow to eagerly show loading overlay before subsequent re-upload completes.
- Implemented manual fallback flow to navigate with `imageUri` and optional `storagePath`/`downloadUrl`, and clear error state.
- Preserved "Retake" button functionality while in the error state.
- Added robust `try/catch` coverage in retry and failure paths to avoid unhandled promise rejections.
- Preserved current `ReviewFormScreen` behavior (blank fields and no `AIFieldBadge` when `aiResult` absent).
- Validation evidence: `npx tsc --noEmit` (root) ✅, `cd functions && npx tsc --noEmit` ✅, `npm test` in `functions` ✅ (2/2 suites, 6/6 tests).

### File List

- src/screens/CameraScreen.tsx (modified)
- \_bmad-output/implementation-artifacts/sprint-status.yaml (modified)

## Change Log

- 2026-03-03: Implemented Story 3.4 AI failure handling and manual-entry fallback in CameraScreen; updated story and sprint tracking to review-ready state.
