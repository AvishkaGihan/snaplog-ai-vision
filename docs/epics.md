---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# snaplog-ai-vision - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for snaplog-ai-vision, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can open a full-screen camera view from the main dashboard with a single tap.
FR2: User can capture a photo using the device camera.
FR3: User can select an existing photo from the device gallery as an alternative to camera capture.
FR4: The system can compress the captured image to below 500 KB before uploading.
FR5: The system can request camera and photo library permissions and handle denial gracefully (explains why permission is needed).
FR6: The system can send the captured image to a backend service for AI-powered analysis.
FR7: The backend service can return a structured item record containing: Title, Category, Color, Condition.
FR8: The backend service can validate the AI response against a defined schema before returning it to the client.
FR9: The system can present a manual entry form instead of crashing if AI analysis fails or returns an invalid schema.
FR10: User can see a loading state indicator during AI analysis.
FR11: After AI analysis, user sees a pre-populated form with AI-generated fields.
FR12: User can edit any AI-generated field before saving.
FR13: User can add additional notes or tags to an item beyond the AI-generated fields.
FR14: User can confirm and save an item after reviewing/editing the AI-generated data.
FR15: User can discard a scan and return to the dashboard without saving.
FR16: The system can persist confirmed items to a cloud database.
FR17: The system can store item photos in cloud storage and make them accessible by item record.
FR18: The system can save items created without network connectivity as local drafts.
FR19: The system can automatically sync local drafts to cloud storage when network connectivity is restored.
FR20: User can view the sync status (pending / synced) for each item record.
FR21: User can view a list of all cataloged items on the main dashboard.
FR22: User can see at minimum: item title, category, thumbnail image, and sync status in the item list.
FR23: User can search items by title or category using a text search input.
FR24: User can filter items by category.
FR25: User can tap an item in the list to view its full details.
FR26: User can export the full item list as a CSV file.
FR27: User can share the exported CSV file via the native OS share sheet (email, Airdrop, Slack, etc.).
FR28: The backend can enforce a maximum of 20 AI analysis requests per user per hour.
FR29: The backend can log all AI parse failures with the raw AI response for diagnosis.
FR30: Administrator can configure the AI prompt server-side without requiring a mobile app update.
FR31: User can delete a cataloged item, removing it from the database and deleting its associated photo from cloud storage.

### NonFunctional Requirements

NFR-P1: The system shall complete client-side image compression in under 2 seconds for a 12MP image.
NFR-P2: The system shall return the structured JSON item record in under 4 seconds (95th percentile) from image upload initiation on a standard 4G connection.
NFR-P3: The system shall render the item list dashboard with 500 items while maintaining a 60fps scroll rate (<16ms frame time).
NFR-P4: The system shall become interactive from a warm start in under 3 seconds.
NFR-S1: The system shall enforce backend-only access to 3rd-party AI services, avoiding embedding credentials in the client bundle.
NFR-S2: The system shall enforce data isolation such that users can only read/write their own item records and images.
NFR-S3: The system shall require an authenticated session (anonymous or authenticated) prior to allowing any AI API invocations.
NFR-R1: The system shall maintain a 0% crash rate resulting from AI parsing failures, network timeouts, or camera permission denials.
NFR-R2: The system shall successfully retry failed user-initiated data operations (save, sync) up to 2 times with backoff before surfacing a failure state.
NFR-R3: The system shall persist unsynced local drafts across application force-quits and device restarts with 100% reliability.
NFR-SC1: The system shall utilize elastic cloud infrastructure capable of scaling automatically without manual intervention.
NFR-SC2: The system shall enforce a strict rate limit of 20 AI analysis requests per user per hour to prevent quota exhaustion.
NFR-C1: The system shall be implemented using a cross-platform mobile framework that compiles to native code without requiring manual ejection to native project files.
NFR-C2: The system shall successfully install and operate with full feature parity on iOS 15+ and Android 10+ (API 29).
NFR-C3: The system shall perform all camera operations using the device's rear-facing camera.

### Additional Requirements

**From Architecture:**
- Starter template: `create-expo-app` with `--template tabs` (Expo SDK 54); must replace Expo Router with React Navigation 7.x
- Core dependencies: React Native Paper 5.15.x, Zustand 5.x, MMKV, Zod 4.3.x, Firebase JS SDK 12.9.x, React Navigation 7.x
- Data model: Firestore subcollection at `users/{userId}/items/{itemId}` with `ItemDocument` interface (id, title, category, color, condition, tags, notes, imageUrl, imagePath, aiGenerated, syncStatus, createdAt, updatedAt)
- Local draft schema: `LocalDraft` interface with localId, item, localImageUri, syncStatus, retryCount, createdAt
- Authentication: Firebase Auth with Anonymous + Google Sign-In
- Firestore Security Rules: user-scoped reads/writes at `users/{userId}/items/{itemId}`
- Cloud Storage Security Rules: user-scoped at `users/{userId}/items/{imageId}`
- Cloud Function API contract: `analyzeItem` callable function with `AnalyzeItemRequest`/`AnalyzeItemResponse` interfaces
- API error codes: RATE_LIMITED, AI_PARSE_FAILURE, AI_TIMEOUT, INVALID_IMAGE
- Gemini prompt stored server-side; Cloud Function strips markdown fences before parsing
- Project structure: feature-first with `src/` containing components, screens, navigation, stores, services, hooks, utils, types, constants, assets
- Cloud Functions project: `functions/` with src/index.ts, analyzeItem.ts, prompts/, validators/, middleware/, utils/
- State architecture: 3 Zustand stores (useItemStore, useAuthStore, useNetworkStore)
- Retry pattern: max 2 retries with exponential backoff (1s, 2s base delay)
- CI/CD: GitHub Actions for lint + type check on PR
- Naming conventions: PascalCase for components, camelCase for hooks/utils/services, SCREAMING_SNAKE_CASE for constants
- Error handling: React Error Boundary at screen level, Zod safeParse for AI, try/catch everywhere
- Sync triggers: network restored, app foregrounded, new draft saved while online

**From UX Design:**
- Dark-mode-first design with custom MD3 theme (background #0F0F13, surface #1A1A22, primary #7C6EF8, secondary/AI-accent #64DFDF)
- Typography: Inter font loaded via expo-font, 7-level type scale from displayLarge (28sp) to labelSmall (11sp)
- Spacing: 8dp base unit with 7-level scale (space1=4dp through space8=48dp)
- Border radius: Cards 12dp, Buttons 8dp, Chips 16dp, Inputs 8dp, FAB 16dp
- Custom components required: ItemCard (with sync badge), ScanLoadingOverlay (animated, cycling copy), AIFieldBadge (sparkle icon), SyncStatusBar (persistent banner), EmptyStateCard (illustration + prompt)
- Camera UX: full-screen modal, single shutter button (48dp), gallery picker option, permission denied → explanation card
- AI loading: overlay on captured image (60% opacity + blur), animated ring progress, cycling copy every 1.5s, 6s timeout with retry/manual CTAs
- Review form: one field per row, label above input, AI badge at label trailing position, inline editing
- Confirm flow: haptic feedback + success animation, return to Dashboard after confirm
- Error messages: calm, helpful tone ("Couldn't analyze image. Fill in details manually or retry.")
- Accessibility: WCAG 2.2 AA, 44×44dp minimum touch targets, accessibilityLabel on all interactive elements, accessibilityLiveRegion on loading states, accessibilityRole="alert" on errors
- Responsive: mobile-first (320–428dp primary), single-column, 16dp screen margins
- Skeleton loading: 3× shimmer ItemCards for dashboard load
- Pull-to-refresh on Dashboard for sync check
- Empty states: all include actionable guidance text

### FR Coverage Map

| FR   | Epic   | Description                                   |
| ---- | ------ | --------------------------------------------- |
| FR1  | Epic 2 | Open full-screen camera from dashboard        |
| FR2  | Epic 2 | Capture photo with device camera              |
| FR3  | Epic 2 | Select photo from gallery                     |
| FR4  | Epic 2 | Compress image to <500KB                      |
| FR5  | Epic 2 | Camera/gallery permission handling            |
| FR6  | Epic 3 | Send image to backend for AI analysis         |
| FR7  | Epic 3 | Backend returns structured item record        |
| FR8  | Epic 3 | Backend validates AI response with Zod schema |
| FR9  | Epic 3 | Manual entry fallback on AI failure           |
| FR10 | Epic 3 | Loading state during AI analysis              |
| FR11 | Epic 3 | Pre-populated form after AI analysis          |
| FR12 | Epic 4 | Edit AI-generated fields                      |
| FR13 | Epic 4 | Add notes/tags beyond AI fields               |
| FR14 | Epic 4 | Confirm and save item                         |
| FR15 | Epic 4 | Discard scan and return to dashboard          |
| FR16 | Epic 4 | Persist items to cloud database               |
| FR17 | Epic 4 | Store photos in cloud storage                 |
| FR18 | Epic 6 | Save items as local drafts offline            |
| FR19 | Epic 6 | Auto-sync drafts when network restored        |
| FR20 | Epic 6 | View sync status per item                     |
| FR21 | Epic 5 | View all cataloged items on dashboard         |
| FR22 | Epic 5 | See title, category, thumbnail, sync status   |
| FR23 | Epic 5 | Search items by title or category             |
| FR24 | Epic 5 | Filter items by category                      |
| FR25 | Epic 5 | Tap item to view full details                 |
| FR26 | Epic 7 | Export item list as CSV                       |
| FR27 | Epic 7 | Share CSV via native OS share sheet           |
| FR28 | Epic 3 | Rate limit: 20 AI requests/user/hour          |
| FR29 | Epic 3 | Log AI parse failures with raw response       |
| FR30 | Epic 3 | Server-side AI prompt configuration           |
| FR31 | Epic 4 | Delete item from database + cloud storage     |

## Epic List

### Epic 1: Project Foundation & Authentication
Users can install and launch the app, sign in (anonymously or with Google), and access a secure, authenticated experience with proper navigation.
**FRs covered:** Foundation — enables NFR-S1–S3, NFR-C1–C2, NFR-SC1

### Epic 2: Camera Capture & Image Processing
Users can open the camera, capture a photo (or pick from gallery), and have the image compressed and ready for processing — all with graceful permission handling.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 3: AI-Powered Item Analysis
Users photograph an item and see AI-populated fields (title, category, color, condition) appear within seconds — or get a clean manual entry fallback if AI is unavailable.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR28, FR29, FR30

### Epic 4: Item Review, Edit & Save
Users can review AI-generated (or manually entered) fields, edit them, add notes/tags, confirm, and save the item — with haptic feedback and a satisfying confirm experience.
**FRs covered:** FR12, FR13, FR14, FR15, FR16, FR17, FR31

### Epic 5: Dashboard & Item Discovery
Users can browse, search, and filter their cataloged items on the dashboard — seeing thumbnails, categories, sync status, and tapping through to full item details.
**FRs covered:** FR21, FR22, FR23, FR24, FR25

### Epic 6: Offline Mode & Background Sync
Users can continue cataloging items with no network — items save locally as drafts and automatically sync when connectivity returns, with visible sync status on every item.
**FRs covered:** FR18, FR19, FR20

### Epic 7: Export & Sharing
Users can export their full inventory as a CSV file and share it via the native OS share sheet (email, AirDrop, etc.).
**FRs covered:** FR26, FR27

---

## Epic 1: Project Foundation & Authentication

Users can install and launch the app, sign in (anonymously or with Google), and access a secure, authenticated experience with proper navigation.

### Story 1.1: Scaffold Expo Project & Install Core Dependencies

As a developer,
I want a properly initialized Expo project with all core dependencies installed and configured,
So that I have a working development environment to build features on.

**Acceptance Criteria:**

**Given** a clean project directory
**When** the developer runs `npx -y create-expo-app@latest ./ --template tabs`
**Then** the Expo project is initialized with TypeScript and Expo SDK 54
**And** Expo Router is removed and replaced with React Navigation 7.x (Stack + Tab + Native Stack)
**And** all core dependencies are installed: React Native Paper 5.15.x, Zustand 5.x, react-native-mmkv, Zod 4.3.x, Firebase JS SDK 12.9.x, @react-native-community/netinfo
**And** the project structure follows the Architecture spec: `src/` with components, screens, navigation, stores, services, hooks, utils, types, constants, assets directories
**And** `tsconfig.json` has strict mode enabled and path alias `@/` mapped to `src/`
**And** the app successfully builds and runs on both iOS (Expo Go) and Android (dev build)

### Story 1.2: Design System & Theme Foundation

As a user,
I want a polished, dark-mode-first visual experience,
So that the app feels premium and professional from the first launch.

**Acceptance Criteria:**

**Given** the scaffolded Expo project
**When** the design system is implemented
**Then** `constants/theme.ts` defines the complete MD3 dark theme with all color tokens (background #0F0F13, surface #1A1A22, primary #7C6EF8, secondary #64DFDF, error #FF6B6B, onBackground #EAEAF0, onSurface #C8C8D4, outline #3A3A48)
**And** typography tokens use the Inter font family with all 7 levels (displayLarge through labelSmall)
**And** spacing tokens use the 8dp base grid (space1=4dp through space8=48dp)
**And** border radius tokens are defined (cards 12dp, buttons 8dp, chips 16dp, inputs 8dp, FAB 16dp)
**And** Inter font is loaded via `expo-font` at app startup
**And** React Native Paper `Provider` wraps the app root with the custom MD3 theme
**And** `constants/config.ts` defines all app constants (MAX_IMAGE_SIZE, AI_TIMEOUT_MS, etc.)

### Story 1.3: Navigation Architecture

As a user,
I want intuitive tab-based navigation with a floating scan button,
So that I can quickly move between the dashboard and settings, and access the camera from anywhere.

**Acceptance Criteria:**

**Given** the themed Expo project
**When** navigation is implemented
**Then** a Bottom Tab Navigator provides two tabs: Dashboard and Settings
**And** the Dashboard tab uses a Stack Navigator for ItemList → ItemDetail → EditItem flow
**And** the Camera screen is configured as a full-screen modal presented over the tab navigator
**And** navigation types are defined in `types/navigation.types.ts` with proper TypeScript param lists
**And** back gesture (swipe right) works for stack navigation on both platforms
**And** all navigation transitions are smooth with default React Navigation animations

### Story 1.4: Firebase Integration & Authentication

As a user,
I want to sign in automatically (anonymously) on first launch or optionally with my Google account,
So that my items are securely scoped to my identity without any friction.

**Acceptance Criteria:**

**Given** a user launching the app for the first time
**When** the app initializes
**Then** Firebase is configured via `services/firebaseConfig.ts` using environment variables from `.env`
**And** the user is automatically signed in anonymously via Firebase Auth
**And** `useAuthStore` (Zustand) tracks auth state: user, isAuthenticated, loading
**And** the user can upgrade to Google Sign-In from the Settings screen
**And** Firestore Security Rules enforce `request.auth.uid == userId` for all reads/writes at `users/{userId}/items/{itemId}`
**And** Cloud Storage Security Rules enforce user-scoped access at `users/{userId}/items/{imageId}`
**And** the `.env.example` file documents all required environment variables
**And** API keys are never exposed in the client bundle (NFR-S1)

### Story 1.5: Zustand State Management & MMKV Persistence

As a user,
I want my app state to persist across sessions and survive force-quits,
So that I never lose my data or have to re-login.

**Acceptance Criteria:**

**Given** the authenticated app
**When** state stores are initialized
**Then** `stores/useItemStore.ts` manages items, drafts, isLoading, searchQuery, categoryFilter with proper actions
**And** `stores/useAuthStore.ts` manages user, isAuthenticated, signInAnonymously, signInWithGoogle, signOut
**And** `stores/useNetworkStore.ts` manages isOnline state with setter
**And** `utils/mmkvStorage.ts` provides a Zustand-compatible storage adapter using react-native-mmkv
**And** useItemStore persists drafts to MMKV via Zustand persist middleware
**And** drafts survive app force-quit and device restart with 100% reliability (NFR-R3)
**And** all store updates use immutable patterns (spread operator)

---

## Epic 2: Camera Capture & Image Processing

Users can open the camera, capture a photo (or pick from gallery), and have the image compressed and ready for processing — all with graceful permission handling.

### Story 2.1: Camera Screen & Photo Capture

As a user,
I want to tap a scan button and take a photo of any item using a clean, full-screen camera,
So that I can quickly capture items for cataloging.

**Acceptance Criteria:**

**Given** the user is on the Dashboard screen
**When** the user taps the FAB (camera icon)
**Then** a full-screen camera modal opens using `expo-camera` with the rear-facing camera (NFR-C3)
**And** a single large shutter button (48dp) is centered at the bottom of the screen
**And** the camera UI is minimal and chrome-free (Apple Camera-inspired)
**And** the user can tap the shutter button to capture a photo
**And** the captured image is stored locally as a temporary file
**And** after capture, the image is displayed for preview before proceeding
**And** all interactive elements have `testID` and `accessibilityLabel` props

### Story 2.2: Gallery Picker Alternative

As a user,
I want to pick an existing photo from my gallery instead of taking a new one,
So that I can catalog items from photos I've already taken.

**Acceptance Criteria:**

**Given** the user is on the Camera screen
**When** the user taps the gallery picker icon (less prominent than shutter)
**Then** the device's native photo library picker opens via `expo-image-picker`
**And** the user can select a single image from their gallery
**And** the selected image is handled identically to a camera-captured image
**And** photo library permission is requested on first use with a clear explanation of why it's needed
**And** if permission is denied, a friendly explanation card is shown with an "Open Settings" CTA

### Story 2.3: Permission Handling & Graceful Denial

As a user,
I want clear, friendly explanations when the app needs camera or gallery access,
So that I understand why permissions are needed and can easily grant them.

**Acceptance Criteria:**

**Given** the user taps the FAB for the first time
**When** camera permission has not been granted
**Then** a `PermissionCard` component is shown with a friendly rationale explaining why camera access is needed
**And** the user can tap "Allow" to trigger the native permission dialog
**And** if the user denies permission, the app does not crash (NFR-R1)
**And** the denial state shows a persistent explanation card with "Open Settings" button
**And** if the user grants permission later via Settings, the camera becomes available without app restart
**And** the same pattern applies to photo library permission for gallery access

### Story 2.4: Image Compression Pipeline

As a user,
I want my photos automatically compressed before upload,
So that uploads are fast and don't consume excessive data.

**Acceptance Criteria:**

**Given** a photo has been captured or selected from gallery
**When** the image is prepared for processing
**Then** `services/imageService.ts` compresses the image using `expo-image-manipulator`
**And** the compressed image is resized to a maximum of 1280px on the longest edge
**And** the compressed file size is always below 500 KB (FR4)
**And** compression completes in under 2 seconds for a 12MP source image (NFR-P1)
**And** the original image is not modified; a compressed copy is created
**And** the compressed image URI is returned for upload

---

## Epic 3: AI-Powered Item Analysis

Users photograph an item and see AI-populated fields (title, category, color, condition) appear within seconds — or get a clean manual entry fallback if AI is unavailable.

### Story 3.1: Cloud Function & Gemini AI Integration

As a backend system,
I want a Cloud Function that receives an image URL and returns AI-analyzed item data,
So that the mobile app can display structured AI results without exposing API keys.

**Acceptance Criteria:**

**Given** the Firebase Cloud Functions project is initialized in `functions/`
**When** the `analyzeItem` HTTPS Callable function is invoked with an `imageUrl`
**Then** the function verifies the caller is authenticated (NFR-S3)
**And** the function calls Gemini 2.0 Flash with the image URL and a strict JSON-only prompt
**And** the prompt is stored server-side in `functions/src/prompts/itemAnalysis.ts` (FR30)
**And** the raw AI response is stripped of any markdown code fences before parsing
**And** the response is validated against a Zod schema in `functions/src/validators/itemSchema.ts` (FR8)
**And** on success, the function returns `{ success: true, data: { title, category, color, condition } }`
**And** on failure, the function returns `{ success: false, error: { code, message } }` with appropriate error code
**And** the Gemini API key is stored in Firebase environment config, never in client code (NFR-S1)

### Story 3.2: Rate Limiting & Error Logging

As an administrator,
I want AI requests rate-limited and all parse failures logged with the raw response,
So that I can control API costs and diagnose AI issues.

**Acceptance Criteria:**

**Given** a user makes AI analysis requests
**When** the user exceeds 20 requests in one hour
**Then** the Cloud Function returns `{ success: false, error: { code: 'RATE_LIMITED', message: '...' } }` (FR28)
**And** the rate limiter is implemented in `functions/src/middleware/rateLimiter.ts`
**And** rate tracking uses an in-memory counter per user UID
**And** all AI parse failures are logged with the raw AI response using `functions.logger` (FR29)
**And** logs include: user UID, timestamp, raw response text, and the specific parse error
**And** retry logic in the Cloud Function uses max 2 retries with exponential backoff (1s, 2s)

### Story 3.3: AI Service Client & Loading Experience

As a user,
I want to see an engaging loading animation while AI analyzes my photo,
So that I feel the app is working and stay engaged during the brief wait.

**Acceptance Criteria:**

**Given** a compressed image has been uploaded to Cloud Storage
**When** the AI analysis is triggered via `services/aiService.ts`
**Then** the `ScanLoadingOverlay` component appears over the captured image (60% opacity + blur)
**And** a custom animated ring progress indicator is shown (not the default RN ActivityIndicator)
**And** loading copy cycles every 1.5 seconds: "Analyzing image..." → "Identifying item..." → "Almost done..."
**And** `accessibilityLiveRegion="polite"` announces loading state changes to screen readers
**And** the AI round-trip completes in under 4 seconds (95th percentile) on 4G (NFR-P2)
**And** if analysis succeeds, the overlay transitions smoothly to the pre-populated Review Form (FR11)
**And** AI-populated fields show the `AIFieldBadge` (sparkle icon in #64DFDF) at the label trailing position

### Story 3.4: AI Failure Handling & Manual Entry Fallback

As a user,
I want a clean manual entry option when AI analysis fails,
So that I can still catalog items regardless of AI or network issues.

**Acceptance Criteria:**

**Given** the AI analysis is in progress
**When** the AI analysis times out after 6 seconds or returns an invalid response
**Then** the loading overlay stops and an inline error state appears with two CTAs: "Try Again" (primary) and "Fill Manually" (secondary)
**And** a friendly toast message appears: "Couldn't analyze image. Fill in details manually or retry." (NFR-R1)
**And** if "Fill Manually" is tapped, the same Review Form appears with all fields blank (FR9)
**And** if "Try Again" is tapped, the AI analysis retries from the same image
**And** the manual entry form is identical in layout and behavior to the AI-populated form
**And** the app never crashes regardless of the AI failure mode (NFR-R1)
**And** when Zod `.safeParse()` fails, the error is caught and manual entry is presented

---

## Epic 4: Item Review, Edit & Save

Users can review AI-generated (or manually entered) fields, edit them, add notes/tags, confirm, and save the item — with haptic feedback and a satisfying confirm experience.

### Story 4.1: Review Form Screen

As a user,
I want to see a clean, editable form with all item fields after scanning,
So that I can review AI suggestions and make corrections before saving.

**Acceptance Criteria:**

**Given** the AI analysis has completed (or manual entry was selected)
**When** the Review Form screen is displayed
**Then** the form shows one field per row: Title, Category, Color, Condition, Tags, Notes
**And** each field has a visible label above the input (not placeholder-only)
**And** AI-populated fields show the `AIFieldBadge` sparkle icon at the label trailing position
**And** all fields are tappable and editable inline (FR12)
**And** the captured item photo is displayed at the top of the form as context
**And** the keyboard scrolls the form to keep the focused field visible
**And** "Return" advances to the next field; the last field "Return" dismisses the keyboard
**And** all interactive elements have `testID` and `accessibilityLabel` props

### Story 4.2: Confirm & Save Item to Cloud

As a user,
I want to tap one button to save my item with a satisfying confirmation,
So that I feel accomplished and can quickly move to the next item.

**Acceptance Criteria:**

**Given** the user is on the Review Form with valid data
**When** the user taps "Confirm & Save" (full-width primary button at the bottom)
**Then** the item photo is uploaded to Cloud Storage at `users/{userId}/items/{imageId}` (FR17)
**And** the item document is saved to Firestore at `users/{userId}/items/{itemId}` with all fields from the `ItemDocument` interface (FR16)
**And** the `syncStatus` is set to `synced`, `aiGenerated` reflects whether AI populated the fields
**And** haptic feedback (medium intensity) fires on confirm tap
**And** a brief success animation plays (item visually confirmed)
**And** the user is returned to the Dashboard where the new item appears at the top of the list
**And** a snackbar shows "Item saved" for 3 seconds
**And** no confirmation dialog is shown for saves (one-tap only)

### Story 4.3: Discard Scan & Cancel Flow

As a user,
I want to abandon a scan and return to the dashboard without saving,
So that I can skip items I don't want to catalog.

**Acceptance Criteria:**

**Given** the user is on the Camera screen or Review Form
**When** the user taps the back/close button
**Then** the current scan is discarded without saving (FR15)
**And** the temporary compressed image is cleaned up from local storage
**And** the user returns to the Dashboard
**And** no data is persisted to Firestore or Cloud Storage
**And** no confirmation dialog is shown for discard (consistent with no-modal save pattern)

### Story 4.4: Edit Existing Item

As a user,
I want to edit a previously saved item's details,
So that I can correct mistakes or update information after initial cataloging.

**Acceptance Criteria:**

**Given** the user is viewing an item's full details on the ItemDetail screen
**When** the user taps "Edit"
**Then** the `EditItemScreen` opens with the same form layout as the Review Form
**And** all fields are pre-populated with the item's current values
**And** the user can modify any field
**And** on save, the Firestore document is updated with the new values and `updatedAt` timestamp
**And** the user returns to ItemDetail with the updated information
**And** the Dashboard list reflects the changes immediately

### Story 4.5: Delete Item

As a user,
I want to delete an item I no longer need,
So that I can keep my inventory clean and accurate.

**Acceptance Criteria:**

**Given** the user is viewing an item on the ItemDetail screen
**When** the user taps "Delete"
**Then** a confirmation dialog appears: "Delete this item?" with "Delete" (destructive) and "Cancel" options (FR31)
**And** on confirmation, the item document is deleted from Firestore
**And** the associated photo is deleted from Cloud Storage
**And** the item is removed from the Zustand store
**And** the user returns to the Dashboard where the item is no longer visible
**And** a snackbar shows "Item deleted" for 3 seconds

---

## Epic 5: Dashboard & Item Discovery

Users can browse, search, and filter their cataloged items on the dashboard — seeing thumbnails, categories, sync status, and tapping through to full item details.

### Story 5.1: Dashboard Item List

As a user,
I want to see all my cataloged items on the main screen,
So that I can browse my inventory at a glance.

**Acceptance Criteria:**

**Given** the user has cataloged items
**When** the Dashboard screen loads
**Then** a virtualized FlatList renders all items sorted by creation date (newest first) (FR21)
**And** each item is displayed as an `ItemCard` showing: 72×72dp thumbnail, title, category chip, and sync status badge (FR22)
**And** the list maintains 60fps scroll performance with 500 items (NFR-P3)
**And** `ItemCard` components use `React.memo` for render optimization
**And** on first load, 3× skeleton shimmer cards are shown while data loads
**And** a pull-to-refresh gesture triggers a sync check
**And** the FAB (Scan button) is always visible at the bottom-right

### Story 5.2: Empty State & First-Run Experience

As a first-time user,
I want a clear, welcoming empty state that tells me exactly what to do,
So that I can start using the app without any instructions.

**Acceptance Criteria:**

**Given** the user has zero cataloged items
**When** the Dashboard loads
**Then** the `EmptyStateCard` is displayed with a custom illustration (camera with sparkles)
**And** the headline reads: "Your inventory starts here"
**And** the subtext reads: "Tap the scan button to photograph any item — AI fills in the details."
**And** no additional CTA button is shown (the FAB is already visible)
**And** the empty state is visually appealing and centered on the screen

### Story 5.3: Search & Filter Items

As a user,
I want to search and filter my items by title or category,
So that I can quickly find specific items in a large inventory.

**Acceptance Criteria:**

**Given** the user has cataloged items on the Dashboard
**When** the user types in the permanently visible `Searchbar` component
**Then** the item list filters in real-time as the user types (debounced at 300ms) (FR23)
**And** search matches against item title and category fields
**And** when no results match, a "No items found for '{query}'" message is shown with a "Clear search" link
**And** `CategoryChip` components are displayed horizontally below the search bar for category filtering (FR24)
**And** tapping a category chip filters the list to only items in that category
**And** tapping the active category chip clears the filter
**And** when no items match the category, "No items in this category" is shown with a "Clear filter" link
**And** search and category filter can be combined

### Story 5.4: Item Detail View

As a user,
I want to tap an item to see its full details with the photo,
So that I can review all information about a cataloged item.

**Acceptance Criteria:**

**Given** the user is on the Dashboard
**When** the user taps an `ItemCard` (FR25)
**Then** the `ItemDetailScreen` opens showing the full-size item photo
**And** all item fields are displayed in a read-only layout: title, category, color, condition, tags, notes
**And** the sync status is visible
**And** creation date and last updated date are formatted and displayed
**And** an "Edit" button is available to navigate to `EditItemScreen`
**And** a "Delete" button is available with destructive styling (text, error color)
**And** back navigation returns to the Dashboard with the list position preserved

---

## Epic 6: Offline Mode & Background Sync

Users can continue cataloging items with no network — items save locally as drafts and automatically sync when connectivity returns, with visible sync status on every item.

### Story 6.1: Network Status Detection & Offline Banner

As a user,
I want to know when I'm offline so I can still use the app confidently,
So that I understand my items will sync once I'm back online.

**Acceptance Criteria:**

**Given** the app is running
**When** the device loses network connectivity
**Then** `useNetworkStore` updates `isOnline` to false via `@react-native-community/netinfo` listener
**And** an offline banner is visible on the Dashboard
**And** when connectivity is restored, `isOnline` updates to true
**And** the offline banner dismisses with a smooth animation
**And** the network status listener is initialized at app startup

### Story 6.2: Local Draft Save & Offline Cataloging

As a user,
I want to save items locally when I have no network,
So that I can continue cataloging without waiting for connectivity.

**Acceptance Criteria:**

**Given** the user is offline (no network connectivity)
**When** the user completes the Review Form and taps "Confirm & Save"
**Then** the item is saved as a `LocalDraft` in MMKV via the Zustand persist middleware (FR18)
**And** the draft includes: localId (UUID), item fields, localImageUri (compressed file path), syncStatus "pending", retryCount 0
**And** the item appears on the Dashboard with a pending sync badge (amber clock icon)
**And** a snackbar shows: "Saved offline — will sync when connected"
**And** the draft persists across app force-quit and device restart (NFR-R3)
**And** multiple offline items can be saved sequentially

### Story 6.3: Background Sync Engine

As a user,
I want my offline items to automatically sync when I get back online,
So that I don't have to manually upload anything.

**Acceptance Criteria:**

**Given** the user has pending draft items stored locally
**When** network connectivity is restored
**Then** `services/syncService.ts` automatically triggers sync (FR19)
**And** sync also triggers on: app foregrounding and when a new draft is saved while online
**And** for each draft: the photo is uploaded to Cloud Storage, then the item document is saved to Firestore
**And** the `SyncStatusBar` component shows "Syncing N items..." with a progress indicator
**And** on successful sync, the draft is removed from MMKV and the item updates to `syncStatus: "synced"` in the store
**And** failed syncs retry up to 2 times with exponential backoff (1s, 2s) (NFR-R2)
**And** after max retries, `syncStatus` is set to "error" with a retry tap handler
**And** the `SyncStatusBar` shows a brief green flash "All synced ✓" then dismisses when complete (FR20)

---

## Epic 7: Export & Sharing

Users can export their full inventory as a CSV file and share it via the native OS share sheet (email, AirDrop, etc.).

### Story 7.1: CSV Export & Share

As a user,
I want to export my full inventory as a CSV file and share it,
So that I can send my catalog to insurance agents, buyers, or other tools.

**Acceptance Criteria:**

**Given** the user has cataloged items
**When** the user taps "Export CSV" on the Settings screen
**Then** `services/csvService.ts` generates a CSV file containing all synced items (FR26)
**And** the CSV includes columns: Title, Category, Color, Condition, Tags, Notes, Created Date
**And** the file is saved locally via `expo-file-system`
**And** the native OS share sheet opens via `expo-sharing` (FR27)
**And** the user can share via email, AirDrop, Slack, or any installed app
**And** if no items exist, a snackbar shows: "No items to export"
**And** the export covers all items regardless of sync status (includes pending drafts with available data)

### Story 7.2: Settings Screen

As a user,
I want a settings screen with export, account info, and sign-out,
So that I can manage my account and access utility features.

**Acceptance Criteria:**

**Given** the user taps the Settings tab
**When** the Settings screen loads
**Then** the screen displays: current user info (email or "Anonymous"), sign-in/sign-out option, Export CSV button, and app version
**And** if signed in anonymously, a "Sign in with Google" option is available
**And** if signed in with Google, a "Sign Out" option is available
**And** tapping "Sign Out" confirms with a dialog before signing out
**And** the screen follows the dark theme design system consistently
