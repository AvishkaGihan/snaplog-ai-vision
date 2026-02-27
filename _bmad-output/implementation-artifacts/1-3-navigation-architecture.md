# Story 1.3: Navigation Architecture

Status: done

## Story

As a user,
I want intuitive tab-based navigation with a floating scan button,
So that I can quickly move between the dashboard and settings, and access the camera from anywhere.

## Acceptance Criteria

**AC1 — Root Stack Navigator with Modal Support:**

- **Given** the themed Expo project (Story 1.2 complete)
- **When** navigation is implemented
- **Then** a Root Native Stack Navigator wraps the entire app, containing:
  - The Bottom Tab Navigator as the "Main" screen
  - Camera screen as a full-screen modal (`presentation: 'modal'`)
  - ReviewForm screen as a full-screen modal (`presentation: 'modal'`)
- **And** modal screens overlay the tab bar completely (no tab bar visible on modal screens)
- **And** the Root Stack is configured in `src/navigation/RootNavigator.tsx`

**AC2 — Bottom Tab Navigator (Dashboard + Settings):**

- **Given** the Root Stack is configured
- **When** the tab navigator renders
- **Then** a Bottom Tab Navigator provides two tabs: Dashboard and Settings
- **And** the Dashboard tab renders `DashboardStack` (a nested Stack Navigator)
- **And** the Settings tab renders `SettingsScreen` (a simple screen, no nested stack)
- **And** tab icons use `MaterialCommunityIcons` from `react-native-vector-icons` (already installed)
- **And** the tab bar uses the dark theme: `tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline }`
- **And** the active tab indicator uses `theme.colors.primary` (#7C6EF8)
- **And** the inactive tab label uses `theme.colors.onSurface` (#C8C8D4)
- **And** both tab screens have `headerShown: false` (headers are managed by individual stacks/screens)

**AC3 — Dashboard Stack Navigator:**

- **Given** the Dashboard tab is selected
- **When** the user navigates within Dashboard
- **Then** a nested Native Stack Navigator in `src/navigation/DashboardStack.tsx` manages the flow: ItemList → ItemDetail → EditItem
- **And** `ItemList` is the initial route (the Dashboard's main view)
- **And** `ItemDetail` receives `{ itemId: string }` as params
- **And** `EditItem` receives `{ itemId: string }` as params
- **And** back gesture (swipe right) works on both iOS and Android for stack navigation
- **And** all navigation transitions use default React Navigation animations (no custom animations for MVP)

**AC4 — Navigation Types with Full TypeScript Coverage:**

- **Given** the navigation structure is defined
- **When** types are specified in `src/types/navigation.types.ts`
- **Then** `RootStackParamList` defines: `Main: undefined`, `Camera: undefined`, `ReviewForm: { imageUri: string }`
- **And** `RootTabParamList` defines: `Dashboard: undefined`, `Settings: undefined`
- **And** `DashboardStackParamList` defines: `ItemList: undefined`, `ItemDetail: { itemId: string }`, `EditItem: { itemId: string }`
- **And** typed `useNavigation` and `useRoute` hooks helpers are exported for each navigator
- **And** `NavigatorScreenParams` is used for nested navigator type forwarding

**AC5 — Placeholder Screens:**

- **Given** the navigation structure exists
- **When** placeholder screens are created
- **Then** all screens render a simple centered label (screen name) with the dark theme background
- **And** screens are in `src/screens/`: `DashboardScreen.tsx`, `ItemDetailScreen.tsx`, `EditItemScreen.tsx`, `CameraScreen.tsx`, `ReviewFormScreen.tsx`, `SettingsScreen.tsx`
- **And** each placeholder uses `theme.colors.background` and `theme.colors.onBackground` for styling
- **And** each placeholder has `testID` and `accessibilityLabel` props set
- **And** all screen components use default export

**AC6 — Build Verification:**

- **Given** the complete navigation setup
- **When** the developer runs verification commands
- **Then** `npx tsc --noEmit` passes with zero errors
- **And** `npx eslint src/` passes with zero errors
- **And** `npx expo start` launches the app with tab navigation visible
- **And** tapping Dashboard and Settings tabs switches between screens
- **And** the dark theme is applied to the tab bar and all screens

## Tasks / Subtasks

- [x] **Task 1: Update navigation types** (AC: 4)
  - [x] Replace `src/types/navigation.types.ts` with `RootStackParamList`, `RootTabParamList`, `DashboardStackParamList`
  - [x] Add typed navigation hook helpers using `NativeStackNavigationProp` and `RouteProp`
  - [x] Use `NavigatorScreenParams` for the `Dashboard` tab's nested stack

- [x] **Task 2: Create placeholder screen files** (AC: 5)
  - [x] Create `src/screens/DashboardScreen.tsx` (replaces inline `DashboardPlaceholder`)
  - [x] Create `src/screens/ItemDetailScreen.tsx`
  - [x] Create `src/screens/EditItemScreen.tsx`
  - [x] Create `src/screens/CameraScreen.tsx`
  - [x] Create `src/screens/ReviewFormScreen.tsx`
  - [x] Create `src/screens/SettingsScreen.tsx` (replaces inline `SettingsPlaceholder`)
  - [x] Each screen: dark background, centered label text, `testID`, `accessibilityLabel`, default export

- [x] **Task 3: Create DashboardStack navigator** (AC: 3)
  - [x] Create `src/navigation/DashboardStack.tsx`
  - [x] Use `createNativeStackNavigator<DashboardStackParamList>()`
  - [x] Register screens: ItemList (initial), ItemDetail, EditItem
  - [x] Configure `headerShown: false` on navigator level (screens will manage their own headers later)

- [x] **Task 4: Create RootNavigator** (AC: 1, 2)
  - [x] Create `src/navigation/RootNavigator.tsx`
  - [x] Define a Root Native Stack (`createNativeStackNavigator<RootStackParamList>()`)
  - [x] Define a Bottom Tab Navigator (`createBottomTabNavigator<RootTabParamList>()`) inside `MainTabs` component
  - [x] Register Dashboard tab → `DashboardStack`, Settings tab → `SettingsScreen`
  - [x] Style tab bar with dark theme tokens (surface background, outline border, primary active, onSurface inactive)
  - [x] Add `MaterialCommunityIcons` tab icons: `view-dashboard` (Dashboard), `cog` (Settings)
  - [x] Register modal screens in Root Stack: Camera (`presentation: 'modal'`), ReviewForm (`presentation: 'modal'`)
  - [x] Set `headerShown: false` for Root Stack group containing Main screen

- [x] **Task 5: Update App.tsx to use RootNavigator** (AC: 1)
  - [x] Remove inline Tab.Navigator and placeholder screen components from App.tsx
  - [x] Import and render `<RootNavigator />` inside `NavigationContainer`
  - [x] Keep all existing providers (SafeAreaProvider, PaperProvider, NavigationContainer with dark theme)
  - [x] Preserve `registerRootComponent`, `enableScreens()`, and font loading logic

- [x] **Task 6: Verify build and navigation** (AC: 6)
  - [x] Run `npx tsc --noEmit` — zero errors
  - [x] Run `npx eslint src/` — zero errors
  - [x] Run `npx expo start` — app launches with tab navigation
  - [x] Verify tab switching between Dashboard and Settings
  - [x] Verify dark theme on tab bar

## Dev Notes

### Critical Architecture Rules

#### Navigation Structure — EXACT Pattern Required

The navigation hierarchy MUST follow this exact nesting:

```
RootStack (NativeStack)
├── Main (screen) → MainTabs (BottomTab)
│   ├── Dashboard (tab) → DashboardStack (NativeStack)
│   │   ├── ItemList (screen) ← initial route
│   │   ├── ItemDetail (screen)
│   │   └── EditItem (screen)
│   └── Settings (tab) → SettingsScreen
├── Camera (modal screen)
└── ReviewForm (modal screen)
```

**Why this pattern?** Camera and ReviewForm are full-screen modals that MUST cover the tab bar. By placing them in the Root Stack (parent of tabs), they overlay everything including the bottom tabs. If you put them inside a tab, the tab bar would remain visible.

#### React Navigation 7.x — Correct API Usage

**Import paths:**

```typescript
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigatorScreenParams } from "@react-navigation/native";
```

**Typed navigation hooks (React Navigation 7.x pattern):**

```typescript
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RouteProp } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";

// Example typed hook for a Dashboard stack screen:
export type DashboardStackNavigationProp =
  NativeStackNavigationProp<DashboardStackParamList>;
export type ItemDetailRouteProp = RouteProp<
  DashboardStackParamList,
  "ItemDetail"
>;
```

**Modal screen configuration:**

```typescript
<RootStack.Screen
  name="Camera"
  component={CameraScreen}
  options={{ presentation: 'modal', headerShown: false }}
/>
```

#### File Locations — EXACT Paths Required

| File             | Path                                | Purpose                                         |
| ---------------- | ----------------------------------- | ----------------------------------------------- |
| RootNavigator    | `src/navigation/RootNavigator.tsx`  | Root stack + tab navigator + modal registration |
| DashboardStack   | `src/navigation/DashboardStack.tsx` | Dashboard tab's stack navigator                 |
| Navigation types | `src/types/navigation.types.ts`     | All param lists + typed hook types              |
| DashboardScreen  | `src/screens/DashboardScreen.tsx`   | Placeholder (will become item list)             |
| ItemDetailScreen | `src/screens/ItemDetailScreen.tsx`  | Placeholder                                     |
| EditItemScreen   | `src/screens/EditItemScreen.tsx`    | Placeholder                                     |
| CameraScreen     | `src/screens/CameraScreen.tsx`      | Placeholder                                     |
| ReviewFormScreen | `src/screens/ReviewFormScreen.tsx`  | Placeholder                                     |
| SettingsScreen   | `src/screens/SettingsScreen.tsx`    | Placeholder                                     |

**DO NOT create** `src/navigation/linking.ts` in this story — deep linking is deferred to a future story.

#### Styling Rules — MANDATORY

- Import theme: `import { theme } from '@/constants/theme';`
- Tab bar background: `theme.colors.surface` — **NEVER** hardcode `#1A1A22`
- Active tint: `theme.colors.primary` — **NEVER** hardcode `#7C6EF8`
- Inactive tint: `theme.colors.onSurface`
- All screen backgrounds: `theme.colors.background`
- All text: `theme.colors.onBackground`
- Use `StyleSheet.create` for all styles

#### Tab Bar Icon Setup

Tab icons use `MaterialCommunityIcons` from `react-native-vector-icons` (already installed via `react-native-paper` dependency):

```typescript
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// In screenOptions:
tabBarIcon: ({ color, size }) => (
  <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
)
```

Icon names: `view-dashboard` for Dashboard, `cog` for Settings.

#### App.tsx Modification Rules — CRITICAL

When modifying `App.tsx`:

1. **KEEP** `registerRootComponent(App)` at the bottom — DO NOT REMOVE
2. **KEEP** `enableScreens()` call at module level before component
3. **KEEP** `useFonts` hook with all four Inter variants
4. **KEEP** `SafeAreaProvider` → `PaperProvider` → `NavigationContainer` wrapper hierarchy
5. **KEEP** the `NavigationContainer` dark theme configuration (custom colors + fonts object)
6. **REMOVE** the inline `DashboardPlaceholder` and `SettingsPlaceholder` function components
7. **REMOVE** the inline `Tab.Navigator` and its `Tab.Screen` children
8. **ADD** `import RootNavigator from '@/navigation/RootNavigator';`
9. **REPLACE** the `<Tab.Navigator>...</Tab.Navigator>` block with `<RootNavigator />`
10. **REMOVE** the `createBottomTabNavigator` import and `Tab` constant (moved to RootNavigator)

#### Component Export Pattern

- **Screen components**: Use `export default function ScreenName()` — default exports
- **Navigator components**: Use `export default function NavigatorName()` — default exports
- **Types**: Use named exports in `navigation.types.ts`

#### Placeholder Screen Template

Every placeholder screen MUST follow this exact pattern:

```tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { theme } from "@/constants/theme";

export default function ScreenName() {
  return (
    <View
      style={styles.screen}
      testID="screen-name-screen"
      accessibilityLabel="Screen Name Screen"
    >
      <Text style={styles.text}>Screen Name</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.space4,
  },
  text: {
    color: theme.colors.onBackground,
  },
});
```

**Note:** Use `Text` from `react-native-paper` (NOT from `react-native`) to ensure theme font is applied.

### Previous Story Intelligence (Story 1.2)

**Key learnings from Story 1.2 implementation:**

1. **`registerRootComponent` is required at bottom of `App.tsx`** — Do not remove or relocate when refactoring.
2. **`enableScreens()` must stay at module level** — Called before any Navigation renders. Preserve this.
3. **Use Paper's `Text` component** — Story 1.2 review found a bug where `react-native`'s `Text` was used instead of Paper's themed `Text`. Always import `Text` from `react-native-paper`.
4. **Use Paper's `ActivityIndicator`** — Same issue found with `ActivityIndicator`. Always use Paper's version.
5. **Path alias `@/` → `src/` works** — Confirmed in Story 1.1. Use `@/constants/theme`, `@/screens/DashboardScreen`, etc.
6. **ESLint uses flat config** — Run lint as `npx eslint src/` (no `--ext` flag).
7. **Current `App.tsx` has a `Tab.Navigator` with inline placeholders** — This MUST be replaced with the new `RootNavigator` component. Remove the inline `DashboardPlaceholder` and `SettingsPlaceholder` functions.
8. **`NavigationContainer` dark theme config exists** — The custom theme object with fonts is already in `App.tsx`. Preserve it exactly.
9. **No new packages needed** — `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, and `react-native-screens` are already installed.
10. **`theme.spacing` is available** — `theme.spacing.space4` etc. are part of the extended `AppTheme` type. Use them for padding/margins.

### Git Intelligence

- Current branch: `feat/1-3-navigat` (already created from `main`)
- Latest commits on main: Story 1.1 scaffold + Story 1.2 design system (merged)
- Previous story (1-2) added these files: `src/constants/theme.ts`, `src/constants/config.ts`, updated `src/App.tsx`, Inter font files
- Navigation types already have basic stubs in `src/types/navigation.types.ts` — these must be fully replaced
- `src/navigation/index.ts` and `src/screens/index.ts` are empty stubs (12 bytes each, likely just `export {};`)

### Technical Research Notes

**React Navigation 7.x key points:**

- `createNativeStackNavigator` is the recommended stack for performance (uses native navigation primitives)
- `presentation: 'modal'` on a screen option makes it present as a modal (slides up on iOS, transparent background on Android)
- `NavigatorScreenParams<T>` is used to type-forward a nested navigator's params through the parent
- `CompositeNavigationProp` combines navigation props from multiple navigators — useful for screens that need to navigate across navigators
- Tab bar `tabBarActiveTintColor` and `tabBarInactiveTintColor` are the correct props in React Navigation 7.x (not `activeColor`/`inactiveColor`)
- `headerShown: false` at navigator's `screenOptions` level hides headers for all screens in that navigator

**Installed packages (verified from package.json):**

- `@react-navigation/native`: ✅ installed
- `@react-navigation/native-stack`: ✅ installed
- `@react-navigation/bottom-tabs`: ✅ installed
- `react-native-screens`: ✅ installed (and `enableScreens()` called)
- `react-native-safe-area-context`: ✅ installed
- `react-native-vector-icons`: ✅ installed (via react-native-paper dependency)

### Project Structure Notes

- New files go in `src/navigation/` and `src/screens/` — both directories exist
- `src/types/navigation.types.ts` already exists and will be REPLACED (not created new)
- `src/App.tsx` will be MODIFIED (not replaced)
- No changes to `constants/`, `stores/`, `services/`, `hooks/`, or `utils/` directories

### References

- Navigation patterns: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Navigation Patterns`]
- Navigation architecture: [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Project structure: [Source: `_bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure`]
- Tab navigator config: [Source: `_bmad-output/planning-artifacts/architecture.md#navigation/RootNavigator.tsx`]
- Dashboard stack: [Source: `_bmad-output/planning-artifacts/architecture.md#navigation/DashboardStack.tsx`]
- Navigation types: [Source: `_bmad-output/planning-artifacts/architecture.md#types/navigation.types.ts`]
- Styling enforcement: [Source: `_bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines`]
- Naming conventions: [Source: `_bmad-output/project-context.md#Naming Conventions`]
- Modal camera UX: [Source: `_bmad-output/planning-artifacts/ux-design-specification.md#Experience Mechanics`]
- Epics Story 1.3: [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.3`]
- Previous Story 1.2: [Source: `_bmad-output/implementation-artifacts/1-2-design-system-and-theme-foundation.md#Completion Notes List`]
- Project context: [Source: `_bmad-output/project-context.md#Navigation`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npm run typecheck` (pass)
- `npm run lint` (pass)

### Review Follow-ups (AI)

Fixed the following issues identified during code review:
- Added safe area insets to `CameraScreen` and `ReviewFormScreen`.
- Mapped `heavy` font weight to `Inter-SemiBold` in `App.tsx` navigation theme.
- Extracted and typed `imageUri` param in `ReviewFormScreen` and `itemId` in `ItemDetailScreen`.
- Added `tabBarTestID` options for E2E testing in `RootNavigator.tsx`.

### Completion Notes List

- Implemented `RootNavigator` with Root Stack + Main Tabs and modal presentation for `Camera` and `ReviewForm`.
- Added `DashboardStack` navigator with `ItemList`, `ItemDetail`, and `EditItem` routes.
- Replaced inline tab navigator in `App.tsx` with `RootNavigator` while preserving providers, theme, `enableScreens()`, and `registerRootComponent`.
- Added six placeholder screens with dark theme styling plus `testID` and `accessibilityLabel`.
- Reworked navigation typing to include `RootStackParamList`, `RootTabParamList`, `DashboardStackParamList`, and typed navigation/route helpers.

### File List

- `src/App.tsx`
- `src/navigation/RootNavigator.tsx`
- `src/navigation/DashboardStack.tsx`
- `src/types/navigation.types.ts`
- `src/types/react-native-vector-icons.d.ts`
- `src/screens/DashboardScreen.tsx`
- `src/screens/ItemDetailScreen.tsx`
- `src/screens/EditItemScreen.tsx`
- `src/screens/CameraScreen.tsx`
- `src/screens/ReviewFormScreen.tsx`
- `src/screens/SettingsScreen.tsx`

## Change Log

- 2026-02-27: Implemented Story 1.3 navigation architecture and validated with `tsc` and `eslint`.
