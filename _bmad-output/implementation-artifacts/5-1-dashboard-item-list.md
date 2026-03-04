# Story 5.1: Dashboard Item List

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see all my cataloged items on the main screen,
So that I can browse my inventory at a glance.

## Acceptance Criteria

**AC1 — Fetch and Display Items from Firestore:**

- **Given** the user is authenticated and has cataloged items in Firestore
- **When** the Dashboard screen loads
- **Then** items are fetched from `users/{userId}/items` collection using the Firestore service layer
- **And** items are stored in `useItemStore` via `setItems()`
- **And** the list is sorted by creation date, newest first (FR21)
- **And** errors during fetch show a user-friendly message — the app never crashes

**AC2 — ItemCard Component with Required Fields:**

- **Given** items are loaded in the store
- **When** the Dashboard renders the item list
- **Then** each item is displayed as an `ItemCard` component
- **And** each `ItemCard` shows: a 72×72dp thumbnail image, title text, category chip, and sync status badge (FR22)
- **And** the sync status badge shows a green checkmark for "synced", amber clock for "pending", red exclamation for "error"
- **And** all `ItemCard` elements have `testID` and `accessibilityLabel` props

**AC3 — Virtualized List with 60fps Performance:**

- **Given** the user has many cataloged items (up to 500)
- **When** the user scrolls through the list
- **Then** a virtualized `FlatList` renders items performantly (NFR-P3)
- **And** `ItemCard` components use `React.memo` for render optimization
- **And** the list maintains 60fps scroll rate (<16ms frame time)
- **And** `getItemLayout` is used for fixed-height optimization

**AC4 — Skeleton Loading State:**

- **Given** the Dashboard is loading items for the first time
- **When** `isLoading` is true in `useItemStore`
- **Then** 3× skeleton shimmer cards are displayed as placeholder content
- **And** skeleton cards match the dimensions and layout of real `ItemCard` components
- **And** shimmer animation provides visual feedback that data is loading

**AC5 — Pull-to-Refresh:**

- **Given** the user is viewing the Dashboard item list
- **When** the user performs a pull-to-refresh gesture
- **Then** items are re-fetched from Firestore
- **And** the `RefreshControl` shows the native loading indicator during refresh
- **And** after refresh completes, the list updates with the latest data

**AC6 — FAB Scan Button Always Visible:**

- **Given** the Dashboard is displayed
- **When** the user views the screen (scrolling or not)
- **Then** the FAB (camera icon) is always visible at the bottom-right
- **And** tapping the FAB navigates to the Camera screen
- **And** the FAB respects safe area insets for bottom spacing

**AC7 — Navigate to Item Detail:**

- **Given** items are displayed in the list
- **When** the user taps an `ItemCard`
- **Then** the app navigates to `ItemDetail` screen with the item's `id` via `navigation.navigate("ItemDetail", { itemId: item.id })`

**AC8 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (regression check)

## Tasks / Subtasks

- [x] **Task 1: Add `fetchItems` function to `firestoreService.ts`** (AC: 1)
  - [x] Add `fetchItems(userId: string): Promise<ItemDocument[]>` function
  - [x] Use Firestore `collection`, `getDocs`, `query`, `orderBy` to fetch all items from `users/{userId}/items` ordered by `createdAt` desc
  - [x] Add `getDocs`, `query`, `orderBy` to the existing import from `firebase/firestore`
  - [x] Map Firestore document snapshots to `ItemDocument[]` array
  - [x] Wrap in try/catch with user-friendly error message
  - [x] Export the function

- [x] **Task 2: Create `ItemCard.tsx` component** (AC: 2, 3, 7)
  - [x] Create `src/components/ItemCard.tsx` as a new file
  - [x] Accept `item: ItemDocument` and `onPress: () => void` as props
  - [x] Display 72×72dp thumbnail via `Image` component with `item.imageUrl` (with fallback placeholder for missing images)
  - [x] Display item `title` using `bodyMedium` typography
  - [x] Display `category` as a `Chip` (React Native Paper) with `chips` border radius
  - [x] Display sync status badge: synced = green check (`✓`), pending = amber clock (`⏳`), error = red exclamation (`!`) using `semanticColors` from theme
  - [x] Wrap entire card in `TouchableRipple` (React Native Paper) or `Pressable` with `onPress` callback
  - [x] Use `React.memo` to prevent unnecessary re-renders
  - [x] Apply `StyleSheet.create` with all values from `theme.ts` — no hardcoded colors/spacing
  - [x] Add `testID="item-card-{item.id}"` and `accessibilityLabel="Item: {item.title}"` on root element

- [x] **Task 3: Create skeleton loading cards** (AC: 4)
  - [x] Create skeleton placeholder component or inline skeleton in `DashboardScreen`
  - [x] Render 3× shimmer cards matching `ItemCard` dimensions
  - [x] Use `Animated` API with looping opacity animation for shimmer effect
  - [x] Use `theme.colors.surface` and `theme.colors.surfaceVariant` for shimmer colors

- [x] **Task 4: Rewrite `DashboardScreen.tsx` with full item list** (AC: 1, 3, 4, 5, 6, 7)
  - [x] Replace the current placeholder content with a `FlatList` rendering `ItemCard` components
  - [x] On mount: call `fetchItems(userId)` via `useEffect`, set results to `useItemStore.setItems()`
  - [x] Set `isLoading` to true before fetch, false after (both success and error)
  - [x] While loading, render skeleton cards instead of the FlatList
  - [x] Configure `FlatList` with `keyExtractor={(item) => item.id}`, `ItemSeparatorComponent` (spacing), and `ListEmptyComponent` (placeholder for future empty state)
  - [x] Add `getItemLayout` callback for fixed-height optimization
  - [x] Add `RefreshControl` for pull-to-refresh that re-fetches from Firestore
  - [x] Each `ItemCard` `onPress` navigates: `navigation.navigate("ItemDetail", { itemId: item.id })`
  - [x] Keep the FAB scan button at bottom-right (already exists)
  - [x] Use `useDashboardNavigation` for navigation within the DashboardStack
  - [x] Get `userId` from `useAuthStore(state => state.user?.uid)`
  - [x] Handle fetch errors with Snackbar feedback

- [x] **Task 5: Build verification** (AC: 8)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                                | Current State                                                                                                                                                                                                                                           | This Story's Action                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `src/screens/DashboardScreen.tsx`   | 57 lines — **placeholder** with "Dashboard" text and FAB scan button. FAB navigates to Camera. Uses `useRootStackNavigation` for Camera navigation.                                                                                                     | **MODIFY** — replace placeholder with full item list |
| `src/stores/useItemStore.ts`        | 103 lines — has `items`, `drafts`, `isLoading`, `searchQuery`, `categoryFilter` state. Has `addItem`, `updateItem`, `deleteItem`, `setItems`, `setSearchQuery`, `setCategoryFilter`, `setLoading` actions. Persists drafts to MMKV.                     | **NO CHANGES** — reuse existing store                |
| `src/services/firestoreService.ts`  | 65 lines — has `saveItem()`, `updateItem()`, `deleteItem()` functions. Uses modular Firestore imports. Does NOT have a `fetchItems` / `getItems` query function yet.                                                                                    | **MODIFY** — add `fetchItems()` function             |
| `src/types/item.types.ts`           | 27 lines — `ItemDocument` interface (id, title, category, color, condition, tags, notes, imageUrl, imagePath, aiGenerated, syncStatus, createdAt, updatedAt) and `LocalDraft` interface.                                                                | **NO CHANGES**                                       |
| `src/constants/theme.ts`            | 116 lines — Full MD3 dark theme with colors (background #0F0F13, surface #1A1A22, primary #7C6EF8, error #FF6B6B), spacing (8dp base), borderRadius (cards=12, chips=16), semanticColors (syncPending=#F0A000, syncComplete=#4CAF50, aiAccent=#64DFDF). | **NO CHANGES**                                       |
| `src/constants/config.ts`           | 13 lines — App constants including `ITEM_THUMBNAIL_SIZE = 72`, `SEARCH_DEBOUNCE_MS = 300`, `SNACKBAR_DURATION_MS = 3000`.                                                                                                                               | **NO CHANGES**                                       |
| `src/types/navigation.types.ts`     | 72 lines — Navigation types with `DashboardStackParamList` (ItemList, ItemDetail, EditItem). Has `useDashboardNavigation()` and `useRootStackNavigation()` typed hooks.                                                                                 | **NO CHANGES**                                       |
| `src/navigation/DashboardStack.tsx` | 21 lines — Stack navigator with ItemList → ItemDetail → EditItem screens. `headerShown: false`.                                                                                                                                                         | **NO CHANGES**                                       |
| `src/stores/useAuthStore.ts`        | Auth store with `user`, `isAuthenticated` state. Used via `useAuthStore(state => state.user?.uid)` for getting userId.                                                                                                                                  | **NO CHANGES**                                       |

#### What NEEDS TO BE CREATED

| File                          | Purpose                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `src/components/ItemCard.tsx` | **NEW** — Reusable item card component for dashboard list |

#### What NEEDS TO BE MODIFIED

| File                               | Purpose                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `src/services/firestoreService.ts` | **MODIFY** — add `fetchItems(userId)` function to query items             |
| `src/screens/DashboardScreen.tsx`  | **MODIFY** — replace placeholder with FlatList, skeleton, pull-to-refresh |

---

### Key Implementation Details

#### `fetchItems` in `firestoreService.ts` (ADD TO EXISTING FILE)

```typescript
import { collection, getDocs, query, orderBy } from "firebase/firestore";
// Add getDocs, query, orderBy to the existing import statement.
// Existing imports: collection, deleteDoc, doc, setDoc, Timestamp, updateDoc

/**
 * Fetch all items for a user, ordered by creation date (newest first).
 */
export async function fetchItems(userId: string): Promise<ItemDocument[]> {
  try {
    const itemsRef = collection(db, "users", userId, "items");
    const q = query(itemsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as ItemDocument[];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch items from Firestore: ${message}`);
  }
}
```

> **⚠️ IMPORTANT**: Add `getDocs`, `query`, `orderBy` to the existing import statement from `firebase/firestore`. The existing imports are `collection`, `deleteDoc`, `doc`, `setDoc`, `Timestamp`, `updateDoc`. Do NOT duplicate any imports.

---

#### ItemCard Component (`src/components/ItemCard.tsx`)

**Layout (horizontal card):**

- Left: 72×72dp thumbnail image (`ITEM_THUMBNAIL_SIZE` from config)
- Center-left: item title (bodyMedium) + category chip below
- Right: sync status badge icon

**Image handling:**

- Use React Native `Image` component with `item.imageUrl` as source
- Add a placeholder/fallback for items without images — use `theme.colors.surfaceVariant` background with a camera icon
- Set `resizeMode="cover"` for thumbnails
- Round image corners using `borderRadius: theme.borderRadius.cards`

**Sync status badge colors (from `theme.semanticColors`):**

- `synced` → `semanticColors.syncComplete` (#4CAF50) — green check icon
- `pending` → `semanticColors.syncPending` (#F0A000) — amber clock icon
- `error` → `theme.colors.error` (#FF6B6B) — red exclamation icon

**Use React Native Paper `Chip` for category:**

```tsx
<Chip
  mode="outlined"
  textStyle={{ fontSize: 11, color: theme.colors.onSurface }}
  style={{
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.chips,
  }}
  compact
>
  {item.category}
</Chip>
```

**Wrap with `React.memo`:**

```tsx
const ItemCard = React.memo(function ItemCard({
  item,
  onPress,
}: ItemCardProps) {
  // ... implementation
});
export default ItemCard;
```

---

#### DashboardScreen Rewrite

**Key navigation pattern — dual navigation hooks:**
The DashboardScreen needs TWO navigation hooks:

1. `useRootStackNavigation()` — for navigating to Camera (modal outside tab navigator)
2. `useDashboardNavigation()` — for navigating to ItemDetail within the DashboardStack

```typescript
const rootNavigation = useRootStackNavigation(); // For Camera modal
const navigation = useDashboardNavigation(); // For ItemDetail stack

// Camera FAB:
rootNavigation.navigate("Camera");

// Item tap:
navigation.navigate("ItemDetail", { itemId: item.id });
```

**Fetch items on mount pattern:**

```typescript
const userId = useAuthStore((state) => state.user?.uid);
const items = useItemStore((state) => state.items);
const isLoading = useItemStore((state) => state.isLoading);

const fetchData = useCallback(async () => {
  if (!userId) return;
  useItemStore.getState().setLoading(true);
  try {
    const fetchedItems = await fetchItems(userId);
    useItemStore.getState().setItems(fetchedItems);
  } catch (error) {
    // Show snackbar with error message
  } finally {
    useItemStore.getState().setLoading(false);
  }
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

**Pull-to-refresh pattern:**

```tsx
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  if (!userId) return;
  setRefreshing(true);
  try {
    const fetchedItems = await fetchItems(userId);
    useItemStore.getState().setItems(fetchedItems);
  } catch (error) {
    // Show snackbar
  } finally {
    setRefreshing(false);
  }
}, [userId]);

<FlatList
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={theme.colors.primary}
    />
  }
/>;
```

**Skeleton loading cards pattern:**

```tsx
const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <Animated.View
      style={[styles.skeletonThumbnail, { opacity: shimmerAnimation }]}
    />
    <View style={styles.skeletonContent}>
      <Animated.View
        style={[styles.skeletonTitle, { opacity: shimmerAnimation }]}
      />
      <Animated.View
        style={[styles.skeletonChip, { opacity: shimmerAnimation }]}
      />
    </View>
  </View>
);

// In render:
if (isLoading) {
  return (
    <View style={styles.screen}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      {/* FAB still visible */}
    </View>
  );
}
```

**Shimmer animation:**

```typescript
const shimmerAnim = useRef(new Animated.Value(0.3)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(shimmerAnim, {
        toValue: 0.3,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]),
  ).start();
}, [shimmerAnim]);
```

**FlatList performance optimizations:**

```tsx
const ITEM_CARD_HEIGHT = 88; // 72dp thumbnail + 16dp vertical padding

<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <ItemCard
      item={item}
      onPress={() => navigation.navigate("ItemDetail", { itemId: item.id })}
    />
  )}
  getItemLayout={(_, index) => ({
    length: ITEM_CARD_HEIGHT,
    offset: ITEM_CARD_HEIGHT * index,
    index,
  })}
  ItemSeparatorComponent={() => (
    <View style={{ height: theme.spacing.space2 }} />
  )}
  contentContainerStyle={{ padding: theme.spacing.space4 }}
  showsVerticalScrollIndicator={false}
/>;
```

> **⚠️ ITEM HEIGHT NOTE**: The `getItemLayout` height must match the actual rendered ItemCard height exactly (including margins/padding), otherwise FlatList will have scroll position bugs. If ItemCard height changes, update `ITEM_CARD_HEIGHT` accordingly.

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Using useState for items (global state)
const [items, setItems] = useState<ItemDocument[]>([]);
// DO: Use useItemStore — items are global state shared across screens.

// ❌ WRONG: Direct Firestore calls from DashboardScreen
import { getDocs, collection } from "firebase/firestore";
const snapshot = await getDocs(collection(db, ...));
// DO: Call firestoreService.fetchItems(userId) — respect architecture boundary.

// ❌ WRONG: Hardcoded thumbnail size
<Image style={{ width: 72, height: 72 }} />
// DO: Use ITEM_THUMBNAIL_SIZE from config.ts: { width: ITEM_THUMBNAIL_SIZE, height: ITEM_THUMBNAIL_SIZE }

// ❌ WRONG: Hardcoded colors in ItemCard
const styles = StyleSheet.create({
  card: { backgroundColor: "#1A1A22" },
  badge: { color: "#4CAF50" },
});
// DO: Use theme.colors.surface, theme.semanticColors.syncComplete, etc.

// ❌ WRONG: Not using React.memo on list item component
export default function ItemCard({ item }: Props) { ... }
// DO: export default React.memo(function ItemCard({...}) { ... });
// Without memo, FlatList re-renders ALL visible cards on any state change.

// ❌ WRONG: Fetching items without userId check
useEffect(() => {
  fetchItems(userId); // userId could be undefined!
}, []);
// DO: Guard with if (!userId) return; and include userId in dependency array.

// ❌ WRONG: Using navigation.navigate without correct hook for the stack
const navigation = useRootStackNavigation();
navigation.navigate("ItemDetail", { itemId: item.id });
// "ItemDetail" is in DashboardStack, not RootStack!
// DO: Use useDashboardNavigation() for ItemDetail, useRootStackNavigation() for Camera.

// ❌ WRONG: Not handling the loading/error states
const items = await fetchItems(userId);
useItemStore.getState().setItems(items);
// What if it fails? What does the user see while loading?
// DO: Set isLoading=true before, false after, catch errors with snackbar feedback.

// ❌ WRONG: Using ScrollView instead of FlatList
<ScrollView>{items.map(item => <ItemCard .../>)}</ScrollView>
// DO: Use FlatList for virtualization — ScrollView renders ALL items, killing perf at 500 items.
```

---

### Previous Story Intelligence

**From Story 4.5 (Delete Item) — Most Recent:**

1. **Snackbar pattern**: Use React Native Paper `Snackbar` with `SNACKBAR_DURATION_MS` constant from config.ts for timed feedback. Pattern: `const [snackbarVisible, setSnackbarVisible] = useState(false)` + `const [snackbarMessage, setSnackbarMessage] = useState("")`.

2. **Auth guard pattern**: `useAuthStore.getState().user?.uid` or `useAuthStore(state => state.user?.uid)` — always check if userId is available before performing Firestore operations.

3. **Store action pattern**: Use `useItemStore.getState().setItems(...)` for calling store actions from async handlers outside React render context (inside `useCallback` async functions).

4. **`useCallback` with proper dependencies**: All handler functions use `useCallback` with explicit dependency arrays. Follow the same pattern for `fetchData` and `onRefresh`.

5. **ItemDetailScreen**: Currently has delete functionality with confirmation dialog (from story 4.5). It's still a partial view — Story 5.4 will add the full detail view. Navigation from Dashboard to ItemDetail already works via `navigation.navigate("ItemDetail", { itemId })`.

6. **Fire-and-forget pattern**: `void asyncFunction()` prefix for non-blocking cleanup calls.

**Cross-Epic Context:**

- Epics 1-4 are fully completed. All core infrastructure (Firebase, Auth, Navigation, Theme, Stores, Camera, AI, Save/Edit/Delete) is in place.
- Epic 5 is the first epic where the Dashboard becomes a real screen with live data.
- The `DashboardScreen` FAB already works — it navigates to Camera correctly.

---

### Git Intelligence

Recent commits (10 most recent, feature branches merged to develop):

```
8c52a57 feat: Add sprint status tracking and Epic 4 retrospective.
e5002dd Merge pull request #22 from AvishkaGihan/feat/4-5-delete-item
bb31d23 feat: implement story 4-5 delete item functionality
8e8cad8 Merge pull request #21 from AvishkaGihan/feat/4-4-edit-existing-item
7b0e2a8 feat: implement story 4-4 edit existing item
4f3a0d1 Merge pull request #20 from AvishkaGihan/feat/4-3-discard-scan-and-cancel-flow
fd31f1b feat: implement discard scan and cancel flow with cleanup and navigation reset
97466de Merge pull request #19 from AvishkaGihan/feat/4-2-confirm-and-save-item-to-cloud
47ab24b feat: implement confirm and save item to cloud with Firestore and Storage integration
a03fb4f Merge pull request #18 from AvishkaGihan/feat/4-1-review-form-screen
```

**Codebase conventions established from recent commits:**

- Feature branches named `feat/{story-key}` (e.g., `feat/4-5-delete-item`)
- `useCallback` for all handler functions with proper dependency arrays
- `useAuthStore.getState().user?.uid` for auth in async handlers
- Modular Firebase imports (tree-shakeable) — `import { X } from "firebase/firestore"`
- `testID` and `accessibilityLabel` on all interactive elements
- `StyleSheet.create` with all values from `theme.ts`
- `void` prefix for fire-and-forget async calls
- React Native Paper components (`Snackbar`, `FAB`, `Button`, `Dialog`, `Portal`, `Chip`, `Text`) used consistently

---

### Dependency Check

**No new npm dependencies required.**

All needed packages are already installed:

- `firebase/firestore` — `getDocs`, `query`, `orderBy` already available in the Firebase JS SDK
- `react-native-paper` — `Chip`, `Text`, `FAB`, `Snackbar` already used in project
- `react-native` — `FlatList`, `RefreshControl`, `Animated`, `Image`, `StyleSheet` are core RN
- `react-native-safe-area-context` — `useSafeAreaInsets` already available

---

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming):
  - New component: `src/components/ItemCard.tsx` — PascalCase, `.tsx` extension ✓
  - Modified service: `src/services/firestoreService.ts` — camelCase, `.ts` extension ✓
  - Modified screen: `src/screens/DashboardScreen.tsx` — PascalCase, `.tsx` extension ✓
- No new directories needed — all files placed in existing directories
- Architecture boundary rules maintained: DashboardScreen → useItemStore (hook) → firestoreService (service) → Firestore. No direct Firebase calls from screen.
- `ItemCard` component is designed to be reusable across Dashboard and any future list views

### References

- Story 5.1 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.1 section, lines 521-537]
- FR21: "User can view a list of all cataloged items on the main dashboard"
- FR22: "User can see at minimum: item title, category, thumbnail image, and sync status in the item list"
- NFR-P3: "The system shall render the item list dashboard with 500 items while maintaining a 60fps scroll rate (<16ms frame time)"
- ItemDocument interface: [Source: `src/types/item.types.ts`]
- useItemStore state and actions: [Source: `src/stores/useItemStore.ts` — 103 lines]
- firestoreService existing pattern: [Source: `src/services/firestoreService.ts` — 65 lines]
- Current DashboardScreen placeholder: [Source: `src/screens/DashboardScreen.tsx` — 57 lines]
- Theme tokens: [Source: `src/constants/theme.ts` — colors, spacing, borderRadius, semanticColors]
- App constants: [Source: `src/constants/config.ts` — ITEM_THUMBNAIL_SIZE=72, SNACKBAR_DURATION_MS=3000]
- Navigation types: [Source: `src/types/navigation.types.ts` — DashboardStackParamList, useDashboardNavigation]
- DashboardStack registration: [Source: `src/navigation/DashboardStack.tsx` — line 15]
- Architecture boundary rules: [Source: `_bmad-output/planning-artifacts/architecture.md` — UI → Stores → Services pattern]
- Architecture FlatList perf requirement: [Source: `architecture.md` — NFR-P3 coverage section]
- UX spec ItemCard: [Source: `_bmad-output/planning-artifacts/epics.md` — "ItemCard (with sync badge)" component from UX design section]
- Previous story 4.5: [Source: `_bmad-output/implementation-artifacts/4-5-delete-item.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npx tsc --noEmit`
- `powershell -NoProfile -Command "Set-Location functions; npx tsc --noEmit"`

### Completion Notes List

- Implemented `fetchItems(userId)` in `firestoreService.ts` with Firestore query ordering by `createdAt` descending and robust error wrapping.
- Added memoized `ItemCard` component with 72×72 thumbnail, category chip, sync status badge, and required test/accessibility attributes.
- Replaced Dashboard placeholder with item `FlatList`, pull-to-refresh, loading skeleton shimmer, dual navigation hooks, and Snackbar-based error feedback.
- Verified TypeScript checks pass in both app root and `functions` workspace.

### File List

- `src/services/firestoreService.ts`
- `src/components/ItemCard.tsx`
- `src/screens/DashboardScreen.tsx`
- `src/types/item.types.ts`
- `_bmad-output/implementation-artifacts/5-1-dashboard-item-list.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-03-04: Implemented Story 5.1 dashboard item list, loading skeletons, pull-to-refresh, and Firestore fetch integration; completed AC8 typecheck verification.
- 2026-03-04: (AI Review) Fixed `minHeight` list optimization bug in ItemCard, added correct Safe Area handling in DashboardScreen, and improved optional chaining for image URLs. Resolved Firebase Timestamp serialization issues in Zustand by mapping item dates. Status changed to done.
