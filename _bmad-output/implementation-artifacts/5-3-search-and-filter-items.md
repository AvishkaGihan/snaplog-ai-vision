# Story 5.3: Search & Filter Items

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to search and filter my items by title or category,
So that I can quickly find specific items in a large inventory.

## Acceptance Criteria

**AC1 — Real-time Search by Title and Category:**

- **Given** the user has cataloged items on the Dashboard
- **When** the user types in the permanently visible `Searchbar` component
- **Then** the item list filters in real-time as the user types (debounced at 300ms) (FR23)
- **And** search matches against item `title` and `category` fields (case-insensitive)
- **And** the search query is stored in `useItemStore.searchQuery` via `setSearchQuery()`
- **And** the `Searchbar` shows a clear (×) icon when text is present, and tapping it clears the search

**AC2 — Empty Search Results State:**

- **Given** the user has typed a search query
- **When** no items match the search query
- **Then** a "No items found for '{query}'" message is shown, centered in the list area
- **And** a "Clear search" tappable link is displayed below the message
- **And** tapping "Clear search" resets the search bar and shows all items

**AC3 — Category Filter Chips:**

- **Given** the user has cataloged items on the Dashboard
- **When** the Dashboard renders
- **Then** `CategoryChip` components are displayed in a horizontal scrollable row below the search bar (FR24)
- **And** chips show all unique categories derived from the current items list
- **And** each chip shows the category name

**AC4 — Category Filter Selection:**

- **Given** the category chips are displayed
- **When** the user taps a category chip
- **Then** the list filters to only items matching that category
- **And** the active chip visually changes to selected state (filled/primaryContainer background)
- **And** tapping the already-active chip clears the filter (toggles off)
- **And** the category filter is stored in `useItemStore.categoryFilter` via `setCategoryFilter()`

**AC5 — Empty Category Filter Results State:**

- **Given** the user has selected a category filter
- **When** no items match the selected category (e.g., combined with search)
- **Then** "No items in this category" message is shown, centered in the list area
- **And** a "Clear filter" tappable link is displayed below the message
- **And** tapping "Clear filter" resets the category filter

**AC6 — Combined Search and Category Filter:**

- **Given** the user has both a search query and a category filter active
- **When** the dashboard filters items
- **Then** both filters are applied together (AND logic) — items must match search AND category
- **And** clearing search preserves the category filter, and vice versa

**AC7 — Accessibility:**

- **Given** the search bar and category chips are rendered
- **When** a screen reader reads the controls
- **Then** the `Searchbar` has `testID="search-bar"` and `accessibilityLabel="Search items"`
- **And** each `CategoryChip` has `testID="category-chip-{category}"` and `accessibilityLabel="Filter by {category}"`
- **And** filter result empty states have `accessibilityRole="alert"`

**AC8 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (regression check)

## Tasks / Subtasks

- [x] **Task 1: Create `useDebounce.ts` custom hook** (AC: 1)
  - [x] Create `src/hooks/useDebounce.ts` as a new file
  - [x] Implement a generic `useDebounce<T>(value: T, delay: number): T` hook
  - [x] Use `useEffect` + `setTimeout` / `clearTimeout` for debounce logic
  - [x] Default delay should use `SEARCH_DEBOUNCE_MS` from config (300ms)
  - [x] Export as a named export

- [x] **Task 2: Create `CategoryChip.tsx` component** (AC: 3, 4, 7)
  - [x] Create `src/components/CategoryChip.tsx` as a new file
  - [x] Accept props: `category: string`, `selected: boolean`, `onPress: () => void`
  - [x] Use React Native Paper `Chip` component
  - [x] Selected state: `mode="flat"`, backgroundColor `theme.colors.primaryContainer`, text color `theme.colors.onBackground`
  - [x] Unselected state: `mode="outlined"`, borderColor `theme.colors.outline`, text color `theme.colors.onSurface`
  - [x] Border radius: `theme.borderRadius.chips` (16dp)
  - [x] Add `testID="category-chip-{category}"` and `accessibilityLabel="Filter by {category}"`
  - [x] Wrap with `React.memo` for list performance
  - [x] Export as default export

- [x] **Task 3: Update `DashboardScreen.tsx` with search and filter UI** (AC: 1, 2, 3, 4, 5, 6, 7)
  - [x] Import `Searchbar` from `react-native-paper`
  - [x] Import `CategoryChip` component
  - [x] Import `useDebounce` hook
  - [x] Import `SEARCH_DEBOUNCE_MS` from config
  - [x] Add `Searchbar` above the FlatList, below the safe area top inset
  - [x] Wire search bar value to local `useState` for immediate text feedback
  - [x] Use `useDebounce` on the local search value, then call `useItemStore.getState().setSearchQuery(debouncedValue)` via `useEffect`
  - [x] Derive unique categories from `items` array using `useMemo`
  - [x] Render a horizontal `FlatList` or `ScrollView` of `CategoryChip` components below the search bar
  - [x] Wire category chip tap to toggle `setCategoryFilter(category)` / `setCategoryFilter(null)`
  - [x] Derive filtered items using `useMemo` — apply search query AND category filter to `items`
  - [x] Pass `filteredItems` to the main FlatList `data` prop instead of raw `items`
  - [x] Remove `getItemLayout` optimization (filtered list has variable data, layout recalculates)
  - [x] Create `SearchEmptyState` inline component for no-results message with "Clear search" / "Clear filter" links
  - [x] Update `ListEmptyComponent` to show `SearchEmptyState` when filters are active, `EmptyStateCard` when no items exist at all
  - [x] Ensure pull-to-refresh still works
  - [x] Ensure FAB remains visible

- [x] **Task 4: Update barrel exports** (AC: 3)
  - [x] Add `CategoryChip` export to `src/components/index.ts`

- [x] **Task 5: Build verification** (AC: 8)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                                | Current State                                                                                                                                                                           | This Story's Action                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/screens/DashboardScreen.tsx`   | 273 lines — Full item list with FlatList, skeleton loading, pull-to-refresh, dual navigation hooks, Snackbar, EmptyStateCard integration. Uses `useItemStore` for `items`, `isLoading`. | **MODIFY** — add Searchbar, category chips, filtering, empty states |
| `src/stores/useItemStore.ts`        | 103 lines — Already has `searchQuery: string`, `categoryFilter: string \| null`, `setSearchQuery()`, `setCategoryFilter()` actions. Items persist drafts to MMKV.                       | **NO CHANGES** — store already supports search/filter               |
| `src/components/ItemCard.tsx`       | 137 lines — React.memo-wrapped component with thumbnail, title, category chip, sync badge. Exports `ITEM_CARD_HEIGHT`.                                                                  | **NO CHANGES**                                                      |
| `src/components/EmptyStateCard.tsx` | Empty state card with SVG camera illustration, used as FlatList ListEmptyComponent.                                                                                                     | **NO CHANGES** — still used when zero total items exist             |
| `src/constants/theme.ts`            | 116 lines — Full MD3 dark theme with all colors, spacing, typography, borderRadius, semanticColors. Includes `primaryContainer: '#3A2E8A'` for selected states.                         | **NO CHANGES**                                                      |
| `src/constants/config.ts`           | 13 lines — Includes `SEARCH_DEBOUNCE_MS = 300`. All constants needed are already defined.                                                                                               | **NO CHANGES**                                                      |
| `src/types/navigation.types.ts`     | Navigation types with `useDashboardNavigation()` and `useRootStackNavigation()`.                                                                                                        | **NO CHANGES**                                                      |
| `src/components/index.ts`           | 5 lines — Barrel exports for PermissionCard, ScanLoadingOverlay, AIFieldBadge, EmptyStateCard.                                                                                          | **MODIFY** — add CategoryChip export                                |

#### What NEEDS TO BE CREATED

| File                              | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `src/hooks/useDebounce.ts`        | **NEW** — Generic debounce hook for search input  |
| `src/components/CategoryChip.tsx` | **NEW** — Reusable category filter chip component |

#### What NEEDS TO BE MODIFIED

| File                              | Purpose                                                                    |
| --------------------------------- | -------------------------------------------------------------------------- |
| `src/screens/DashboardScreen.tsx` | **MODIFY** — add search bar, category chips, filtering logic, empty states |
| `src/components/index.ts`         | **MODIFY** — add CategoryChip barrel export                                |

---

### Key Implementation Details

#### `useDebounce` Hook (`src/hooks/useDebounce.ts`)

```typescript
import { useEffect, useState } from "react";

/**
 * Debounces a value by the specified delay in milliseconds.
 * Returns the debounced value which updates only after
 * the specified delay has passed since the last change.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

> **⚠️ IMPORTANT**: This is a generic hook. The `delay` parameter is provided by the caller — typically `SEARCH_DEBOUNCE_MS` from `config.ts` (300ms). Named export, NOT default export (hooks follow named export convention).

---

#### `CategoryChip` Component (`src/components/CategoryChip.tsx`)

```tsx
import React from "react";
import { StyleSheet } from "react-native";
import { Chip } from "react-native-paper";

import { theme } from "@/constants/theme";

interface CategoryChipProps {
  category: string;
  selected: boolean;
  onPress: () => void;
}

const CategoryChip = React.memo(function CategoryChip({
  category,
  selected,
  onPress,
}: CategoryChipProps) {
  return (
    <Chip
      mode={selected ? "flat" : "outlined"}
      onPress={onPress}
      selected={selected}
      style={[styles.chip, selected && styles.chipSelected]}
      textStyle={[styles.chipText, selected && styles.chipTextSelected]}
      compact
      testID={`category-chip-${category}`}
      accessibilityLabel={`Filter by ${category}`}
    >
      {category}
    </Chip>
  );
});

export default CategoryChip;

const styles = StyleSheet.create({
  chip: {
    borderColor: theme.colors.outline,
    borderRadius: theme.borderRadius.chips,
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primaryContainer,
  },
  chipText: {
    fontSize: 11,
    color: theme.colors.onSurface,
  },
  chipTextSelected: {
    color: theme.colors.onBackground,
  },
});
```

> **⚠️ IMPORTANT**: Uses `React.memo` since this renders in a horizontal list. `selected` prop drives visual state change via `primaryContainer` background. `compact` mode keeps chips small.

---

#### DashboardScreen Modifications

**Search bar integration — add ABOVE the FlatList, pinned at the top:**

The search bar and category chips should be placed outside the FlatList as a fixed header, so they don't scroll away. Alternatively, use `ListHeaderComponent` on the FlatList.

**Recommended approach: `ListHeaderComponent`** — keeps search bar and chips scrollable with the content but visible at the top.

```tsx
// NEW imports:
import { ScrollView } from "react-native";
import { Searchbar } from "react-native-paper";
import CategoryChip from "@/components/CategoryChip";
import { useDebounce } from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_MS } from "@/constants/config";

// Inside DashboardScreen component:
const searchQuery = useItemStore((state) => state.searchQuery);
const categoryFilter = useItemStore((state) => state.categoryFilter);

// Local state for immediate text input feedback (no lag)
const [searchText, setSearchText] = useState("");

// Debounce the search text before updating store
const debouncedSearchText = useDebounce(searchText, SEARCH_DEBOUNCE_MS);

// Sync debounced value to store
useEffect(() => {
  useItemStore.getState().setSearchQuery(debouncedSearchText);
}, [debouncedSearchText]);

// Derive unique categories from ALL items (not filtered)
const categories = useMemo(() => {
  const cats = new Set(items.map((item) => item.category).filter(Boolean));
  return Array.from(cats).sort();
}, [items]);

// Apply search and category filter
const filteredItems = useMemo(() => {
  let result = items;

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }

  if (categoryFilter) {
    result = result.filter((item) => item.category === categoryFilter);
  }

  return result;
}, [items, searchQuery, categoryFilter]);

// Whether any filter is active (for choosing correct empty state)
const isFilterActive = searchQuery.length > 0 || categoryFilter !== null;
```

**ListHeaderComponent for Searchbar + Chips:**

```tsx
const ListHeaderComponent = useMemo(
  () => (
    <View style={styles.headerContainer}>
      <Searchbar
        placeholder="Search items..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchBar}
        inputStyle={styles.searchBarInput}
        iconColor={theme.colors.onSurface}
        placeholderTextColor={theme.colors.outline}
        testID="search-bar"
        accessibilityLabel="Search items"
      />
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          testID="category-chip-row"
          accessibilityLabel="Category filters"
        >
          {categories.map((category) => (
            <CategoryChip
              key={category}
              category={category}
              selected={categoryFilter === category}
              onPress={() =>
                useItemStore
                  .getState()
                  .setCategoryFilter(
                    categoryFilter === category ? null : category,
                  )
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  ),
  [searchText, categories, categoryFilter],
);
```

> **⚠️ WARNING**: The `ListHeaderComponent` uses `useMemo` but depends on `searchText`, `categories`, and `categoryFilter`. This will re-render the header when those values change, which is correct and expected. However, `setSearchText` should NOT be a memo dependency since it's a stable setter from `useState`.

**Empty state logic — determine which empty component to show:**

```tsx
const ListEmptyComponent = useMemo(() => {
  if (isFilterActive) {
    return (
      <SearchEmptyState
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        onClearSearch={() => {
          setSearchText("");
          useItemStore.getState().setSearchQuery("");
        }}
        onClearFilter={() => {
          useItemStore.getState().setCategoryFilter(null);
        }}
      />
    );
  }
  return <EmptyStateCard />;
}, [isFilterActive, searchQuery, categoryFilter]);
```

**`SearchEmptyState` inline component (within DashboardScreen):**

```tsx
function SearchEmptyState({
  searchQuery,
  categoryFilter,
  onClearSearch,
  onClearFilter,
}: {
  searchQuery: string;
  categoryFilter: string | null;
  onClearSearch: () => void;
  onClearFilter: () => void;
}) {
  const hasSearchQuery = searchQuery.length > 0;
  const hasCategoryFilter = categoryFilter !== null;

  return (
    <View
      style={styles.searchEmptyState}
      accessibilityRole="alert"
      testID="search-empty-state"
    >
      <Text style={styles.searchEmptyText}>
        {hasSearchQuery && !hasCategoryFilter
          ? `No items found for '${searchQuery}'`
          : hasCategoryFilter && !hasSearchQuery
            ? "No items in this category"
            : `No items found for '${searchQuery}' in this category`}
      </Text>
      {hasSearchQuery && (
        <Text
          style={styles.clearLink}
          onPress={onClearSearch}
          testID="clear-search-link"
          accessibilityLabel="Clear search"
          accessibilityRole="link"
        >
          Clear search
        </Text>
      )}
      {hasCategoryFilter && (
        <Text
          style={styles.clearLink}
          onPress={onClearFilter}
          testID="clear-filter-link"
          accessibilityLabel="Clear filter"
          accessibilityRole="link"
        >
          Clear filter
        </Text>
      )}
    </View>
  );
}
```

**FlatList update — use `filteredItems` and updated ListEmptyComponent:**

```tsx
<FlatList
  data={filteredItems}  // CHANGED from items
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  // REMOVED: getItemLayout (filtered list varies, layout recalculates)
  ItemSeparatorComponent={() => <View style={styles.separator} />}
  ListHeaderComponent={ListHeaderComponent}  // NEW
  ListEmptyComponent={ListEmptyComponent}    // UPDATED
  contentContainerStyle={[
    styles.listContent,
    {
      paddingTop: insets.top + theme.spacing.space4,
      paddingBottom:
        insets.bottom + theme.spacing.space4 + theme.spacing.space8 + theme.spacing.space6,
    },
    { flexGrow: 1 },
  ]}
  refreshControl={...}  // unchanged
  showsVerticalScrollIndicator={false}
  testID="dashboard-item-list"
  accessibilityLabel="Dashboard item list"
/>
```

> **⚠️ CRITICAL**: Remove `getItemLayout` when using filtered data. The `getItemLayout` optimization assumes a static dataset and will cause visual glitches when items are filtered dynamically. FlatList will recalculate without it — acceptable for the expected 500-item scale.

**New stylesheet entries to add:**

```typescript
// ADD to styles StyleSheet.create:
headerContainer: {
  gap: theme.spacing.space2,
  marginBottom: theme.spacing.space3,
},
searchBar: {
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.inputs,
},
searchBarInput: {
  ...theme.typography.bodyMedium,
  color: theme.colors.onBackground,
},
chipRow: {
  gap: theme.spacing.space2,
  paddingVertical: theme.spacing.space1,
},
searchEmptyState: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: theme.spacing.space8,
  gap: theme.spacing.space3,
},
searchEmptyText: {
  ...theme.typography.bodyMedium,
  color: theme.colors.onSurface,
  textAlign: "center",
},
clearLink: {
  ...theme.typography.labelLarge,
  color: theme.colors.primary,
  textAlign: "center",
},
```

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Filtering items inside the store with an action
// DO: Derive filtered items via useMemo in the component — keep the store's items array as the full dataset.
// The store's searchQuery and categoryFilter are stored for potential cross-screen use,
// but the actual filtering computation happens at the view layer.

// ❌ WRONG: Not debouncing search input
searchBar.onChangeText = (text) => {
  useItemStore.getState().setSearchQuery(text);
};
// DO: Use local state + useDebounce + useEffect to batch updates at 300ms intervals.
// Updating the store on every keystroke causes unnecessary re-renders of the entire item list.

// ❌ WRONG: Fetching filtered items from Firestore on each search
const filtered = await fetchFilteredItems(userId, query);
// DO: Filter client-side. All items are already loaded in the store.
// Firestore queries would require composite indexes and add latency.

// ❌ WRONG: Creating separate component files for SearchEmptyState
// It's only used inside DashboardScreen — define inline in the same file.

// ❌ WRONG: Using FlatList for category chips
<FlatList horizontal data={categories} ... />
// DO: Use ScrollView for category chips. FlatList adds overhead for a small,
// non-virtualized horizontal list that rarely exceeds 10-15 items.

// ❌ WRONG: Hardcoding category values
const CATEGORIES = ["Electronics", "Clothing", "Furniture"];
// DO: Derive categories from the actual items in the store.
// Categories are dynamic — they come from whatever the user catalogs.

// ❌ WRONG: Not clearing search text when clearing search
onClearSearch={() => useItemStore.getState().setSearchQuery("")}
// DO: Also clear the local searchText state, or the Searchbar will still show the old text.

// ❌ WRONG: Keeping getItemLayout with filtered data
getItemLayout={(_, index) => ({
  length: ITEM_LIST_ROW_HEIGHT,
  offset: ITEM_LIST_ROW_HEIGHT * index,
  index,
})}
// DO: Remove getItemLayout when the data changes dynamically via filtering.
// getItemLayout assumes static data and will cause scroll position bugs.

// ❌ WRONG: Hardcoded styles
<Searchbar style={{ backgroundColor: '#1A1A22' }} />
// DO: Use theme.colors.surface from theme.ts.

// ❌ WRONG: Using React Context for filter state
const FilterContext = React.createContext(...);
// DO: Use useItemStore (Zustand) — the store already has searchQuery and categoryFilter.
```

---

### Dependency Check

**No new npm dependencies required.**

All needed packages are already installed:

- `react-native-paper` — `Searchbar`, `Chip`, `Snackbar`, `FAB`, `Text` already used in project
- `react-native` — `FlatList`, `ScrollView`, `View`, `StyleSheet` are core RN
- All theme constants and config values already available

---

### Previous Story Intelligence

**From Story 5.2 (Empty State & First-Run Experience) — Most Recent:**

1. **EmptyStateCard**: SVG illustration with "Your inventory starts here" headline, integrated as `ListEmptyComponent={EmptyStateCard}` in DashboardScreen. Must still be shown when items array is completely empty (no items at all, not just filtered to zero).

2. **Component barrel pattern**: New components added to `src/components/index.ts` as `export { default as ComponentName } from "./ComponentName"`.

3. **StyleSheet conventions**: All values from `theme.ts` — `theme.colors.*`, `theme.spacing.*`, `theme.typography.*`, `theme.borderRadius.*`. Zero hardcoded values.

**From Story 5.1 (Dashboard Item List):**

1. **DashboardScreen structure**: 273 lines with FlatList, skeleton loading (3×), pull-to-refresh, dual navigation hooks (`useRootStackNavigation` for Camera, `useDashboardNavigation` for ItemDetail).

2. **FlatList performance**: Currently uses `getItemLayout` for fixed-height optimization — this MUST be removed when filtering is added because the data size changes dynamically.

3. **Store interaction pattern**: `useItemStore.getState().setItems(...)` for calling store actions from async handlers. Selector pattern: `useItemStore((state) => state.items)`.

4. **Snackbar pattern**: Local state `[snackbarVisible, snackbarMessage]` with `SNACKBAR_DURATION_MS` from config.

5. **Code review feedback**: Fixed Safe Area handling, image URL optional chaining. Search bar should respect safe area via the existing `insets.top` padding on the FlatList's `contentContainerStyle`.

---

### Git Intelligence

Recent commits (from develop branch):

```
ad7ca49 (HEAD -> develop) Merge pull request #24 from AvishkaGihan/feat/5-2-empty-state
078e785 feat: implement empty state card and first run experience
feedf7 Merge pull request
8c52a57 feat: Add sprint status tracking and Epic 4 retrospective
e5002dd Merge pull request #22 from AvishkaGihan/feat/4-5-delete-item
```

**Codebase conventions from recent work:**

- Feature branches: `feat/{story-key}` (e.g., `feat/5-3-search-and-filter-items`)
- `StyleSheet.create` with all values from `theme.ts`
- `testID` and `accessibilityLabel` on all interactive elements
- React Native Paper components used consistently
- Default exports for component files, named exports for hooks/services
- `@/` path alias for all src imports
- `React.memo` on list item components

---

### Project Structure Notes

- New hook: `src/hooks/useDebounce.ts` — camelCase with `use` prefix, `.ts` extension ✓
- New component: `src/components/CategoryChip.tsx` — PascalCase, `.tsx` extension ✓
- Modified screen: `src/screens/DashboardScreen.tsx` — PascalCase, `.tsx` extension ✓
- Modified barrel: `src/components/index.ts` — add export ✓
- No new directories needed — all files placed in existing directories
- Architecture boundary maintained: filtering derived via `useMemo` in the view layer, store holds raw state values

### References

- Story 5.3 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.3, lines 555-572]
- FR23: "User can search items by title or category using a text search input" [Source: `epics.md`, line 41]
- FR24: "User can filter items by category" [Source: `epics.md`, line 42]
- UX Searchbar as permanent element: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Anti-patterns section, line 186: "Search must be permanently visible"]
- UX empty state patterns for search/filter: [Source: `ux-design-specification.md`, lines 705-713]
- UX CategoryChip component: [Source: `ux-design-specification.md`, line 527: "Chip — Category filter chips on Dashboard"]
- Architecture CategoryChip.tsx: [Source: `_bmad-output/planning-artifacts/architecture.md`, line 639]
- Architecture useDebounce.ts: [Source: `architecture.md`, line 666]
- Architecture useItemStore interface: [Source: `architecture.md`, lines 286-301 — searchQuery, categoryFilter]
- Theme tokens: [Source: `src/constants/theme.ts` — colors (primaryContainer #3A2E8A), spacing, borderRadius, typography]
- Config constants: [Source: `src/constants/config.ts` — SEARCH_DEBOUNCE_MS=300]
- Current DashboardScreen: [Source: `src/screens/DashboardScreen.tsx` — 273 lines]
- useItemStore: [Source: `src/stores/useItemStore.ts` — 103 lines, searchQuery/categoryFilter already defined]
- ItemCard component: [Source: `src/components/ItemCard.tsx` — 137 lines, ITEM_CARD_HEIGHT export]
- Previous story 5.2: [Source: `_bmad-output/implementation-artifacts/5-2-empty-state-and-first-run-experience.md`]
- Previous story 5.1: [Source: `_bmad-output/implementation-artifacts/5-1-dashboard-item-list.md`]
- Project context rules: [Source: `_bmad-output/project-context.md`]

## Senior Developer Review (AI)

**🔥 CODE REVIEW FINDINGS, Avish!**

**Issues Found:** 1 High, 2 Medium, 0 Low

### 🔴 HIGH ISSUES
- **Category Filter Logic Bug (`DashboardScreen.tsx`)**: `categories` list uses `item.category.trim()`, but `filteredItems` checks strict equality `item.category === categoryFilter` without trimming. Items with trailing spaces in their category will disappear when filtered. *[FIXED AUTOMATICALLY]*

### 🟡 MEDIUM ISSUES
- **UX Issue (`DashboardScreen.tsx`)**: Missing `keyboardShouldPersistTaps="handled"` on the `FlatList` and `ScrollView`. When the keyboard is open, tapping a category chip or an item requires two clicks (first to dismiss keyboard, second to trigger tap). *[FIXED AUTOMATICALLY]*
- **Performance Issue (`DashboardScreen.tsx`)**: `React.memo` on `CategoryChip` is defeated by passing an inline `onPress` function. This causes all category chips to re-render unnecessarily on every keystroke in the search bar. *[FIXED AUTOMATICALLY]*

All code review issues were automatically fixed.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Root typecheck: `npx tsc --noEmit`
- Functions typecheck: `cd functions && npx tsc --noEmit`
- Lint: `npm run lint`

### Completion Notes List

- Implemented `useDebounce` as a generic named hook with default `SEARCH_DEBOUNCE_MS` and timeout cleanup.
- Added `CategoryChip` memoized component with selected/unselected theme states and accessibility/test IDs.
- Updated Dashboard list flow to include Searchbar input, debounced store sync, dynamic category chips, combined search+category filtering, and contextual empty states with clear actions.
- Preserved pull-to-refresh and FAB behavior while switching list data source to filtered results.
- Removed `getItemLayout` to avoid incorrect row offsets when list data is filtered dynamically.
- Verified project and functions TypeScript checks pass and lint passes.

### File List

- src/hooks/useDebounce.ts
- src/components/CategoryChip.tsx
- src/screens/DashboardScreen.tsx
- src/components/index.ts
- \_bmad-output/implementation-artifacts/sprint-status.yaml
- \_bmad-output/implementation-artifacts/5-3-search-and-filter-items.md

## Change Log

- 2026-03-05: Code review completed. 1 High and 2 Medium issues were identified related to category whitespace filtering, missing keyboard taps, and inline callback memoization issues. All 3 issues were automatically fixed by AI review agent. Story marked as done.
- 2026-03-05: Implemented Story 5.3 search and category filtering on Dashboard, added debounce hook and category chip component, and completed typecheck/lint verification.
