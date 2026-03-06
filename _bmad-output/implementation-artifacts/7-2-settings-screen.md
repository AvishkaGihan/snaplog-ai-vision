# Story 7.2: Settings Screen

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a settings screen with export, account info, and sign-out,
So that I can manage my account and access utility features.

## Acceptance Criteria

**AC1 — User Info Display:**

- **Given** the user taps the Settings tab
- **When** the Settings screen loads
- **Then** the screen displays the current user info: display name (or "Anonymous User" if anonymous), email (or "No email — sign in with Google" if anonymous), and avatar (photo or initials)
- **And** the user card is styled with `theme.colors.surface` background, `theme.borderRadius.cards` border radius, and proper spacing
- **And** all text uses theme typography tokens (not hardcoded sizes or colors)
- **And** the user card has `testID` and `accessibilityLabel` on all interactive/semantic elements

**AC2 — Sign-in / Sign-out Options:**

- **Given** the user is signed in anonymously
- **When** the Settings screen loads
- **Then** a "Sign in with Google" button is displayed (contained mode, primary style)
- **And** the button has `testID="settings-google-sign-in-button"` and `accessibilityLabel="Sign in with Google"`
- **And** the button shows a loading state while Google sign-in is in progress
- **And** the button is disabled while the Google auth module is not ready

- **Given** the user is signed in with Google
- **When** the Settings screen loads
- **Then** a "Sign Out" button is displayed (outlined mode)
- **And** tapping "Sign Out" shows a confirmation dialog: "Sign out?" with "Cancel" and "Sign Out" actions
- **And** on confirmation, the user is signed out via `useAuthStore.signOut()`
- **And** the dialog has `testID="settings-sign-out-dialog"` and appropriate `accessibilityLabel` on all actions

**AC3 — Export CSV Button:**

- **Given** the Settings screen is loaded
- **When** the user views the screen
- **Then** an "Export CSV" button is visible between the divider/user card section and the app version
- **And** tapping the button triggers the CSV export flow (already implemented in `csvService.ts`)
- **And** the button has `testID="settings-export-csv-button"` and `accessibilityLabel="Export CSV"`
- **And** the button shows loading/disabled state during export
- **And** empty state shows snackbar "No items to export" if no items or drafts exist
- **And** errors show snackbar "Couldn't export items. Please try again."

**AC4 — App Version Display:**

- **Given** the Settings screen is loaded
- **When** the user scrolls to the bottom
- **Then** the app version is displayed using `Constants.expoConfig?.version`
- **And** the version text uses `theme.colors.onSurface` and `bodyMedium` typography

**AC5 — Dark Theme Consistency:**

- **Given** the complete Settings screen implementation
- **When** the screen renders
- **Then** all colors come from `theme.colors.*` tokens — no hardcoded color values
- **And** all spacing uses `theme.spacing.*` tokens
- **And** all border radii use `theme.borderRadius.*` tokens
- **And** the screen background is `theme.colors.background`
- **And** the overall appearance is consistent with the dark-mode-first design system

**AC6 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (regression check)

## Tasks / Subtasks

- [x] **Task 1: Audit existing `src/screens/SettingsScreen.tsx` against all ACs** (AC: 1, 2, 3, 4, 5)
  - [x] Verify user info display matches AC1 exactly (display name, email, avatar)
  - [x] Verify sign-in/sign-out flow matches AC2 exactly (anonymous → Google button, Google → Sign Out button with dialog)
  - [x] Verify Export CSV button placement and behavior matches AC3 (between divider and version, loading/empty/error states)
  - [x] Verify app version display matches AC4 (Constants.expoConfig?.version with correct styling)
  - [x] Verify ALL colors, spacing, and border radii use theme tokens (AC5)
  - [x] Verify ALL interactive elements have `testID` and `accessibilityLabel` props

- [x] **Task 2: Fix any discrepancies found in audit** (AC: 1–5)
  - [x] Apply any fixes needed based on the audit in Task 1
  - [x] Ensure no regressions to existing Export CSV functionality
  - [x] Ensure no regressions to existing sign-in/sign-out functionality

- [x] **Task 3: Build verification** (AC: 6)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS — The Settings Screen Is Essentially Complete

> **⚠️ CRITICAL**: The `SettingsScreen.tsx` was built and enhanced across Story 7.1 (CSV Export & Share) and its subsequent code review. **Most of Story 7.2's acceptance criteria are already satisfied by the existing implementation.** Your primary job is to **audit the existing code** against the ACs below, identify any gaps, and fix them — NOT to rebuild the screen from scratch.

| File                               | Current State                                                                                                                                                              | This Story's Action                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/screens/SettingsScreen.tsx`   | 263 lines — User card (avatar/initials, name, email), Google Sign-In / Sign Out with dialog, Export CSV with loading/snackbar, app version, ScrollView, dark theme styling | **AUDIT** — Verify every AC is met; fix any gaps                    |
| `src/stores/useAuthStore.ts`       | 87 lines — `user`, `isAuthenticated`, `loading`, `signInAnonymously`, `signInWithGoogle`, `signOut`, `initialize`                                                          | **NO CHANGES** — already provides all auth state and actions needed |
| `src/stores/useItemStore.ts`       | Has `items: ItemDocument[]`, `drafts: LocalDraft[]` — used for CSV export empty state check                                                                                | **NO CHANGES** — already read by SettingsScreen for export feature  |
| `src/types/auth.types.ts`          | 8 lines — `AuthUser { uid, email, displayName, isAnonymous, photoURL }`                                                                                                    | **NO CHANGES** — provides all user info fields needed for display   |
| `src/services/csvService.ts`       | CSV generation + share orchestration — `exportAndShareCsv`, `generateCsvContent`                                                                                           | **NO CHANGES** — already complete and tested from Story 7.1         |
| `src/hooks/useGoogleAuth.ts`       | Google auth hook — `signIn`, `isReady`, `loading`                                                                                                                          | **NO CHANGES** — already used by SettingsScreen                     |
| `src/constants/theme.ts`           | 116 lines — Full dark theme with colors, spacing, borderRadius, typography, semanticColors                                                                                 | **NO CHANGES** — use tokens for all styling                         |
| `src/constants/config.ts`          | 13 constants — Includes `SNACKBAR_DURATION_MS = 3000`                                                                                                                      | **NO CHANGES** — reuse for snackbar duration                        |
| `src/navigation/RootNavigator.tsx` | 66 lines — Tab Navigator with Dashboard and Settings tabs; Settings uses `SettingsScreen` component                                                                        | **NO CHANGES** — Settings tab already wired                         |

#### Dependencies Already Installed (Do NOT Install Again)

| Package              | Version | Purpose                                                               |
| -------------------- | ------- | --------------------------------------------------------------------- |
| `react-native-paper` | 5.15.x  | `Button`, `Dialog`, `Snackbar`, `Avatar`, `Text`, `Divider`, `Portal` |
| `expo-constants`     | Latest  | App version from `expoConfig`                                         |
| `zustand`            | 5.x     | State management (`useAuthStore`, `useItemStore`)                     |
| `expo-file-system`   | ~18.0.8 | Used by csvService (write CSV file)                                   |
| `expo-sharing`       | ~14.0.x | Used by csvService (native share sheet)                               |

**No new npm dependencies required.**

---

### Existing Implementation Analysis

The current `SettingsScreen.tsx` (263 lines) already implements:

1. **User info display** ✅
   - Avatar with photo URL (if available) or text initials fallback
   - Display name (or "Anonymous User")
   - Email (or "No email — sign in with Google")
   - User card with surface background and card border radius

2. **Sign-in/sign-out** ✅
   - Anonymous users see "Sign in with Google" button (contained mode, with loading/disabled states)
   - Google users see "Sign Out" button (outlined mode)
   - Sign out confirmation dialog with Cancel/Sign Out actions
   - All interactive elements have `testID` and `accessibilityLabel`

3. **Export CSV** ✅
   - "Export CSV" button with `icon="file-export"`, loading/disabled state
   - Empty state check (no items + no drafts → snackbar "No items to export")
   - Error handling with snackbar "Couldn't export items. Please try again."
   - Double-tap guard via `isExporting` flag

4. **App version** ✅
   - `Constants.expoConfig?.version ?? "1.0.0"` displayed with `bodyMedium` and `onSurface` color

5. **Dark theme** ✅
   - All styles use `theme.colors.*`, `theme.spacing.*`, `theme.borderRadius.*`
   - No hardcoded values detected in stylesheet

6. **Layout** ✅
   - `SafeAreaView` wrapper with `ScrollView` for content overflow
   - Proper element ordering: title → user card → divider → export button → version

**Potential gaps to verify during audit:**

- Ensure `accessibilityLabel` coverage is complete on ALL semantic elements (not just interactive ones)
- Verify the `userEmail` style uses `theme.colors.onSurface` (secondary text) vs `theme.colors.onBackground` (currently both use `onBackground` — the email might be better as `onSurface` for visual hierarchy)
- Verify that text elements within the user card have proper `accessibilityLabel` attributes

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Rebuilding the screen from scratch
// DO: Audit the existing 263-line implementation and fix only what's needed.

// ❌ WRONG: Adding useState for global state
const [user, setUser] = useState<User | null>(null);
// DO: Read from useAuthStore (already connected).

// ❌ WRONG: Calling Firebase directly from the screen
import { signOut } from 'firebase/auth';
// DO: Call useAuthStore.signOut() — services layer handles Firebase.

// ❌ WRONG: Hardcoding colors
const styles = StyleSheet.create({
  card: { backgroundColor: '#1A1A22' },
});
// DO: Use theme.colors.surface, theme.spacing.space4, etc.

// ❌ WRONG: Missing testID/accessibilityLabel on interactive elements
<Button onPress={handleSignOut}>Sign Out</Button>
// DO: Always include testID and accessibilityLabel.

// ❌ WRONG: Not wrapping async handlers in try/catch
await signOut(); // No error handling
// DO: Always wrap in try/catch. Show friendly snackbar on error.
```

---

### Project Structure Notes

- **No new files needed** — this story audits and potentially refines the existing `src/screens/SettingsScreen.tsx`
- Architecture boundaries are already maintained: UI (SettingsScreen) → Stores (useAuthStore, useItemStore) → Services (csvService, authService)
- No Firestore calls from UI — all state comes from Zustand stores
- Navigation already set up — Settings is the second tab in the Bottom Tab Navigator (`RootNavigator.tsx`)

### Previous Story Intelligence

**From Story 7.1 (CSV Export & Share) — Directly Preceding:**

1. **SettingsScreen was modified extensively** — Added Export CSV button, `isExporting` state, `snackbar` state, `handleExportCsv` handler, and `Snackbar` component. All of this is already in the current 263-line file.

2. **Code review fixes applied** — Story 7.1's code review added:
   - `ScrollView` wrapper for content overflow on smaller devices
   - Safe string casting in `escapeCsvField` for crash prevention
   - Date formatting fix for standard Date objects

3. **`useShallow` pattern for store selectors** — SettingsScreen already uses `useShallow` from `zustand/react/shallow` for both `useAuthStore` and `useItemStore` selectors. Follow this same pattern.

4. **`showSnackbar` helper** — A local helper function already exists for setting snackbar message + visibility. Reuse it for any new snackbar messages.

5. **Snackbar is separate from Dialog** — The `Snackbar` is outside the `ScrollView` (at `SafeAreaView` level), while the `Dialog` is inside a `Portal`. This is the correct pattern — keep it.

**From Story 1.4 (Firebase Integration & Authentication):**

1. **Anonymous auth auto-creates on first launch** — `useAuthStore.initialize()` subscribes to auth state. If no user, it auto-signs in anonymously. The Settings screen reads this state.

2. **Google Sign-In via `useGoogleAuth` hook** — Returns `{ signIn, isReady, loading }`. The `isReady` flag indicates whether the Google auth module is initialized. Button should be disabled when `!isReady`.

**From Story 1.3 (Navigation Architecture):**

1. **Settings is a tab screen** — It's the second tab in the Bottom Tab Navigator, using the `cog` icon. No stack navigation within Settings tab.

### Git Intelligence

Recent commits on `develop` branch show completed work on:

- Background sync engine implementation and fixes (Story 6.3)
- CSV export and share implementation (Story 7.1)
- Code review fixes for both stories

**Codebase conventions confirmed from recent work:**

- `StyleSheet.create` with all values from `theme.ts`
- `testID` and `accessibilityLabel` on all interactive elements
- Default exports for screen files, named exports for hooks/services/utils
- `@/` path alias for all src imports
- `useShallow` from `zustand/react/shallow` for multi-field selectors

### References

- Story 7.2 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7.2, lines 674-689]
- Epic 7 overview: "Export & Sharing" [Source: `epics.md`, lines 170-172]
- Architecture Settings screen mapping: [Source: `architecture.md`, line 627]
- Architecture export requirements mapping: [Source: `architecture.md`, line 726]
- Architecture boundary rules — UI → Stores only: [Source: `architecture.md`, lines 709-715]
- AuthUser interface: [Source: `src/types/auth.types.ts`, lines 1-8]
- Existing SettingsScreen: [Source: `src/screens/SettingsScreen.tsx` — 263 lines]
- Existing useAuthStore: [Source: `src/stores/useAuthStore.ts` — 87 lines]
- Existing RootNavigator: [Source: `src/navigation/RootNavigator.tsx` — 66 lines, Settings tab wired]
- Existing useGoogleAuth hook: [Source: `src/hooks/useGoogleAuth.ts`]
- Project context — architectural boundary rules: [Source: `project-context.md`, lines 94-100]
- Project context — error handling patterns: [Source: `project-context.md`, lines 102-109]
- Project context — no hardcoded colors: [Source: `project-context.md`, lines 72-74]
- Previous story 7-1: [Source: `_bmad-output/implementation-artifacts/7-1-csv-export-and-share.md`]
- UX Design — Settings navigation: [Source: `ux-design-specification.md`, lines 692-701]
- UX Design — dark theme colors: [Source: `ux-design-specification.md`, lines 316-329]
- UX Design — button hierarchy: [Source: `ux-design-specification.md`, lines 648-658]
- UX Design — feedback patterns (Snackbar, Dialog): [Source: `ux-design-specification.md`, lines 662-672]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

### Completion Notes List

- Completed AC-focused audit of `src/screens/SettingsScreen.tsx`; confirmed existing layout and core behavior from Story 7.1 remained intact.
- Implemented targeted fixes only: added semantic `testID`/`accessibilityLabel` coverage for user card/name/email and sign-out dialog copy, and aligned user card text color with `theme.colors.onSurface`.
- Added defensive error handling for async auth actions (`handleGoogleSignIn`, `handleConfirmSignOut`) with user-facing snackbar feedback to avoid unhandled async failures.
- Verified quality gates: root TypeScript check, functions TypeScript check, lint, and workspace Problems panel all clean.
- No new dependencies added and no architecture boundary changes introduced.

### File List

- src/screens/SettingsScreen.tsx
- \_bmad-output/implementation-artifacts/sprint-status.yaml
- \_bmad-output/implementation-artifacts/7-2-settings-screen.md

## Change Log

- 2026-03-06: Story context created for 7-2-settings-screen — comprehensive developer guide. The Settings screen is already largely implemented from Story 7.1; this story focuses on auditing for completeness against all acceptance criteria.
- 2026-03-06: Completed Story 7.2 implementation audit and gap fixes; added semantic accessibility coverage and auth async error handling in SettingsScreen, validated with typecheck/lint, and moved status to review.

