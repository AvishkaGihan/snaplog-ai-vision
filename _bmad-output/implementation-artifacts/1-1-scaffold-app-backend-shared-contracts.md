# Story 1.1: Scaffold App + Backend + Shared Contracts

Status: done

## Story

As a developer,
I want a scaffolded Expo app and Firebase backend with shared contracts,
So that we can ship features safely without schema and status drift.

## Acceptance Criteria

**Given** a new clone of the repo
**When** I run the documented install/start steps for the app and functions
**Then** the Expo app boots successfully and Firebase Functions compile successfully
**And** the project is initialized from the selected starter (Expo Router tabs template + Firebase project scaffolding)
**And** a shared contracts module exists defining (at minimum) the item status enum and AI response schema validator

## Tasks / Subtasks

- [x] **Task 1: Initialize Monorepo Structure** (AC: All)
  - [x] 1.1 Create root `package.json` with npm workspaces configuration for `contracts/`, `functions/`, `mobile/`
  - [x] 1.2 Create `tsconfig.base.json` with shared TypeScript defaults
  - [x] 1.3 Create root `.gitignore` with Node, Expo, Firebase ignores
  - [x] 1.4 Create `.editorconfig`, `.prettierrc.cjs`, `.prettierignore`
  - [x] 1.5 Create `eslint.config.js` (unified lint config)
  - [x] 1.6 Create `.npmrc` file

- [x] **Task 2: Scaffold Expo App** (AC: Expo app boots successfully)
  - [x] 2.1 Run `npx create-expo-app@3.5.3 mobile --template tabs` from repo root
  - [x] 2.2 Verify Expo Router tabs structure is created under `mobile/`
  - [x] 2.3 Update `mobile/package.json` name to match workspace naming
  - [x] 2.4 Create `mobile/tsconfig.json` extending base config
  - [x] 2.5 Verify `npm run dev -w mobile` starts Expo successfully

- [x] **Task 3: Scaffold Firebase Backend** (AC: Firebase Functions compile successfully)
  - [x] 3.1 Run `firebase init functions firestore storage` from repo root (TypeScript)
  - [x] 3.2 Move/organize `functions/` folder structure per architecture
  - [x] 3.3 Create `functions/tsconfig.json` extending base config
  - [x] 3.4 Configure Functions for `asia-south1` region in `functions/src/config/region.ts`
  - [x] 3.5 Create placeholder callable functions: `analyzeItem`, `exportInventoryCsv`, `requestAccountDeletion`
  - [x] 3.6 Verify `npm run build -w functions` compiles successfully
  - [x] 3.7 Create `firestore.rules` with per-user isolation template
  - [x] 3.8 Create `storage.rules` with per-user isolation and image-only constraints

- [x] **Task 4: Create Shared Contracts Package** (AC: Shared contracts module exists)
  - [x] 4.1 Create `contracts/package.json` with Zod dependency
  - [x] 4.2 Create `contracts/tsconfig.json` extending base config
  - [x] 4.3 Create `contracts/src/index.ts` as main entry point
  - [x] 4.4 Create `contracts/src/enums/item-status.enum.ts` with status state machine
  - [x] 4.5 Create `contracts/src/enums/taxonomy.enum.ts` with 15-20 category taxonomy
  - [x] 4.6 Create `contracts/src/schemas/item.schema.ts` with Zod schema for item record
  - [x] 4.7 Create `contracts/src/schemas/ai.schema.ts` with strict AI response validator
  - [x] 4.8 Create `contracts/src/schemas/export.schema.ts` for CSV export column contract
  - [x] 4.9 Create `contracts/src/schemas/callable.schema.ts` for callable payloads
  - [x] 4.10 Create `contracts/src/utils/zod-helpers.ts` for shared validation utilities
  - [x] 4.11 Create `contracts/src/utils/id-helpers.ts` for ID generation patterns
  - [x] 4.12 Verify contracts import correctly in both `mobile/` and `functions/`

- [x] **Task 5: Configure CI/CD Foundation** (AC: All - project setup)
  - [x] 5.1 Create `.github/workflows/ci.yml` with lint/typecheck/test jobs
  - [x] 5.2 Configure path filters for per-package CI isolation
  - [x] 5.3 Verify CI pipeline runs successfully on push

- [x] **Task 6: Documentation & Verification** (AC: Documented install/start steps)
  - [x] 6.1 Update root `README.md` with install/start instructions
  - [x] 6.2 Document workspace commands: dev, build, test for each package
  - [x] 6.3 Verify fresh clone → install → start workflow works end-to-end

## Dev Notes

### Architecture Compliance

This story establishes the foundational structure defined in [architecture.md](../_bmad-output/planning-artifacts/architecture.md). All subsequent stories depend on this scaffold being correctly implemented.

**Critical Architecture Decisions to Implement:**

1. **Monorepo Structure**: npm workspaces with `contracts/`, `functions/`, `mobile/`
2. **TypeScript End-to-End**: Shared `tsconfig.base.json` with per-package extensions
3. **Expo Router Tabs**: Selected starter template matching the tabbed IA (Dashboard / Queue / Inventory / Settings)
4. **Firebase Backend**: Auth + Firestore + Storage + Functions (TypeScript)
5. **Shared Contracts**: Zod-based schemas + enums for anti-drift

### Technical Stack & Versions

**CRITICAL - Use these exact versions:**

| Package              | Version  | Purpose                                               |
| -------------------- | -------- | ----------------------------------------------------- |
| `create-expo-app`    | `3.5.3`  | Expo scaffolding                                      |
| `firebase-tools`     | `15.5.1` | Firebase CLI                                          |
| `firebase`           | `12.8.0` | Client SDK (mobile)                                   |
| `firebase-admin`     | `13.6.0` | Admin SDK (functions)                                 |
| `firebase-functions` | `7.0.5`  | Functions SDK                                         |
| `zod`                | `4.3.6`  | Schema validation (contracts)                         |
| `@google/genai`      | `1.39.0` | AI SDK (functions only - not installed in this story) |

[Source: architecture.md#starter-template-evaluation]

### Project Structure Requirements

**Complete Directory Structure to Create:**

```
snaplog-ai-vision/
├── README.md
├── package.json                         # npm workspaces root
├── package-lock.json
├── .gitignore
├── .gitattributes
├── .editorconfig
├── .npmrc
├── tsconfig.base.json                   # shared TS defaults
├── eslint.config.js                     # unified lint config
├── .prettierrc.cjs
├── .prettierignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── firebase.json
├── .firebaserc
├── firestore.indexes.json
├── firestore.rules
├── storage.rules
├── contracts/                           # shared Zod schemas + enums
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── schemas/
│       │   ├── item.schema.ts
│       │   ├── export.schema.ts
│       │   ├── callable.schema.ts
│       │   └── ai.schema.ts
│       ├── enums/
│       │   ├── item-status.enum.ts
│       │   └── taxonomy.enum.ts
│       └── utils/
│           ├── zod-helpers.ts
│           └── id-helpers.ts
├── functions/                           # Firebase Cloud Functions
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                     # exports callable functions
│       ├── config/
│       │   └── region.ts                # asia-south1
│       └── callable/
│           ├── analyze-item.ts          # placeholder
│           ├── export-inventory-csv.ts  # placeholder
│           └── request-account-deletion.ts # placeholder
└── mobile/                              # Expo app
    ├── package.json
    ├── tsconfig.json
    ├── app.json
    └── app/                             # Expo Router routes
        ├── _layout.tsx
        └── (tabs)/
            ├── _layout.tsx
            ├── index.tsx                # Dashboard
            ├── queue.tsx
            ├── inventory.tsx
            └── settings.tsx
```

[Source: architecture.md#project-structure-boundaries]

### Item Status State Machine

**CRITICAL: Implement this exact status enum in `contracts/`:**

```typescript
// Primary flow: DRAFT_LOCAL → UPLOADING → ANALYZING → READY → CONFIRMED
// Failure state: FAILED with metadata (failureStage, failureReason, retryCount)

export enum ItemStatus {
  DRAFT_LOCAL = 'DRAFT_LOCAL',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  READY = 'READY',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}
```

[Source: architecture.md#data-architecture]

### Category Taxonomy

**Implement 15-20 predefined categories:**

```typescript
export enum ItemCategory {
  TOPS = 'TOPS',
  BOTTOMS = 'BOTTOMS',
  DRESSES = 'DRESSES',
  OUTERWEAR = 'OUTERWEAR',
  SHOES = 'SHOES',
  BAGS = 'BAGS',
  ACCESSORIES = 'ACCESSORIES',
  JEWELRY = 'JEWELRY',
  ACTIVEWEAR = 'ACTIVEWEAR',
  SWIMWEAR = 'SWIMWEAR',
  SLEEPWEAR = 'SLEEPWEAR',
  SUITS_FORMAL = 'SUITS_FORMAL',
  VINTAGE = 'VINTAGE',
  DESIGNER = 'DESIGNER',
  ELECTRONICS = 'ELECTRONICS',
  HOME_GOODS = 'HOME_GOODS',
  COLLECTIBLES = 'COLLECTIBLES',
  OTHER = 'OTHER',
}
```

[Source: PRD FR29-FR30, architecture.md#data-architecture]

### Item Record Schema

**Implement in `contracts/src/schemas/item.schema.ts`:**

```typescript
// Identity/audit: id, ownerUid, createdAt, updatedAt
// Status: status, failureStage?, failureReason?, retryCount
// Image refs: localUri?, storagePath, sha256?, width?, height?, bytes?
// AI result: schemaVersion, taxonomyVersion, attempts, lastModel, rawJson?, parsed
// Human fields: title, brand, category, size, color, condition, description, tags[]
// Export metadata: lastExportedAt?
```

[Source: architecture.md#data-architecture]

### AI Response Schema

**Strict JSON-only validation in `contracts/src/schemas/ai.schema.ts`:**

- Must validate against exact JSON schema structure
- Schema version tracking required
- Taxonomy version tracking required
- Support for graceful fallback on invalid output

[Source: architecture.md#ai-extraction-contract, PRD FR26]

### Firebase Configuration

**Region:** `asia-south1` (Mumbai) - minimizes latency for Sri Lanka-based usage

**Firestore Structure:**

- `users/{uid}/items/{itemId}` - per-user item records
- `users/{uid}/exports/{exportId}` - export records

**Storage Structure:**

- `users/{uid}/items/{itemId}/original.jpg`
- `users/{uid}/items/{itemId}/thumb.jpg`

[Source: architecture.md#data-architecture]

### Firestore Rules Template

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Per-user isolation - only allow access to own data
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

[Source: architecture.md#authentication-security]

### Storage Rules Template

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Per-user isolation + image-only constraints
    match /users/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid
        && request.resource.contentType.matches('image/.*')
        && request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
  }
}
```

[Source: architecture.md#authentication-security]

### Naming Conventions

**CRITICAL - Follow these patterns consistently:**

| Context               | Convention | Example                            |
| --------------------- | ---------- | ---------------------------------- |
| Firestore fields      | camelCase  | `ownerUid`, `createdAt`            |
| SQLite tables/columns | snake_case | `queue_jobs`, `item_id`            |
| React components      | PascalCase | `ItemCard`, `QueueScreen`          |
| Hooks                 | useThing   | `useQueueState`                    |
| Files                 | kebab-case | `item-card.tsx`, `queue-engine.ts` |
| Directories           | kebab-case | `local-db/`, `callable/`           |

[Source: architecture.md#naming-patterns]

### Callable Functions Placeholder Structure

Each callable function should:

1. Export from `functions/src/index.ts`
2. Use `onCall` from `firebase-functions/v2/https`
3. Set region to `asia-south1`
4. Return placeholder response for now (implementation in later stories)

```typescript
// Example structure for analyze-item.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { REGION } from '../config/region';

export const analyzeItem = onCall({ region: REGION }, async (request) => {
  // Placeholder - will be implemented in Epic 4
  throw new HttpsError('unimplemented', 'Not yet implemented');
});
```

[Source: architecture.md#api-communication-patterns]

### CI/CD Configuration

**GitHub Actions workflow should:**

1. Run on push to main and pull requests
2. Use path filters for per-package isolation
3. Run lint → typecheck → test for each package
4. Install dependencies at root (npm workspaces)

[Source: architecture.md#infrastructure-deployment]

## Testing Requirements

### Verification Checklist

- [ ] Fresh clone → `npm install` succeeds
- [ ] `npm run dev -w mobile` starts Expo and shows tabs UI
- [ ] `npm run build -w functions` compiles without errors
- [ ] `npm run build -w contracts` compiles without errors
- [ ] Contracts can be imported in both mobile and functions packages
- [ ] Item status enum is available from contracts
- [ ] AI response schema validator is available from contracts
- [ ] Firestore rules file exists with per-user isolation
- [ ] Storage rules file exists with per-user isolation
- [ ] CI workflow file exists and is valid YAML

### Manual Verification Steps

1. Clone fresh copy of repo
2. Run `npm install` at root
3. Run `npm run dev -w mobile` - should see Expo dev server and tabs UI
4. Run `npm run build -w functions` - should compile successfully
5. Verify `contracts` imports work in both packages

## References

- [Architecture Decision Document](_bmad-output/planning-artifacts/architecture.md)
- [PRD - Functional Requirements](_bmad-output/planning-artifacts/prd.md#functional-requirements)
- [Epics - Story 1.1](_bmad-output/planning-artifacts/epics.md#story-11-scaffold-app--backend--shared-contracts)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Completion Notes List

- ✅ All 6 tasks complete - monorepo scaffold established
- ✅ Contracts package: 18 category taxonomy, item status state machine, Zod schemas
- ✅ Functions: 3 placeholder callables (analyzeItem, exportInventoryCsv, requestAccountDeletion)
- ✅ Mobile: Expo Router tabs template integrated
- ✅ Firestore/Storage rules: Per-user isolation implemented
- ✅ CI workflow: Validates lint/typecheck/build per package
- ✅ All packages typecheck successfully
- ✅ Contracts import verified in both mobile and functions

### Change Log

- 2026-02-04: Initial scaffold implementation - monorepo structure, Expo app, Firebase functions, shared contracts
- 2026-02-05: Code Review Fixes - Updated Expo Router tabs structure to match Architecture (Dashboard, Queue, Inventory, Settings). Fixed ESLint configuration and dependencies.

### File List

- package.json
- tsconfig.base.json
- .gitignore
- .editorconfig
- .prettierrc.cjs
- .prettierignore
- eslint.config.js
- .npmrc
- README.md
- firebase.json
- .firebaserc
- firestore.indexes.json
- firestore.rules
- storage.rules
- .github/workflows/ci.yml
- contracts/package.json
- contracts/tsconfig.json
- contracts/src/index.ts
- contracts/src/enums/item-status.enum.ts
- contracts/src/enums/taxonomy.enum.ts
- contracts/src/schemas/item.schema.ts
- contracts/src/schemas/ai.schema.ts
- contracts/src/schemas/export.schema.ts
- contracts/src/schemas/callable.schema.ts
- contracts/src/utils/zod-helpers.ts
- contracts/src/utils/id-helpers.ts
- functions/package.json
- functions/tsconfig.json
- functions/src/index.ts
- functions/src/config/region.ts
- functions/src/callable/analyze-item.ts
- functions/src/callable/export-inventory-csv.ts
- functions/src/callable/request-account-deletion.ts
- mobile/package.json
- mobile/tsconfig.json
- mobile/components/ExternalLink.tsx (fixed TS error)
- mobile/components/useClientOnlyValue.ts (fixed TS error)
- mobile/app/(tabs)/queue.tsx
- mobile/app/(tabs)/inventory.tsx
- mobile/app/(tabs)/settings.tsx
