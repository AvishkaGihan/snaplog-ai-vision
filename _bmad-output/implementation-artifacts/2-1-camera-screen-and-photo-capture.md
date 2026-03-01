# Story 2.1: Camera Screen & Photo Capture

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to tap a scan button and take a photo of any item using a clean, full-screen camera,
So that I can quickly capture items for cataloging.

## Acceptance Criteria

**AC1 — Full-Screen Camera Modal Opens from Dashboard FAB:**

- **Given** the user is on the Dashboard screen
- **When** the user taps the FAB (camera icon)
- **Then** a full-screen camera modal opens using `expo-camera`'s `CameraView` component with the rear-facing camera (NFR-C3)
- **And** the camera fills the entire screen with no navigation chrome
- **And** the camera uses `facing="back"` — the user MUST NOT be able to switch to the front camera
- **And** navigation to the Camera screen uses the existing `Camera` route in `RootStackParamList` (already configured as `presentation: "modal"` in `RootNavigator.tsx`)

**AC2 — Shutter Button & Camera UI:**

- **Given** the camera screen is open and the camera has loaded
- **When** the camera is ready (via `onCameraReady` callback)
- **Then** a single large shutter button (48dp) is centered at the bottom of the screen
- **And** the camera UI is minimal and chrome-free (Apple Camera-inspired)
- **And** a close/dismiss button (X icon) is positioned at the top-left corner for dismissal
- **And** the shutter button uses the theme's `primary` color (`#7C6EF8`) for visual prominence
- **And** the shutter button is disabled until `onCameraReady` fires (prevent premature capture)

**AC3 — Photo Capture:**

- **Given** the camera is ready and the shutter button is enabled
- **When** the user taps the shutter button
- **Then** `takePictureAsync()` is called on the `CameraView` ref to capture a photo
- **And** `animateShutter` prop is set to `true` on the `CameraView` for native shutter animation
- **And** the captured image is stored locally as a temporary file (the URI from `CameraCapturedPicture.uri`)
- **And** the shutter button shows a brief loading state (disabled) during capture to prevent double-taps

**AC4 — Image Preview After Capture:**

- **Given** a photo has been captured successfully
- **When** the image is ready
- **Then** the captured image is displayed as a full-screen preview (replacing the camera viewfinder)
- **And** two action buttons are shown at the bottom: "Use Photo" (primary, full-width) and "Retake" (secondary/outlined)
- **And** tapping "Use Photo" navigates to the `ReviewForm` screen passing the image URI via the `imageUri` param (already typed in `RootStackParamList`)
- **And** tapping "Retake" dismisses the preview and returns to the live camera viewfinder

**AC5 — Camera Permission Handling:**

- **Given** the user taps the FAB and camera permission has NOT been granted
- **When** the Camera screen mounts
- **Then** the `useCameraPermissions` hook from `expo-camera` is used to check and request permission
- **And** if permission is not yet determined (`permission === null`), a loading state is shown
- **And** if permission is denied (`!permission.granted`), a `PermissionCard` component is displayed (not the camera)
- **And** the `PermissionCard` shows a friendly rationale, an "Allow Camera" button that calls `requestPermission()`, and an "Open Settings" button that opens the device settings via `Linking.openSettings()`
- **And** the app does NOT crash regardless of permission state (NFR-R1)

**AC6 — Dashboard FAB Implementation:**

- **Given** the Dashboard screen is currently a placeholder
- **When** the FAB is implemented
- **Then** a React Native Paper `FAB` component is positioned at the bottom-right of the Dashboard screen
- **And** the FAB uses a camera icon (`camera` from MaterialCommunityIcons)
- **And** tapping the FAB navigates to the `Camera` screen using `navigation.navigate('Camera')`
- **And** the FAB uses `theme.colors.primary` as its color
- **And** the FAB has a `borderRadius` of `theme.borderRadius.fab` (16dp)
- **And** the FAB has `testID="scan-fab"` and `accessibilityLabel="Scan item"`

**AC7 — Accessibility & Testing Props:**

- **Given** the complete Camera screen implementation
- **When** accessibility is verified
- **Then** all interactive elements have `testID` props: `scan-fab`, `camera-shutter`, `camera-close`, `camera-retake`, `camera-use-photo`, `camera-permission-allow`, `camera-permission-settings`
- **And** all interactive elements have `accessibilityLabel` props with descriptive text
- **And** the shutter button has `accessibilityRole="button"` and `accessibilityLabel="Take photo"`
- **And** the camera preview area has `accessibilityLabel="Camera viewfinder"`

**AC8 — Build Verification:**

- **Given** the complete Camera screen implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` passes with zero errors
- **And** `npx eslint src/` passes with zero errors
- **And** no runtime errors occur on app launch

## Tasks / Subtasks

- [x] **Task 1: Create `src/components/PermissionCard.tsx`** (AC: 5)
  - [x] Create component with friendly camera rationale text
  - [x] Add "Allow Camera" button that calls `requestPermission()`
  - [x] Add "Open Settings" button via `Linking.openSettings()`
  - [x] Style with theme tokens (surface background, primary button, onBackground text)
  - [x] Add `testID` and `accessibilityLabel` props

- [x] **Task 2: Update `src/components/index.ts`** (AC: 5)
  - [x] Add re-export for `PermissionCard`

- [x] **Task 3: Implement `src/screens/CameraScreen.tsx`** (AC: 1, 2, 3, 4, 5, 7)
  - [x] Replace placeholder with full camera implementation
  - [x] Import `CameraView`, `useCameraPermissions` from `expo-camera`
  - [x] Use `useRef<CameraView>` for camera ref to call `takePictureAsync()`
  - [x] Implement permission check flow (loading → denied → granted states)
  - [x] Render `CameraView` with `facing="back"`, `animateShutter={true}`, `onCameraReady`
  - [x] Implement shutter button (48dp, centered bottom, disabled until camera ready)
  - [x] Implement close button (top-left, dismiss modal)
  - [x] Implement capture handler — `cameraRef.current?.takePictureAsync()`
  - [x] Implement image preview state (show captured image with Use Photo / Retake buttons)
  - [x] Navigate to `ReviewForm` on "Use Photo" with `{ imageUri }` param
  - [x] Return to camera viewfinder on "Retake"
  - [x] Add all `testID` and `accessibilityLabel` props
  - [x] Use `useSafeAreaInsets()` for safe area handling

- [x] **Task 4: Update `src/screens/DashboardScreen.tsx`** (AC: 6)
  - [x] Add React Native Paper `FAB` component
  - [x] Position FAB at bottom-right with absolute positioning
  - [x] Set FAB icon to `camera` from MaterialCommunityIcons
  - [x] Navigate to `Camera` screen on FAB press using `useRootStackNavigation` or composite navigation
  - [x] Set `testID="scan-fab"` and `accessibilityLabel="Scan item"`
  - [x] Import `useDashboardNavigation` or appropriate navigation hook

- [x] **Task 5: Build verification** (AC: 8)
  - [x] Run `npx tsc --noEmit` — zero errors
  - [x] Run `npx eslint src/` — zero errors
  - [x] Run `npx expo start` — app launches without runtime errors

## Dev Notes

### Critical Architecture Rules

#### expo-camera v17 API — MANDATORY Patterns

**This is the #1 area where LLMs make mistakes.** The expo-camera API changed significantly. Use the CURRENT API only:

```typescript
// ✅ CORRECT — expo-camera v17 (CameraView API)
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      // photo.uri is the temporary file path
    } catch (error) {
      // Handle error — never crash (NFR-R1)
    }
  };

  return (
    <CameraView
      ref={cameraRef}
      style={{ flex: 1 }}
      facing="back"
      animateShutter={true}
      onCameraReady={() => setCameraReady(true)}
    />
  );
}
```

```typescript
// ❌ WRONG — Old expo-camera API (Camera component — DEPRECATED)
import { Camera } from "expo-camera"; // WRONG — use CameraView
const type = Camera.Constants.Type.back; // WRONG — use facing="back" prop
```

**Key expo-camera v17 Details:**

- Component: `CameraView` (NOT `Camera`)
- Permission hook: `useCameraPermissions()` — returns `[PermissionResponse | null, requestPermissionFn]`
- Camera direction: `facing="back"` prop (NOT `type` prop)
- Capture: `cameraRef.current.takePictureAsync()` returns `CameraCapturedPicture` with `uri`, `width`, `height`
- `animateShutter={true}` enables native shutter animation
- `onCameraReady` callback — MUST wait for this before calling `takePictureAsync()`
- Captured image URI is **temporary** — stored in app's cache directory
- For permanent storage, use `expo-file-system`'s `FileSystem.copyAsync()` (relevant for Story 2.4)

#### Navigation Pattern — Camera as Modal

The Camera screen is already configured as a modal in `RootNavigator.tsx`:

```typescript
<RootStack.Screen
  name="Camera"
  component={CameraScreen}
  options={{ presentation: "modal", headerShown: false }}
/>
```

**Navigation to Camera from Dashboard:** The Dashboard uses `DashboardStack` which is nested inside the Tab Navigator, which is inside the RootStack. To navigate to the Camera (which lives on the RootStack), you need access to the root stack navigation:

```typescript
// From DashboardScreen (which is inside DashboardStack → Tab → RootStack)
import { useNavigation } from "@react-navigation/native";
import type { RootStackNavigationProp } from "@/types/navigation.types";

// Inside the component:
const rootNavigation = useNavigation<RootStackNavigationProp>();
rootNavigation.navigate("Camera");
```

**Or use the typed hook already exported:**

```typescript
import { useRootStackNavigation } from "@/types/navigation.types";
// But NOTE: this may not work from a nested navigator — if it doesn't,
// use the getParent() pattern or useNavigation with the RootStack type
```

**Navigation from Camera to ReviewForm:**

```typescript
navigation.navigate("ReviewForm", { imageUri: capturedImageUri });
```

The `ReviewForm` route already accepts `{ imageUri: string }` param in `RootStackParamList`.

#### Architectural Boundary #1 — UI → Stores Only

For this story, the Camera screen has minimal interaction with stores. The screen primarily deals with:

1. Camera permission (via `useCameraPermissions` hook from expo-camera, NOT a store)
2. Capturing an image (local operation)
3. Navigation (passing imageUri to ReviewForm)

**No direct service calls from the CameraScreen.** The image compression and upload happen in later stories (2.4 and beyond).

#### Styling — Theme Tokens ONLY

```typescript
import { theme } from "@/constants/theme";

// ✅ CORRECT
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  shutterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
  },
  fabStyle: {
    position: "absolute",
    right: theme.spacing.space4,
    bottom: theme.spacing.space4,
  },
});

// ❌ WRONG — never hardcode
const styles = StyleSheet.create({
  shutterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7C6EF8",
  },
});
```

### UX Design Specifics for Camera Screen

**From UX Design Specification:**

- **Camera UX:** Full-screen modal, minimal chrome (Apple Camera-inspired)
- **Shutter button:** 48dp diameter, centered at bottom
- **Close button:** Top-left corner for dismissal
- **Gallery picker option:** Story 2.2 — NOT this story. Do NOT add gallery picker here.
- **Permission denied:** Show a friendly `PermissionCard` with rationale and "Open Settings" CTA
- **No navigation bar:** Camera is headerShown: false (already configured)

**PermissionCard Design:**

- Surface-colored card (theme.colors.surface)
- Camera icon at top
- Headline: "Camera Access Needed"
- Rationale text: "SnapLog needs camera access to photograph items for your inventory. Your photos are processed securely."
- Primary button: "Allow Camera Access"
- Secondary link/button: "Open Settings"

**Image Preview State:**

- After capture, show the image full-screen
- "Use Photo" button — primary, full-width, at the bottom
- "Retake" button — secondary/outlined, next to or above the primary button
- Both buttons respect 44×44dp minimum touch targets (WCAG AA)

### PermissionCard Component Design

The `PermissionCard` is defined in the architecture at `src/components/PermissionCard.tsx`. It is a reusable component that will also be used for photo library permissions in Story 2.2.

```typescript
// Component interface
interface PermissionCardProps {
  icon: string; // MaterialCommunityIcons icon name
  title: string; // e.g., "Camera Access Needed"
  description: string; // Friendly rationale text
  onAllow: () => void; // Calls requestPermission()
  allowLabel?: string; // Default: "Allow Access"
  onOpenSettings: () => void; // Calls Linking.openSettings()
  showSettingsButton?: boolean; // Show "Open Settings" when denied
  testID?: string;
}
```

### Previous Story Intelligence (Story 1.5)

**Key learnings from Epic 1:**

1. **`useShallow` from `zustand/react/shallow`** — Established pattern. Not needed heavily in this story since Camera screen doesn't read much from stores.
2. **Named exports for stores, default exports for screens** — CameraScreen uses `export default function CameraScreen()` (already established).
3. **Import path convention** — Use `@/` path alias for ALL project imports: `import { theme } from '@/constants/theme'`.
4. **`useSafeAreaInsets`** — Already used in the placeholder CameraScreen. Keep using it for safe area handling.
5. **Runtime library issues** — Story 1.4 found that `expo-auth-session` needed replacement with `@react-native-google-signin/google-signin`. Be prepared for similar adjustments with expo-camera if runtime issues arise.
6. **`registerRootComponent` must stay at bottom of App.tsx** — DO NOT modify App.tsx for this story.
7. **Branch pattern:** `feat/{story-key}` → PR → `develop`. Expected branch: `feat/2-1-camera-screen-and-photo-capture`.

### Git Intelligence

- **Latest commits:** Epic 1 finalized and retrospective completed
- **Branch to create:** `feat/2-1-camera-screen-and-photo-capture` from `develop`
- **Files that exist and will be MODIFIED:**
  - `src/screens/CameraScreen.tsx` (placeholder → full implementation)
  - `src/screens/DashboardScreen.tsx` (placeholder → add FAB)
  - `src/components/index.ts` (add PermissionCard export)
- **Files to CREATE:**
  - `src/components/PermissionCard.tsx`
- **Files that exist and must NOT be modified:**
  - `src/navigation/RootNavigator.tsx` — Camera modal route already configured correctly
  - `src/types/navigation.types.ts` — Camera and ReviewForm params already typed
  - `src/stores/` — No store changes needed for this story
  - `src/App.tsx` — No changes needed

### expo-camera app.json Plugin Configuration

The `expo-camera` plugin needs to be configured in `app.json` for permissions. Verify that the following exists or add it:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "SnapLog needs camera access to photograph items for your inventory."
        }
      ]
    ]
  }
}
```

**Check `app.json` before development** — the plugin may or may not already be configured from the initial project setup.

### Dependencies Status

All required dependencies are already installed:

- `expo-camera: ~17.0.10` ✅
- `expo-file-system: ~19.0.21` ✅ (for future use, not needed in this story)
- `expo-image-picker: ~17.0.10` ✅ (for Story 2.2, not this story)
- `expo-image-manipulator: ~14.0.8` ✅ (for Story 2.4, not this story)

**No new `npm install` needed for this story.**

### Project Structure Notes

- **Alignment with architecture:** All files go in already-defined directories (`screens/`, `components/`)
- **`src/components/PermissionCard.tsx`** — New file, matches architecture spec component list
- **`src/screens/CameraScreen.tsx`** — Existing placeholder, full rewrite
- **`src/screens/DashboardScreen.tsx`** — Existing placeholder, add FAB component
- **No changes to:** `services/`, `stores/`, `hooks/`, `utils/`, `types/`, `constants/`, `navigation/` directories

### File Operations Summary

| File              | Path                                | Action                        |
| ----------------- | ----------------------------------- | ----------------------------- |
| PermissionCard    | `src/components/PermissionCard.tsx` | CREATE                        |
| Components barrel | `src/components/index.ts`           | MODIFY (add export)           |
| Camera screen     | `src/screens/CameraScreen.tsx`      | REWRITE (replace placeholder) |
| Dashboard screen  | `src/screens/DashboardScreen.tsx`   | MODIFY (add FAB)              |

**DO NOT CREATE:**

- `src/hooks/useCamera.ts` — Not needed for this story; the camera logic lives directly in CameraScreen. The hook is defined in architecture for future extraction but is overkill for the current scope.
- `src/hooks/useImagePicker.ts` — Story 2.2 scope
- `src/services/imageService.ts` — Story 2.4 scope
- Any gallery picker UI — Story 2.2 scope

**DO NOT MODIFY:**

- `src/navigation/RootNavigator.tsx` — Already correctly configured
- `src/types/navigation.types.ts` — Already has Camera and ReviewForm params
- `src/stores/*` — No store changes needed
- `src/App.tsx` — No changes needed
- `package.json` — All dependencies already installed

### References

- Story 2.1 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.1 section]
- Camera UX specification: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Experience Mechanics, Camera section]
- Camera architecture: [Source: `_bmad-output/planning-artifacts/architecture.md` — Frontend Architecture, Camera entry]
- PermissionCard component spec: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Custom Components, PermissionCard]
- Navigation configuration: [Source: `src/navigation/RootNavigator.tsx` — Camera modal route]
- Navigation types: [Source: `src/types/navigation.types.ts` — RootStackParamList]
- Theme tokens: [Source: `src/constants/theme.ts` — Full theme object]
- Naming conventions: [Source: `_bmad-output/project-context.md` — Naming Conventions]
- Previous story (1.5): [Source: `_bmad-output/implementation-artifacts/1-5-zustand-state-management-and-mmkv-persistence.md`]
- expo-camera v17 docs: [Source: https://docs.expo.dev/versions/latest/sdk/camera/]
- Project context rules: [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npm run typecheck` (initial run found shutter button typing issue in `CameraScreen.tsx`; fixed)
- `npm run typecheck` (rerun passed)
- `npm run lint` (passed)
- `npx expo start --non-interactive` (startup reached "Starting project at ..." for smoke verification)

### Completion Notes List

- Implemented reusable `PermissionCard` with rationale text, allow action, and open settings action.
- Replaced `CameraScreen` placeholder with full `expo-camera` v17 flow: permission handling, back camera `CameraView`, shutter capture, temporary URI preview, retake/use-photo actions, and safe-area-aware controls.
- Added `DashboardScreen` floating scan FAB to open `Camera` modal with required test/accessibility props.
- Verified TypeScript and ESLint checks pass and performed Expo startup smoke check.

### File List

- `src/components/PermissionCard.tsx` (created)
- `src/components/index.ts` (updated)
- `src/screens/CameraScreen.tsx` (updated)
- `src/screens/DashboardScreen.tsx` (updated)

## Change Log

- 2026-03-01: Implemented Story 2.1 camera capture flow, permission UX, dashboard scan FAB, and verification checks.
- 2026-03-01: Addressed code review findings by debouncing navigation on `handleUsePhoto`, ensuring `takePictureAsync` uses reasonable quality, observing component mount status to avoid memory leak, and adjusting `resizeMode` on the preview image.
