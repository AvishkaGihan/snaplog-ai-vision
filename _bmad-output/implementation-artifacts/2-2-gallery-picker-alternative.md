# Story 2.2: Gallery Picker Alternative

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to pick an existing photo from my gallery instead of taking a new one,
So that I can catalog items from photos I've already taken.

## Acceptance Criteria

**AC1 — Gallery Picker Icon on Camera Screen:**

- **Given** the user is on the Camera screen with the camera viewfinder active
- **When** the camera is in its live viewfinder state (NOT in preview mode)
- **Then** a gallery picker `IconButton` is displayed with a `image-multiple` icon (MaterialCommunityIcons)
- **And** the gallery icon is positioned at the bottom-left of the screen, visually less prominent than the shutter button
- **And** the gallery icon has a `testID="camera-gallery-picker"` and `accessibilityLabel="Pick from gallery"`
- **And** the gallery icon meets the 44×44dp minimum touch target (WCAG AA)
- **And** the gallery icon uses `theme.colors.onBackground` for icon color with a semi-transparent surface background for visibility

**AC2 — Native Gallery Picker Opens:**

- **Given** the user taps the gallery picker icon on the Camera screen
- **When** photo library permission has been granted
- **Then** the device's native photo library picker opens via `expo-image-picker`'s `launchImageLibraryAsync()`
- **And** the picker is configured for single image selection with `mediaTypes: ['images']`
- **And** `allowsEditing` is set to `false` (no cropping — raw photo needed for AI analysis)
- **And** `quality` is set to `0.8` (matches camera capture quality from Story 2.1)

**AC3 — Selected Image Handled Identically to Camera Capture:**

- **Given** the user has selected an image from the gallery
- **When** the picker returns a result with `result.canceled === false`
- **Then** the selected image URI (`result.assets[0].uri`) is set as the `capturedImageUri` state
- **And** the Camera screen transitions to the same preview state as after camera capture (showing the image full-screen with "Use Photo" and "Retake" buttons)
- **And** tapping "Use Photo" navigates to `ReviewForm` with the gallery image URI, identically to Story 2.1 flow
- **And** tapping "Retake" returns to the live camera viewfinder (not the gallery)
- **And** the gallery-selected image flows through the exact same downstream pipeline (compression → upload → AI analysis in future stories)

**AC4 — Photo Library Permission Handling (First Use):**

- **Given** the user taps the gallery picker icon for the first time
- **When** photo library permission has NOT been granted yet
- **Then** `ImagePicker.requestMediaLibraryPermissionsAsync()` is called to request permission
- **And** if permission is granted, the gallery picker opens immediately
- **And** if permission is denied, a `PermissionCard` is displayed (reusing the component from Story 2.1) with:
  - Icon: `"image-multiple"` (NOT `"camera"`)
  - Title: `"Photo Library Access Needed"`
  - Description: `"SnapLog needs access to your photo library so you can select existing photos for cataloging."`
  - Allow button label: `"Allow Photo Access"`
  - "Open Settings" button visible
- **And** the app does NOT crash regardless of permission state (NFR-R1)

**AC5 — Permission Denied State — Gallery Only:**

- **Given** photo library permission has been permanently denied
- **When** the user taps the gallery picker icon
- **Then** a `PermissionCard` is displayed inline (within the Camera screen overlay, NOT replacing the entire camera view)
- **And** the user can dismiss the permission card to return to the camera viewfinder
- **And** the camera continues to function normally — permission denial for gallery does NOT affect camera functionality
- **And** the "Open Settings" CTA links to `Linking.openSettings()` so the user can grant permission manually

**AC6 — Picker Cancellation:**

- **Given** the native gallery picker is open
- **When** the user cancels/dismisses the picker without selecting an image (`result.canceled === true`)
- **Then** the Camera screen returns to the live camera viewfinder
- **And** no state change occurs — the camera remains ready to capture
- **And** no error is shown

**AC7 — Accessibility & Testing Props:**

- **Given** the complete gallery picker implementation
- **When** accessibility is verified
- **Then** all new interactive elements have `testID` props: `camera-gallery-picker`, `gallery-permission-card`, `gallery-permission-allow`, `gallery-permission-settings`, `gallery-permission-dismiss`
- **And** all new interactive elements have `accessibilityLabel` props with descriptive text
- **And** the gallery picker icon has `accessibilityRole="button"`

**AC8 — Build Verification:**

- **Given** the complete gallery picker implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` passes with zero errors
- **And** `npx eslint src/` passes with zero errors
- **And** no runtime errors occur on app launch

## Tasks / Subtasks

- [x] **Task 1: Add `expo-image-picker` plugin to `app.json`** (AC: 4)
  - [x] Add `expo-image-picker` plugin with `photosPermission` message: `"SnapLog needs access to your photo library so you can select existing photos for cataloging."`

- [x] **Task 2: Update `src/screens/CameraScreen.tsx` — Add Gallery Picker Icon** (AC: 1, 6)
  - [x] Import `* as ImagePicker` from `expo-image-picker`
  - [x] Add gallery icon `IconButton` to the `shutterContainer` area, positioned to the left of the shutter button
  - [x] Set icon to `image-multiple`, with appropriate sizing and styling
  - [x] Ensure the gallery icon is only visible in the live viewfinder state (NOT during preview)
  - [x] Use `theme.colors.onBackground` for icon color, semi-transparent surface background
  - [x] Add `testID="camera-gallery-picker"` and `accessibilityLabel="Pick from gallery"`

- [x] **Task 3: Update `src/screens/CameraScreen.tsx` — Gallery Picker Handler** (AC: 2, 3, 6)
  - [x] Create `handlePickFromGallery` callback function
  - [x] Check for media library permissions using `ImagePicker.requestMediaLibraryPermissionsAsync()`
  - [x] If permission denied → show gallery permission card state (see Task 4)
  - [x] If permission granted → call `ImagePicker.launchImageLibraryAsync()` with options: `{ mediaTypes: ['images'], allowsEditing: false, quality: 0.8 }`
  - [x] On successful selection: set `capturedImageUri` to `result.assets[0].uri` (reuses existing preview flow)
  - [x] On cancellation (`result.canceled === true`): do nothing, return to viewfinder
  - [x] Wrap all operations in try/catch to prevent crashes (NFR-R1)

- [x] **Task 4: Update `src/screens/CameraScreen.tsx` — Gallery Permission State** (AC: 4, 5)
  - [x] Add `showGalleryPermission` boolean state
  - [x] When gallery permission is denied, set `showGalleryPermission = true`
  - [x] Render a `PermissionCard` overlay (NOT replacing the camera — displayed as a modal-like overlay on top of the camera) with gallery-specific props
  - [x] Add a dismiss/close button on the permission card overlay so user can return to camera
  - [x] Use icon `"image-multiple"`, title `"Photo Library Access Needed"`, description about gallery access
  - [x] Add testID props for the gallery permission card and its buttons
  - [x] When user taps "Allow Photo Access", call `ImagePicker.requestMediaLibraryPermissionsAsync()` again
  - [x] If permission granted after re-request → dismiss card and open gallery picker
  - [x] If still denied → keep showing the card with "Open Settings" visible

- [x] **Task 5: Style the Gallery Picker Layout** (AC: 1)
  - [x] Restructure `shutterContainer` to use a row layout: [gallery icon] — [shutter button] — [spacer/placeholder]
  - [x] Gallery icon positioned bottom-left, shutter centered, maintaining visual hierarchy
  - [x] Add styles for the gallery icon container, gallery permission overlay
  - [x] All styles use `theme.*` tokens — no hardcoded values

- [x] **Task 6: Build verification** (AC: 8)
  - [x] Run `npx tsc --noEmit` — zero errors
  - [x] Run `npx eslint src/` — zero errors
  - [x] Run `npx expo start` — app launches without runtime errors

## Dev Notes

### Critical Architecture Rules

#### expo-image-picker API — MANDATORY Patterns

**This library is already installed** (`expo-image-picker: ~17.0.10`). Use the CURRENT API:

```typescript
// ✅ CORRECT — expo-image-picker current API
import * as ImagePicker from "expo-image-picker";

const handlePickFromGallery = async () => {
  try {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      // Show gallery permission card
      setShowGalleryPermission(true);
      return;
    }

    // Launch the gallery picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImageUri(result.assets[0].uri);
    }
    // If cancelled, do nothing — return to camera viewfinder
  } catch (error) {
    console.warn("Failed to pick image from gallery", error);
  }
};
```

```typescript
// ❌ WRONG — Old deprecated API patterns
import { MediaTypeOptions } from "expo-image-picker"; // WRONG — use string array ['images']
ImagePicker.launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.Images }); // WRONG — deprecated enum
```

**Key expo-image-picker Details:**

- Import: `import * as ImagePicker from 'expo-image-picker'` (namespace import pattern)
- Permission: `ImagePicker.requestMediaLibraryPermissionsAsync()` returns `{ status: 'granted' | 'denied' | 'undetermined' }`
- Launch: `ImagePicker.launchImageLibraryAsync(options)` returns `ImagePickerResult`
- Result shape: `{ canceled: boolean, assets: [{ uri, width, height, ... }] }`
- **Note**: `canceled` is spelled with ONE `l` (American English) — NOT `cancelled`
- `mediaTypes`: Use string array `['images']` — the `MediaTypeOptions` enum is deprecated
- `quality`: 0.0 to 1.0 — use `0.8` for consistency with camera capture in Story 2.1
- `allowsEditing: false` — no cropping; raw photo needed for accurate AI analysis

#### app.json Plugin Configuration

`expo-image-picker` plugin MUST be configured in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "SnapLog needs access to your photo library so you can select existing photos for cataloging."
        }
      ]
    ]
  }
}
```

**Verify `app.json` already has the `expo-camera` plugin** — add `expo-image-picker` alongside it, NOT replacing it.

#### Navigation — No Changes Required

The Camera screen navigation is already configured correctly from Story 2.1:

- Camera is a modal screen in `RootNavigator.tsx`
- `ReviewForm` route accepts `{ imageUri: string }` param
- Gallery-selected images pass through the EXACT SAME navigation path as camera captures

```typescript
// Same as Story 2.1 — no changes needed for navigation
navigation.navigate("ReviewForm", { imageUri: selectedImageUri });
```

#### Architectural Boundary — Camera Screen Scope ONLY

**All changes are scoped to `CameraScreen.tsx` and `app.json` only.**

This story does NOT:

- Create new files (no `useImagePicker.ts` hook — keep logic in CameraScreen for now)
- Modify `PermissionCard.tsx` (component is already generic enough with configurable props)
- Modify stores, services, hooks, or navigation
- Touch any other screens

The architecture spec lists `hooks/useImagePicker.ts` — but for this story, the gallery picker logic lives directly in `CameraScreen.tsx`. Hook extraction is future refactoring if needed.

#### Styling — Theme Tokens ONLY

```typescript
// ✅ CORRECT — Galaxy picker icon styling
const styles = StyleSheet.create({
  galleryButton: {
    backgroundColor: "rgba(26, 26, 34, 0.6)", // theme.colors.surface at 60% opacity
  },
  galleryPermissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 15, 19, 0.85)", // theme.colors.background at 85% opacity
    justifyContent: "center",
    padding: theme.spacing.space4,
    zIndex: 10,
  },
});
```

### UX Design Specifics for Gallery Picker

**From UX Design Specification:**

- **Gallery picker option:** Icon button, LESS prominent than shutter button — secondary action
- **Position:** Bottom-left of the camera screen (shutter is centered)
- **Icon:** `image-multiple` from MaterialCommunityIcons (NOT `image` — signals "pick from library")
- **Visual hierarchy:** The shutter button (48dp, primary color) is the hero. The gallery icon is smaller/subtler
- **Permission denied → explanation card:** Reuse `PermissionCard` component with gallery-specific copy
- **No separate gallery screen** — the native OS picker is used directly

**Camera Screen Layout After This Story:**

```
┌──────────────────────────┐
│  [X close]               │  ← Top-left close button (existing)
│                          │
│                          │
│    Camera Viewfinder     │
│                          │
│                          │
│                          │
│  [🖼] ── [ ◉ ] ── [   ] │  ← Bottom row: gallery (left), shutter (center), spacer (right)
└──────────────────────────┘
```

### Previous Story Intelligence (Story 2.1)

**Key learnings from Story 2.1:**

1. **`PermissionCard` is fully reusable** — Already accepts configurable `icon`, `title`, `description`, `allowLabel`, `onAllow`, `onOpenSettings`, and `showSettingsButton` props. No modifications needed for gallery permission use case.
2. **`isMounted` ref pattern** — Story 2.1 uses `isMounted` ref to prevent state updates on unmounted component. Continue using this pattern for gallery picker async operations.
3. **`isNavigating` ref pattern** — Story 2.1 debounces navigation to prevent double-tap on "Use Photo". This pattern already protects the gallery flow since gallery images go through the same `handleUsePhoto` → navigate to ReviewForm path.
4. **`capturedImageUri` state** — This is the key state variable. Setting it to a gallery image URI triggers the exact same preview flow as camera capture. No new state management needed for the image itself.
5. **Camera permission is separate from gallery permission** — Camera permission uses `useCameraPermissions()` from `expo-camera`. Gallery permission uses `ImagePicker.requestMediaLibraryPermissionsAsync()` from `expo-image-picker`. These are independent — denying gallery does NOT affect camera.
6. **`quality: 0.8`** — Story 2.1 uses `quality: 0.8` for `takePictureAsync`. Use the same quality for gallery picker for consistency.
7. **Named exports for components, default exports for screens** — Maintain this pattern.
8. **Import path convention** — Use `@/` path alias: `import { theme } from '@/constants/theme'`.

### Git Intelligence

- **Latest commit on develop:** `754efe4 — Merge pull request #10 from AvishkaGihan/feat/2-1-camera-screen-and-photo-capture`
- **Branch to create:** `feat/2-2-gallery-picker-alternative` from `develop`
- **Files modified in Story 2.1 that will be touched again:**
  - `src/screens/CameraScreen.tsx` — Adding gallery picker icon + handler + permission state
- **Files NOT to modify:**
  - `src/components/PermissionCard.tsx` — Already generic enough
  - `src/components/index.ts` — No new components being created
  - `src/navigation/RootNavigator.tsx` — No navigation changes
  - `src/types/navigation.types.ts` — No type changes
  - `src/stores/*` — No store changes
  - `src/App.tsx` — No changes

### Dependencies Status

All required dependencies are already installed:

- `expo-image-picker: ~17.0.10` ✅ (already in package.json)
- `expo-camera: ~17.0.10` ✅ (used by existing camera functionality)

**No new `npm install` needed for this story.**

### Project Structure Notes

- **Alignment with architecture:** All changes within existing files — no new directories or files
- **`src/screens/CameraScreen.tsx`** — Existing file, adding gallery functionality
- **`app.json`** — Adding expo-image-picker plugin configuration
- **No changes to:** `services/`, `stores/`, `hooks/`, `utils/`, `types/`, `constants/`, `navigation/`, `components/` directories

### File Operations Summary

| File          | Path                           | Action                                |
| ------------- | ------------------------------ | ------------------------------------- |
| Camera screen | `src/screens/CameraScreen.tsx` | MODIFY (add gallery picker)           |
| App config    | `app.json`                     | MODIFY (add expo-image-picker plugin) |

**DO NOT CREATE:**

- `src/hooks/useImagePicker.ts` — Overkill for scope; gallery logic lives in CameraScreen
- Any new component files — `PermissionCard` is already reusable
- Any service files — No backend/service interaction in this story

**DO NOT MODIFY:**

- `src/components/PermissionCard.tsx` — Already configurable via props
- `src/components/index.ts` — No new exports
- `src/navigation/RootNavigator.tsx` — Already correctly configured
- `src/types/navigation.types.ts` — Already has Camera and ReviewForm params
- `src/stores/*` — No store changes needed
- `src/App.tsx` — No changes needed
- `package.json` — All dependencies already installed

### References

- Story 2.2 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.2 section]
- Gallery picker UX specification: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Experience Mechanics, Camera section]
- Gallery picker in user journey: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Journey 1: Primary Scan Flow]
- Camera architecture: [Source: `_bmad-output/planning-artifacts/architecture.md` — Frontend Architecture, Camera entry]
- PermissionCard component: [Source: `src/components/PermissionCard.tsx` — Current implementation]
- CameraScreen implementation: [Source: `src/screens/CameraScreen.tsx` — Story 2.1 implementation]
- Navigation types: [Source: `src/types/navigation.types.ts` — RootStackParamList]
- Theme tokens: [Source: `src/constants/theme.ts` — Full theme object]
- Naming conventions: [Source: `_bmad-output/project-context.md` — Naming Conventions]
- Previous story (2.1): [Source: `_bmad-output/implementation-artifacts/2-1-camera-screen-and-photo-capture.md`]
- expo-image-picker docs: [Source: https://docs.expo.dev/versions/latest/sdk/imagepicker/]
- Project context rules: [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npx tsc --noEmit` ✅
- `npx eslint src/` ✅
- `npx expo start --offline --port 8082` startup smoke check (CI mode) ✅

### Completion Notes List

- Applied Code Review Fixes (AI): Added missing `expo-camera` plugin to `app.json`.
- Applied Code Review Fixes (AI): Safely hardcoded rgba values for `theme.colors` opacity styles.
- Applied Code Review Fixes (AI): Appended UI alert components to gracefully display errors during failed gallery permission flows.
- Applied Code Review Fixes (AI): Streamlined `isMounted.current` checks within gallery asynchronous callbacks.
- Implemented gallery-picker alternative flow in `CameraScreen` using `expo-image-picker` with required options (`mediaTypes: ['images']`, `allowsEditing: false`, `quality: 0.8`).
- Added gallery permission handling via inline overlay `PermissionCard` with gallery-specific copy, test IDs, accessibility labels, settings CTA, and dismiss action.
- Ensured selected gallery image reuses existing camera preview pipeline via `capturedImageUri` and existing `Use Photo` / `Retake` flow.
- Updated camera controls layout to `[gallery] [shutter] [spacer]` while preserving shutter prominence and minimum touch targets.
- Added `expo-image-picker` plugin in `app.json` with required `photosPermission` message.

### File List

- `app.json`
- `src/screens/CameraScreen.tsx`
