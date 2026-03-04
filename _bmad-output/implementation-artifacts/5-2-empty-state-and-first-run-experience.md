# Story 5.2: Empty State & First-Run Experience

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a first-time user,
I want a clear, welcoming empty state that tells me exactly what to do,
So that I can start using the app without any instructions.

## Acceptance Criteria

**AC1 — EmptyStateCard Component with Illustration:**

- **Given** the user has zero cataloged items
- **When** the Dashboard loads
- **Then** the `EmptyStateCard` component is displayed instead of the item list
- **And** the card includes a custom illustration (camera with sparkles — implemented as a React Native SVG component, not an external asset file)
- **And** the illustration is visually appealing and centered on the card
- **And** the illustration uses the theme's `primary` (#7C6EF8) and `secondary`/AI-accent (#64DFDF) colors

**AC2 — Empty State Copy:**

- **Given** the `EmptyStateCard` is displayed
- **When** the user views the card
- **Then** the headline reads: **"Your inventory starts here"** (using `titleLarge` typography)
- **And** the subtext reads: **"Tap the scan button to photograph any item — AI fills in the details."** (using `bodyMedium` typography, `onSurface` color)
- **And** no additional CTA button is shown (the FAB is already visible)

**AC3 — Integration with DashboardScreen:**

- **Given** the `EmptyStateCard` component is created
- **When** the DashboardScreen renders with zero items and `isLoading` is false
- **Then** the `EmptyStateCard` replaces the current placeholder `ListEmptyComponent` in the FlatList
- **And** the empty state is vertically centered in the available space
- **And** the FAB (Scan button) remains visible at the bottom-right
- **And** pull-to-refresh still functions when the empty state is shown

**AC4 — Accessibility:**

- **Given** the `EmptyStateCard` is displayed
- **When** a screen reader reads the card
- **Then** the component has `testID="empty-state-card"` and `accessibilityLabel="No items yet. Tap the scan button to photograph any item."` on the root element
- **And** the illustration has `accessibilityLabel="Camera illustration"` and `accessible={true}`

**AC5 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` (from project root) passes with zero errors
- **And** `cd functions && npx tsc --noEmit` passes with zero errors (regression check)

## Tasks / Subtasks

- [x] **Task 1: Create `EmptyStateCard.tsx` component** (AC: 1, 2, 4)
  - [x] Create `src/components/EmptyStateCard.tsx` as a new file
  - [x] Create a camera-with-sparkles illustration using React Native `Svg`, `Path`, `Circle`, `G` components from `react-native-svg`
  - [x] Use theme colors (`primary` #7C6EF8, `secondary` #64DFDF, `onSurface`) for illustration — no hardcoded colors
  - [x] Display headline "Your inventory starts here" with `titleLarge` typography
  - [x] Display subtext "Tap the scan button to photograph any item — AI fills in the details." with `bodyMedium` typography, `onSurface` color
  - [x] Do NOT render any CTA button — the FAB already exists
  - [x] Center the card content vertically and horizontally
  - [x] Add `testID="empty-state-card"` and `accessibilityLabel` on root
  - [x] Add `accessibilityLabel` on SVG illustration
  - [x] Use `StyleSheet.create` with theme tokens — zero hardcoded values
  - [x] Export as default export

- [x] **Task 2: Integrate `EmptyStateCard` into `DashboardScreen.tsx`** (AC: 3)
  - [x] Import `EmptyStateCard` component
  - [x] Replace the existing `emptyList` placeholder with `<EmptyStateCard />`
  - [x] Ensure the FlatList `ListEmptyComponent` renders the `EmptyStateCard` when items array is empty
  - [x] Verify vertical centering via `contentContainerStyle={{ flexGrow: 1 }}` (already exists)
  - [x] Verify pull-to-refresh still works in empty state
  - [x] Verify FAB remains visible
  - [x] Remove unused styles (`emptyState`, `emptyStateText`) from the stylesheet

- [x] **Task 3: Verify `react-native-svg` dependency** (AC: 1)
  - [x] Check if `react-native-svg` is already installed in package.json
  - [x] If NOT installed: run `npx expo install react-native-svg` (Expo-compatible install)
  - [x] If already installed: skip (do NOT reinstall)

- [x] **Task 4: Build verification** (AC: 5)
  - [x] `npx tsc --noEmit` — zero errors from project root
  - [x] `cd functions && npx tsc --noEmit` — zero errors (regression check)

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

| File                              | Current State                                                                                                                                                                                                          | This Story's Action                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/screens/DashboardScreen.tsx` | 299 lines — Full item list with FlatList, skeleton loading, pull-to-refresh, dual navigation hooks, Snackbar error feedback. Has a placeholder `emptyList` component (lines 155–162) that renders "No items yet" text. | **MODIFY** — replace placeholder `emptyList` with `EmptyStateCard` |
| `src/constants/theme.ts`          | 116 lines — Full MD3 dark theme with colors (primary #7C6EF8, secondary #64DFDF, background #0F0F13, surface #1A1A22, onSurface #C8C8D4, onBackground #EAEAF0), spacing, borderRadius, typography, semanticColors.     | **NO CHANGES**                                                     |
| `src/constants/config.ts`         | 13 lines — App constants. No empty state constants needed.                                                                                                                                                             | **NO CHANGES**                                                     |
| `src/components/ItemCard.tsx`     | Existing component with React.memo, exported ITEM_CARD_HEIGHT constant.                                                                                                                                                | **NO CHANGES**                                                     |
| `src/components/index.ts`         | 193 bytes — Barrel export file for components.                                                                                                                                                                         | **MODIFY** — add EmptyStateCard export                             |
| `src/stores/useItemStore.ts`      | Has `items`, `isLoading` state used to determine empty state.                                                                                                                                                          | **NO CHANGES**                                                     |

#### What NEEDS TO BE CREATED

| File                                | Purpose                                                    |
| ----------------------------------- | ---------------------------------------------------------- |
| `src/components/EmptyStateCard.tsx` | **NEW** — Empty state card with illustration for dashboard |

#### What NEEDS TO BE MODIFIED

| File                              | Purpose                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `src/screens/DashboardScreen.tsx` | **MODIFY** — replace placeholder empty state with `EmptyStateCard` |
| `src/components/index.ts`         | **MODIFY** — add barrel export for `EmptyStateCard`                |

---

### Key Implementation Details

#### EmptyStateCard Component (`src/components/EmptyStateCard.tsx`)

**Layout (full-width card, vertically centered):**

- Top: SVG illustration (camera with sparkles), approximately 120×120dp
- Center: Headline text, centered
- Below: Subtext, centered, with max-width for readability

**SVG Illustration approach — Use `react-native-svg`:**

Create a simple, elegant camera-with-sparkles illustration using `react-native-svg` primitives. This avoids needing external asset files and keeps the illustration programmatic and theme-aware.

```tsx
import Svg, { Rect, Circle, Path, G } from "react-native-svg";

function CameraIllustration() {
  return (
    <Svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      accessibilityLabel="Camera illustration"
    >
      {/* Camera body - rounded rectangle */}
      <Rect
        x={20}
        y={35}
        width={80}
        height={55}
        rx={12}
        fill={theme.colors.surface}
        stroke={theme.colors.primary}
        strokeWidth={2}
      />
      {/* Camera lens */}
      <Circle
        cx={60}
        cy={62}
        r={16}
        fill={theme.colors.surfaceVariant}
        stroke={theme.colors.primary}
        strokeWidth={2}
      />
      <Circle
        cx={60}
        cy={62}
        r={10}
        fill={theme.colors.background}
        stroke={theme.colors.outline}
        strokeWidth={1}
      />
      {/* Camera flash bump */}
      <Rect
        x={35}
        y={28}
        width={20}
        height={10}
        rx={4}
        fill={theme.colors.surface}
        stroke={theme.colors.primary}
        strokeWidth={2}
      />
      {/* Sparkles using secondary/AI color */}
      <Path
        d="M95 25 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 z"
        fill={theme.colors.secondary}
      />
      <Path
        d="M15 45 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z"
        fill={theme.colors.secondary}
        opacity={0.7}
      />
      <Path
        d="M100 70 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z"
        fill={theme.colors.secondary}
        opacity={0.5}
      />
    </Svg>
  );
}
```

> **⚠️ IMPORTANT**: The SVG should use theme colors NOT hardcoded hex values. Get `theme.colors.primary`, `theme.colors.secondary`, `theme.colors.surface`, etc. from the imported theme.

**Component structure:**

```tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { theme } from "@/constants/theme";

// ... CameraIllustration SVG component above

export default function EmptyStateCard() {
  return (
    <View
      style={styles.container}
      testID="empty-state-card"
      accessibilityLabel="No items yet. Tap the scan button to photograph any item."
    >
      <CameraIllustration />
      <Text style={styles.headline}>Your inventory starts here</Text>
      <Text style={styles.subtext}>
        Tap the scan button to photograph any item — AI fills in the details.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.space6,
    paddingVertical: theme.spacing.space8,
  },
  headline: {
    ...theme.typography.titleLarge,
    color: theme.colors.onBackground,
    textAlign: "center",
    marginTop: theme.spacing.space5,
    marginBottom: theme.spacing.space3,
  },
  subtext: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurface,
    textAlign: "center",
    maxWidth: 280,
  },
});
```

---

#### DashboardScreen Integration

**Replace the existing placeholder (lines 155–162):**

```tsx
// CURRENT (REMOVE):
const emptyList = useMemo(
  () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No items yet</Text>
    </View>
  ),
  [],
);

// REPLACE WITH:
import EmptyStateCard from "@/components/EmptyStateCard";

// In the component body, replace the useMemo block with simply:
// (No useMemo needed — EmptyStateCard is already a pure component)
// In FlatList, update ListEmptyComponent:
<FlatList
  // ... existing props
  ListEmptyComponent={EmptyStateCard}
  // ...
/>;
```

**Remove unused styles from DashboardScreen (lines 248–257):**

```typescript
// REMOVE these styles:
emptyState: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: theme.spacing.space8,
},
emptyStateText: {
  ...theme.typography.bodyLarge,
  color: theme.colors.onSurface,
},
```

**Important: Keep `flexGrow: 1`** in `contentContainerStyle` of FlatList — this is what enables vertical centering of the empty state.

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Using an external image/asset file for the illustration
import EmptyStateImage from "@/assets/images/empty-state.svg";
// DO: Create a React Native SVG component using react-native-svg primitives.
// This keeps the illustration theme-aware and avoids asset loading issues.

// ❌ WRONG: Hardcoded colors in the SVG illustration
<Circle cx={60} cy={62} r={16} fill="#7C6EF8" />
// DO: Use theme.colors.primary, theme.colors.secondary, etc.

// ❌ WRONG: Adding a CTA button in the EmptyStateCard
<Button mode="contained" onPress={...}>Start Scanning</Button>
// DO: No CTA button. The FAB is already visible — adding a button is redundant and clutters the design.

// ❌ WRONG: Using useState for empty state detection
const [isEmpty, setIsEmpty] = useState(true);
// DO: Derive from items.length === 0 — FlatList's ListEmptyComponent handles this automatically.

// ❌ WRONG: Hardcoded text styles
<Text style={{ fontSize: 20, fontWeight: "600", color: "#EAEAF0" }}>
// DO: Use theme.typography.titleLarge and theme.colors.onBackground.

// ❌ WRONG: Creating a separate empty state screen
// The empty state is a component WITHIN the DashboardScreen, not a separate route.
// The FlatList's ListEmptyComponent prop handles rendering it when data is empty.

// ❌ WRONG: Not removing the old placeholder styles
// If you don't remove emptyState and emptyStateText from DashboardScreen styles,
// you'll have dead code that confuses future developers.

// ❌ WRONG: Wrapping EmptyStateCard in useMemo
const emptyList = useMemo(() => <EmptyStateCard />, []);
// DO: Pass the component reference directly: ListEmptyComponent={EmptyStateCard}
// FlatList accepts a component type for ListEmptyComponent, which is more efficient.
```

---

### Dependency Check

**Potentially needed:**

- `react-native-svg` — Check if already installed. If not, install via `npx expo install react-native-svg` (Expo-compatible). This is a standard Expo-compatible library and does NOT require ejection.

**Already installed (do NOT reinstall):**

- `react-native-paper` — `Text` component used for headline and subtext
- `react-native` — `View`, `StyleSheet` core RN components
- Theme and config constants already available

---

### Previous Story Intelligence

**From Story 5.1 (Dashboard Item List) — Most Recent:**

1. **DashboardScreen structure**: The screen uses dual navigation hooks (`useRootStackNavigation` for Camera, `useDashboardNavigation` for ItemDetail). The FAB and Snackbar are positioned absolutely. The FlatList already has `contentContainerStyle={{ flexGrow: 1 }}` for empty state centering.

2. **Existing empty state placeholder**: Lines 155–162 define a `useMemo`-wrapped `emptyList` component that shows "No items yet" — this is the exact code to replace.

3. **Skeleton loading**: When `isLoading` is true, skeleton cards render. When loading is complete and items are empty, the `ListEmptyComponent` kicks in. The flow is: loading skeletons → empty state (if no items) or item list (if items exist).

4. **Shimmer animation**: DashboardScreen already has a shimmer animation ref (`shimmerAnim`). The EmptyStateCard does NOT need any shimmer — it's a static display component.

5. **StyleSheet pattern**: All styles use `theme.colors.*`, `theme.spacing.*`, `theme.typography.*`, `theme.borderRadius.*`. Follow the same pattern.

6. **Code review feedback from 5.1**: Fixed Safe Area handling and image URL optional chaining. No relevant issues for this story.

---

### Git Intelligence

Recent commits (from develop branch):

```
ebdec65 feat/5-1-dashboard-item-list (current HEAD)
e5002dd Merge pull request #22 from AvishkaGihan/feat/4-5-delete-item
bb31d23 feat: implement story 4-5 delete item functionality
8e8cad8 Merge pull request #21 from AvishkaGihan/feat/4-4-edit-existing-item
7b0e2a8 feat: implement story 4-4 edit existing item
```

**Codebase conventions from recent work:**

- Feature branches: `feat/{story-key}` (e.g., `feat/5-2-empty-state-and-first-run-experience`)
- `StyleSheet.create` with all values from `theme.ts`
- `testID` and `accessibilityLabel` on all interactive elements
- React Native Paper components (`Text`, `FAB`) used for UI consistency
- Default exports for component files
- `@/` path alias for all src imports

---

### Project Structure Notes

- New component: `src/components/EmptyStateCard.tsx` — PascalCase, `.tsx` extension ✓
- Modified screen: `src/screens/DashboardScreen.tsx` — PascalCase, `.tsx` extension ✓
- Modified barrel: `src/components/index.ts` — add export ✓
- No new directories needed — all files placed in existing directories
- Architecture boundary maintained: EmptyStateCard is a pure presentational component, no state management or service calls

### References

- Story 5.2 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 5.2, lines 539-553]
- UX EmptyStateCard design: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — EmptyStateCard section, lines 607-617]
- UX empty state patterns: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Empty States section, lines 705-713]
- UX first-time user journey: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Journey 3, lines 472-487]
- Theme tokens: [Source: `src/constants/theme.ts` — colors, spacing, borderRadius, typography]
- Current DashboardScreen: [Source: `src/screens/DashboardScreen.tsx` — 299 lines, placeholder empty state at lines 155-162]
- Architecture project structure: [Source: `_bmad-output/planning-artifacts/architecture.md` — EmptyStateCard listed at line 637]
- Architecture components directory: [Source: `_bmad-output/planning-artifacts/architecture.md` — line 398]
- Previous story 5.1: [Source: `_bmad-output/implementation-artifacts/5-1-dashboard-item-list.md`]
- Project context rules: [Source: `_bmad-output/project-context.md`]

## Change Log

- 2026-03-05: Implemented EmptyStateCard with themed SVG illustration, integrated it into DashboardScreen as FlatList empty state, added component barrel export, installed `react-native-svg`, and completed TypeScript verification checks.
- 2026-03-05: Performed code review. Fixed width style constraint on EmptyStateCard subtext and adjusted DashboardScreen FlatList padding for true visual centering. Status updated to done.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Added `src/components/EmptyStateCard.tsx` with `react-native-svg` camera/sparkles illustration and accessibility labels.
- Updated `src/screens/DashboardScreen.tsx` to use `ListEmptyComponent={EmptyStateCard}` and removed old empty placeholder memo/styles.
- Added `EmptyStateCard` export to `src/components/index.ts`.
- Installed dependency with `npx expo install react-native-svg`.
- Ran verification tasks: `npx tsc --noEmit` and `cd functions && npx tsc --noEmit`.

### Senior Developer Review (AI)

- [x] Fixed EmptyStateCard subtext width from `100%` to `maxWidth: 280` as requested in design spec.
- [x] Fixed double-padding in DashboardScreen's FlatList `contentContainerStyle` to prevent EmptyStateCard visual squishing.

### Completion Notes List

- ✅ AC1 met: Empty state component created with custom theme-driven SVG illustration and centered layout.
- ✅ AC2 met: Headline and subtext copy implemented with required typography and no extra CTA button.
- ✅ AC3 met: Dashboard FlatList empty placeholder replaced by `EmptyStateCard`; `flexGrow: 1`, pull-to-refresh, and FAB behavior preserved.
- ✅ AC4 met: Required `testID` and accessibility labels added to root and illustration.
- ✅ AC5 met: Root and functions TypeScript verification commands executed without reported errors.

### File List

- src/components/EmptyStateCard.tsx (new/modified)
- src/screens/DashboardScreen.tsx (modified)
- src/components/index.ts (modified)
- package.json (modified)
- package-lock.json (modified)
