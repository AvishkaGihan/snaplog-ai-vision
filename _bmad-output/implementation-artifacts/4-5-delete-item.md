# Story 4.5: Delete Item

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to delete an item I no longer need,
So that I can keep my inventory clean and accurate.

## Acceptance Criteria

**AC1 — Delete Confirmation Dialog:**

- **Given** the user is viewing an item on the ItemDetail screen
- **When** the user taps "Delete"
- **Then** a confirmation dialog appears with the title "Delete this item?" (FR31)
- **And** the dialog presents two options: "Delete" (destructive, error color) and "Cancel"
- **And** tapping "Cancel" dismisses the dialog with no changes
- **And** the dialog uses React Native Paper's `Portal` and `Dialog` components for consistency

**AC2 — Delete Item from Firestore:**

- **Given** the user taps "Delete" in the confirmation dialog
- **When** the deletion is confirmed
- **Then** the item document at `users/{userId}/items/{itemId}` is deleted from Firestore
- **And** the operation is wrapped in try/catch with a user-friendly error message on failure

**AC3 — Delete Associated Photo from Cloud Storage:**

- **Given** the user confirms deletion
- **When** the Firestore document is deleted
- **Then** the associated photo is deleted from Cloud Storage using the item's `imagePath` field
- **And** Cloud Storage deletion failure is logged but does NOT block the overall delete flow (fire-and-forget)

**AC4 — Remove Item from Zustand Store:**

- **Given** the Firestore document is successfully deleted
- **When** the deletion completes
- **Then** `useItemStore.getState().deleteItem(itemId)` is called to remove the item from local state
- **And** the Dashboard list no longer shows the deleted item

**AC5 — Navigate Back to Dashboard with Feedback:**

- **Given** the deletion completes successfully
- **When** the item is removed
- **Then** the user is navigated back to the Dashboard (not ItemDetail, since the item no longer exists)
- **And** a snackbar shows "Item deleted" for 3 seconds (`SNACKBAR_DURATION_MS`)
- **And** the deleted item is no longer visible in the list

**AC6 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (no functions changes, but verify no regression)

## Tasks / Subtasks

- [x] **Task 1: Add `deleteItem` function to `firestoreService.ts`** (AC: 2)
  - [x] Add `deleteItem(userId: string, itemId: string): Promise<void>` function
  - [x] Use Firestore `deleteDoc` / `doc` to delete the document at `users/{userId}/items/{itemId}`
  - [x] Add `deleteDoc` to the existing import from `firebase/firestore`
  - [x] Wrap in try/catch with user-friendly error message
  - [x] Export the function

- [x] **Task 2: Implement delete flow in `ItemDetailScreen.tsx`** (AC: 1, 2, 3, 4, 5)
  - [x] Add delete dialog state (`deleteDialogVisible: boolean`)
  - [x] Add `isDeleting` loading state to prevent double-taps
  - [x] Add "Delete" button with destructive text styling (error color) to the screen
  - [x] Add React Native Paper `Dialog` (inside `Portal`) with "Delete this item?" title, body text, Cancel and Delete actions
  - [x] Implement `handleDelete` function:
    1. Set `isDeleting` to true
    2. Get `userId` from `useAuthStore.getState().user?.uid`
    3. Call `firestoreService.deleteItem(userId, itemId)` to delete from Firestore
    4. Call `deleteItemImage(item.imagePath)` fire-and-forget (void, no await)
    5. Call `useItemStore.getState().deleteItem(itemId)` to remove from store
    6. Navigate to Dashboard using `navigation.navigate("ItemList")` or `navigation.popToTop()`
    7. Show "Item deleted" snackbar
  - [x] Add `testID` and `accessibilityLabel` on all interactive elements

- [x] **Task 3: Build verification** (AC: 6)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                                | Current State                                                                                                                                                                    | This Story's Action                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/services/firestoreService.ts`  | 51 lines — has `saveItem()` and `updateItem()` functions. Uses modular Firestore imports (`collection`, `doc`, `setDoc`, `Timestamp`, `updateDoc`).                              | **MODIFY** — add `deleteItem()` function               |
| `src/services/storageService.ts`    | 41 lines — has `uploadItemImage()` and `deleteItemImage(storagePath)`. The `deleteItemImage` function uses `deleteObject` and catches errors (logs warning instead of throwing). | **NO CHANGES** — reuse existing `deleteItemImage`      |
| `src/stores/useItemStore.ts`        | 103 lines — already has `deleteItem(id)` action that filters the item from the items array.                                                                                      | **NO CHANGES** — reuse existing `deleteItem` action    |
| `src/screens/ItemDetailScreen.tsx`  | 35 lines — **placeholder only** (just displays "Item Detail (ID: {itemId})" text). Already has route `ItemDetail: { itemId: string }`. Will be fully built in Epic 5.            | **MODIFY** — add delete button and confirmation dialog |
| `src/types/navigation.types.ts`     | Navigation types with `ItemDetail: { itemId: string }` in `DashboardStackParamList`. Has `useDashboardStackRoute` and `useDashboardNavigation` typed hooks.                      | **NO CHANGES**                                         |
| `src/navigation/DashboardStack.tsx` | Already registers `ItemDetail` screen: `<Stack.Screen name="ItemDetail" component={ItemDetailScreen} />`                                                                         | **NO CHANGES**                                         |
| `src/constants/theme.ts`            | Theme tokens including `colors.error` (#FF6B6B)                                                                                                                                  | **NO CHANGES**                                         |
| `src/constants/config.ts`           | App constants including `SNACKBAR_DURATION_MS = 3000`                                                                                                                            | **NO CHANGES**                                         |
| `src/types/item.types.ts`           | `ItemDocument` interface with `id`, `imagePath` (Cloud Storage path), and all other fields                                                                                       | **NO CHANGES**                                         |

#### What NEEDS TO BE MODIFIED

| File                               | Purpose                                                               |
| ---------------------------------- | --------------------------------------------------------------------- |
| `src/services/firestoreService.ts` | **MODIFY** — add `deleteItem(userId, itemId)` function                |
| `src/screens/ItemDetailScreen.tsx` | **MODIFY** — add delete button and confirmation dialog to placeholder |

---

### Key Implementation Details

#### `deleteItem` in `firestoreService.ts` (ADD TO EXISTING FILE)

```typescript
import { deleteDoc } from "firebase/firestore";

/**
 * Delete an item from Firestore.
 */
export async function deleteItem(
  userId: string,
  itemId: string,
): Promise<void> {
  try {
    const itemRef = doc(db, "users", userId, "items", itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to delete item from Firestore: ${message}`);
  }
}
```

> **⚠️ IMPORTANT**: Add `deleteDoc` to the existing import statement from `firebase/firestore`. The existing imports are `collection`, `doc`, `setDoc`, `Timestamp`, `updateDoc`. Do NOT import `doc` twice — it is already imported.

---

#### ItemDetailScreen Delete Flow (ADD TO EXISTING PLACEHOLDER)

**Context**: ItemDetailScreen is currently a placeholder (35 lines). This story adds delete functionality to it. The full ItemDetail view (displaying item fields, photo, edit button) will be built in Epic 5 (Story 5.4). For now, the screen should:

1. Look up the item from the Zustand store using the `itemId` route param
2. Display a minimal view showing the item title (or just the item ID as it does now)
3. Add a "Delete" button with destructive styling
4. Add a confirmation dialog

**Navigation pattern**: ItemDetailScreen is inside the DashboardStack. After deleting, navigate back to ItemList (Dashboard). Use `navigation.popToTop()` to return to the Dashboard since the current screen's item no longer exists — using `navigation.goBack()` would leave the user on a screen referencing a deleted item.

**Confirmation dialog pattern** (from UX spec — destructive actions require confirmation):

```typescript
import { Portal, Dialog, Button, Text, Snackbar } from "react-native-paper";
import { useItemStore } from "@/stores/useItemStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { deleteItem as deleteItemFromFirestore } from "@/services/firestoreService";
import { deleteItemImage } from "@/services/storageService";
import {
  useDashboardNavigation,
  useDashboardStackRoute,
} from "@/types/navigation.types";
import { SNACKBAR_DURATION_MS } from "@/constants/config";

// State
const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [snackbarVisible, setSnackbarVisible] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");

// Item lookup
const item = useItemStore((state) => state.items.find((i) => i.id === itemId));

// Handler
const handleDelete = useCallback(async () => {
  if (isDeleting || !item) return;
  setIsDeleting(true);
  setDeleteDialogVisible(false);

  try {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) {
      setSnackbarMessage("Please sign in to delete items");
      setSnackbarVisible(true);
      setIsDeleting(false);
      return;
    }

    // Delete from Firestore
    await deleteItemFromFirestore(userId, itemId);

    // Delete image from Cloud Storage (fire-and-forget)
    if (item.imagePath) {
      void deleteItemImage(item.imagePath);
    }

    // Remove from local store
    useItemStore.getState().deleteItem(itemId);

    // Navigate back to Dashboard
    navigation.popToTop();

    // Note: Snackbar will need to be shown on Dashboard after navigation.
    // Alternative: show snackbar briefly then navigate after timeout.
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete item";
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    setIsDeleting(false);
  }
}, [isDeleting, item, itemId, navigation]);
```

> **⚠️ SNACKBAR TIMING**: Since the user navigates away after deletion, the snackbar approach requires thought. Two options:
>
> 1. **Show snackbar then navigate** — `setSnackbarMessage("Item deleted"); setSnackbarVisible(true); setTimeout(() => navigation.popToTop(), 1500);` (same pattern as EditItemScreen)
> 2. **Navigate immediately** — show success via a brief visual, navigate instantly.
>    **Recommended approach**: Option 1 — show snackbar for 1.5s then navigate, consistent with EditItemScreen's save pattern.

---

#### Confirmation Dialog JSX Pattern

```tsx
<Portal>
  <Dialog
    visible={deleteDialogVisible}
    onDismiss={() => setDeleteDialogVisible(false)}
    style={{ backgroundColor: theme.colors.surface }}
    testID="delete-confirmation-dialog"
  >
    <Dialog.Title style={{ color: theme.colors.onBackground }}>
      Delete this item?
    </Dialog.Title>
    <Dialog.Content>
      <Text style={{ color: theme.colors.onSurface }}>
        This item and its photo will be permanently deleted. This action cannot
        be undone.
      </Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button
        onPress={() => setDeleteDialogVisible(false)}
        testID="delete-cancel-button"
        accessibilityLabel="Cancel deletion"
      >
        Cancel
      </Button>
      <Button
        onPress={handleDelete}
        textColor={theme.colors.error}
        loading={isDeleting}
        disabled={isDeleting}
        testID="delete-confirm-button"
        accessibilityLabel="Confirm delete item"
      >
        Delete
      </Button>
    </Dialog.Actions>
  </Dialog>
</Portal>;

{
  /* Delete button trigger */
}
<Button
  onPress={() => setDeleteDialogVisible(true)}
  textColor={theme.colors.error}
  mode="text"
  testID="delete-item-button"
  accessibilityLabel="Delete this item"
>
  Delete Item
</Button>;

{
  /* Snackbar */
}
<Snackbar
  visible={snackbarVisible}
  onDismiss={() => setSnackbarVisible(false)}
  duration={SNACKBAR_DURATION_MS}
  testID="delete-snackbar"
>
  {snackbarMessage}
</Snackbar>;
```

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Awaiting the Cloud Storage deletion (should be fire-and-forget)
await deleteItemImage(item.imagePath);
// Cloud Storage deletion failure should NOT block the user experience.
// DO: Use void prefix for fire-and-forget: void deleteItemImage(item.imagePath);

// ❌ WRONG: Using navigation.goBack() after deleting
navigation.goBack();
// If user came from Dashboard → ItemDetail, goBack works. But ItemDetail now has a
// deleted item. Use popToTop() to return to the dashboard cleanly.
// DO: navigation.popToTop() to return to ItemList (Dashboard)

// ❌ WRONG: No confirmation dialog for destructive action
// UX spec REQUIRES confirmation dialog for all destructive actions.
// DO: Show Dialog with "Delete this item?" before executing deletion.

// ❌ WRONG: Direct Firestore call from the screen component
import { deleteDoc, doc } from "firebase/firestore";
await deleteDoc(doc(db, ...));
// DO: Call firestoreService.deleteItem() — respect architecture boundary: UI → Services

// ❌ WRONG: Forgetting to remove item from Zustand store after Firestore delete
await deleteItemFromFirestore(userId, itemId);
navigation.popToTop();
// The item would still appear in the Dashboard list until a refresh!
// DO: Call useItemStore.getState().deleteItem(itemId) after Firestore deletion.

// ❌ WRONG: Using deleteItemImage without checking imagePath
void deleteItemImage(item.imagePath);
// imagePath could theoretically be empty/null for edge cases.
// DO: Guard with if (item.imagePath) { void deleteItemImage(item.imagePath); }

// ❌ WRONG: Hardcoded colors/spacing
const styles = StyleSheet.create({ button: { color: "#FF6B6B" } });
// DO: Use theme tokens: theme.colors.error, theme.spacing.space4, etc.

// ❌ WRONG: Not preventing double-tap during deletion
// DO: Use isDeleting state to disable the button and short-circuit handleDelete
```

---

### Previous Story Intelligence

**From Story 4.4 (Edit Existing Item):**

1. **Snackbar + delayed navigation pattern**: EditItemScreen shows "Item updated" snackbar, then uses `setTimeout(() => navigation.goBack(), 1500)` to let the snackbar display briefly before navigating. Apply the same pattern for delete: show "Item deleted" snackbar, then `setTimeout(() => navigation.popToTop(), 1500)`.

2. **Auth guard pattern**: `useAuthStore.getState().user?.uid` — check if userId is available before performing Firestore operations. Show error snackbar if not authenticated.

3. **Item lookup from store**: `useItemStore(state => state.items.find(i => i.id === itemId))` — handle the edge case where item might not be found (show error state, don't crash).

4. **`useCallback` with proper dependencies**: All handler functions use `useCallback` with explicit dependency arrays. Follow the same pattern for `handleDelete`.

5. **Store action pattern**: `useItemStore.getState().deleteItem(itemId)` — calling store actions from async handlers (outside React render context) uses `getState()`.

**From Story 4.3 (Discard Scan & Cancel Flow):**

1. **Fire-and-forget pattern**: Story 4.3 uses `void deleteItemImage(storagePath)` for cleanup calls that shouldn't block navigation. Apply the same pattern for Cloud Storage image deletion in the delete flow.

**From Story 4.2 (Confirm & Save Item to Cloud):**

1. **Haptic feedback**: Story 4.2 uses haptic feedback on confirm. For deletion, haptic feedback is NOT recommended — destructive actions should not feel "satisfying" in the same way. No haptic on delete.

---

### Git Intelligence

Recent commits show `develop` branch with stories through 4.4 completed. Codebase conventions:

- `useCallback` for all handler functions with proper dependency arrays
- `useAuthStore.getState().user?.uid` pattern for getting user ID outside of render
- `useItemStore.getState().deleteItem()` pattern for calling store actions from async handlers
- Modular Firebase imports (tree-shakeable)
- `testID` and `accessibilityLabel` on all interactive elements
- `StyleSheet.create` with all values from `theme.ts`
- `void` prefix for fire-and-forget async calls (`void deleteItemImage(...)`)

---

### Dependency Check

**No new dependencies required.**

All needed packages are already installed:

- `firebase/firestore` — `deleteDoc` already available in the Firebase JS SDK
- `react-native-paper` — `Portal`, `Dialog`, `Button`, `Text`, `Snackbar` already used in project
- `react-native-safe-area-context` — `useSafeAreaInsets` already available if needed
- `@/types/navigation.types` — `useDashboardStackRoute`, `useDashboardNavigation` already exist
- `@/stores/useItemStore` — `deleteItem(id)` action already exists
- `@/services/storageService` — `deleteItemImage(storagePath)` already exists

---

### Project Structure Notes

- No new files created — this story modifies 2 existing files
- `firestoreService.ts` gets a new `deleteItem` function alongside existing `saveItem` and `updateItem`
- `ItemDetailScreen.tsx` is enhanced from placeholder — adding delete button and confirmation dialog
- Architecture boundary rules are maintained: screen → firestoreService (import), screen → storageService (import for fire-and-forget image delete), screen → useItemStore (via hook/getState)
- Navigation remains unchanged — `ItemDetail` route and screen registration already exist in `DashboardStack.tsx`
- ItemDetailScreen remains a partial placeholder for Epic 5 — this story only adds the delete functionality, not the full detail view

### References

- Story 4.5 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.5 section]
- FR31: "User can delete a cataloged item, removing it from the database and deleting its associated photo from cloud storage"
- UX spec destructive action pattern: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Feedback Patterns table, line 670]
- UX spec button hierarchy: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Button Hierarchy table, line 654]
- UX spec flow optimization: "No confirmation dialogs for saves; only for destructive actions (delete)" [Source: line 512]
- ItemDocument interface: [Source: `src/types/item.types.ts`]
- useItemStore.deleteItem: [Source: `src/stores/useItemStore.ts` — lines 50-53]
- firestoreService existing pattern: [Source: `src/services/firestoreService.ts` — all 51 lines]
- storageService.deleteItemImage: [Source: `src/services/storageService.ts` — lines 33-40]
- DashboardStack ItemDetail route: [Source: `src/navigation/DashboardStack.tsx` — line 16]
- Navigation types ItemDetail params: [Source: `src/types/navigation.types.ts` — line 15]
- Current ItemDetailScreen placeholder: [Source: `src/screens/ItemDetailScreen.tsx` — 35 lines]
- Previous story 4.4: [Source: `_bmad-output/implementation-artifacts/4-4-edit-existing-item.md`]
- Architecture boundary rules: [Source: `_bmad-output/planning-artifacts/architecture.md` — UI → Stores → Services pattern]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npx tsc --noEmit` (repo root) ✅
- `npx tsc --noEmit` (`functions/`) ✅
- `npm run lint` ✅

### Completion Notes List

- Implemented `deleteItem(userId, itemId)` in Firestore service with modular `deleteDoc` usage and wrapped error handling.
- Replaced `ItemDetailScreen` placeholder with delete-focused flow: item lookup, destructive delete button, confirmation dialog (`Portal` + `Dialog`), and `isDeleting` guard.
- Implemented deletion sequence: auth guard → Firestore delete → fire-and-forget storage cleanup (`void deleteItemImage`) → Zustand store removal (`useItemStore.getState().deleteItem`) → snackbar feedback and dashboard navigation via `navigation.popToTop()`.
- Added `testID` and `accessibilityLabel` to interactive elements introduced in this story.
- No new dependencies were added.

### Change Log

- 2026-03-04: Implemented Story 4.5 delete item flow and completed build/lint verification.
- 2026-03-04: Fixed Snackbar unmount and early return issue during AI code review.

### File List

- `src/services/firestoreService.ts`
- `src/screens/ItemDetailScreen.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/4-5-delete-item.md`
