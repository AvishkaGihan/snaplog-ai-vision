# Story 6.1: Network Status Detection & Offline Banner

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to know when I'm offline so I can still use the app confidently,
So that I understand my items will sync once I'm back online.

## Acceptance Criteria

**AC1 — Network Status Listener Initialization:**

- **Given** the app is launched
- **When** the app initializes
- **Then** a `useNetworkStatus` hook initializes a `@react-native-community/netinfo` listener at app startup
- **And** the listener updates `useNetworkStore.isOnline` via `setOnline(status)` on every connectivity change
- **And** the listener is cleaned up (unsubscribed) when the app component unmounts
- **And** the initial network state is read on startup (not just changes)

**AC2 — Offline Banner Visibility:**

- **Given** the app is running and the device loses network connectivity
- **When** `useNetworkStore.isOnline` becomes `false`
- **Then** an offline banner is visible on the Dashboard screen (below the safe area, above the list header)
- **And** the banner displays a cloud-off icon and text: "You're offline — items will sync when reconnected"
- **And** the banner uses `semanticColors.syncPending` (#F0A000) as the background accent
- **And** the banner has compact height (36dp), horizontally centered icon + text

**AC3 — Online Restoration & Banner Dismissal:**

- **Given** the offline banner is visible
- **When** network connectivity is restored (`isOnline` becomes `true`)
- **Then** the offline banner dismisses with a smooth slide-up animation (200ms `Animated.timing`)
- **And** the banner is completely removed from the layout after animation completes (not just hidden)

**AC4 — Banner Animation on Appearance:**

- **Given** the device goes offline
- **When** the offline banner appears
- **Then** it slides down from the top with a smooth animation (200ms `Animated.timing`)
- **And** the layout adjusts smoothly to accommodate the banner without jarring content shifts

**AC5 — Accessibility:**

- **Given** the offline banner is rendered
- **When** a screen reader reads the screen
- **Then** the banner has `accessibilityRole="alert"` and `accessibilityLiveRegion="polite"`
- **And** `accessibilityLabel="You are offline. Items will sync when reconnected"`
- **And** the hook and banner have `testID` props for automated testing

**AC6 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (regression check)

## Tasks / Subtasks

- [x] **Task 1: Create `useNetworkStatus` hook** (AC: 1)
  - [x] Create `src/hooks/useNetworkStatus.ts` as a new file
  - [x] Implement `useNetworkStatus(): void` — initializes NetInfo listener
  - [x] On each state change, call `useNetworkStore.getState().setOnline(state.isConnected ?? false)`
  - [x] Fetch initial state on mount with `NetInfo.fetch()`
  - [x] Return unsubscribe function in `useEffect` cleanup
  - [x] Named export (not default)
  - [x] Update `src/hooks/index.ts` barrel to re-export

- [x] **Task 2: Create `OfflineBanner` component** (AC: 2, 3, 4, 5)
  - [x] Create `src/components/OfflineBanner.tsx` as a new file
  - [x] Render compact banner (36dp height) with `MaterialCommunityIcons` cloud-off icon + text
  - [x] Use `Animated.Value` for slide-in/slide-out animation (translateY, 200ms)
  - [x] Accept `visible: boolean` prop — controls animation direction
  - [x] Remove from layout when hidden (use state to conditionally render after animation out)
  - [x] Apply `semanticColors.syncPending` background, `theme.colors.onBackground` text
  - [x] Add `accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`, `accessibilityLabel`
  - [x] Add `testID="offline-banner"`
  - [x] Default export; update `src/components/index.ts` barrel

- [x] **Task 3: Integrate `useNetworkStatus` in App.tsx** (AC: 1)
  - [x] Import and call `useNetworkStatus()` inside `App` component (after auth check, before render)
  - [x] Place the call inside the rendered branch (after `fontsLoaded && isInitialized`) to avoid premature listener setup

- [x] **Task 4: Integrate `OfflineBanner` in DashboardScreen** (AC: 2, 3, 4)
  - [x] Import `useNetworkStore` and `OfflineBanner`
  - [x] Read `isOnline` from `useNetworkStore`
  - [x] Render `<OfflineBanner visible={!isOnline} />` between safeArea top and the FlatList
  - [x] Ensure banner doesn't overlap with search bar or content

- [x] **Task 5: Build verification** (AC: 6)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                              | Current State                                                                                                                                            | This Story's Action                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `src/stores/useNetworkStore.ts`   | 14 lines — `isOnline: boolean` + `setOnline(status)` action. Uses `create` from Zustand. Already has the correct interface per architecture spec.        | **NO CHANGES** — call `setOnline` from hook |
| `src/App.tsx`                     | 91 lines — Root component with `SafeAreaProvider`, `PaperProvider`, `NavigationContainer`, `useAuthStore` initialization. No network listener currently. | **MODIFY** — add `useNetworkStatus()` call  |
| `src/screens/DashboardScreen.tsx` | 483 lines — Full dashboard with search, category filter, skeleton loading, FlatList, FAB, Snackbar. Uses `useSafeAreaInsets()`.                          | **MODIFY** — add `OfflineBanner` rendering  |
| `src/hooks/index.ts`              | 1 export: `useGoogleAuth`.                                                                                                                               | **MODIFY** — add `useNetworkStatus` export  |
| `src/hooks/useDebounce.ts`        | 18 lines — Simple debounce hook. Not exported from barrel (imported directly).                                                                           | **NO CHANGES**                              |
| `src/components/index.ts`         | 5 exports: PermissionCard, ScanLoadingOverlay, AIFieldBadge, EmptyStateCard, CategoryChip.                                                               | **MODIFY** — add `OfflineBanner` export     |
| `src/constants/theme.ts`          | 116 lines — Has `semanticColors.syncPending` (#F0A000) and all needed tokens.                                                                            | **NO CHANGES**                              |
| `src/constants/config.ts`         | 13 constants — No network-related constants needed (banner timing is inline).                                                                            | **NO CHANGES**                              |
| `src/types/item.types.ts`         | Has `syncStatus: 'synced' \| 'pending' \| 'error'` on `ItemDocument`.                                                                                    | **NO CHANGES**                              |
| `@react-native-community/netinfo` | Already installed in `package.json`.                                                                                                                     | **NO CHANGES** — just import and use        |

#### What NEEDS TO BE CREATED

| File                               | Purpose                                                        |
| ---------------------------------- | -------------------------------------------------------------- |
| `src/hooks/useNetworkStatus.ts`    | **NEW** — NetInfo listener hook that updates `useNetworkStore` |
| `src/components/OfflineBanner.tsx` | **NEW** — Animated offline banner component                    |

#### What NEEDS TO BE MODIFIED

| File                              | Purpose                                                    |
| --------------------------------- | ---------------------------------------------------------- |
| `src/App.tsx`                     | **ADD** — `useNetworkStatus()` call for app-level listener |
| `src/screens/DashboardScreen.tsx` | **ADD** — `OfflineBanner` rendered above FlatList          |
| `src/hooks/index.ts`              | **ADD** — re-export `useNetworkStatus`                     |
| `src/components/index.ts`         | **ADD** — re-export `OfflineBanner`                        |

---

### Key Implementation Details

#### `useNetworkStatus` Hook (`src/hooks/useNetworkStatus.ts`)

```typescript
import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useNetworkStore } from "@/stores/useNetworkStore";

/**
 * Initializes a network status listener that keeps useNetworkStore in sync.
 * Call once at app root level. Cleans up on unmount.
 */
export function useNetworkStatus(): void {
  useEffect(() => {
    // Fetch initial state immediately
    NetInfo.fetch().then((state) => {
      useNetworkStore.getState().setOnline(state.isConnected ?? false);
    });

    // Subscribe to ongoing changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      useNetworkStore.getState().setOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
```

> **⚠️ IMPORTANT**: Named export, NOT default. Uses `useNetworkStore.getState()` (not hook selector) because this is a side-effect in `useEffect`, not a render dependency. The `state.isConnected` can be `null` on certain platforms during startup — default to `false` with `?? false`.

---

#### `OfflineBanner` Component (`src/components/OfflineBanner.tsx`)

```tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme, semanticColors } from "@/constants/theme";

const BANNER_HEIGHT = 36;
const ANIMATION_DURATION = 200;

interface OfflineBannerProps {
  visible: boolean;
}

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -BANNER_HEIGHT,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setShouldRender(false);
        }
      });
    }
  }, [visible, translateY]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY }] }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel="You are offline. Items will sync when reconnected"
      testID="offline-banner"
    >
      <MaterialCommunityIcons
        name="cloud-off-outline"
        size={16}
        color={theme.colors.onBackground}
      />
      <Text style={styles.bannerText}>
        You're offline — items will sync when reconnected
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: BANNER_HEIGHT,
    backgroundColor: semanticColors.syncPending,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.space2,
    paddingHorizontal: theme.spacing.space4,
  },
  bannerText: {
    ...theme.typography.labelSmall,
    color: theme.colors.onBackground,
    fontWeight: "600",
  },
});
```

> **⚠️ IMPORTANT**: Default export (component file convention). Uses `Animated` from react-native (not `react-native-reanimated`) for simplicity — consistent with existing shimmer animation in `DashboardScreen`. The `shouldRender` state ensures the banner is fully removed from layout after animation-out, not just invisible.

---

#### App.tsx Integration

```typescript
// Add import at top:
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

// Inside App component, after useEffect for auth, add:
useNetworkStatus();
```

> **⚠️ IMPORTANT**: Place `useNetworkStatus()` at the App root level so the listener is active for the entire app lifecycle. Call it unconditionally (not inside the loading check) so network state is tracked even during font/auth loading. This follows React hooks rules — it must not be called conditionally.

---

#### DashboardScreen Integration

```typescript
// Add imports:
import { useNetworkStore } from "@/stores/useNetworkStore";
import OfflineBanner from "@/components/OfflineBanner";

// Inside DashboardScreen function, add selector:
const isOnline = useNetworkStore((state) => state.isOnline);

// In the JSX return, add OfflineBanner ABOVE the FlatList/skeleton but inside the outer View:
<View
  style={styles.screen}
  testID="dashboard-screen"
  accessibilityLabel="Dashboard Screen"
>
  <OfflineBanner visible={!isOnline} />
  {isLoading ? (
    <DashboardSkeleton shimmerOpacity={shimmerAnim} />
  ) : (
    <FlatList ... />
  )}
  <FAB ... />
  <Snackbar ... />
</View>
```

> **⚠️ IMPORTANT**: The `OfflineBanner` renders INSIDE the main `View` but ABOVE the conditional `FlatList`/skeleton block. Since the banner uses `translateY` animation with `useNativeDriver: true`, it won't cause layout recalculation — it slides down and pushes content naturally because it's in the normal flow. When hidden (`shouldRender=false`), it returns `null` so doesn't occupy any space.

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Modifying useNetworkStore to add NetInfo logic
// DO: Keep the store pure (state + setters only). NetInfo listener
// logic belongs in a hook (useNetworkStatus), not in the store.

// ❌ WRONG: Using react-native-reanimated for this simple animation
import Animated from "react-native-reanimated";
// DO: Use react-native's built-in Animated API. This matches the
// existing shimmer animation pattern in DashboardScreen.

// ❌ WRONG: Creating a "NetworkProvider" context wrapper
// DO: Use the existing Zustand store pattern. The architecture explicitly
// states: "No custom event bus — all communication via Zustand store subscriptions"

// ❌ WRONG: Subscribing to NetInfo inside DashboardScreen
useEffect(() => { NetInfo.addEventListener(...) }, []);
// DO: Subscribe ONCE at app root level via useNetworkStatus() in App.tsx.
// Multiple subscriptions cause redundant state updates.

// ❌ WRONG: Using useNetworkStore as a hook selector to trigger the listener
const isOnline = useNetworkStore(state => state.isOnline);
// In useNetworkStatus hook ⬆️ — this would create a render dependency.
// DO: Use useNetworkStore.getState().setOnline() in useEffect (no render dependency).

// ❌ WRONG: Hardcoding colors
<View style={{ backgroundColor: '#F0A000' }}>
// DO: Use theme.semanticColors.syncPending from constants/theme.ts

// ❌ WRONG: Using opacity:0 to hide the banner
// DO: Use shouldRender state to completely remove from layout (return null).
// Hidden elements with opacity:0 still consume space and receive touch events.

// ❌ WRONG: Missing null coalescing for NetInfo state.isConnected
useNetworkStore.getState().setOnline(state.isConnected);
// DO: state.isConnected can be null on startup. Use ?? false:
useNetworkStore.getState().setOnline(state.isConnected ?? false);
```

---

### Dependency Check

**No new npm dependencies required.**

All needed packages are already installed:

- `@react-native-community/netinfo` — already in `package.json` (installed in Story 1.1)
- `react-native` — `Animated`, `View`, `StyleSheet` are core RN
- `react-native-paper` — `Text` already used everywhere
- `@expo/vector-icons` — `MaterialCommunityIcons` included by Expo SDK 54
- `zustand` — store already defined and working
- All theme constants and semantic colors already available

---

### Previous Story Intelligence

**From Story 5.4 (Item Detail View) — Most Recent:**

1. **`formatDate` utility added to `src/utils/formatters.ts`**: Named export, pure utility. Shows the pattern for new utility files — named exports, no default.

2. **Code review fixes**: MMKV serialized `Timestamp` handling, optional chaining for undefined fields, Safe Area insets applied. These defensive patterns should be replicated.

3. **Inline helper components**: `SyncStatusBadge` and `DetailField` defined inline in the screen file (not separate components) for single-use UI. HOWEVER, `OfflineBanner` is used on the Dashboard and may be used on other screens in future stories — it warrants its own component file per architecture spec.

**From Story 5.1 (Dashboard Item List):**

1. **DashboardScreen 483 lines**: Has shimmer animation using `Animated.Value` + `Animated.timing` — identical pattern to use for the offline banner animation.

2. **`useSafeAreaInsets()`**: Used for top padding on the FlatList content. The offline banner should render AFTER the safe area top (not under the notch).

3. **`RefreshControl` pattern**: Pull-to-refresh triggers sync check — future story 6.3 will enhance this with draft sync. Don't break this pattern.

**From Epic 5 Retrospective:**

- All stories followed the pattern of creating components in `src/components/`, hooks in `src/hooks/`, updating barrel files. Follow this same convention.

---

### Git Intelligence

Recent commits (from develop branch):

```
4a57f84 (HEAD -> develop) feat: Add Epic 5 retrospective document
9b28781 Merge feat/5-4-item-detail-view
526cfa8 feat: implement item detail view screen and formatting utils
7de9bd3 Merge feat/5-3-search-and-filter
c0bbb56 feat: implement search and category filter for items
```

**Codebase conventions from recent work:**

- Feature branches: `feat/{story-key}` (e.g., `feat/6-1-network-status-detection`)
- `StyleSheet.create` with all values from `theme.ts`
- `testID` and `accessibilityLabel` on all interactive elements
- React Native Paper components used consistently
- Default exports for component/screen files, named exports for hooks/services/utils
- `@/` path alias for all src imports
- `useCallback` wrapping handlers, `useMemo` for derived data
- Inline helper components for single-use UI; dedicated files for reusable components

---

### Project Structure Notes

- New hook: `src/hooks/useNetworkStatus.ts` — camelCase, `.ts` extension, named export ✓
- New component: `src/components/OfflineBanner.tsx` — PascalCase, `.tsx` extension, default export ✓
- Modified: `src/App.tsx` — add hook call ✓
- Modified: `src/screens/DashboardScreen.tsx` — add banner rendering ✓
- Modified: `src/hooks/index.ts` — add barrel export ✓
- Modified: `src/components/index.ts` — add barrel export ✓
- No new directories needed — all files placed in existing directories
- Architecture boundary maintained: hook reads from NetInfo and writes to store; UI reads from store

### References

- Story 6.1 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 6.1, lines 598-612]
- FR18-FR20: Offline mode requirements [Source: `epics.md`, lines 36-38]
- Epic 6 overview: "Offline Mode & Background Sync" [Source: `epics.md`, lines 166-168]
- Architecture `useNetworkStore` interface: [Source: `architecture.md`, lines 312-316]
- Architecture boundary rules — UI → Stores only: [Source: `architecture.md`, lines 709-715]
- Architecture sync triggers: network restored, app foregrounded, new draft saved online [Source: `architecture.md`, line 456]
- Architecture NetInfo pattern: [Source: `architecture.md`, line 455]
- UX offline banner: SyncStatusBar spec [Source: `ux-design-specification.md`, lines 591-603]
- UX offline emotional design: "In control, not anxious" [Source: `ux-design-specification.md`, line 120]
- UX semantic colors: syncPending=#F0A000 [Source: `ux-design-specification.md`, line 332]
- Project context — network status detection: [Source: `project-context.md`, line 37]
- Project context — offline-first requirements: [Source: `project-context.md`, lines 263-268]
- Existing useNetworkStore: [Source: `src/stores/useNetworkStore.ts` — 14 lines]
- Existing App.tsx: [Source: `src/App.tsx` — 91 lines, no network listener]
- Existing DashboardScreen: [Source: `src/screens/DashboardScreen.tsx` — 483 lines]
- Previous story 5-4: [Source: `_bmad-output/implementation-artifacts/5-4-item-detail-view.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Root typecheck: `npx tsc --noEmit` (pass)
- Functions typecheck: `cd functions && npx tsc --noEmit` (pass)

### Completion Notes List

- Implemented `useNetworkStatus` hook using NetInfo `fetch()` + `addEventListener()` and synced connectivity state into `useNetworkStore` via `setOnline(state.isConnected ?? false)`.
- Added `OfflineBanner` component with 200ms `Animated.timing` slide-in/slide-out transitions and conditional unmount after hide animation completion.
- Added accessibility semantics for the banner: `accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`, and explicit `accessibilityLabel`.
- Integrated listener initialization through `InitializedApp` render branch in `App.tsx` so the hook starts after `fontsLoaded && isInitialized` gating.
- Integrated `<OfflineBanner visible={!isOnline} />` in `DashboardScreen` below safe-area top and above list content without overlap.
- Updated hooks/components barrel exports for `useNetworkStatus` and `OfflineBanner`.

### File List

- src/hooks/useNetworkStatus.ts
- src/components/OfflineBanner.tsx
- src/App.tsx
- src/screens/DashboardScreen.tsx
- src/hooks/index.ts
- src/components/index.ts
- \_bmad-output/implementation-artifacts/sprint-status.yaml
- \_bmad-output/implementation-artifacts/6-1-network-status-detection-and-offline-banner.md

## Change Log

- 2026-03-05: Story 6.1 context created by create-story workflow with exhaustive artifact analysis.
- 2026-03-05: Implemented network status listener and animated offline banner; integrated app/dashboard wiring, updated exports, and completed typecheck verification.
