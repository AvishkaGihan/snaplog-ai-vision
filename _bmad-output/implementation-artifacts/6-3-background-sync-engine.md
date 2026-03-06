# Story 6.3: Background Sync Engine

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want my offline items to automatically sync when I get back online,
So that I don't have to manually upload anything.

## Acceptance Criteria

**AC1 — Network Restored Trigger:**

- **Given** the user has pending draft items stored locally
- **When** network connectivity is restored (`useNetworkStore.isOnline` transitions from `false` to `true`)
- **Then** `services/syncService.ts` automatically triggers sync of all pending drafts (FR19)
- **And** no user interaction is required to initiate the sync

**AC2 — App Foregrounding Trigger:**

- **Given** the user has pending draft items stored locally
- **When** the app returns to the foreground (from background/inactive state)
- **Then** the sync engine checks for pending drafts and syncs them if the device is online
- **And** the sync does not fire if the device is offline at the moment of foregrounding

**AC3 — Online Draft Save Trigger:**

- **Given** the user saves a new draft while online (e.g., drafted while offline, now online but draft still in queue)
- **When** a new draft is added to the store while the device is online
- **Then** the sync engine triggers automatically to process the new draft along with any other pending drafts

**AC4 — Sync Process Per Draft:**

- **Given** a pending draft is being synced
- **When** the sync engine processes it
- **Then** the photo is uploaded to Cloud Storage at `users/{userId}/items/{imageId}` via `storageService.uploadItemImage`
- **And** the item document is saved to Firestore at `users/{userId}/items/{itemId}` via `firestoreService.saveItem` — with `imageUrl` and `imagePath` populated from the upload result
- **And** `syncStatus` is set to `"synced"` on the Firestore document
- **And** upon successful sync, the draft is removed from MMKV via `useItemStore.removeDraft(localId)`
- **And** the synced item is added to the items array via `useItemStore.addItem(savedItem)`

**AC5 — SyncStatusBar During Sync:**

- **Given** sync is in progress
- **When** one or more drafts are being synced
- **Then** the `SyncStatusBar` component appears on the Dashboard showing "Syncing N items..." with a progress indicator (FR20)
- **And** the progress indicator updates as each draft completes
- **And** when all drafts are synced, the bar briefly shows a green flash "All synced ✓" for ~2 seconds, then dismisses
- **And** `SyncStatusBar` is rendered persistently above the item list — it does NOT block user interaction

**AC6 — Retry on Failure:**

- **Given** a draft sync attempt fails (network error, server error, etc.)
- **When** the failure occurs
- **Then** the sync engine retries up to 2 times with exponential backoff (1s base delay, then 2s) (NFR-R2)
- **And** `useItemStore.updateDraftStatus(localId, "pending", retryCount + 1)` is called on each retry
- **And** after max retries (retryCount >= 2), `syncStatus` is set to `"error"` via `useItemStore.updateDraftStatus(localId, "error", retryCount)`
- **And** the `ItemCard` on the Dashboard displays a red error badge for that item

**AC7 — Error Item Retry via Tap:**

- **Given** a draft has `syncStatus: "error"` after max retries
- **When** the user taps the error item card on the Dashboard
- **Then** the draft's `retryCount` is reset to 0 and `syncStatus` is set to `"pending"`
- **And** the sync engine re-triggers to attempt syncing that draft again

**AC8 — Concurrent Sync Prevention:**

- **Given** a sync is already in progress
- **When** another sync trigger fires (network change, foreground, etc.)
- **Then** the new trigger is ignored — only one sync cycle runs at a time
- **And** no duplicate uploads or saves occur

**AC9 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (regression check)

## Tasks / Subtasks

- [x] **Task 1: Create `src/services/syncService.ts`** (AC: 1, 3, 4, 6, 8)
  - [x] Create the file at `src/services/syncService.ts`
  - [x] Implement `syncAllDrafts(userId: string)` — iterates pending drafts, uploads image, saves to Firestore, removes draft, adds synced item to store
  - [x] Implement `syncSingleDraft(draft: LocalDraft, userId: string)` — handles a single draft: upload → save → update store
  - [x] Add concurrency guard (`isSyncing` flag) to prevent duplicate sync runs
  - [x] Implement retry logic: up to 2 retries per draft with exponential backoff (1s, 2s)
  - [x] On success: `removeDraft(localId)` + `addItem(savedItem)` — atomic update
  - [x] On failure after max retries: `updateDraftStatus(localId, "error", retryCount)`
  - [x] Export a progress callback mechanism for `SyncStatusBar` (total, completed, status)

- [x] **Task 2: Create `src/hooks/useSync.ts`** (AC: 1, 2, 3)
  - [x] Create the file at `src/hooks/useSync.ts`
  - [x] Subscribe to `useNetworkStore.isOnline` — when transitions `false → true`, trigger `syncAllDrafts`
  - [x] Subscribe to `AppState` change — when app comes to foreground AND `isOnline`, trigger sync
  - [x] Subscribe to `useItemStore.drafts` — when a new draft is added AND `isOnline`, trigger sync
  - [x] All triggers call `syncAllDrafts` which has internal concurrency guard
  - [x] Read `userId` from `useAuthStore.getState().user?.uid`
  - [x] Named export: `useSync()`

- [x] **Task 3: Create `src/components/SyncStatusBar.tsx`** (AC: 5)
  - [x] Create the file at `src/components/SyncStatusBar.tsx`
  - [x] Display "Syncing N items..." with an `ActivityIndicator` or `ProgressBar` from React Native Paper
  - [x] Calculate progress from sync callback (completed / total)
  - [x] When sync completes (all items synced), show green "All synced ✓" briefly (~2s), then fade/slide away
  - [x] Use `Animated` for smooth enter/exit transitions
  - [x] Style with `theme.semanticColors.syncPending` (amber) during sync, `theme.semanticColors.syncComplete` (green) on completion
  - [x] Set `accessibilityLiveRegion="polite"` for screen reader announcements
  - [x] Set `accessibilityRole="status"` on the container
  - [x] Add `testID="sync-status-bar"` and `accessibilityLabel`

- [x] **Task 4: Integrate `useSync` hook in `App.tsx`** (AC: 1, 2, 3)
  - [x] Import `useSync` from `@/hooks/useSync`
  - [x] Call `useSync()` inside the `InitializedApp` component (only mount when authenticated + initialized)
  - [x] Re-export `useSync` from `src/hooks/index.ts` barrel

- [x] **Task 5: Integrate `SyncStatusBar` in `DashboardScreen.tsx`** (AC: 5, 7)
  - [x] Import `SyncStatusBar` component
  - [x] Render `SyncStatusBar` above the `FlatList`, below the search area
  - [x] Pass sync state (isSyncing, total, completed, isComplete) via a Zustand sync state or props from the hook
  - [x] Handle error item tap: reset `retryCount` to 0, set `syncStatus` to `"pending"`, which triggers re-sync via the `drafts` subscription

- [x] **Task 6: Add sync state to share between hook and UI** (AC: 5, 8)
  - [x] Add sync-related state to `useItemStore` OR create a separate `useSyncStore`:
    - `isSyncing: boolean`
    - `syncTotal: number`
    - `syncCompleted: number`
    - `syncComplete: boolean` (brief flag for "All synced ✓" display)
  - [x] syncService updates these values as it progresses

- [x] **Task 7: Build verification** (AC: 9)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

### Review Follow-ups (AI)
- [ ] [AI-Review][Medium] Zero Test Coverage: No tests exist for syncService.ts or useSync.ts. Deferring until a testing framework (e.g., Jest) is configured in the project.

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                               | Current State                                                                                                                                                                | This Story's Action                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/stores/useItemStore.ts`       | 103 lines — Has `addItem(item)`, `addDraft(draft)`, `removeDraft(localId)`, `updateDraftStatus(localId, status, retryCount?)`. Persist middleware partializes `drafts` only. | **MODIFY** — Add sync progress state (`isSyncing`, `syncTotal`, `syncCompleted`, `syncComplete`) OR create separate sync store |
| `src/stores/useNetworkStore.ts`    | 14 lines — `isOnline: boolean` + `setOnline(status)`.                                                                                                                        | **NO CHANGES** — subscribe to isOnline changes in useSync hook                                                                 |
| `src/stores/useAuthStore.ts`       | Auth state + `user` object with `uid`.                                                                                                                                       | **NO CHANGES** — read `user.uid` for userId during sync                                                                        |
| `src/types/item.types.ts`          | 28 lines — `ItemDocument` (with `syncStatus`, `imageUrl`, `imagePath`) and `LocalDraft` (with `localId`, `userId`, `item`, `localImageUri`, `syncStatus`, `retryCount`).     | **NO CHANGES** — types already define everything needed                                                                        |
| `src/services/storageService.ts`   | 41 lines — `uploadItemImage(localUri, userId)` returns `{ downloadUrl, storagePath }`.                                                                                       | **NO CHANGES** — call directly from syncService                                                                                |
| `src/services/firestoreService.ts` | 88 lines — `saveItem(userId, itemData)` returns `ItemDocument` with Firestore-generated `id`.                                                                                | **NO CHANGES** — call directly from syncService                                                                                |
| `src/services/imageService.ts`     | Has `cleanupTempImage(uri)` — deletes temporary local image file.                                                                                                            | **NO CHANGES** — call AFTER successful sync to clean up local image                                                            |
| `src/hooks/useNetworkStatus.ts`    | 21 lines — NetInfo listener, updates `useNetworkStore`. Already called in App.tsx.                                                                                           | **NO CHANGES**                                                                                                                 |
| `src/components/ItemCard.tsx`      | 137 lines — Renders sync badges: `synced` (green ✓), `pending` (amber ⏳), `error` (red !).                                                                                  | **NO CHANGES** — error drafts will naturally show error badge                                                                  |
| `src/components/OfflineBanner.tsx` | Animated offline banner — already integrated in DashboardScreen.                                                                                                             | **NO CHANGES**                                                                                                                 |
| `src/constants/config.ts`          | 13 constants — Includes `MAX_AI_RETRIES = 2`, `RETRY_BASE_DELAY_MS = 1000`, `SNACKBAR_DURATION_MS = 3000`.                                                                   | **NO CHANGES** — reuse `MAX_AI_RETRIES` and `RETRY_BASE_DELAY_MS` for sync retries                                             |
| `src/constants/theme.ts`           | 116 lines — Has `semanticColors.syncPending` (#F0A000), `semanticColors.syncComplete` (#4CAF50).                                                                             | **NO CHANGES** — use these colors in SyncStatusBar                                                                             |
| `src/App.tsx`                      | 98 lines — `InitializedApp` renders `RootNavigator`. `useNetworkStatus()` called in `App`.                                                                                   | **MODIFY** — Add `useSync()` call in `InitializedApp`                                                                          |
| `src/screens/DashboardScreen.tsx`  | 530 lines — Merges items + drafts via `combinedItems`. Has `filteredItems`.                                                                                                  | **MODIFY** — Add `SyncStatusBar` above FlatList; handle error draft tap to reset retryCount                                    |

#### What NEEDS TO BE CREATED

| File                               | Purpose                                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/services/syncService.ts`      | **NEW** — Background sync engine: processes pending drafts (upload image → save Firestore → update store) |
| `src/hooks/useSync.ts`             | **NEW** — Hook that wires sync triggers: network restored, app foreground, new draft while online         |
| `src/components/SyncStatusBar.tsx` | **NEW** — Animated bar showing sync progress ("Syncing N items…" → "All synced ✓")                        |

---

### Key Implementation Details

#### `syncService.ts` — The Core Sync Engine

```typescript
import { useItemStore } from "@/stores/useItemStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { uploadItemImage } from "@/services/storageService";
import { saveItem } from "@/services/firestoreService";
import { cleanupTempImage } from "@/services/imageService";
import { MAX_AI_RETRIES, RETRY_BASE_DELAY_MS } from "@/constants/config";
import type { LocalDraft, ItemDocument } from "@/types/item.types";

let isSyncing = false;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncSingleDraft(
  draft: LocalDraft,
  userId: string,
): Promise<void> {
  // 1. Upload image to Cloud Storage
  const { downloadUrl, storagePath } = await uploadItemImage(
    draft.localImageUri,
    userId,
  );

  // 2. Build the item document from draft fields
  const itemData: Omit<ItemDocument, "id"> = {
    title: draft.item.title ?? "",
    category: draft.item.category ?? "",
    color: draft.item.color ?? "",
    condition: (draft.item.condition as ItemDocument["condition"]) ?? "Good",
    tags: draft.item.tags ?? [],
    notes: draft.item.notes ?? "",
    imageUrl: downloadUrl,
    imagePath: storagePath,
    aiGenerated: draft.item.aiGenerated ?? false,
    syncStatus: "synced",
    createdAt: draft.createdAt, // ISO string — firestoreService.saveItem handles Timestamp
    updatedAt: new Date().toISOString(),
  };

  // 3. Save to Firestore
  const savedItem = await saveItem(userId, itemData);

  // 4. Update store: remove draft, add synced item
  useItemStore.getState().removeDraft(draft.localId);
  useItemStore.getState().addItem(savedItem);

  // 5. Clean up the local temp image (no longer needed)
  void cleanupTempImage(draft.localImageUri);
}

export async function syncAllDrafts(userId: string): Promise<void> {
  if (isSyncing) return; // Concurrency guard
  isSyncing = true;

  try {
    const { drafts } = useItemStore.getState();
    const pendingDrafts = drafts.filter(
      (d) => d.syncStatus === "pending" && d.userId === userId,
    );

    if (pendingDrafts.length === 0) {
      return;
    }

    // Update sync progress state
    useItemStore.getState().setSyncProgress({
      isSyncing: true,
      syncTotal: pendingDrafts.length,
      syncCompleted: 0,
      syncComplete: false,
    });

    let completed = 0;

    for (const draft of pendingDrafts) {
      let retryCount = draft.retryCount;
      let success = false;

      for (let attempt = 0; attempt <= MAX_AI_RETRIES; attempt++) {
        try {
          await syncSingleDraft(draft, userId);
          success = true;
          completed++;
          useItemStore.getState().setSyncProgress({
            isSyncing: true,
            syncTotal: pendingDrafts.length,
            syncCompleted: completed,
            syncComplete: false,
          });
          break;
        } catch {
          retryCount++;
          if (attempt < MAX_AI_RETRIES) {
            useItemStore
              .getState()
              .updateDraftStatus(draft.localId, "pending", retryCount);
            await delay(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
          } else {
            useItemStore
              .getState()
              .updateDraftStatus(draft.localId, "error", retryCount);
          }
        }
      }
    }

    // Brief "All synced" state
    useItemStore.getState().setSyncProgress({
      isSyncing: false,
      syncTotal: pendingDrafts.length,
      syncCompleted: completed,
      syncComplete: completed > 0,
    });

    // Clear syncComplete flag after 2s
    if (completed > 0) {
      setTimeout(() => {
        useItemStore.getState().setSyncProgress({
          isSyncing: false,
          syncTotal: 0,
          syncCompleted: 0,
          syncComplete: false,
        });
      }, 2000);
    }
  } finally {
    isSyncing = false;
  }
}
```

> **⚠️ CRITICAL**: The `isSyncing` module-level flag prevents concurrent sync runs. All three triggers (network restored, foreground, new draft) call `syncAllDrafts`, and the guard ensures only one runs.

> **⚠️ IMPORTANT**: Use `useItemStore.getState()` (not hooks) inside the service because this is imperative, non-React code. This is the established pattern from Story 6.2.

> **⚠️ IMPORTANT**: Call `cleanupTempImage` only AFTER successful upload+save. Use `void` prefix because cleanup failure should not break sync.

> **⚠️ IMPORTANT**: Filter drafts by `userId` to ensure user-scoped sync, matching the user-scoping added in Story 6.2 code review.

---

#### `useSync.ts` — Sync Trigger Hook

```typescript
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useNetworkStore } from "@/stores/useNetworkStore";
import { useItemStore } from "@/stores/useItemStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { syncAllDrafts } from "@/services/syncService";

export function useSync(): void {
  const prevOnlineRef = useRef<boolean>(useNetworkStore.getState().isOnline);
  const prevDraftCountRef = useRef<number>(
    useItemStore.getState().drafts.length,
  );

  useEffect(() => {
    // Trigger 1: Network restored (false → true)
    const unsubNetwork = useNetworkStore.subscribe((state) => {
      const wasOffline = !prevOnlineRef.current;
      const isNowOnline = state.isOnline;
      prevOnlineRef.current = state.isOnline;

      if (wasOffline && isNowOnline) {
        const userId = useAuthStore.getState().user?.uid;
        if (userId) {
          void syncAllDrafts(userId);
        }
      }
    });

    // Trigger 2: App foregrounding
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          const isOnline = useNetworkStore.getState().isOnline;
          const userId = useAuthStore.getState().user?.uid;
          if (isOnline && userId) {
            void syncAllDrafts(userId);
          }
        }
      },
    );

    // Trigger 3: New draft saved while online
    const unsubDrafts = useItemStore.subscribe((state) => {
      const currentCount = state.drafts.length;
      const prevCount = prevDraftCountRef.current;
      prevDraftCountRef.current = currentCount;

      if (currentCount > prevCount) {
        // A new draft was added
        const isOnline = useNetworkStore.getState().isOnline;
        const userId = useAuthStore.getState().user?.uid;
        if (isOnline && userId) {
          void syncAllDrafts(userId);
        }
      }
    });

    return () => {
      unsubNetwork();
      appStateSubscription.remove();
      unsubDrafts();
    };
  }, []);
}
```

> **⚠️ IMPORTANT**: Use `useRef` to track previous `isOnline` state so we only fire on `false → true` transitions, not on every state update.

> **⚠️ IMPORTANT**: Use Zustand's `.subscribe()` (not selector hooks) for imperative subscriptions. This follows the same pattern as `useNetworkStatus` hook.

> **⚠️ IMPORTANT**: `void syncAllDrafts(userId)` — fire and forget. The sync engine manages its own error handling internally. The `void` prefix satisfies the `no-floating-promises` ESLint rule.

---

#### `SyncStatusBar.tsx` — Sync Progress UI

```typescript
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Text, ProgressBar } from "react-native-paper";

import { theme, semanticColors } from "@/constants/theme";
import { useItemStore } from "@/stores/useItemStore";

export default function SyncStatusBar() {
  const { isSyncing, syncTotal, syncCompleted, syncComplete } = useItemStore(
    (state) => ({
      isSyncing: state.isSyncing,
      syncTotal: state.syncTotal,
      syncCompleted: state.syncCompleted,
      syncComplete: state.syncComplete,
    }),
  );

  const slideAnim = useRef(new Animated.Value(0)).current;
  const isVisible = isSyncing || syncComplete;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  if (!isVisible && syncTotal === 0) return null;

  const progress = syncTotal > 0 ? syncCompleted / syncTotal : 0;
  const remaining = syncTotal - syncCompleted;
  const barColor = syncComplete
    ? semanticColors.syncComplete
    : semanticColors.syncPending;
  const label = syncComplete
    ? "All synced ✓"
    : `Syncing ${remaining} item${remaining !== 1 ? "s" : ""}...`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: barColor,
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-40, 0],
              }),
            },
          ],
        },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="status"
      accessibilityLabel={label}
      testID="sync-status-bar"
    >
      <View style={styles.content}>
        <Text style={styles.label} variant="labelLarge">
          {label}
        </Text>
      </View>
      {isSyncing && (
        <ProgressBar
          progress={progress}
          color={theme.colors.onBackground}
          style={styles.progressBar}
          testID="sync-progress-bar"
        />
      )}
    </Animated.View>
  );
}
```

> **⚠️ IMPORTANT**: Default export for component files (project convention). Named exports for hooks/services/utils.

> **⚠️ IMPORTANT**: Use `Animated.View` for smooth enter/exit animation. The slide-down + opacity approach matches the `OfflineBanner` animation pattern established in Story 6.1.

> **⚠️ IMPORTANT**: Display "remaining" count not "completed" count — "Syncing 3 items..." is more useful to the user than "1 of 3 complete."

---

#### Store Modifications for Sync State

Add sync progress state to `useItemStore`. This keeps it in the same store since it's tightly coupled to the items/drafts data:

```typescript
// Add to ItemStore interface:
isSyncing: boolean;
syncTotal: number;
syncCompleted: number;
syncComplete: boolean;
setSyncProgress: (progress: {
  isSyncing: boolean;
  syncTotal: number;
  syncCompleted: number;
  syncComplete: boolean;
}) => void;

// Add to store initial state (inside persist create):
isSyncing: false,
syncTotal: 0,
syncCompleted: 0,
syncComplete: false,

// Add action:
setSyncProgress: ({ isSyncing, syncTotal, syncCompleted, syncComplete }) => {
  set({ isSyncing, syncTotal, syncCompleted, syncComplete });
},

// CRITICAL: Update partialize to EXCLUDE sync state from persistence:
partialize: (state) => ({ drafts: state.drafts }),
// sync state is ephemeral — never persist to MMKV
```

> **⚠️ CRITICAL**: The `partialize` function already only persists `drafts`. Make sure the new sync state fields are NOT added to `partialize`. Sync progress is ephemeral (runtime-only).

---

#### App.tsx Integration

```typescript
// In InitializedApp:
import { useSync } from "@/hooks/useSync";

function InitializedApp() {
  useSync(); // Wire all sync triggers
  return <RootNavigator />;
}
```

> **⚠️ IMPORTANT**: Place `useSync()` in `InitializedApp`, NOT in `App`. This ensures the hook only mounts when auth is initialized and fonts are loaded — otherwise `useAuthStore.getState().user?.uid` could be null.

---

#### DashboardScreen Integration

```typescript
// Add import:
import SyncStatusBar from "@/components/SyncStatusBar";

// Render above FlatList, below search + filter area:
<SyncStatusBar />

// For error draft tap handling — modify the renderItem press handler:
// When tapping an item with syncStatus "pending" (mapped from a draft with error),
// check if the source draft has syncStatus "error" and reset it:
const handleItemPress = useCallback(
  (item: ItemDocument) => {
    // Check if this is a draft with error status
    const errorDraft = drafts.find(
      (d) => d.localId === item.id && d.syncStatus === "error",
    );
    if (errorDraft) {
      // Reset to pending to trigger re-sync
      useItemStore.getState().updateDraftStatus(errorDraft.localId, "pending", 0);
      return; // Don't navigate to detail for error drafts
    }

    // Only navigate to detail for synced items
    if (item.syncStatus === "synced") {
      dashboardNavigation.navigate("ItemDetail", { itemId: item.id });
    }
  },
  [dashboardNavigation, drafts],
);
```

> **⚠️ IMPORTANT**: When a draft has `syncStatus: "error"`, tapping it resets `retryCount` to 0 and `syncStatus` to `"pending"`. This triggers the draft count subscription in `useSync` ("new" pending draft detected), which triggers `syncAllDrafts`.

> **⚠️ IMPORTANT**: Don't navigate to `ItemDetail` for pending/error drafts — they don't have a Firestore document yet. Only navigate for `synced` items. This is a known limitation documented in Story 6.2.

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Creating a custom event bus for sync triggers
import EventEmitter from "events";
const syncEmitter = new EventEmitter();
// DO: Use Zustand store subscriptions. Architecture prohibits custom event buses.

// ❌ WRONG: Running syncs in parallel
await Promise.all(drafts.map((d) => syncSingleDraft(d, userId)));
// DO: Process drafts sequentially (for loop) to avoid overwhelming the
// network and Firebase rate limits. Sequential is safer for a sync engine.

// ❌ WRONG: Persisting sync progress to MMKV
partialize: (state) => ({ drafts: state.drafts, isSyncing: state.isSyncing });
// DO: Sync progress is ephemeral. Only `drafts` should be persisted.

// ❌ WRONG: Using useEffect hooks for sync triggers in a screen-level component
// This breaks when the screen unmounts
useEffect(() => {
  syncAllDrafts(userId);
}, [isOnline]);
// DO: Use useSync() hook at App root level (InitializedApp) so it stays
// mounted for the entire app lifecycle.

// ❌ WRONG: Calling storageService/firestoreService directly from UI
import { uploadItemImage } from "@/services/storageService";
// DO: All sync logic goes through syncService.ts. UI never calls Firebase
// services directly (architecture boundary rule).

// ❌ WRONG: Using useState to manage sync progress
const [isSyncing, setIsSyncing] = useState(false);
// DO: Use Zustand store for sync state. useState for shared/global state is
// forbidden by project rules.

// ❌ WRONG: Not filtering drafts by userId
const pendingDrafts = drafts.filter((d) => d.syncStatus === "pending");
// DO: Filter by userId too: d.userId === userId (user-scoping added in 6.2 review)

// ❌ WRONG: Deleting the local temp image before the sync completes
cleanupTempImage(draft.localImageUri);
await uploadItemImage(draft.localImageUri, userId); // File already deleted!
// DO: Clean up AFTER successful upload + save. Use void prefix for fire-and-forget.

// ❌ WRONG: Hardcoding retry constants
const MAX_RETRIES = 2;
const BASE_DELAY = 1000;
// DO: Import from @/constants/config — MAX_AI_RETRIES, RETRY_BASE_DELAY_MS
// These are already defined and shared across the app.
```

---

### Dependency Check

**No new npm dependencies required.**

All needed packages are already installed:

- `zustand` — store subscriptions + state management
- `react-native-mmkv` — draft persistence via Zustand persist middleware
- `@react-native-community/netinfo` — network detection (already active via useNetworkStatus)
- `react-native-paper` — `ProgressBar`, `Text` components for SyncStatusBar
- `react-native` — `AppState` API for foreground detection, `Animated` for animations
- All theme constants and semantic colors already available

---

### Previous Story Intelligence

**From Story 6.2 (Local Draft Save & Offline Cataloging) — Most Recent:**

1. **`LocalDraft` now includes `userId` field** — Added during 6.2 code review. The sync service MUST filter drafts by `userId` when syncing to maintain user-scoped data isolation.

2. **`useItemStore.addDraft` has dedup guard** — `drafts.some(d => d.localId === draft.localId)` prevents duplicate drafts. This is relevant because sync should never accidentally re-add a draft.

3. **`useNetworkStore.getState().isOnline` pattern** — Established for reading network state outside React render cycle. Use the same `getState()` pattern in `syncService.ts`.

4. **`handleConfirmSave` skips `cleanupTempImage` for drafts** — The local image file is still on disk and available for `syncService` to upload. After successful sync, `syncService` should clean it up.

5. **DashboardScreen merges items + drafts** via `combinedItems`. Draft items with `syncStatus: "error"` will automatically display the red error badge via `ItemCard`, no changes needed.

6. **Double-tap prevention** — `isSaving` flag in ReviewFormScreen. Apply the same pattern: module-level `isSyncing` flag in syncService for concurrency guard.

**From Story 6.1 (Network Status Detection & Offline Banner):**

1. **`OfflineBanner` uses `Animated.timing`** for smooth enter/exit animations. Apply the same animation pattern for `SyncStatusBar`.

2. **`useNetworkStatus` hook** is called in `App.tsx` → updates `useNetworkStore.isOnline`. The `useSync` hook can subscribe to this store directly.

3. **`InitializedApp` component** is the correct mount point for `useSync()` — it's rendered only when fonts are loaded and auth is initialized.

---

### Git Intelligence

Recent commits (from develop branch):

```
7587821 (HEAD -> develop) feat: enhance navigation flow with proper back navigation and category filter for items
9b28781 Merge feat/5-4-item-detail-view
```

**Codebase conventions from recent work:**

- Feature branches: `feat/{story-key}` (e.g., `feat/6-3-background-sync-engine`)
- `StyleSheet.create` with all values from `theme.ts`
- `testID` and `accessibilityLabel` on all interactive elements
- Default exports for component/screen files, named exports for hooks/services/utils
- `@/` path alias for all src imports
- `useCallback` wrapping handlers, `useMemo` for derived data
- `useStore.getState().action()` in async handlers (not hook selectors)
- `AppState` API from `react-native` used in `CameraScreen.tsx` — follow the same pattern for foreground detection

---

### Project Structure Notes

- New service: `src/services/syncService.ts` — camelCase, `.ts` extension, named exports ✓
- New hook: `src/hooks/useSync.ts` — camelCase with `use` prefix, `.ts` extension, named export ✓
- New component: `src/components/SyncStatusBar.tsx` — PascalCase, `.tsx` extension, default export ✓
- Modified: `src/stores/useItemStore.ts` — add sync progress state + action ✓
- Modified: `src/App.tsx` — add `useSync()` call in `InitializedApp` ✓
- Modified: `src/screens/DashboardScreen.tsx` — add `SyncStatusBar` + error draft tap handler ✓
- Modified: `src/hooks/index.ts` — re-export `useSync` ✓
- No new directories needed — all files placed in existing directories
- Architecture boundaries maintained: syncService → storageService + firestoreService (services layer); UI → stores only

### References

- Story 6.3 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 6.3, lines 631-648]
- FR19: Auto-sync drafts when network restored [Source: `epics.md`, line 38]
- FR20: View sync status per item [Source: `epics.md`, line 39]
- NFR-R2: 2× retry with exponential backoff [Source: `epics.md`, line 61]
- Epic 6 overview: "Offline Mode & Background Sync" [Source: `epics.md`, lines 166-168]
- Architecture offline draft data flow: [Source: `architecture.md`, lines 742-750]
- Architecture sync triggers: network restored, app foregrounded, new draft saved while online [Source: `architecture.md`, lines 455-457]
- Architecture retry pattern: max 2 retries, exponential backoff 1s,2s [Source: `architecture.md`, lines 484-500]
- Architecture boundary rules — UI → Stores only, Stores → Services: [Source: `architecture.md`, lines 709-715]
- Architecture no custom event bus: [Source: `architecture.md`, line 457]
- Architecture `syncService.ts` in project tree: [Source: `architecture.md`, line 657]
- Architecture `useSync.ts` in project tree: [Source: `architecture.md`, line 665]
- Architecture `SyncStatusBar` component: [Source: `architecture.md`, line 638]
- Architecture loading state — background sync uses `SyncStatusBar`: [Source: `architecture.md`, line 480]
- Project context — offline-first requirements: [Source: `project-context.md`, lines 263-268]
- Project context — sync triggers: [Source: `project-context.md`, line 266]
- Project context — no custom event bus: [Source: `project-context.md`, line 267]
- Project context — retry pattern: [Source: `project-context.md`, lines 111-115]
- UX sync status bar — "Syncing N items…" + green flash: [Source: `ux-design-specification.md`]
- Existing useItemStore: [Source: `src/stores/useItemStore.ts` — 103 lines, draft CRUD + persist]
- Existing storageService: [Source: `src/services/storageService.ts` — 41 lines, uploadItemImage]
- Existing firestoreService: [Source: `src/services/firestoreService.ts` — 88 lines, saveItem]
- Existing useNetworkStore: [Source: `src/stores/useNetworkStore.ts` — 14 lines, isOnline]
- Existing useNetworkStatus hook: [Source: `src/hooks/useNetworkStatus.ts` — 21 lines]
- Existing config constants: [Source: `src/constants/config.ts` — MAX_AI_RETRIES, RETRY_BASE_DELAY_MS]
- Existing theme semanticColors: [Source: `src/constants/theme.ts` — syncPending #F0A000, syncComplete #4CAF50]
- Previous story 6-2: [Source: `_bmad-output/implementation-artifacts/6-2-local-draft-save-and-offline-cataloging.md`]
- Previous story 6-1: [Source: `_bmad-output/implementation-artifacts/6-1-network-status-detection-and-offline-banner.md`]
- AppState usage pattern: [Source: `src/screens/CameraScreen.tsx` — lines 4-5, 56, 512-535]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Root typecheck (`npx tsc --noEmit`) passes after sync implementation updates.
- Functions typecheck task output is buffered with stale historical logs in the shared terminal; workspace diagnostics report no errors.

### Completion Notes List

- Implemented `syncService` with sequential pending-draft processing, user-scoped filtering, retry/backoff, and module-level concurrency guard.
- Added sync progress state to `useItemStore` and connected it to service updates for UI rendering.
- Added `useSync` hook to trigger background sync on network restoration, app foreground, and online draft-state changes.
- Added `SyncStatusBar` with animated visibility, progress indicator, and completion state.
- Updated dashboard interaction so tapping an error draft resets it to pending and re-triggers sync through store subscription logic.
- Mounted `useSync` in `InitializedApp` and exported it in the hooks barrel.
- **Review Fix (High)**: Resolved sync race condition by implementing a `while(true)` loop in `syncService.ts` to actively process newly added pending drafts without stalling.
- **Review Fix (High)**: Relocated `SyncStatusBar` outside the `FlatList` in `DashboardScreen.tsx` so it renders persistently above the list items.
- **Review Fix (Medium)**: Added `shouldRender` state in `SyncStatusBar.tsx` to delay unmounting until the completion of the exit animation.

### File List

- src/services/syncService.ts
- src/hooks/useSync.ts
- src/components/SyncStatusBar.tsx
- src/stores/useItemStore.ts
- src/App.tsx
- src/hooks/index.ts
- src/screens/DashboardScreen.tsx

## Change Log

- 2026-03-05: Implemented background sync engine, sync trigger hook, sync status UI integration, and dashboard retry-on-error tap behavior for Story 6.3.
