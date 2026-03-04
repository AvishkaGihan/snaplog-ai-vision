# Story 4.4: Edit Existing Item

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to edit a previously saved item's details,
So that I can correct mistakes or update information after initial cataloging.

## Acceptance Criteria

**AC1 — Edit Form Pre-populated with Current Values:**

- **Given** the user is viewing an item's full details on the ItemDetail screen
- **When** the user taps "Edit"
- **Then** the `EditItemScreen` opens with the same form layout as the ReviewFormScreen
- **And** all fields are pre-populated with the item's current values (title, category, color, condition, tags, notes)
- **And** the item photo is displayed at the top of the form (loaded from `imageUrl`)
- **And** all fields are tappable and editable inline (FR12)
- **And** the keyboard scrolls the form to keep the focused field visible
- **And** "Return" advances to the next field; the last field "Return" dismisses the keyboard
- **And** all interactive elements have `testID` and `accessibilityLabel` props

**AC2 — Save Updated Item to Firestore:**

- **Given** the user has modified fields on the EditItemScreen
- **When** the user taps "Save Changes" (full-width primary button)
- **Then** the Firestore document at `users/{userId}/items/{itemId}` is updated with the new field values
- **And** the `updatedAt` field is set to `Timestamp.now()` on save
- **And** the `createdAt` field is NOT changed
- **And** the `imageUrl`, `imagePath`, `aiGenerated`, and `syncStatus` fields are NOT changed
- **And** haptic feedback (medium intensity) fires on save tap
- **And** a snackbar shows "Item updated" for 3 seconds
- **And** the user returns to ItemDetail with the updated information visible

**AC3 — Zustand Store Reflects Changes:**

- **Given** the user saves changes on EditItemScreen
- **When** the Firestore update completes
- **Then** `useItemStore.getState().updateItem(id, updates)` is called with the updated fields
- **And** the ItemDetail screen shows the new values immediately on return
- **And** the Dashboard list reflects the changes when navigated back to

**AC4 — Form Validation:**

- **Given** the user is editing an item
- **When** the Title field is empty
- **Then** the "Save Changes" button is disabled
- **And** the user cannot submit the form

**AC5 — Cancel Edit (Back Navigation):**

- **Given** the user is on the EditItemScreen
- **When** the user taps the "Cancel" button or uses hardware back
- **Then** the user returns to the ItemDetail screen without saving changes
- **And** all original field values remain unchanged in Firestore and the store

**AC6 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (no functions changes, but verify no regression)

## Tasks / Subtasks

- [x] **Task 1: Add `updateItem` function to `firestoreService.ts`** (AC: 2)
  - [x] Add `updateItem(userId: string, itemId: string, updates: Partial<Omit<ItemDocument, "id">>): Promise<void>` function
  - [x] Use Firestore `updateDoc` / `doc` to update the document at `users/{userId}/items/{itemId}`
  - [x] Always include `updatedAt: Timestamp.now()` in the update
  - [x] Wrap in try/catch with user-friendly error message
  - [x] Export the function

- [x] **Task 2: Implement `EditItemScreen.tsx`** (AC: 1, 2, 3, 4, 5)
  - [x] Replace the placeholder with a full form screen modeled on `ReviewFormScreen.tsx`
  - [x] Read `itemId` from `route.params` via `useDashboardStackRoute<"EditItem">()`
  - [x] Look up the item from `useItemStore` using `itemId`
  - [x] Initialize form state (`useState`) from the item's current values
  - [x] Display the item photo at the top from `item.imageUrl`
  - [x] Render fields: Title, Category, Color, Condition, Tags, Notes (same layout as ReviewFormScreen)
  - [x] NO AI badges — editing a saved item does not show AI badges
  - [x] Title validation: "Save Changes" button disabled when title is empty
  - [x] Add keyboard-advancing behavior with refs (Return → next field)
  - [x] Implement `handleSave` that calls `updateItem` in firestoreService, then `useItemStore.getState().updateItem(id, updates)`
  - [x] Fire haptic feedback on save
  - [x] Show "Item updated" snackbar, then navigate back to ItemDetail
  - [x] Implement `handleCancel` that calls `navigation.goBack()` — no cleanup needed
  - [x] Add `testID` and `accessibilityLabel` on all interactive elements

- [x] **Task 3: Build verification** (AC: 6)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                                | Current State                                                                                                                                                                                                                                      | This Story's Action                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/screens/EditItemScreen.tsx`    | 31 lines — **placeholder only** (just displays "Edit Item" text in a centered View). Already exported and registered in `DashboardStack.tsx` and `src/screens/index.ts`. Route `EditItem: { itemId: string }` exists in `DashboardStackParamList`. | **REPLACE** — rewrite with full edit form                                                                               |
| `src/screens/ItemDetailScreen.tsx`  | 35 lines — **placeholder only** (just displays "Item Detail (ID: {itemId})" text). Already has route `ItemDetail: { itemId: string }`.                                                                                                             | **NO CHANGES** — will be implemented in Epic 5; edit button is NOT part of this story since ItemDetail is a placeholder |
| `src/screens/ReviewFormScreen.tsx`  | 414 lines — full form with Title, Category, Color, Condition, Tags, Notes fields. Uses `KeyboardAvoidingView`, `ScrollView`, field refs for keyboard advancing, `useSafeAreaInsets`, `AIFieldBadge`, snackbar.                                     | **NO CHANGES** — use as reference/pattern for EditItemScreen form layout                                                |
| `src/services/firestoreService.ts`  | 28 lines — only has `saveItem()` function. Uses modular Firestore imports (`collection`, `doc`, `setDoc`, `Timestamp`).                                                                                                                            | **MODIFY** — add `updateItem()` function                                                                                |
| `src/services/storageService.ts`    | 41 lines — has `uploadItemImage()` and `deleteItemImage()`.                                                                                                                                                                                        | **NO CHANGES** — image is not re-uploaded on edit                                                                       |
| `src/stores/useItemStore.ts`        | 103 lines — already has `updateItem(id, updates)` action that updates items array via immutable spread. Also has `deleteItem(id)`.                                                                                                                 | **NO CHANGES** — reuse existing `updateItem` action                                                                     |
| `src/types/navigation.types.ts`     | Navigation types with `EditItem: { itemId: string }` in `DashboardStackParamList`. Has `useDashboardStackRoute` typed hook.                                                                                                                        | **NO CHANGES**                                                                                                          |
| `src/navigation/DashboardStack.tsx` | Already registers `EditItem` screen: `<Stack.Screen name="EditItem" component={EditItemScreen} />`                                                                                                                                                 | **NO CHANGES**                                                                                                          |
| `src/constants/theme.ts`            | Theme tokens                                                                                                                                                                                                                                       | **NO CHANGES**                                                                                                          |
| `src/constants/config.ts`           | App constants including `SNACKBAR_DURATION_MS`                                                                                                                                                                                                     | **NO CHANGES**                                                                                                          |
| `src/types/item.types.ts`           | `ItemDocument` interface with all fields (id, title, category, color, condition, tags, notes, imageUrl, imagePath, aiGenerated, syncStatus, createdAt, updatedAt)                                                                                  | **NO CHANGES**                                                                                                          |

#### What NEEDS TO BE MODIFIED

| File                               | Purpose                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| `src/services/firestoreService.ts` | **MODIFY** — add `updateItem(userId, itemId, updates)` function |
| `src/screens/EditItemScreen.tsx`   | **REPLACE** — rewrite placeholder with full edit form screen    |

---

### Key Implementation Details

#### `updateItem` in `firestoreService.ts` (ADD TO EXISTING FILE)

```typescript
import { doc, updateDoc, Timestamp } from "firebase/firestore";

/**
 * Update an existing item in Firestore.
 * Always sets updatedAt to the current time.
 */
export async function updateItem(
  userId: string,
  itemId: string,
  updates: Partial<Omit<ItemDocument, "id">>,
): Promise<void> {
  try {
    const itemRef = doc(db, "users", userId, "items", itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to update item in Firestore: ${message}`);
  }
}
```

> **⚠️ IMPORTANT**: Import `updateDoc` from `firebase/firestore` — this is a new import not currently in `firestoreService.ts`. The existing imports are `collection`, `doc`, `setDoc`, `Timestamp`. Add `updateDoc` to the existing import statement. Do NOT import `doc` twice — it is already imported.

---

#### EditItemScreen (REPLACE EXISTING PLACEHOLDER)

**Navigation pattern**: EditItemScreen is inside the DashboardStack (not a modal), so it uses `useDashboardStackRoute<"EditItem">()` and `useDashboardNavigation()` for back navigation. Use `navigation.goBack()` to return to ItemDetail — this is correct because EditItem is inside the Dashboard stack, not a modal.

**Form layout**: Copy the form field layout from `ReviewFormScreen.tsx` (lines 194–328) — same fields, same styling, same keyboard advancing pattern. Key differences from ReviewFormScreen:

1. **No AI badges** — editing existing items does not show AI badges (remove `AIFieldBadge` usage)
2. **Image from URL** — use `item.imageUrl` instead of a local file URI, with the `Image` component's `source={{ uri: item.imageUrl }}`
3. **Tags** — `item.tags` is a `string[]` array, so initialize the tags `useState` with `item.tags.join(", ")` to display as comma-separated text
4. **Condition** — `item.condition` is typed as `"Excellent" | "Good" | "Fair" | "Poor"`, use it directly as initial value
5. **Save handler** — calls `updateItem()` + `useItemStore.getState().updateItem()` instead of `saveItem()` + `addItem()`
6. **Navigation** — `navigation.goBack()` returns to ItemDetail (not reset to Dashboard)
7. **No discard cleanup** — cancel just navigates back, no file/storage cleanup needed

**Item lookup from store**: Use `useItemStore(state => state.items.find(i => i.id === itemId))` to get the item. Handle the edge case where item might not be found (show error state).

```typescript
import {
  useDashboardStackRoute,
  useDashboardNavigation,
} from "@/types/navigation.types";

const route = useDashboardStackRoute<"EditItem">();
const navigation = useDashboardNavigation();
const { itemId } = route.params;
const item = useItemStore((state) => state.items.find((i) => i.id === itemId));
```

**handleSave implementation pattern:**

```typescript
const handleSave = useCallback(async () => {
  if (!isFormValid || isSaving) return;
  setIsSaving(true);

  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userId = useAuthStore.getState().user?.uid;
    if (!userId) {
      setSnackbarMessage("Please sign in to save changes");
      setSnackbarVisible(true);
      setIsSaving(false);
      return;
    }

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updates: Partial<Omit<ItemDocument, "id">> = {
      title: title.trim(),
      category: category.trim(),
      color: color.trim(),
      condition: (condition.trim() || "Good") as ItemDocument["condition"],
      tags: parsedTags,
      notes: notes.trim(),
    };

    await updateItem(userId, itemId, updates);
    useItemStore.getState().updateItem(itemId, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    setSnackbarMessage("Item updated");
    setSnackbarVisible(true);

    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update item";
    setSnackbarMessage(message);
    setSnackbarVisible(true);
    setIsSaving(false);
  }
}, [
  isFormValid,
  isSaving,
  title,
  category,
  color,
  condition,
  tags,
  notes,
  itemId,
  navigation,
]);
```

> **⚠️ IMPORTANT**: The `updateItem` for Firestore returns `Promise<void>` (no return value). The store's `updateItem` is synchronous. Include `updatedAt: Timestamp.now()` in the store update so the UI reflects the new timestamp immediately.

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Importing from RootStack navigation types
import { useRootStackNavigation, useRootStackRoute } from "@/types/navigation.types";
// EditItemScreen is inside DashboardStack, NOT the root modal stack.
// DO: Use Dashboard-scoped navigation:
import { useDashboardNavigation, useDashboardStackRoute } from "@/types/navigation.types";

// ❌ WRONG: Using navigation.reset() to go back from edit
navigation.reset({ index: 0, routes: [{ name: "Main" }] });
// EditItem is a normal stack screen, not a modal.
// DO: Use navigation.goBack() to return to ItemDetail

// ❌ WRONG: Re-uploading the image on edit
const result = await uploadItemImage(imageUri, userId);
// Image doesn't change when editing text fields. The photo stays the same.
// DO: Never touch storageService in the edit flow.

// ❌ WRONG: Overwriting createdAt, syncStatus, aiGenerated, imageUrl, imagePath
const updates = { title, category, color, condition, tags, notes, createdAt: Timestamp.now() };
// DO: Only send user-editable fields (title, category, color, condition, tags, notes).
// updatedAt is handled by the updateItem function itself.

// ❌ WRONG: Hardcoded colors/spacing
const styles = StyleSheet.create({ input: { backgroundColor: "#1A1A22" } });
// DO: Use theme tokens: theme.colors.surface, theme.spacing.space4, etc.

// ❌ WRONG: Direct Firestore call from the screen component
import { doc, updateDoc } from "firebase/firestore";
await updateDoc(doc(db, ...));
// DO: Call firestoreService.updateItem() — respect architecture boundary: UI → Stores → Services

// ❌ WRONG: Creating AIFieldBadge in EditItemScreen
<AIFieldBadge testID="ai-badge-title" />
// Editing an existing item does NOT show AI badges. AI badges only appear on ReviewFormScreen
// when showing freshly AI-analyzed fields.

// ❌ WRONG: Forgetting to handle the case where item is not found in store
const item = useItemStore(state => state.items.find(i => i.id === itemId));
// item could be undefined if navigated with stale ID. Show error state, don't crash.
```

---

### Previous Story Intelligence

**From Story 4.3 (Discard Scan & Cancel Flow):**

1. **`navigation.goBack()` vs `navigation.reset()`**: Story 4.3 uses `navigation.reset()` from ReviewFormScreen (modal) to skip the Camera screen and go to Dashboard. EditItemScreen does NOT need this — it's inside the Dashboard stack, so `navigation.goBack()` correctly returns to ItemDetail.

2. **`beforeRemove` listener pattern**: Story 4.3 added `beforeRemove` listeners in CameraScreen and ReviewFormScreen for cleanup. EditItemScreen does NOT need this — there are no resources to clean up on back navigation.

3. **Fire-and-forget pattern (`void`)**: Used for cleanup calls that shouldn't block navigation. Not needed for EditItemScreen since there is no cleanup.

**From Story 4.2 (Confirm & Save Item to Cloud):**

1. **`saveItem` function pattern**: `firestoreService.saveItem(userId, itemData)` creates a new document. The new `updateItem` function should follow the same error handling pattern (try/catch, throw with descriptive message).

2. **Snackbar timing**: Navigating immediately after save hides the snackbar. Story 4.2 uses `setTimeout(() => { navigation.reset(...) }, 1500)` to let the snackbar show briefly. Apply the same pattern: `setTimeout(() => { navigation.goBack() }, 1500)`.

3. **Haptic feedback**: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)` fires on confirm tap. Do the same for save in EditItemScreen.

**From Story 4.1 (Review Form Screen):**

1. **Form field pattern**: Title, Category, Color, Condition, Tags, Notes — each in a `View` with a label row above the `TextInput`. Use `ref` chaining for keyboard navigation.

2. **`isFormValid`**: `title.trim().length > 0` is the only validation check. Apply same for EditItemScreen.

3. **Style sheet reuse**: The form styles in ReviewFormScreen are defined locally. EditItemScreen should define its own styles following the same pattern from `theme.ts` tokens.

---

### Git Intelligence

Recent commits show `develop` branch with stories through 4.3 completed. Codebase conventions:

- `useCallback` for all handler functions with proper dependency arrays
- `useAuthStore.getState().user?.uid` pattern for getting user ID outside of render
- `useItemStore.getState().updateItem()` pattern for calling store actions from async handlers
- Modular Firebase imports (tree-shakeable)
- `testID` and `accessibilityLabel` on all interactive elements
- `StyleSheet.create` with all values from `theme.ts`

---

### Dependency Check

**No new dependencies required.**

All needed packages are already installed:

- `firebase/firestore` — `updateDoc` already available in the Firebase JS SDK
- `expo-haptics` — already used in ReviewFormScreen
- `react-native-paper` — `TextInput`, `Button`, `Snackbar`, `Text` already used
- `react-native-safe-area-context` — `useSafeAreaInsets` already used
- `@/types/navigation.types` — `useDashboardStackRoute`, `useDashboardNavigation` already exist

---

### Project Structure Notes

- No new files created — this story modifies 2 existing files
- `EditItemScreen.tsx` is rewritten from placeholder to full implementation, staying in `src/screens/`
- `firestoreService.ts` gets a new `updateItem` function alongside existing `saveItem`
- Architecture boundary rules are maintained: screen → firestoreService (via import), screen → useItemStore (via hook)
- Navigation remains unchanged — `EditItem` route and screen registration already exist in `DashboardStack.tsx`

### References

- Story 4.4 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.4 section]
- FR12: "User can edit any AI-generated field before saving"
- ItemDocument interface: [Source: `src/types/item.types.ts` — lines 3-17]
- useItemStore.updateItem: [Source: `src/stores/useItemStore.ts` — lines 43-48]
- useItemStore.deleteItem: [Source: `src/stores/useItemStore.ts` — lines 50-53]
- firestoreService.saveItem pattern: [Source: `src/services/firestoreService.ts` — lines 6-27]
- ReviewFormScreen form layout: [Source: `src/screens/ReviewFormScreen.tsx` — lines 194-328]
- ReviewFormScreen handleConfirmSave: [Source: `src/screens/ReviewFormScreen.tsx` — lines 95-166]
- DashboardStack EditItem route: [Source: `src/navigation/DashboardStack.tsx` — line 17]
- Navigation types EditItem params: [Source: `src/types/navigation.types.ts` — line 16]
- Current EditItemScreen placeholder: [Source: `src/screens/EditItemScreen.tsx` — 31 lines]
- Current ItemDetailScreen placeholder: [Source: `src/screens/ItemDetailScreen.tsx` — 35 lines]
- Architecture boundary rules: [Source: `_bmad-output/planning-artifacts/architecture.md` — UI → Stores → Services pattern]
- Previous story 4.3: [Source: `_bmad-output/implementation-artifacts/4-3-discard-scan-and-cancel-flow.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npx tsc --noEmit` (root) — pass
- `cd functions && npx tsc --noEmit` — pass
- `npm run lint` — pass

### Completion Notes List

- Implemented `updateItem(userId, itemId, updates)` in Firestore service using `updateDoc` and forced `updatedAt: Timestamp.now()`.
- Replaced `EditItemScreen` placeholder with a full editable form pre-populated from Zustand item data.
- Implemented save flow with medium haptic feedback, Firestore update, local store update, snackbar feedback, and `navigation.goBack()`.
- Added title-required validation (`Save Changes` disabled when title is empty).
- Added keyboard next/done behavior via input refs and dismiss on last field.
- Added `testID` and `accessibilityLabel` across interactive elements.
- Added safe fallback UI when the requested item is missing from store.

### File List

- `src/services/firestoreService.ts`
- `src/screens/EditItemScreen.tsx`

## Change Log

- 2026-03-04: Implemented Story 4.4 edit flow, Firestore update service, validation/accessibility updates, and completed build verification.
- 2026-03-04: Senior Developer Review (AI) - Passed with fixes for UX/Performance issues applied.

