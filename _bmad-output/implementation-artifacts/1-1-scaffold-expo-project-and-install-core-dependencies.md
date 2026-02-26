# Story 1.1: Scaffold Expo Project & Install Core Dependencies

Status: ready-for-dev

## Story

As a developer,
I want a properly initialized Expo project with all core dependencies installed and configured,
So that I have a working development environment to build features on.

## Acceptance Criteria

**AC1 — Project Initialization:**
- **Given** a clean project directory
- **When** the developer runs `npx -y create-expo-app@latest ./ --template tabs`
- **Then** the Expo project is initialized with TypeScript and Expo SDK 54

**AC2 — Navigation Framework:**
- **Given** the initialized project
- **When** setup is complete
- **Then** Expo Router is fully removed and replaced with React Navigation 7.x (Stack + Tab + Native Stack)
- **And** the `expo-router` package is uninstalled; `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`, `@react-navigation/stack`, `react-native-screens`, `react-native-safe-area-context` are installed via `npx expo install`

**AC3 — Core Dependencies:**
- **Given** the project is initialized with React Navigation
- **When** all dependencies are installed
- **Then** the following packages are present at correct versions:
  - `react-native-paper@5.15.x` (UI components, MD3 theme)
  - `zustand@5.x` (state management)
  - `react-native-mmkv` (local persistence)
  - `zod@4.3.x` (schema validation)
  - `firebase@12.9.x` (Firestore, Auth, Storage)
  - `@react-native-community/netinfo` (network status)
  - `expo-camera` (camera capture)
  - `expo-image-manipulator` (image compression)
  - `expo-font` (Inter typeface)
  - `expo-file-system` (file access for CSV export)
  - `expo-sharing` (native share sheet)
  - `expo-image-picker` (gallery picker)
  - `react-native-haptic-feedback` (haptic confirmation)

**AC4 — Project Structure:**
- **Given** the core dependencies are installed
- **When** the developer sets up the source tree
- **Then** the project structure follows the Architecture spec with `src/` containing:
  - `components/` — Reusable UI components
  - `screens/` — Screen-level components
  - `navigation/` — Navigation configuration
  - `stores/` — Zustand stores
  - `services/` — Business logic + Firebase calls
  - `hooks/` — Custom React hooks
  - `utils/` — Pure utility functions
  - `types/` — TypeScript type definitions
  - `constants/` — App constants and theme
  - `assets/` — Static assets (fonts, images)

**AC5 — TypeScript Configuration:**
- **Given** the project structure
- **When** tsconfig is configured
- **Then** `tsconfig.json` has strict mode enabled (`"strict": true`)
- **And** the path alias `@/` is mapped to `src/` so that `import { theme } from '@/constants/theme'` resolves correctly

**AC6 — Firebase Project Config Files:**
- **Given** the dependencies are installed
- **When** Firebase config stubs are created
- **Then** `src/services/firebaseConfig.ts` exists (initialized but using placeholder values from `.env`)
- **And** `.env.example` documents required variables: `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID`
- **And** `firestore.rules`, `storage.rules`, `firebase.json`, `.firebaserc` stubs exist at root

**AC7 — Build Success:**
- **Given** the configured project
- **When** the developer runs `npx expo start`
- **Then** the app successfully launches on iOS simulator (Expo Go) and Android emulator (dev build) with no TypeScript errors

**AC8 — GitHub Actions CI:**
- **Given** the project repository
- **When** a PR is opened
- **Then** `.github/workflows/ci.yml` runs ESLint and TypeScript type check (`tsc --noEmit`)

## Tasks / Subtasks

- [ ] **Task 1: Initialize Expo project** (AC: 1)
  - [ ] Run `npx -y create-expo-app@latest ./ --template tabs` in the project root
  - [ ] Verify TypeScript template and Expo SDK 54 are installed
  - [ ] Delete default `app/` directory (Expo Router scaffold)

- [ ] **Task 2: Remove Expo Router, install React Navigation** (AC: 2)
  - [ ] Uninstall Expo Router: `npm uninstall expo-router`
  - [ ] Remove all `app/` directory contents and the `app` entry point from `package.json`
  - [ ] Install React Navigation packages via `npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack @react-navigation/stack react-native-screens react-native-safe-area-context`
  - [ ] Create minimal `src/App.tsx` as the app entry (replace `index.ts` reference)
  - [ ] Update `package.json` `"main"` field to point to `src/App.tsx` (or use `expo` key if needed)

- [ ] **Task 3: Install all core dependencies** (AC: 3)
  - [ ] Run `npx expo install react-native-paper expo-camera expo-image-manipulator expo-font expo-file-system expo-sharing expo-image-picker`
  - [ ] Run `npm install zustand react-native-mmkv zod firebase @react-native-community/netinfo react-native-haptic-feedback`
  - [ ] Verify package versions match specifications in AC3
  - [ ] Run `npx expo install` to reconcile any version mismatches

- [ ] **Task 4: Create full project directory structure** (AC: 4)
  - [ ] Create all `src/` subdirectories: `components`, `screens`, `navigation`, `stores`, `services`, `hooks`, `utils`, `types`, `constants`, `assets`
  - [ ] Create placeholder `index.ts` or `.gitkeep` in each empty directory to preserve structure in git
  - [ ] Create `assets/fonts/Inter/` directory (font files added in Story 1.2)

- [ ] **Task 5: Configure TypeScript** (AC: 5)
  - [ ] Edit `tsconfig.json`: ensure `"strict": true` is set
  - [ ] Add path alias configuration: `"paths": { "@/*": ["./src/*"] }` under `compilerOptions`
  - [ ] Update `babel.config.js` to include `babel-plugin-module-resolver` for `@/` alias at dev time (install `babel-plugin-module-resolver` as devDependency)
  - [ ] Run `npx tsc --noEmit` to confirm zero type errors

- [ ] **Task 6: Create Firebase stub files** (AC: 6)
  - [ ] Create `src/services/firebaseConfig.ts` with Firebase app initialization reading from `process.env.EXPO_PUBLIC_*` variables
  - [ ] Create `.env.example` with all required environment variable names (no values)
  - [ ] Create `.gitignore` entry for `.env`
  - [ ] Create stub `firestore.rules` (allow read, write: if false; // placeholder)
  - [ ] Create stub `storage.rules` (allow read, write: if false; // placeholder)
  - [ ] Create stub `firebase.json` (project config with functions, firestore, storage targets)
  - [ ] Create stub `.firebaserc` with project alias

- [ ] **Task 7: Create minimal App.tsx entry point** (AC: 7)
  - [ ] Create `src/App.tsx` with NavigationContainer + placeholder screens (Dashboard, Settings) using Bottom Tab Navigator
  - [ ] Wrap with React Native Paper `PaperProvider` (theme can be default for now — theme tokens added in Story 1.2)
  - [ ] Verify app runs with `npx expo start` on both platforms

- [ ] **Task 8: Set up GitHub Actions CI** (AC: 8)
  - [ ] Create `.github/workflows/ci.yml` with lint and type-check jobs
  - [ ] Configure ESLint job: `npx eslint src/ --ext .ts,.tsx`
  - [ ] Configure type-check job: `npx tsc --noEmit`
  - [ ] Trigger runs on `push` and `pull_request` events

- [ ] **Task 9: Create placeholder type files** (AC: 4, 5)
  - [ ] Create `src/types/item.types.ts` with `ItemDocument` and `LocalDraft` interfaces (from architecture)
  - [ ] Create `src/types/api.types.ts` with `AnalyzeItemRequest` and `AnalyzeItemResponse` interfaces
  - [ ] Create `src/types/navigation.types.ts` with placeholder `RootTabParamList` type

## Dev Notes

### Critical Architecture Rules for This Story

This is the foundation story — every decision made here shapes all subsequent stories. Follow these rules exactly:

#### Navigation: React Navigation 7.x ONLY
- **NEVER use Expo Router** — it is explicitly forbidden in this project
- Use `@react-navigation/bottom-tabs` for the Tab Navigator (Dashboard | Settings)
- Use `@react-navigation/native-stack` for stack screens
- Camera and Review Form are **modal** screens (presented over the tab bar)
- All navigation types must be in `src/types/navigation.types.ts`

#### Package Installation Strategy
- **Use `npx expo install` for Expo ecosystem packages** (expo-*, react-native-screens, etc.) — this ensures SDK 54 compatible versions
- **Use `npm install` for non-Expo packages** (zustand, zod, firebase, react-native-mmkv)
- **NEVER** manually specify Expo package versions — let `expo install` resolve them

#### Firebase SDK: Modular Imports ONLY
```typescript
// ✅ CORRECT
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ❌ WRONG — firebase/compat is banned
import firebase from 'firebase/compat/app';
```

#### TypeScript: Strict Mode is Mandatory
```json
// tsconfig.json — required settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### `@/` Path Alias — Two Configs Required
The path alias needs configuration in two places:
1. `tsconfig.json` — for TypeScript type resolution
2. `babel.config.js` — for Metro bundler runtime resolution (via `babel-plugin-module-resolver`)

Both must be configured correctly or imports will resolve at compile time but fail at runtime.

### Project Structure Notes

#### Alignment with Architecture
The `src/` directory structure must exactly match the architecture document:
```
src/
├── App.tsx                    ← Entry point (wraps all providers)
├── components/                ← Reusable UI components
├── screens/                   ← Screen-level components (one per route)
├── navigation/                ← React Navigation config
├── stores/                    ← Zustand stores
├── services/                  ← Business logic + Firebase calls
├── hooks/                     ← Custom React hooks
├── utils/                     ← Pure utility functions
├── types/                     ← TypeScript type definitions
├── constants/                 ← theme.ts, config.ts, categories.ts
└── assets/                    ← Static assets (fonts, images)
```

Also create at root:
```
functions/                     ← Cloud Functions (blank for now, scaffold in Story 3.1)
├── src/
│   ├── index.ts
│   ├── analyzeItem.ts
│   ├── prompts/
│   ├── validators/
│   ├── middleware/
│   └── utils/
└── __tests__/
```

#### Firebase Config File Pattern
```typescript
// src/services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

**Note:** Use `EXPO_PUBLIC_` prefix for client-accessible env vars in Expo SDK 51+ (SDK 54 uses this convention).

#### Minimal App.tsx Pattern
```tsx
// src/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

// Placeholder screens — will be replaced in Stories 1.2–1.5
function DashboardPlaceholder() {
  return <View><Text>Dashboard</Text></View>;
}
function SettingsPlaceholder() {
  return <View><Text>Settings</Text></View>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Dashboard" component={DashboardPlaceholder} />
            <Tab.Screen name="Settings" component={SettingsPlaceholder} />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
```

#### Type Definitions to Create Now
These interfaces are used across all future stories — define them here to avoid import conflicts:

```typescript
// src/types/item.types.ts
import { Timestamp } from 'firebase/firestore';

export interface ItemDocument {
  id: string;
  title: string;
  category: string;
  color: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  tags: string[];
  notes: string;
  imageUrl: string;           // Cloud Storage download URL
  imagePath: string;          // Cloud Storage path (for deletion)
  aiGenerated: boolean;       // Whether AI populated the fields
  syncStatus: 'synced' | 'pending' | 'error';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LocalDraft {
  localId: string;            // UUID generated client-side
  item: Partial<ItemDocument>;
  localImageUri: string;      // Local file path before upload
  syncStatus: 'pending' | 'error';
  retryCount: number;
  createdAt: string;          // ISO 8601 string
}
```

```typescript
// src/types/api.types.ts
export interface AnalyzeItemRequest {
  imageUrl: string;           // Cloud Storage download URL
}

export interface AnalyzeItemResponse {
  success: boolean;
  data?: {
    title: string;
    category: string;
    color: string;
    condition: string;
  };
  error?: {
    code: 'RATE_LIMITED' | 'AI_PARSE_FAILURE' | 'AI_TIMEOUT' | 'INVALID_IMAGE';
    message: string;
  };
}
```

```typescript
// src/types/navigation.types.ts
export type RootTabParamList = {
  Dashboard: undefined;
  Settings: undefined;
};

export type DashboardStackParamList = {
  ItemList: undefined;
  ItemDetail: { itemId: string };
  EditItem: { itemId: string };
};

export type RootModalParamList = {
  Camera: undefined;
  ReviewForm: { imageUri: string };
};
```

### Known Dependency Gotchas

1. **`react-native-mmkv`** requires a dev build — cannot run in bare Expo Go. The team is targeting Expo Go for iOS demo, but MMKV will require a custom dev build (via EAS) on Android. This is acceptable per PRD.

2. **`firebase@12.9.x` and React Native**: The Firebase JS SDK works with React Native but requires `@react-native-firebase` AsyncStorage workaround for persistence — however, for Firestore, the JS SDK's `enableIndexedDbPersistence` is *not* supported on React Native. Use MMKV/Zustand for local persistence (as designed) and do **not** enable Firestore offline persistence.

3. **`expo install` vs `npm install`**: After running both, always run `npx expo install --check` to verify there are no version conflicts with the Expo SDK.

4. **`react-native-screens`**: Must call `enableScreens()` from `react-native-screens` at app startup before any navigation renders. Add this as the first call in `src/App.tsx`.

5. **`babel-plugin-module-resolver`** for `@/` alias: Install as a devDependency (`npm install -D babel-plugin-module-resolver`). Configure in `babel.config.js`:
```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: { '@': './src' },
    }],
  ],
};
```

### References

- Architecture: Project Structure [Source: `_bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure`]
- Architecture: Starter template decision [Source: `_bmad-output/planning-artifacts/architecture.md#Selected Starter`]
- Architecture: Frontend Architecture table [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Architecture: Data model interfaces [Source: `_bmad-output/planning-artifacts/architecture.md#Data Architecture`]
- Architecture: Naming conventions [Source: `_bmad-output/planning-artifacts/architecture.md#Naming Patterns`]
- Architecture: Boundary rules [Source: `_bmad-output/planning-artifacts/architecture.md#Key Boundary Rules`]
- Project Context: Technology stack & versions [Source: `_bmad-output/project-context.md#Technology Stack & Versions`]
- Project Context: Critical don't-miss rules [Source: `_bmad-output/project-context.md#Critical Don't-Miss Rules`]
- Epics: Story 1.1 full context [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.1`]
- PRD: NFR-C1 (no ejection), NFR-C2 (iOS 15+, Android 10+) [Source: `_bmad-output/planning-artifacts/prd.md`]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
