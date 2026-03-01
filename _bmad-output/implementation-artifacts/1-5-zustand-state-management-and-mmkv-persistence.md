# Story 1.5: Zustand State Management & MMKV Persistence

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want my app state to persist across sessions and survive force-quits,
So that I never lose my data or have to re-login.

## Acceptance Criteria

**AC1 — Item Store with Full State Management:**

- **Given** the authenticated app with navigation and theme in place (Stories 1.1–1.4 complete)
- **When** `stores/useItemStore.ts` is initialized
- **Then** the store manages: `items: ItemDocument[]`, `drafts: LocalDraft[]`, `isLoading: boolean`, `searchQuery: string`, `categoryFilter: string | null`
- **And** the store provides actions: `addItem`, `updateItem`, `deleteItem`, `addDraft`, `removeDraft`, `updateDraftStatus`, `setItems`, `setSearchQuery`, `setCategoryFilter`, `setLoading`
- **And** all state updates use immutable patterns (spread operator — never mutate state directly)
- **And** the store is exported as a named export: `export const useItemStore = create<ItemStore>(...)`

**AC2 — Auth Store Already Exists (Verification Only):**

- **Given** `stores/useAuthStore.ts` was implemented in Story 1.4
- **When** the store is verified
- **Then** it manages: `user: AuthUser | null`, `isAuthenticated: boolean`, `loading: boolean`, `isInitialized: boolean`
- **And** it provides actions: `initialize()`, `signInAnonymously()`, `signInWithGoogle(idToken)`, `signOut()`
- **And** it does NOT use Zustand persist middleware (Firebase Auth handles its own persistence)
- **And** no modifications are needed for this story

**AC3 — Network Store with Online Status:**

- **Given** the app needs network awareness for offline features (Epic 6 foundation)
- **When** `stores/useNetworkStore.ts` is initialized
- **Then** the store manages: `isOnline: boolean` (defaults to `true`)
- **And** the store provides a `setOnline(status: boolean)` action
- **And** the store does NOT use persist middleware (network state is always runtime-determined)
- **And** the store is exported as a named export: `export const useNetworkStore = create<NetworkStore>(...)`

**AC4 — MMKV Storage Adapter for Zustand:**

- **Given** local persistence is required for offline draft survival (NFR-R3)
- **When** `utils/mmkvStorage.ts` is created
- **Then** it creates a single MMKV instance via `new MMKV()`
- **And** it exports a `mmkvStorage` object implementing Zustand's `StateStorage` interface: `getItem(name): string | null`, `setItem(name, value): void`, `removeItem(name): void`
- **And** `getItem` uses `MMKV.getString(name)` returning `value ?? null`
- **And** `setItem` uses `MMKV.set(name, value)`
- **And** `removeItem` uses `MMKV.delete(name)`
- **And** no other file in the project accesses MMKV directly (architectural boundary rule #5)

**AC5 — Item Store Persists Drafts via MMKV:**

- **Given** the `useItemStore` is configured with Zustand `persist` middleware
- **When** a draft is added to the store
- **Then** the `persist` middleware serializes and saves drafts to MMKV automatically
- **And** `partialize` is configured to persist ONLY `drafts` (not `items`, `isLoading`, `searchQuery`, or `categoryFilter`)
- **And** the persist storage uses `createJSONStorage(() => mmkvStorage)` from `zustand/middleware`
- **And** the store name for persistence is `'item-store'`

**AC6 — Drafts Survive Force-Quit and Device Restart:**

- **Given** drafts have been saved to the item store
- **When** the app is force-quit and restarted
- **Then** all drafts are restored from MMKV on store initialization with 100% reliability (NFR-R3)
- **And** restored drafts retain all fields: `localId`, `item` (partial ItemDocument), `localImageUri`, `syncStatus`, `retryCount`, `createdAt`
- **And** non-persisted state (`items`, `isLoading`, `searchQuery`, `categoryFilter`) resets to defaults

**AC7 — Build Verification:**

- **Given** the complete state management implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` passes with zero errors
- **And** `npx eslint src/` passes with zero errors
- **And** no runtime errors occur on app launch

## Tasks / Subtasks

- [x] **Task 1: Create `src/utils/mmkvStorage.ts`** (AC: 4)
  - [x] Import `MMKV` from `react-native-mmkv`
  - [x] Create singleton MMKV instance: `const storage = new MMKV()`
  - [x] Export `mmkvStorage` object with `getItem`, `setItem`, `removeItem` implementing Zustand's `StateStorage` interface
  - [x] Use named export: `export const mmkvStorage = { ... }`

- [x] **Task 2: Create `src/stores/useItemStore.ts`** (AC: 1, 5)
  - [x] Import `create` from `zustand`, `persist` and `createJSONStorage` from `zustand/middleware`
  - [x] Import `mmkvStorage` from `@/utils/mmkvStorage`
  - [x] Import `ItemDocument`, `LocalDraft` from `@/types/item.types`
  - [x] Define `ItemStore` interface with state and action types
  - [x] Implement store with `persist` middleware wrapping the store definition
  - [x] Configure persist: `name: 'item-store'`, `storage: createJSONStorage(() => mmkvStorage)`, `partialize: (state) => ({ drafts: state.drafts })`
  - [x] Implement all actions with immutable patterns (spread operator)
  - [x] Export as named export: `export const useItemStore = create<ItemStore>()(...)`

- [x] **Task 3: Create `src/stores/useNetworkStore.ts`** (AC: 3)
  - [x] Import `create` from `zustand`
  - [x] Define `NetworkStore` interface with `isOnline: boolean` and `setOnline: (status: boolean) => void`
  - [x] Implement simple store (no persist middleware)
  - [x] Default `isOnline` to `true` (optimistic default)
  - [x] Export as named export: `export const useNetworkStore = create<NetworkStore>(...)`

- [x] **Task 4: Update `src/stores/index.ts`** (AC: 1, 3)
  - [x] Add re-exports for `useItemStore` and `useNetworkStore`
  - [x] Keep existing `useAuthStore` re-export

- [x] **Task 5: Update `src/utils/index.ts`** (AC: 4)
  - [x] Add re-export for `mmkvStorage`

- [x] **Task 6: Build verification** (AC: 7)
  - [x] Run `npx tsc --noEmit` — zero errors
  - [x] Run `npx eslint src/` — zero errors
  - [x] Run `npx expo start` — app launches without runtime errors

## Dev Notes

### Critical Architecture Rules

#### Architectural Boundary #5 — MMKV Access ONLY in mmkvStorage.ts

**This is the #1 boundary to respect.** Per architecture:

> MMKV ↔ Zustand — Local persistence is handled exclusively through Zustand's persist middleware with MMKV adapter. No direct MMKV reads/writes outside `mmkvStorage.ts`.

```
useItemStore → persist middleware → createJSONStorage → mmkvStorage → MMKV
```

**DO NOT** import from `react-native-mmkv` in:

- Any store file (stores use `mmkvStorage` adapter via persist config)
- Any screen or component
- Any service file
- Any other utility file

**EXCEPTION:** `mmkvStorage.ts` is the ONLY file that imports from `react-native-mmkv`.

#### Zustand Store Pattern — EXACT Pattern Required

All stores follow the existing pattern established in `useAuthStore`:

```typescript
import { create } from "zustand";

interface MyStore {
  // State
  someValue: string;
  // Actions
  setSomeValue: (value: string) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  someValue: "",
  setSomeValue: (value) => set({ someValue: value }),
}));
```

For persisted stores (useItemStore), wrap with `persist`:

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "@/utils/mmkvStorage";

export const useItemStore = create<ItemStore>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: "item-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ drafts: state.drafts }),
    },
  ),
);
```

**CRITICAL NOTE on typing:** When using `persist` middleware with `create`, you MUST use the curried form: `create<ItemStore>()(persist(...))` — note the extra `()`. This is required in Zustand 5.x for proper TypeScript inference with middleware.

#### Immutable State Updates — MANDATORY

All state mutations must use the spread operator pattern:

```typescript
// ✅ CORRECT — immutable
addItem: (item) => set((state) => ({
  items: [...state.items, item],
})),

deleteItem: (id) => set((state) => ({
  items: state.items.filter((i) => i.id !== id),
})),

updateItem: (id, updates) => set((state) => ({
  items: state.items.map((i) => i.id === id ? { ...i, ...updates } : i),
})),

// ❌ WRONG — mutation
addItem: (item) => set((state) => {
  state.items.push(item); // NEVER mutate!
  return state;
}),
```

#### Selector Pattern — Shallow Comparison

All components reading from stores MUST use shallow selectors for performance:

```typescript
import { useShallow } from "zustand/react/shallow";

// ✅ CORRECT — shallow selector
const { items, isLoading } = useItemStore(
  useShallow((state) => ({ items: state.items, isLoading: state.isLoading })),
);

// ✅ CORRECT — single primitive (no shallow needed)
const isOnline = useNetworkStore((state) => state.isOnline);

// ❌ WRONG — will re-render on ANY store change
const store = useItemStore();
```

**Note:** `useShallow` is imported from `zustand/react/shallow` (already used in App.tsx from Story 1.4).

#### useAuthStore — DO NOT MODIFY

`useAuthStore` was fully implemented in Story 1.4 and is already working correctly. It intentionally does NOT use persist middleware because Firebase Auth manages its own persistence via AsyncStorage. **Do not add MMKV persistence to useAuthStore.**

#### Only Drafts Are Persisted — NOT Items

The `items` array in `useItemStore` represents cloud-synced data fetched from Firestore. It does NOT need persistence — it will be re-fetched on app launch (implemented in Epic 5).

Only `drafts` (offline items not yet synced) need MMKV persistence to survive force-quit (NFR-R3). This is configured via `partialize`:

```typescript
partialize: (state) => ({ drafts: state.drafts }),
```

This ensures:

- `drafts` → persisted to MMKV → survives force-quit ✅
- `items` → NOT persisted → re-fetched from Firestore on launch
- `isLoading` → NOT persisted → resets to `false` on launch
- `searchQuery` → NOT persisted → resets to `''` on launch
- `categoryFilter` → NOT persisted → resets to `null` on launch

### Zustand 5.x + MMKV Technical Details

**Zustand 5.0.11 persist middleware:**

- `persist` and `createJSONStorage` are imported from `zustand/middleware`
- `createJSONStorage` wraps a `StateStorage` object and handles JSON serialization/deserialization
- The `StateStorage` interface requires: `getItem(name: string): string | null | Promise<string | null>`, `setItem(name: string, value: string): void | Promise<void>`, `removeItem(name: string): void | Promise<void>`
- MMKV's synchronous API satisfies this interface directly (no Promise wrapping needed)

**react-native-mmkv 4.1.2:**

- `new MMKV()` creates (or opens) the default MMKV instance
- `storage.getString(key)` returns `string | undefined` — must convert `undefined` to `null` for StateStorage
- `storage.set(key, value)` sets a string value
- `storage.delete(key)` removes a key
- All operations are synchronous (C++ backed, ~30x faster than AsyncStorage)
- Thread-safe and process-safe by default

**Why NOT use MMKV for Firebase Auth persistence?**
`getReactNativePersistence` (used in `firebaseConfig.ts`) requires an AsyncStorage-compatible interface with Promise-based methods. While MMKV could be wrapped with Promises, `@react-native-async-storage/async-storage` is the documented and tested approach for Firebase Auth. MMKV is reserved for Zustand persist middleware only (architectural boundary).

### Item Store Interface Design

The `ItemStore` interface must support all the operations needed by future stories:

```typescript
interface ItemStore {
  // State
  items: ItemDocument[];
  drafts: LocalDraft[];
  isLoading: boolean;
  searchQuery: string;
  categoryFilter: string | null;

  // Item actions (used by Epic 4: save, Epic 5: dashboard)
  addItem: (item: ItemDocument) => void;
  updateItem: (id: string, updates: Partial<ItemDocument>) => void;
  deleteItem: (id: string) => void;
  setItems: (items: ItemDocument[]) => void;

  // Draft actions (used by Epic 6: offline sync)
  addDraft: (draft: LocalDraft) => void;
  removeDraft: (localId: string) => void;
  updateDraftStatus: (
    localId: string,
    status: LocalDraft["syncStatus"],
    retryCount?: number,
  ) => void;

  // UI state actions (used by Epic 5: search/filter)
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
  setLoading: (loading: boolean) => void;
}
```

**Why these specific actions?**

- `addItem` / `deleteItem` / `updateItem` — CRUD operations for synced items (Epic 4: Stories 4.2, 4.4, 4.5)
- `setItems` — Bulk-set items after Firestore fetch (Epic 5: Story 5.1 dashboard load)
- `addDraft` / `removeDraft` — Offline draft lifecycle (Epic 6: Stories 6.2, 6.3)
- `updateDraftStatus` — Sync engine updates draft state (Epic 6: Story 6.3)
- `setSearchQuery` / `setCategoryFilter` — Dashboard filtering (Epic 5: Story 5.3)
- `setLoading` — Loading state for dashboard (Epic 5: Story 5.1)

### Previous Story Intelligence (Story 1.4)

**Key learnings from Story 1.4 implementation:**

1. **`useShallow` from `zustand/react/shallow`** — Already established pattern in App.tsx. Use for all multi-field selectors.
2. **`isInitialized` vs `loading` separation** — Story 1.4 found that a single `loading` boolean was insufficient. App.tsx gates on `isInitialized` only, while per-operation `loading` doesn't unmount the navigator. Lesson: be thoughtful about what loading states mean.
3. **Named exports for stores** — `export const useAuthStore = create<AuthStore>(...)` pattern is established. Follow same pattern for useItemStore and useNetworkStore.
4. **`stores/index.ts` already re-exports** — Currently has `export * from "@/stores/useAuthStore";`. Add the new stores here.
5. **Import path convention** — Use `@/` path alias. All stores import services from `@/services/`, types from `@/types/`, utils from `@/utils/`.
6. **No React Context for state** — Architecture is explicit: Zustand only for data state. React Context acceptable only for theme/navigation providers.
7. **`@react-native-google-signin/google-signin`** replaced `expo-auth-session` during runtime testing — demonstrates that implementation details may need to be adapted during development. Be prepared for similar adjustments.
8. **`registerRootComponent` must stay at bottom of App.tsx** — Do not modify App.tsx structure when adding new store usage.
9. **`enableScreens()` must stay at module level** — Same; preserve existing App.tsx patterns.

### Git Intelligence

- **Latest commit:** `9e933b7` — Merge PR #6 (feat/1-4-firebase-auth → develop)
- **Branch pattern:** `feat/{story-key}` → PR → `develop`
- **Expected branch for this story:** `feat/1-5-zustand-state-management-and-mmkv-persistence`
- **Files created by previous stories still in use:**
  - `src/stores/useAuthStore.ts` (1.4) — DO NOT MODIFY
  - `src/stores/index.ts` (1.4) — WILL MODIFY (add exports)
  - `src/types/item.types.ts` (1.1) — Has `ItemDocument` and `LocalDraft` interfaces ready to use
  - `src/utils/index.ts` (1.1) — Currently empty stub, WILL MODIFY
- **Dependencies already installed:** `react-native-mmkv: ^4.1.2`, `zustand: 5.0.11` — no new `npm install` needed

### Project Structure Notes

- **Alignment with architecture:** All files go in already-defined directories (`stores/`, `utils/`)
- **`src/utils/mmkvStorage.ts`** — New file following the architecture spec exactly. Named in the architecture's project structure tree.
- **`src/stores/useItemStore.ts`** — New file following the architecture spec exactly. Named in the architecture's project structure tree.
- **`src/stores/useNetworkStore.ts`** — New file following the architecture spec exactly. Named in the architecture's project structure tree.
- **No changes to:** `screens/`, `components/`, `services/`, `hooks/`, `navigation/`, `constants/`, `types/` directories
- **No new dependencies needed** — both `react-native-mmkv` and `zustand` are already in `package.json`

### File Operations Summary

| File          | Path                            | Action               |
| ------------- | ------------------------------- | -------------------- |
| MMKV adapter  | `src/utils/mmkvStorage.ts`      | CREATE               |
| Item store    | `src/stores/useItemStore.ts`    | CREATE               |
| Network store | `src/stores/useNetworkStore.ts` | CREATE               |
| Stores barrel | `src/stores/index.ts`           | MODIFY (add exports) |
| Utils barrel  | `src/utils/index.ts`            | MODIFY (add export)  |

**DO NOT CREATE:**

- `src/stores/useAuthStore.ts` — Already exists from Story 1.4
- `src/services/storageService.ts` — Not needed for this story; MMKV access is through mmkvStorage only
- `src/hooks/useNetworkStatus.ts` — Epic 6 story; just create the store here
- `src/services/syncService.ts` — Epic 6 story; not part of this story
- Any test files — Testing infrastructure not yet established

**DO NOT MODIFY:**

- `src/stores/useAuthStore.ts` — Working correctly from Story 1.4
- `src/App.tsx` — No changes needed; new stores don't require App.tsx initialization
- `src/types/item.types.ts` — `ItemDocument` and `LocalDraft` interfaces already defined correctly
- `package.json` — All dependencies already installed

### References

- Story 1.5 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 1.5 section]
- State architecture (Zustand): [Source: `_bmad-output/planning-artifacts/architecture.md` — State Architecture (Zustand)]
- MMKV boundary rule: [Source: `_bmad-output/planning-artifacts/architecture.md` — Architectural Boundaries, Rule #5]
- Persist middleware pattern: [Source: `_bmad-output/planning-artifacts/architecture.md` — Communication Patterns]
- ItemDocument & LocalDraft types: [Source: `src/types/item.types.ts`]
- Naming conventions: [Source: `_bmad-output/project-context.md` — Naming Conventions]
- Zustand rules: [Source: `_bmad-output/project-context.md` — State Management (Zustand)]
- NFR-R3 (drafts survive force-quit): [Source: `_bmad-output/planning-artifacts/architecture.md` — Requirements Coverage]
- Previous story (1.4): [Source: `_bmad-output/implementation-artifacts/1-4-firebase-integration-and-authentication.md`]
- Project context: [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

### Completion Notes List

- Implemented `mmkvStorage` adapter using `react-native-mmkv` with Zustand `StateStorage` contract in `src/utils/mmkvStorage.ts`.
- Implemented `useItemStore` with Zustand `persist` middleware and `partialize` to persist only `drafts` under store name `item-store`.
- Implemented `useNetworkStore` with `isOnline` and `setOnline` action without persistence.
- Updated barrel exports in `src/stores/index.ts` and `src/utils/index.ts`.
- Verified with `npx tsc --noEmit`, `npx eslint src/`, and Expo startup smoke check via `npx expo start --offline`.

### Review Follow-ups (AI)

- [x] [AI-Review][High] Use the documented factory method `createMMKV` instead of constructor format, as react-native-mmkv 4.x only exports the factory, the constructor MMKV type cannot be used at runtime.
- [x] [AI-Review][Medium] Fix draft duplication bug in addDraft of useItemStore.ts where drafts are concatenated without checking localId, avoiding duplicates on retry.

### File List

- src/utils/mmkvStorage.ts
- src/stores/useItemStore.ts
- src/stores/useNetworkStore.ts
- src/stores/index.ts
- src/utils/index.ts
- \_bmad-output/implementation-artifacts/1-5-zustand-state-management-and-mmkv-persistence.md
- \_bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-03-01: Implemented Story 1.5 Zustand state management + MMKV persistence, completed validation checks, and set status to review.
