# Story 4.1: Review Form Screen

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see a clean, editable form with all item fields after scanning,
So that I can review AI suggestions and make corrections before saving.

## Acceptance Criteria

**AC1 — Form Fields Display:**

- **Given** the AI analysis has completed (or manual entry was selected)
- **When** the Review Form screen is displayed
- **Then** the form shows one field per row: Title, Category, Color, Condition, Tags, Notes
- **And** each field has a visible label above the input (not placeholder-only)
- **And** AI-populated fields show the `AIFieldBadge` sparkle icon at the label trailing position
- **And** fields without AI data (Tags, Notes always; all fields in manual entry) do NOT show the `AIFieldBadge`

**AC2 — Inline Editing:**

- **Given** the form is displayed with fields (AI-populated or blank)
- **When** the user taps any field
- **Then** the field is editable inline (FR12)
- **And** the user can modify AI-generated values freely
- **And** the Tags field accepts comma-separated text input
- **And** the Notes field supports multi-line text entry

**AC3 — Item Photo Context:**

- **Given** the Review Form screen is displayed
- **When** the screen loads
- **Then** the captured item photo is displayed at the top of the form as context
- **And** the photo uses the `imageUri` passed via navigation params
- **And** the photo has rounded corners (12dp card radius) and appropriate height

**AC4 — Keyboard Scroll Behavior:**

- **Given** the user taps a field to edit
- **When** the keyboard opens
- **Then** the form scrolls to keep the focused field visible above the keyboard
- **And** the scroll behavior is handled by `KeyboardAvoidingView` or equivalent pattern
- **And** no field is ever hidden behind the keyboard

**AC5 — Return Key Advancement:**

- **Given** the user is editing a single-line field (Title, Category, Color, Condition, Tags)
- **When** the user presses the "Return" key
- **Then** focus advances to the next field in order
- **And** on the last single-line field (Tags), "Return" moves focus to Notes
- **And** in the Notes field (multi-line), "Return" inserts a newline (does NOT dismiss keyboard)
- **And** only the last field's "Done" action dismisses the keyboard

**AC6 — Accessibility & Testing:**

- **Given** the complete implementation
- **When** accessibility audit is performed
- **Then** all interactive elements have `testID` props for automated testing
- **And** all interactive and semantic elements have `accessibilityLabel` props
- **And** the form screen itself has an `accessibilityLabel`
- **And** all touch targets are at minimum 44×44dp (MIN_TOUCH_TARGET from config)

**AC7 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (no functions changes, but verify no regression)

## Tasks / Subtasks

- [x] **Task 1: Add Tags and Notes fields to ReviewFormScreen** (AC: 1, 2)
  - [x] Add `tags` state (`useState<string>('')`) — stored as comma-separated string, parsed to array on save (Story 4.2)
  - [x] Add `notes` state (`useState<string>('')`)
  - [x] Add Tags field with label, `TextInput` (single-line, `mode="outlined"`), no AI badge (Tags are never AI-generated)
  - [x] Add Notes field with label, `TextInput` (`multiline`, `numberOfLines={4}`, `mode="outlined"`), no AI badge (Notes are never AI-generated)
  - [x] Ensure aiFieldMap does NOT include tags or notes (they are always user-entered)

- [x] **Task 2: Implement keyboard scroll behavior** (AC: 4)
  - [x] Wrap the form in `KeyboardAvoidingView` with `behavior="padding"` on iOS (`Platform.OS === 'ios'`)
  - [x] Ensure `ScrollView` works with `KeyboardAvoidingView` to scroll focused field into view
  - [x] Import `Platform`, `KeyboardAvoidingView` from `react-native`

- [x] **Task 3: Implement Return key field advancement** (AC: 5)
  - [x] Create `useRef` for each TextInput: `titleRef`, `categoryRef`, `colorRef`, `conditionRef`, `tagsRef`, `notesRef`
  - [x] Set `returnKeyType="next"` on all single-line fields (Title through Tags)
  - [x] Set `returnKeyType="default"` on Notes (multi-line)
  - [x] Set `blurOnSubmit={false}` on all fields except Notes
  - [x] Wire `onSubmitEditing` on each field to `.focus()` the next ref
  - [x] On Tags `onSubmitEditing`, focus `notesRef`
  - [x] Notes uses `blurOnSubmit={true}` or default behavior — Return inserts newline, Done/blur dismisses

- [x] **Task 4: Accessibility and testID audit** (AC: 6)
  - [x] Ensure all new fields (Tags, Notes) have `testID` and `accessibilityLabel`
  - [x] Verify existing fields have `testID` and `accessibilityLabel` (they already do from Story 3.3)
  - [x] Add `accessibilityLabel` to the Tags and Notes label `Text` components
  - [x] Ensure all buttons have `contentStyle={{ minHeight: 44 }}` for MIN_TOUCH_TARGET

- [x] **Task 5: Build verification** (AC: 7)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

The following files exist from Stories 1.x–3.4 and earlier epics. Most are **unchanged** in this story:

| File                                    | Current State                                                                                                    | This Story's Action                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/screens/ReviewFormScreen.tsx`      | 182 lines — has Title, Category, Color, Condition fields with AIFieldBadge; Back button; disabled Confirm & Save | **MODIFY** — add Tags + Notes fields, keyboard handling, return-key advancement |
| `src/screens/CameraScreen.tsx`          | 887 lines — complete camera + gallery + AI flow with error handling and manual entry fallback                    | **NO CHANGES**                                                                  |
| `src/services/aiService.ts`             | Complete — calls `analyzeItem` Cloud Function, returns `{ success, data, error }`                                | **NO CHANGES**                                                                  |
| `src/services/storageService.ts`        | Complete — `uploadItemImage(localUri, userId)` returns `{ downloadUrl, storagePath }`                            | **NO CHANGES**                                                                  |
| `src/services/imageService.ts`          | Complete — `compressImage()` returns `{ uri, width, height, size }`                                              | **NO CHANGES**                                                                  |
| `src/services/firebaseConfig.ts`        | Complete — exports `app`, `auth`, `db`, `storage`, `functions`                                                   | **NO CHANGES**                                                                  |
| `src/components/ScanLoadingOverlay.tsx` | Complete — overlay with ring animation, cycling copy, timeout                                                    | **NO CHANGES**                                                                  |
| `src/components/AIFieldBadge.tsx`       | Complete — sparkle icon badge in aiAccent (#64DFDF)                                                              | **NO CHANGES**                                                                  |
| `src/components/index.ts`               | Exports: `PermissionCard`, `ScanLoadingOverlay`, `AIFieldBadge`                                                  | **NO CHANGES**                                                                  |
| `src/types/navigation.types.ts`         | `ReviewForm: { imageUri, aiResult?, storagePath?, downloadUrl? }`                                                | **NO CHANGES** — params are sufficient                                          |
| `src/types/item.types.ts`               | `ItemDocument` with id, title, category, color, condition, tags, notes, imageUrl, etc.                           | **NO CHANGES** — already has `tags: string[]` and `notes: string`               |
| `src/types/api.types.ts`                | `AnalyzeItemResponseData` has title, category, color, condition                                                  | **NO CHANGES** — AI does NOT return tags/notes                                  |
| `src/constants/config.ts`               | All constants: `MIN_TOUCH_TARGET=44`, `SNACKBAR_DURATION_MS=3000`, etc.                                          | **NO CHANGES**                                                                  |
| `src/constants/theme.ts`                | Full MD3 dark theme with colors, spacing, typography, borderRadius, semanticColors                               | **NO CHANGES**                                                                  |
| `src/stores/useAuthStore.ts`            | Auth state with `user`                                                                                           | **NO CHANGES**                                                                  |
| `src/stores/useItemStore.ts`            | Item and draft state management                                                                                  | **NO CHANGES**                                                                  |

#### What NEEDS TO BE MODIFIED

| File                               | Purpose                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| `src/screens/ReviewFormScreen.tsx` | **MODIFY** — add Tags/Notes, keyboard handling, Return-key advancement, accessibility |

---

### Key Implementation Details

#### Current ReviewFormScreen Structure (Pre-Modification)

The current `ReviewFormScreen.tsx` (182 lines) has this structure:

```typescript
// Imports: React, Image, ScrollView, StyleSheet, View, Button, Text, TextInput
// From @/components: AIFieldBadge
// From @/constants/theme: theme
// From @/types/navigation.types: useRootStackNavigation, useRootStackRoute

export default function ReviewFormScreen() {
  // Navigation & route params
  const { imageUri, aiResult } = route.params;

  // State: title, category, color, condition (initialized from aiResult or '')
  const [title, setTitle] = useState(aiResult?.title ?? "");
  const [category, setCategory] = useState(aiResult?.category ?? "");
  const [color, setColor] = useState(aiResult?.color ?? "");
  const [condition, setCondition] = useState(aiResult?.condition ?? "");

  // aiFieldMap: tracks which fields were AI-populated (for AIFieldBadge)
  const aiFieldMap = useMemo(
    () => ({
      title: Boolean(aiResult?.title),
      category: Boolean(aiResult?.category),
      color: Boolean(aiResult?.color),
      condition: Boolean(aiResult?.condition),
    }),
    [aiResult],
  );

  // handleBack: navigation.goBack()

  // JSX: ScrollView > Image > [fieldContainer × 4] > Confirm & Save (disabled) > Back
}
```

**What's missing for Story 4.1:**

1. **Tags field** — not present; `ItemDocument.tags` is `string[]` but AI doesn't return tags
2. **Notes field** — not present; `ItemDocument.notes` is `string` but AI doesn't return notes
3. **KeyboardAvoidingView** — not wrapped; keyboard may hide lower fields
4. **Return-key advancement** — no refs, no `onSubmitEditing`, no `returnKeyType`
5. **Platform import** — needed for KeyboardAvoidingView behavior

---

#### Target ReviewFormScreen (Post-Modification)

**New imports to add:**

```typescript
import { useRef } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import type { TextInput as RNTextInput } from "react-native";
```

> **⚠️ IMPORTANT**: Import `TextInput` as type from `react-native` for ref typing, but use `TextInput` from `react-native-paper` for rendering. The paper `TextInput` forwards refs via `React.forwardRef`, so you can use `React.useRef<RNTextInput>(null)` for the refs.

**New state to add:**

```typescript
const [tags, setTags] = useState(""); // Comma-separated string
const [notes, setNotes] = useState("");
```

**New refs to add:**

```typescript
const titleRef = useRef<RNTextInput>(null);
const categoryRef = useRef<RNTextInput>(null);
const colorRef = useRef<RNTextInput>(null);
const conditionRef = useRef<RNTextInput>(null);
const tagsRef = useRef<RNTextInput>(null);
const notesRef = useRef<RNTextInput>(null);
```

**Modified JSX structure:**

```tsx
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : undefined}
  keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
>
  <ScrollView
    style={[styles.screen, { paddingTop: insets.top }]}
    contentContainerStyle={[
      styles.contentContainer,
      { paddingBottom: insets.bottom + theme.spacing.space4 },
    ]}
    keyboardShouldPersistTaps="handled"
    testID="review-form-screen"
    accessibilityLabel="Review Form Screen"
  >
    {/* Image at top */}
    {/* Title field with ref, returnKeyType="next", onSubmitEditing -> categoryRef */}
    {/* Category field with ref, returnKeyType="next", onSubmitEditing -> colorRef */}
    {/* Color field with ref, returnKeyType="next", onSubmitEditing -> conditionRef */}
    {/* Condition field with ref, returnKeyType="next", onSubmitEditing -> tagsRef */}
    {/* Tags field (NEW) with ref, returnKeyType="next", onSubmitEditing -> notesRef */}
    {/* Notes field (NEW) with ref, multiline, returnKeyType="default" */}
    {/* Confirm & Save button (still disabled — implemented in Story 4.2) */}
    {/* Back button */}
  </ScrollView>
</KeyboardAvoidingView>
```

**Each field pattern (example: Title):**

```tsx
<View style={styles.fieldContainer}>
  <View style={styles.labelRow}>
    <Text style={styles.label}>Title</Text>
    {aiFieldMap.title ? <AIFieldBadge testID="ai-badge-title" /> : null}
  </View>
  <TextInput
    ref={titleRef}
    value={title}
    onChangeText={setTitle}
    mode="outlined"
    style={styles.input}
    returnKeyType="next"
    blurOnSubmit={false}
    onSubmitEditing={() => categoryRef.current?.focus()}
    testID="review-form-title-input"
    accessibilityLabel="Title"
  />
</View>
```

**Tags field (NEW):**

```tsx
<View style={styles.fieldContainer}>
  <View style={styles.labelRow}>
    <Text style={styles.label}>Tags</Text>
    {/* No AIFieldBadge — tags are never AI-generated */}
  </View>
  <TextInput
    ref={tagsRef}
    value={tags}
    onChangeText={setTags}
    mode="outlined"
    style={styles.input}
    placeholder="e.g. vintage, leather, designer"
    returnKeyType="next"
    blurOnSubmit={false}
    onSubmitEditing={() => notesRef.current?.focus()}
    testID="review-form-tags-input"
    accessibilityLabel="Tags, comma separated"
  />
</View>
```

**Notes field (NEW):**

```tsx
<View style={styles.fieldContainer}>
  <View style={styles.labelRow}>
    <Text style={styles.label}>Notes</Text>
    {/* No AIFieldBadge — notes are never AI-generated */}
  </View>
  <TextInput
    ref={notesRef}
    value={notes}
    onChangeText={setNotes}
    mode="outlined"
    style={[styles.input, styles.notesInput]}
    placeholder="Additional details about this item..."
    multiline
    numberOfLines={4}
    returnKeyType="default"
    testID="review-form-notes-input"
    accessibilityLabel="Notes"
  />
</View>
```

**New style to add:**

```typescript
notesInput: {
  minHeight: 100,
  textAlignVertical: 'top',
},
```

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Using useState for tags as an array directly
const [tags, setTags] = useState<string[]>([]);
// DO: Store as string, parse to array on save in Story 4.2

// ❌ WRONG: Hardcoding colors or spacing
style={{ backgroundColor: '#1A1A22', padding: 16 }}
// DO: Use theme.colors.surface, theme.spacing.space4

// ❌ WRONG: Forgetting KeyboardAvoidingView
<ScrollView>...</ScrollView>
// DO: Wrap in KeyboardAvoidingView for iOS

// ❌ WRONG: Creating a new service or store for form state
// Form state is local (useState) — not global (Zustand). This is correct
// per the architecture: "never useState for GLOBAL state" — form state is local/screen-level

// ❌ WRONG: Adding Tags/Notes to aiFieldMap
aiFieldMap: { tags: false, notes: false }  // Unnecessary — just don't render AIFieldBadge

// ❌ WRONG: Implementing save logic in this story
// "Confirm & Save" button remains disabled — save is Story 4.2

// ❌ WRONG: Using placeholder-only labels
<TextInput placeholder="Title" />  // DON'T — must have visible label above input

// ❌ WRONG: Missing blurOnSubmit={false} on single-line fields
// Without this, keyboard dismisses on Return instead of advancing

// ✅ CORRECT: Using refs for field advancement
onSubmitEditing={() => categoryRef.current?.focus()}

// ✅ CORRECT: keyboardShouldPersistTaps="handled" on ScrollView
// Allows tapping outside inputs to dismiss keyboard while still handling button taps
```

---

### Previous Story Intelligence

**From Story 3.4 (AI Failure Handling & Manual Entry Fallback):**

1. **Manual entry already works** — When `aiResult` is `undefined`, all fields show blank and no `AIFieldBadge` appears. This was verified. The form is identical for AI-populated and manual entry — only difference is pre-filled values and badges.

2. **Navigation params are stable** — `ReviewForm: { imageUri, aiResult?, storagePath?, downloadUrl? }`. No changes needed. The `storagePath` and `downloadUrl` are passed through for Story 4.2 (save).

3. **CameraScreen handles all navigation** — both AI success and manual entry paths correctly navigate to ReviewFormScreen with appropriate params.

4. **Error state with CTAs is complete** — "Try Again" and "Fill Manually" work correctly from CameraScreen.

**From Story 3.3 (AI Service Client & Loading Experience):**

1. **AIFieldBadge component exists** — imported from `@/components`, shows sparkle icon in `semanticColors.aiAccent` (#64DFDF). Used for title, category, color, condition when AI-populated.

2. **ReviewFormScreen was initially created** — with 4 fields (Title, Category, Color, Condition) and disabled Confirm & Save. This story extends it with Tags, Notes, keyboard handling, and Return-key advancement.

3. **Image display pattern** — The photo is already shown at the top with `Image` component, `resizeMode="cover"`, `borderRadius: theme.borderRadius.cards`.

**From Story 3.2 / 3.1 (Cloud Function):**

1. **AI only returns 4 fields** — `{ title, category, color, condition }` in `AnalyzeItemResponseData`. Tags and Notes are always user-entered. This is by design — AI categorizes, user annotates.

---

### Git Intelligence

Recent commits are on the `develop` branch, with completed work on stories 3.1–3.4. The codebase uses:

- Consistent `import { theme } from '@/constants/theme'` pattern
- `StyleSheet.create` with theme tokens everywhere
- `testID` and `accessibilityLabel` on all interactive elements
- `react-native-paper` components (`TextInput`, `Button`, `Text`, `Snackbar`, `IconButton`)

---

### Dependency Check

**No new dependencies needed.** Everything required is already installed:

- `react-native-paper` — `TextInput`, `Button`, `Text` (already used in ReviewFormScreen)
- `@/components` — `AIFieldBadge` (already imported)
- `@/constants/theme` — theme tokens (already imported)
- `react-native` — `KeyboardAvoidingView`, `Platform` (add to existing import)
- `react-native-safe-area-context` — `useSafeAreaInsets` (already imported)

**New imports to add in ReviewFormScreen:**

```typescript
import { useRef } from "react"; // Add to existing React import
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"; // Add KeyboardAvoidingView, Platform to existing import
import type { TextInput as RNTextInput } from "react-native"; // For ref typing
```

---

### Project Structure Notes

- All changes are confined to `src/screens/ReviewFormScreen.tsx` — a single file modification
- Form state (title, category, color, condition, tags, notes) uses `useState` — this is correct per architecture rules (local/screen-level state, NOT global state)
- Tags are entered as comma-separated text in this story; parsing to `string[]` for Firestore happens in Story 4.2 (Confirm & Save)
- Notes field uses multi-line TextInput — standard React Native Paper pattern
- No new components created — all fields follow the existing pattern in ReviewFormScreen

### References

- Story 4.1 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.1 section]
- Review form UX: [Source: `_bmad-output/planning-artifacts/epics.md` — one field per row, label above input, AI badge at label trailing]
- ItemDocument interface: [Source: `src/types/item.types.ts` — tags: string[], notes: string]
- Navigation params: [Source: `src/types/navigation.types.ts` — ReviewForm params]
- AI response data: [Source: `src/types/api.types.ts` — AnalyzeItemResponseData (title, category, color, condition only)]
- Architecture boundary rules: [Source: `_bmad-output/planning-artifacts/architecture.md` — UI → Stores only pattern]
- Naming conventions: [Source: `_bmad-output/project-context.md` — Naming Conventions table]
- Accessibility requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — WCAG 2.2 AA, 44×44dp touch targets]
- Keyboard handling best practices: [Source: `_bmad-output/planning-artifacts/architecture.md` — UX requirements]
- Current ReviewFormScreen: [Source: `src/screens/ReviewFormScreen.tsx` — 182 lines]
- Current theme constants: [Source: `src/constants/theme.ts` — spacing, borderRadius, colors]
- Current config constants: [Source: `src/constants/config.ts` — MIN_TOUCH_TARGET=44]
- Previous story 3.4: [Source: `_bmad-output/implementation-artifacts/3-4-ai-failure-handling-and-manual-entry-fallback.md`]
- Project context: [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Root type check: `npx tsc --noEmit`
- Functions type check: `cd functions && npx tsc --noEmit`

### Completion Notes List

- Added `tags` and `notes` local state to `ReviewFormScreen` with Tags as comma-separated text input and Notes as multiline input.
- Added `KeyboardAvoidingView` + `Platform` behavior and `keyboardShouldPersistTaps="handled"` to keep fields accessible while keyboard is open.
- Implemented return-key advancement with refs and `onSubmitEditing` flow: Title → Category → Color → Condition → Tags → Notes.
- Kept Notes as multiline with `returnKeyType="default"` and no forced blur behavior so return inserts newline.
- Preserved AI badge behavior for AI-only fields and ensured Tags/Notes do not render AI badges.
- Completed accessibility/testID audit for new and existing form controls, including label accessibility for Tags and Notes.
- Verified touch target minimum via existing button `contentStyle` minHeight of 44.
- No new dependencies were added.
- **[Code Review Findings]** Fixed ScrollView clipping padding issue.
- **[Code Review Findings]** Added missing spacing gap to the AIFieldBadge row.
- **[Code Review Findings]** Added consistent accessibility labels to Title, Category, Color, and Condition labels.
- **[Code Review Findings]** Added missing keyboardVerticalOffset property.

### File List

- src/screens/ReviewFormScreen.tsx (modified)
- \_bmad-output/implementation-artifacts/sprint-status.yaml (modified)
- \_bmad-output/implementation-artifacts/4-1-review-form-screen.md (modified)

## Change Log

- 2026-03-03: Implemented Story 4.1 review form enhancements (Tags/Notes fields, keyboard handling, return-key focus flow, accessibility updates) and completed build verification checks.
- 2026-03-03: Applied automated fixes for code review findings.
