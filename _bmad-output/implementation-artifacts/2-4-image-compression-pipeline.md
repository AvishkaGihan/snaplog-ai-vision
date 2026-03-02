# Story 2.4: Image Compression Pipeline

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want my photos automatically compressed before upload,
So that uploads are fast and don't consume excessive data.

## Acceptance Criteria

**AC1 — Compression Service Exists:**

- **Given** a photo has been captured via camera or selected from gallery
- **When** the image is prepared for processing
- **Then** `services/imageService.ts` provides an exported `compressImage(uri: string)` function
- **And** the function accepts a local image URI (from camera capture or gallery pick) and returns a `Promise<CompressedImageResult>`
- **And** `CompressedImageResult` is typed as `{ uri: string; width: number; height: number; fileSize: number }`

**AC2 — Image Resized to Max 1280px Longest Edge:**

- **Given** a source image with dimensions larger than 1280px
- **When** `compressImage(uri)` is called
- **Then** the compressed image is resized so the longest edge is at most 1280px
- **And** the aspect ratio is preserved (only one dimension is specified to `expo-image-manipulator`)
- **And** the `MAX_IMAGE_DIMENSION` constant from `constants/config.ts` is used (value: 1280)

**AC3 — Compressed File Size Below 500 KB:**

- **Given** any source image (up to 12MP)
- **When** `compressImage(uri)` is called
- **Then** the compressed file size is always below 500 KB (FR4)
- **And** the `MAX_IMAGE_SIZE_BYTES` constant from `constants/config.ts` is used (value: 500,000)
- **And** if the first compression pass produces a file > 500 KB, the quality is iteratively reduced until the target is met
- **And** the compression format is JPEG

**AC4 — Compression Completes Under 2 Seconds:**

- **Given** a 12MP source image
- **When** `compressImage(uri)` is called
- **Then** compression completes in under 2 seconds (NFR-P1)
- **And** the function does NOT block the UI thread (it is async)

**AC5 — Original Image Not Modified:**

- **Given** a source image at a local URI
- **When** `compressImage(uri)` is called
- **Then** the original image file at `uri` is NOT modified or deleted
- **And** a new compressed copy is created at a different URI
- **And** the compressed image URI is returned for upload

**AC6 — Compressed Image URI Returned:**

- **Given** `compressImage(uri)` completes successfully
- **When** the caller reads the result
- **Then** the returned `CompressedImageResult` contains `uri`, `width`, `height`, and `fileSize`
- **And** the `uri` points to a valid local file that can be read and uploaded

**AC7 — CameraScreen Integrates Compression:**

- **Given** the user taps "Use Photo" on the preview screen
- **When** the captured/selected image is being prepared
- **Then** `compressImage(capturedImageUri)` is called BEFORE navigating to ReviewForm
- **And** the compressed image URI is passed to ReviewForm (not the original)
- **And** a brief loading indicator is shown during compression
- **And** if compression fails, an error alert is shown and the user can retry or continue with the original image

**AC8 — Error Handling:**

- **Given** the compression function encounters an error
- **When** e.g. the source file is missing, corrupt, or unsupported
- **Then** the function throws a descriptive error (caught by try/catch in caller)
- **And** the app does NOT crash (NFR-R1)
- **And** the error is logged via `console.warn`

**AC9 — Build Verification:**

- **Given** the complete image compression implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` passes with zero errors
- **And** `npx eslint src/` passes with zero errors
- **And** `npx expo start` launches without runtime errors

## Tasks / Subtasks

- [x] **Task 1: Install expo-image-manipulator** (AC: 1)
  - [x] Run `npx expo install expo-image-manipulator`
  - [x] Verify the package is added to `package.json` with a version compatible with Expo SDK 54
  - [x] Verify no other dependency changes or conflicts

- [x] **Task 2: Create `services/imageService.ts`** (AC: 1, 2, 3, 5, 6)
  - [x] Create `src/services/imageService.ts` as a NEW file
  - [x] Import `manipulateAsync`, `SaveFormat` from `expo-image-manipulator`
  - [x] Import `getInfoAsync` from `expo-file-system`
  - [x] Import `MAX_IMAGE_DIMENSION`, `MAX_IMAGE_SIZE_BYTES` from `@/constants/config`
  - [x] Define `CompressedImageResult` interface: `{ uri: string; width: number; height: number; fileSize: number }`
  - [x] Export `compressImage(uri: string): Promise<CompressedImageResult>`
  - [x] Implementation steps:
    1. Call `manipulateAsync(uri, [{ resize: { width: MAX_IMAGE_DIMENSION } }], { compress: 0.8, format: SaveFormat.JPEG })`
    2. Check file size with `getInfoAsync(result.uri, { size: true })`
    3. If file size > `MAX_IMAGE_SIZE_BYTES`, iteratively re-compress with lower quality (0.6 → 0.4 → 0.2) until below target
    4. Return `CompressedImageResult` with the final URI, dimensions, and file size
  - [x] Wrap everything in try/catch — rethrow with descriptive message
  - [x] Export `compressImage` as a named export

- [x] **Task 3: Integrate compression into CameraScreen** (AC: 7, 8)
  - [x] Import `compressImage` from `@/services/imageService` in `CameraScreen.tsx`
  - [x] Add `isCompressing` state variable: `const [isCompressing, setIsCompressing] = useState(false);`
  - [x] Modify `handleUsePhoto`:
    1. Set `isCompressing = true`
    2. Call `const compressed = await compressImage(capturedImageUri!)`
    3. Navigate to ReviewForm with `compressed.uri` instead of raw `capturedImageUri`
    4. In catch block: show `Alert.alert("Compression Failed", ...)` with retry option
    5. Always set `isCompressing = false` in finally block
  - [x] Update the "Use Photo" button to show `ActivityIndicator` when `isCompressing` is true
  - [x] Disable both "Retake" and "Use Photo" buttons while `isCompressing`
  - [x] Add `testID="camera-compressing-indicator"` to the loading indicator
  - [x] Add `accessibilityLabel="Compressing image"` to the loading indicator

- [x] **Task 4: Update services barrel export** (AC: 1)
  - [ ] If `src/services/index.ts` exists, add `export { compressImage } from './imageService';`
  - [x] If no barrel export exists, skip this task

- [x] **Task 5: Build verification** (AC: 9)
  - [x] Run `npx tsc --noEmit` — zero errors
  - [x] Run `npx eslint src/` — zero errors
  - [x] Run `npx expo start` — app launches without runtime errors
  - [x] Verify compression works: take a photo, confirm compressed URI is passed to ReviewForm

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

The camera capture flow from Stories 2.1–2.3 is already implemented in `CameraScreen.tsx` (494 lines). This story adds a compression service and integrates it into the existing flow.

**Already in place:**

- `CameraScreen.tsx` — Full camera capture and gallery picker with permission handling
- `constants/config.ts` — Already has `MAX_IMAGE_SIZE_BYTES = 500_000` and `MAX_IMAGE_DIMENSION = 1280`
- Navigation to ReviewForm with `imageUri` param: `navigation.navigate("ReviewForm", { imageUri: capturedImageUri })`
- `isMounted` ref pattern for safe async state updates
- `isNavigating` ref to prevent double navigation
- `handleUsePhoto` callback — THE insertion point for compression

#### What NEEDS TO BE CREATED (The Actual Work)

1. **Install `expo-image-manipulator`** — Not yet in the project
2. **Create `src/services/imageService.ts`** — New file with the compression pipeline
3. **Modify `CameraScreen.tsx` `handleUsePhoto`** — Insert compression step before navigation

#### Key Implementation Details — expo-image-manipulator API

```typescript
// ✅ CORRECT — Using manipulateAsync (works with Expo SDK 54)
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
}

export async function compressImage(
  uri: string,
): Promise<CompressedImageResult> {
  // Step 1: Resize to max dimension + initial compression
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: MAX_IMAGE_DIMENSION } }],
    { compress: 0.8, format: SaveFormat.JPEG },
  );

  // Step 2: Check file size
  const fileInfo = await FileSystem.getInfoAsync(result.uri, { size: true });

  if (!fileInfo.exists || !("size" in fileInfo)) {
    throw new Error("Failed to get compressed file info");
  }

  // Step 3: If still too large, iteratively reduce quality
  if (fileInfo.size > MAX_IMAGE_SIZE_BYTES) {
    // Re-compress at lower qualities until under target
    const qualities = [0.6, 0.4, 0.2];
    for (const quality of qualities) {
      const recompressed = await manipulateAsync(
        uri, // Always compress from ORIGINAL to avoid quality cascading
        [{ resize: { width: MAX_IMAGE_DIMENSION } }],
        { compress: quality, format: SaveFormat.JPEG },
      );
      const reInfo = await FileSystem.getInfoAsync(recompressed.uri, {
        size: true,
      });
      if (
        reInfo.exists &&
        "size" in reInfo &&
        reInfo.size <= MAX_IMAGE_SIZE_BYTES
      ) {
        return {
          uri: recompressed.uri,
          width: recompressed.width,
          height: recompressed.height,
          fileSize: reInfo.size,
        };
      }
    }
  }

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    fileSize: fileInfo.size,
  };
}
```

```typescript
// ❌ WRONG — Do NOT use these patterns
// BAD: Modifying the original image in place
FileSystem.moveAsync({ from: compressed.uri, to: originalUri }); // NEVER overwrite original

// BAD: Not checking file size after compression
const result = await manipulateAsync(uri, actions, options);
return result.uri; // Must verify size meets constraint

// BAD: Compressing from already-compressed output (quality cascading)
const pass1 = await manipulateAsync(uri, actions, { compress: 0.8 });
const pass2 = await manipulateAsync(pass1.uri, actions, { compress: 0.6 }); // Quality degrades rapidly

// BAD: Using only height for resize (breaks landscape photos)
[{ resize: { height: MAX_IMAGE_DIMENSION } }]; // Only works for portrait
// Use width: MAX_IMAGE_DIMENSION for landscape-dominant photos
// Or calculate which dimension is longer and resize that one

// BAD: Forgetting expo-file-system import for size checking
// Must use FileSystem.getInfoAsync for the size check
```

#### CameraScreen Integration Point

Current `handleUsePhoto` in `CameraScreen.tsx` (Lines 69-83):

```typescript
// CURRENT CODE — Will need modification
const handleUsePhoto = useCallback(() => {
  if (!capturedImageUri || isNavigating.current) {
    return;
  }

  isNavigating.current = true;
  navigation.navigate("ReviewForm", { imageUri: capturedImageUri });

  setTimeout(() => {
    if (isMounted.current) {
      isNavigating.current = false;
    }
  }, 500);
}, [capturedImageUri, navigation]);
```

**AFTER modification — should become async and insert compression:**

```typescript
// NEW CODE — Insert compression before navigation
const handleUsePhoto = useCallback(async () => {
  if (!capturedImageUri || isNavigating.current || isCompressing) {
    return;
  }

  try {
    setIsCompressing(true);
    const compressed = await compressImage(capturedImageUri);

    if (!isMounted.current) return;

    isNavigating.current = true;
    navigation.navigate("ReviewForm", { imageUri: compressed.uri });

    setTimeout(() => {
      if (isMounted.current) {
        isNavigating.current = false;
      }
    }, 500);
  } catch (error) {
    console.warn("Image compression failed", error);
    if (isMounted.current) {
      Alert.alert(
        "Compression Issue",
        "Couldn't compress the image. Would you like to retry or use the original?",
        [
          { text: "Retry", onPress: handleUsePhoto },
          {
            text: "Use Original",
            onPress: () => {
              isNavigating.current = true;
              navigation.navigate("ReviewForm", { imageUri: capturedImageUri });
              setTimeout(() => {
                if (isMounted.current) isNavigating.current = false;
              }, 500);
            },
          },
        ],
      );
    }
  } finally {
    if (isMounted.current) {
      setIsCompressing(false);
    }
  }
}, [capturedImageUri, navigation, isCompressing]);
```

**UI update — show loading while compressing (preview actions area, Lines 284-311):**

The "Use Photo" button should show an `ActivityIndicator` when `isCompressing` is true, and both buttons should be disabled during compression.

#### Dependency to Install

```bash
npx expo install expo-image-manipulator
# Also needed for file size checking:
npx expo install expo-file-system
```

**Check if `expo-file-system` is already installed** — it may already be present from Expo SDK setup. Run `npx expo install` to ensure correct versions.

### Sizing Approach — Width-Only Resize

The `resize` action uses `width: MAX_IMAGE_DIMENSION` (1280). This approach works because:

- `expo-image-manipulator` auto-calculates the other dimension to maintain aspect ratio when only one is specified
- For landscape photos (wider than tall), width=1280 limits the longest edge
- For portrait photos (taller than wide), width=1280 will make the height even smaller since the width is the shorter side

**IMPORTANT: If the source image is portrait-oriented (height > width), the width=1280 resize will make the height less than 1280, which is correct behavior. However, for very tall/narrow images, this may produce images much smaller than needed. To handle all orientations correctly:**

```typescript
// BETTER: Determine longest edge and resize that
const imageInfo = await manipulateAsync(uri, [], {}); // Get original dimensions
const isLandscape = imageInfo.width >= imageInfo.height;
const resizeAction = isLandscape
  ? { resize: { width: MAX_IMAGE_DIMENSION } }
  : { resize: { height: MAX_IMAGE_DIMENSION } };
```

This ensures the longest edge is always capped at 1280px regardless of orientation.

### Files to Modify / Create

| File         | Path                           | Action                                                   |
| ------------ | ------------------------------ | -------------------------------------------------------- |
| imageService | `src/services/imageService.ts` | **NEW** — Image compression pipeline                     |
| CameraScreen | `src/screens/CameraScreen.tsx` | **MODIFY** — Integrate compression into `handleUsePhoto` |

**DO NOT MODIFY:**

- `src/constants/config.ts` — Constants already exist
- `src/components/PermissionCard.tsx` — Not related
- `src/navigation/*` — No navigation changes
- `src/stores/*` — No store changes
- `src/types/navigation.types.ts` — ReviewForm already accepts `imageUri: string`, no changes needed
- `src/hooks/*` — No new hooks needed

**DO NOT CREATE:**

- No new components
- No new screens
- No new hooks
- No new types files (interface lives in imageService.ts)

### UX Design Specifics

**From UX Design Specification:**

- Compression is a **background operation** — user should see a brief loading state while it happens
- Must complete in under 2 seconds — fast enough to feel near-instant
- The compressed URI replaces the raw URI for ALL downstream operations (upload, AI analysis)
- Error tone: "Couldn't compress the image" — calm, helpful, with retry option

### Previous Story Intelligence

**From Story 2.3 (Permission Handling & Graceful Denial):**

1. `AppState` listener pattern is established — for reference only, not relevant to this story
2. `isMounted` ref pattern is consistently used for safe async state updates
3. Code review identified that `icon` prop on `PermissionCard` was missing — shows importance of testing all props
4. The `handleAppForegroundPermissionRecheck` callback uses `try/catch` with individual error handling — follow the same pattern

**From Story 2.2 (Gallery Picker Alternative):**

1. Gallery-picked images follow the same URI pattern as camera captures — compression works identically for both
2. `quality: 0.8` is already applied during capture/pick — but this is camera quality, NOT the same as post-processing compression
3. The `openGalleryPicker` callback doesn't modify the picked image — compression needs to happen at the "Use Photo" step

**From Story 2.1 (Camera Screen & Photo Capture):**

1. Camera captures at `quality: 0.8` via `takePictureAsync({ quality: 0.8 })` — this produces large files that need further compression
2. `capturedImageUri` state holds the raw URI — this is the input to compressImage
3. Preview shows the captured image before the user decides to "Use Photo" — compression happens AFTER preview, not before

### Git Intelligence

**Latest commits on develop:**

| Hash      | Message                                                     |
| --------- | ----------------------------------------------------------- |
| `38e95ac` | Merge PR — feat/2-3-permission-handling-and-graceful-denial |

**Branch to create:** `feat/2-4-image-compression-pipeline` from `develop`

**Files from recent stories that will be touched:**

- `src/screens/CameraScreen.tsx` — Adding compression integration into `handleUsePhoto`

### Dependencies Status

**Already installed:**

- `expo-camera: ~17.0.10` ✅
- `expo-image-picker: ~17.0.10` ✅
- `react-native` ✅ (includes `Alert`)

**Needs installation:**

- `expo-image-manipulator` — ❌ NOT installed, required for this story
- `expo-file-system` — Check if already present; needed for `getInfoAsync` to verify file sizes

**Install command:**

```bash
npx expo install expo-image-manipulator expo-file-system
```

### Technical Details — expo-image-manipulator API

- **`manipulateAsync(uri, actions, saveOptions)`** — Core function
  - `uri`: Local file URI (from camera or gallery)
  - `actions`: Array of transform actions, e.g. `[{ resize: { width: 1280 } }]`
  - `saveOptions`: `{ compress: 0.0-1.0, format: SaveFormat.JPEG | SaveFormat.PNG }`
  - Returns: `{ uri: string, width: number, height: number }`
- **`SaveFormat.JPEG`** — Use JPEG for smallest file sizes; PNG is lossless and larger
- **Resize behavior**: If only `width` OR `height` is specified, the other is calculated to maintain aspect ratio
- **Compress range**: `1.0` = maximum quality (largest), `0.0` = minimum quality (smallest)
- **Output location**: Written to app's cache directory automatically — no manual file management needed

### Project Structure Notes

- `src/services/imageService.ts` — New file, follows the architecture's feature-first structure
- All services live in `src/services/` directory — consistent with existing `authService.ts`, `firebaseConfig.ts`
- Named export `compressImage` follows camelCase convention for functions
- `CompressedImageResult` interface is PascalCase — consistent with TypeScript naming conventions
- No barrel export in `services/` currently — only create one if it already exists

### Performance Considerations

- JPEG compression at quality 0.8 with 1280px max dimension typically produces files between 150-400 KB — well under the 500 KB limit
- Iterative re-compression should rarely trigger (only for very detailed, high-contrast images)
- Always compress from the ORIGINAL image (not from a previously compressed version) to avoid quality cascading
- The compression is single-threaded but fast because `expo-image-manipulator` uses native code internally
- For a 12MP image: resize from ~4000x3000 to 1280xN is the most time-consuming step
- NFR-P1 requires completion in under 2 seconds — achievable with single-pass compression in most cases

### References

- Story 2.4 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.4 section]
- Image compression architecture: [Source: `_bmad-output/planning-artifacts/architecture.md` — Frontend Architecture, Image Handling entry]
- NFR-P1 (compression <2s): [Source: `_bmad-output/planning-artifacts/architecture.md` — NFR Coverage]
- FR4 (compress to <500KB): [Source: `_bmad-output/planning-artifacts/epics.md` — Requirements Inventory]
- Config constants: [Source: `src/constants/config.ts` — MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_DIMENSION]
- CameraScreen current implementation: [Source: `src/screens/CameraScreen.tsx` — 494 lines, handleUsePhoto at L69-83]
- Image pipeline architecture: [Source: `_bmad-output/planning-artifacts/architecture.md` — Camera → Image Compression → Cloud Storage flow]
- Naming conventions: [Source: `_bmad-output/project-context.md` — Naming Conventions]
- Services directory structure: [Source: `_bmad-output/planning-artifacts/architecture.md` — Project Structure]
- expo-image-manipulator API: [Source: https://docs.expo.dev/versions/latest/sdk/imagemanipulator/]
- Previous stories: [Source: `_bmad-output/implementation-artifacts/2-3-permission-handling-and-graceful-denial.md`]
- Project context rules: [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npx expo install expo-image-manipulator` (completed; dependency already up to date)
- `npx tsc --noEmit` (exit code 0)
- `npx eslint src/` (exit code 0)
- `npx expo start --port 8082` with `CI=1` (startup smoke check completed, then process terminated)

### Completion Notes List

- Added new `compressImage(uri)` service in `src/services/imageService.ts` with JPEG output and iterative quality fallback.
- Enforced config constants `MAX_IMAGE_DIMENSION` and `MAX_IMAGE_SIZE_BYTES` in compression flow.
- Integrated async compression into `CameraScreen` before navigation to ReviewForm.
- Added compression UX state with loading indicator (`camera-compressing-indicator`) and disabled preview action buttons while compressing.
- Added retry / use-original recovery alert path when compression fails.
- Migrated deprecated Expo APIs to SDK 54 current APIs (`File` and `ImageManipulator` context workflow) to remove runtime warnings.
- On-device manual verification confirmed: compression works and compressed URI is passed to ReviewForm.

### File List

- `src/services/imageService.ts` (new)
- `src/screens/CameraScreen.tsx` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `_bmad-output/implementation-artifacts/2-4-image-compression-pipeline.md` (modified)

## Change Log

- 2026-03-02: Implemented image compression pipeline service and CameraScreen integration; completed static verification (`tsc`, `eslint`) and Expo startup smoke check.
- 2026-03-02: Completed manual device validation and migrated deprecated Expo filesystem/image manipulator APIs; story moved to review.
