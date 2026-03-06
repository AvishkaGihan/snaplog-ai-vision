---
project_name: 'snaplog-ai-vision'
user_name: 'Avish'
date: '2026-02-25'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Technology | Version | Purpose |
|---|---|---|
| Expo SDK | 54 | Managed workflow — **no ejection allowed** |
| React Native | 0.81 | Mobile UI runtime |
| React | 19 | Component model |
| TypeScript | 5.x | **Strict mode enabled** — no `any` types |
| React Navigation | 7.x | Stack + Tab + Modal navigation |
| Zustand | 5.x | Global state management (hooks-based) |
| React Native Paper | 5.15.x | Material Design 3 component library |
| MMKV | Latest (`react-native-mmkv`) | Local storage — **30x faster than AsyncStorage** |
| Zod | 4.3.x | Schema validation (AI response + input) |
| Firebase JS SDK | 12.9.0 | Firestore, Auth, Cloud Storage (modular imports) |
| Firebase Cloud Functions | Node.js 20 | Backend logic — HTTPS Callable functions |
| Gemini 2.0 Flash | Server-side only | AI image analysis — **never called from client** |
| expo-camera | Latest (SDK 54) | Camera capture — rear camera only |
| expo-image-manipulator | Latest (SDK 54) | Image resize + compression |
| expo-font (Inter) | Latest (SDK 54) | Primary typeface |
| @react-native-community/netinfo | Latest | Network status detection |

**Critical Version Constraints:**

- All Expo packages must be compatible with SDK 54 — use `npx expo install` to ensure correct versions
- Firebase SDK uses **modular imports** (tree-shakeable) — never use `firebase/compat`
- React Navigation 7.x — do NOT use Expo Router

---

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Strict mode is mandatory** — `strict: true` in `tsconfig.json`; never use `any` or `// @ts-ignore`
- **Use `null` for absent values** in persisted data — never `undefined`
- **Boolean fields** must be `true`/`false` — never `1`/`0`
- **Date format**: ISO 8601 strings in transit; Firestore `Timestamp` in database
- **JSON field naming**: camelCase everywhere (client, API, Firestore)
- **Async/await only** — no raw `.then()` chains
- **All async operations** must be wrapped in `try/catch` — zero unhandled promise rejections

### Framework-Specific Rules (React Native / Expo)

#### State Management (Zustand)

- **All global state** must use Zustand stores — **never** `useState` for shared/global state
- React Context is acceptable **only** for theme/navigation providers — never for data state
- Actions are **co-located** in the store definition — no separate action files
- Use **shallow comparison** for selectors: `useItemStore(state => state.items, shallow)`
- Persist middleware uses MMKV adapter: `persist(storeDefinition, { name: 'store-name', storage: mmkvStorage })`
- **Immutable updates** only — use spread operator for state mutations

#### Styling

- **Always** use `StyleSheet.create` with theme tokens from `constants/theme.ts`
- **Never hardcode** colors, spacing, or font sizes — always reference `theme.colors.*`, `theme.spacing.*`, `theme.typography.*`
- Theme follows MD3 dark theme specification from UX design doc

#### Accessibility & Testing

- **Every interactive element** must have a `testID` prop
- **Every interactive/semantic element** must have an `accessibilityLabel`

#### Navigation

- Navigation uses React Navigation 7.x with Stack + Tab + Modal patterns
- Tab Navigator: Dashboard | Settings
- Dashboard Stack: ItemList → ItemDetail → EditItem
- Camera and Review Form are modal screens

#### Image Pipeline

- Compress images before upload: max 1280px resize via `expo-image-manipulator`
- Image compression must complete in < 2 seconds (NFR-P1)
- Only rear camera — configure `expo-camera` accordingly

### Architectural Boundary Rules

1. **UI → Stores only** — Screens/components read state from Zustand and dispatch actions. **No direct service calls from UI.**
2. **Stores → Services** — Business logic lives in `services/`. Stores call services and update state with results.
3. **Services → Firebase** — All Firebase SDK calls are encapsulated in `services/`. **No raw Firestore/Storage/Auth calls outside `services/`.**
4. **Cloud Function → Gemini** — The mobile app **NEVER** calls Gemini directly. All AI requests go through `analyzeItem` Cloud Function.
5. **MMKV ↔ Zustand** — Local persistence is handled exclusively through Zustand's persist middleware with MMKV adapter. **No direct MMKV reads/writes outside `mmkvStorage.ts`.**

### Error Handling Patterns

- UI layer: React Error Boundary at screen level — catch render errors, show friendly fallback
- API calls: `try/catch` with typed error responses — `if (e.code === 'RATE_LIMITED') ...`
- AI Analysis: Zod `.safeParse()` with fallback to manual entry — **never throw on bad AI output**
- Network: NetInfo listener + offline banner — user always sees online/offline state
- Cloud Functions: Structured logging via `functions.logger` — include raw AI response in error logs
- **Error message tone**: Written by a calm, helpful friend. Example: _"Couldn't analyze image. Fill in details manually or retry."_

### Retry Pattern

- Max **2 retries** with exponential backoff (1s, 2s)
- Use the `withRetry<T>` utility function in services
- Never retry on client validation errors — only on transient network/server errors

### Loading State Patterns

| Context | State Variable | UI Pattern |
|---|---|---|
| AI Analysis | `isAnalyzing: boolean` | `ScanLoadingOverlay` (custom overlay, not bare spinner) |
| Dashboard load | `isLoading: boolean` | Skeleton item cards (3× shimmer) |
| Image upload | `uploadProgress: number` | Linear progress bar replacing Confirm button |
| Background sync | `pendingSyncCount: number` | `SyncStatusBar` (persistent, non-blocking) |

### Testing Rules

- Test files are **co-located** in `__tests__/` directories alongside source files
- Test file naming: `{SourceFile}.test.tsx` or `{SourceFile}.test.ts`
- Use `testID` props for component selection in tests
- Zod schemas should have dedicated unit tests with valid and invalid input cases
- Cloud Function tests are in `functions/__tests__/`

### Code Quality & Style Rules

- ESLint + Prettier are configured — all code must pass linting
- **Import convention**: Use `@/` path alias for src imports (e.g., `import { theme } from '@/constants/theme'`)
- No unused imports or variables
- Prefer named exports for services, hooks, and utilities
- Default exports for screen and component files

### Development Workflow Rules

- CI/CD via GitHub Actions: lint + type check on PR
- Android distribution: Side-loaded APK via EAS Build (no Play Store for MVP)
- iOS distribution: Expo Go for demo (no App Store for MVP)
- Firebase environment config for secrets (`GEMINI_API_KEY`) — **never in client bundle**
- Monitoring: Firebase Crashlytics + Cloud Function logs

---

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component files | PascalCase `.tsx` | `ItemCard.tsx`, `ScanLoadingOverlay.tsx` |
| Hook files | camelCase with `use` prefix `.ts` | `useItemStore.ts`, `useNetworkStatus.ts` |
| Utility files | camelCase `.ts` | `imageCompressor.ts`, `csvExporter.ts` |
| Type files | camelCase `.ts` | `item.types.ts`, `api.types.ts` |
| Constant files | camelCase `.ts` | `theme.ts`, `config.ts` |
| Components | PascalCase | `ItemCard`, `SyncStatusBar` |
| Functions | camelCase | `compressImage`, `analyzeItem` |
| Variables | camelCase | `syncStatus`, `isLoading` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_IMAGE_SIZE`, `AI_TIMEOUT_MS` |
| Zustand stores | `use` + Entity + `Store` | `useItemStore`, `useAuthStore` |
| Types/Interfaces | PascalCase | `ItemDocument`, `LocalDraft` |
| Enums | PascalCase | `SyncStatus.Pending` |
| Cloud Function names | camelCase | `analyzeItem`, `syncItem` |
| Environment vars | SCREAMING_SNAKE_CASE | `GEMINI_API_KEY` |
| Firestore collections | camelCase, plural | `items`, `users` |
| Firestore fields | camelCase | `syncStatus`, `createdAt` |
| Firestore paths | `users/{userId}/items/{itemId}` | User-scoped |

---

## Project Structure

```
snaplog-ai-vision/
├── src/                              # React Native application source
│   ├── App.tsx                       # App root with providers
│   ├── constants/                    # Theme, config, categories
│   ├── types/                        # TypeScript type definitions
│   ├── navigation/                   # React Navigation config
│   ├── screens/                      # Screen-level components
│   ├── components/                   # Reusable UI components
│   ├── stores/                       # Zustand stores
│   ├── services/                     # Business logic + Firebase calls
│   ├── hooks/                        # Custom React hooks
│   ├── utils/                        # Pure utility functions
│   └── assets/                       # Static assets
├── functions/                        # Firebase Cloud Functions (Node.js 20)
│   ├── src/
│   │   ├── index.ts                  # Cloud Function exports
│   │   ├── analyzeItem.ts            # Gemini AI analysis
│   │   ├── prompts/                  # Gemini prompt templates
│   │   ├── validators/               # Zod schemas
│   │   ├── middleware/               # Rate limiter
│   │   └── utils/                    # Gemini client, response parser, logger
│   └── __tests__/                    # Cloud Function tests
├── assets/                           # Fonts, images, icons
├── firestore.rules                   # Firestore Security Rules
├── storage.rules                     # Cloud Storage Security Rules
└── firebase.json                     # Firebase project config
```

**Critical:** All new files **must** be placed in the appropriate directory above. No ad-hoc directory creation.

---

## API Contract

**Cloud Function: `analyzeItem` (HTTPS Callable)**

```typescript
// Input
interface AnalyzeItemRequest {
  imageUrl: string;  // Cloud Storage download URL
}

// Output
interface AnalyzeItemResponse {
  success: boolean;
  data?: { title: string; category: string; color: string; condition: string; };
  error?: { code: 'RATE_LIMITED' | 'AI_PARSE_FAILURE' | 'AI_TIMEOUT' | 'INVALID_IMAGE'; message: string; };
}
```

**All Cloud Function responses** must use the `{ success, data, error }` wrapper format.

---

## Critical Don't-Miss Rules

### Anti-Patterns to AVOID

- ❌ **No `useState` for global state** — use Zustand stores
- ❌ **No hardcoded colors/spacing** — use `theme.ts` tokens
- ❌ **No raw Firebase SDK calls in UI or stores** — go through `services/`
- ❌ **No client-side Gemini API calls** — must go through Cloud Function
- ❌ **No `firebase/compat` imports** — use modular `firebase/firestore`, `firebase/auth` etc.
- ❌ **No `undefined` in persisted data** — use `null`
- ❌ **No unhandled async operations** — always `try/catch`
- ❌ **No `// @ts-ignore`** — fix the type error instead
- ❌ **No Expo Router** — use React Navigation 7.x
- ❌ **No native modules requiring ejection** — Expo Managed Workflow only

### Security Rules

- Gemini API key stored in Firebase environment config — **never in client code**
- Firestore Security Rules enforce `request.auth.uid == userId` for all reads/writes
- Cloud Storage rules scope access to `users/{userId}/items/*`
- Anonymous auth is supported — users can start without sign-up

### Performance Gotchas

- Use `React.memo` on `ItemCard` and other list item components
- FlatList with virtualization in `DashboardScreen` — never render full list
- Use `useDebounce` for search input — don't fire on every keystroke
- Lazy load non-critical screens for warm start < 3 seconds
- Compress images to max 1280px before upload

### Offline-First Requirements

- Every write must work offline — draft to MMKV, sync when online
- Sync triggers: (a) network restored, (b) app foregrounded, (c) new draft saved while online
- No custom event bus — all sync communication via Zustand store subscriptions
- Drafts must survive force-quit (MMKV persistence)

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Check the architecture document for detailed data models and flow diagrams

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review periodically for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-02-25
