---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/ux-design-directions.html
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-04'
project_name: 'snaplog-ai-vision'
user_name: 'AvishkaGihan'
date: '2026-02-04'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (architectural implications):**
- Authentication + account lifecycle: email/password auth, settings, password reset, and in-app delete account with asynchronous backend cleanup.
- Burst capture + intake workflow: rapid capture/import that never blocks the camera; each capture becomes a draft immediately; enforce batch cap of 20.
- Offline-first drafts (photos are “sacred”): store photos + metadata locally; persist across restarts; resumable sync when connectivity returns; user can delete local drafts.
- Queue + state machine: per-item statuses (Draft, Uploading, Analyzing, Ready, Failed, Confirmed); persistent queue across restarts; retries; optional parallelism capped at 2 items concurrently.
- AI extraction contract: vision-to-JSON with strict schema validation; taxonomy-constrained categories (15–20); retry invalid JSON once; then manual edit fallback without blocking save.
- Review/edit/confirm loop: review-first UX that prioritizes Brand/Size/Condition; fast “Confirm & Next”; edits on drafts and saved items; delete item supported.
- Export: CSV export of user inventory; include server-generated signed image URLs (7-day expiry); exports must be per-user authorized only.
- Notifications: local notifications for batch completion and “ready” items (no remote push infra in MVP).

**Non-Functional Requirements (architecture drivers):**
- Performance: p50 < 4s / p95 < 8s for upload+analyze+parse+ready on good networks; client remains responsive during 20-item burst + background processing.
- Reliability/resilience: offline capture must always succeed; queue safe to retry without irreconcilable duplicates; invalid AI output cannot dead-end the user; export failures surface actionable retry quickly.
- Security/privacy: TLS in transit; strict per-user isolation for items and images; API keys/secrets never shipped in the mobile bundle; prompts/data model exclude buyer/supplier PII; signed URLs expire in 7 days.
- Scalability/limits: backend enforces ≤ 20 requests / 5 min and ≤ 2 concurrent analyses per user; client queue must respect throttling.
- Observability: server-side logging of processing events without sensitive payloads; correlation identifiers across client → server → model call.
- Accessibility: pragmatic WCAG 2.1 AA intent, clear labels, dynamic type up to 200%, reduce-motion support.

**Scale & Complexity:**
- Primary domain: mobile-first inventory ops / reseller workflow
- Complexity level: medium
- Estimated architectural components: ~9
  - Mobile app UI + navigation (capture tunnel, queue, inventory, settings)
  - On-device storage (photos + draft metadata) and offline sync coordinator
  - Client-side queue engine + durable state machine
  - Backend API/functions surface (auth-bound operations, export, signed URLs, deletion orchestration)
  - AI integration layer (request shaping, schema validation, retries, taxonomy enforcement)
  - Data store for inventory items + statuses + audit fields
  - Object storage for images with per-user access controls
  - Export pipeline (CSV generation + signed URL issuance)
  - Observability + rate-limiting enforcement

### Technical Constraints & Dependencies

- Offline-first requirement implies a local persistence layer for photos + draft metadata and a resumable upload/analysis workflow.
- Strict JSON-only AI output with schema validation and taxonomy constraints is a hard contract; architecture must handle invalid output deterministically.
- Signed URL generation for export implies a trusted server-side signer and short-lived link policy (7 days).
- Account deletion requires asynchronous cleanup of cloud data and local best-effort cleanup; user-facing behavior must be immediate even if backend cleanup takes time.
- Rate limits and concurrency caps shape both client queue scheduling and backend enforcement.

### Cross-Cutting Concerns Identified

- Status taxonomy consistency across client, backend, and export (shared enum + transition rules).
- Idempotency + deduplication semantics for retries (upload/analyze/export/delete).
- Schema versioning and validation strategy for AI output (including safe fallbacks).
- Per-user security boundaries (data isolation for items, images, exports, and signed URLs).
- Observability/correlation IDs across distributed steps (client → function → model).
- Data lifecycle: local drafts retention, cloud retention, export link expiry, and deletion guarantees.

## Starter Template Evaluation

### Primary Technology Domain

Mobile app + serverless backend (full-stack) based on: burst capture + offline drafts + async processing queue + AI vision-to-JSON + export (signed URLs) + account deletion orchestration.

### Starter Options Considered

1) **Expo (create-expo-app) “tabs” template (Expo Router) + TypeScript**
- Strengths: matches the tabbed IA (Dashboard / Queue / Inventory / Settings), supports a “capture tunnel” via stack routing, and is the most standard Expo starting point for shipping quickly.
- Trade-offs: requires deliberate module boundaries to keep “queue engine / storage / AI contract” from leaking into UI components.

2) **Expo blank-typescript**
- Strengths: maximum control over navigation and structure.
- Trade-offs: more setup work; higher risk of inconsistent patterns.

3) **Firebase backend scaffolding**
- Firebase Auth + Firestore + Storage + Cloud Functions (TypeScript) provides a cohesive baseline for:
  - Per-user access control (rules)
  - Image storage isolation
  - Server-side signed URL generation for export
  - Server-side AI call (keys not shipped to app)
  - Account deletion orchestration

### Selected Starter: Expo Router Tabs + Firebase (Monorepo)

**Rationale for Selection:**
- UX spec explicitly calls for tabs + a persistent “mini-queue instrument panel”; Expo Router tabs are a clean fit.
- PRD requires strict per-user isolation, signed URLs, and “secrets server-side” — Firebase + Functions covers these with minimal infra overhead.
- Queue + offline-first requirements benefit from a single-repo structure that keeps shared contracts (schemas/enums) consistent across app + functions.

**Initialization Commands (Monorepo layout):**

```bash
# From repo root
npx create-expo-app@3.5.3 app --template tabs

# Firebase scaffolding (run from repo root; creates firebase.json, .firebaserc, functions/, etc.)
npm i -g firebase-tools@15.5.1
firebase login
firebase init functions firestore storage
# Choose: TypeScript for Functions
```

**Architectural Decisions Provided by Starter**

**Language & Runtime:**
- TypeScript end-to-end
- Expo-managed React Native app in `app/`
- Firebase Cloud Functions in `functions/` (Node runtime managed by Firebase)

**Routing & App Structure:**
- Expo Router with tabs (aligns with Dashboard / Queue / Inventory / Settings)
- Enables “Capture tunnel” as a stack route (camera flow protected from casual navigation)

**Backend Foundations:**
- Firebase Auth for identity
- Firestore for item records + status/state machine fields
- Storage for images (per-user paths + rules)
- Functions for:
  - AI extraction call (Google) and schema validation
  - CSV export generation and signed URL issuance (7-day expiry policy)
  - Delete-account orchestration (async cleanup)

**Key Libraries to Adopt Early (baseline):**
- Firebase client SDK: `firebase@12.8.0`
- Functions dependencies: `firebase-admin@13.6.0`, `firebase-functions@7.0.5`
- JSON schema enforcement in both app + functions (recommended): `zod@4.3.6`
- Google AI SDK (server-side in Functions): `@google/genai@1.39.0` (preferred over older `@google/generative-ai@0.24.1`)

**Note:** Project initialization using these commands should be the first implementation story. Establish shared “contracts” early (status enum, item schema, AI response schema, export columns) to prevent drift between app and functions.

## Core Architectural Decisions

### Data Architecture

**Decision:** Firestore per-user subcollections (multi-tenant isolation by path)
- Structure:
  - `users/{uid}/items/{itemId}`
  - `users/{uid}/exports/{exportId}`
- Rationale: strict per-user isolation and simpler Security Rules; aligns with “per-user data/image isolation” requirements.

**Item Status State Machine (single shared enum):**
- Primary flow: `DRAFT_LOCAL` → `UPLOADING` → `ANALYZING` → `READY` → `CONFIRMED`
- Failure state: `FAILED` with metadata (`failureStage`, `failureReason`, `retryCount`)
- Review logic: infer review need from `status === READY` (no separate `needsReview` flag).
- “CONFIRMED” definition: user-verified only; export is tracked separately (e.g., `lastExportedAt`).

**Item Record (high-level fields):**
- Identity/audit: `id`, `ownerUid`, `createdAt`, `updatedAt`
- Status: `status`, `failureStage?`, `failureReason?`, `retryCount`
- Image refs: `localUri?`, `storagePath`, `sha256?`, `width?`, `height?`, `bytes?`
- AI result: `schemaVersion`, `taxonomyVersion`, `attempts`, `lastModel`, `rawJson?`, `parsed`
- Human fields: `title`, `brand`, `category`, `size`, `color`, `condition`, `description`, `tags[]`
- Export metadata: `lastExportedAt?`

**Storage & Export Strategy:**
- Cloud Storage paths:
  - `users/{uid}/items/{itemId}/original.jpg`
  - `users/{uid}/items/{itemId}/thumb.jpg` (generated thumbnail)
- Offline handling: local drafts preserve photos + metadata; cloud stores original + thumb once synced.
- Signed URLs: generated server-side (Cloud Functions) at CSV export time with 7-day TTL.

**Shared Contracts (anti-drift):**
- Monorepo shared package: `contracts/`
- Zod-based schemas + enums used by both Expo app and Cloud Functions to enforce:
  - status enum consistency
  - item schema consistency
  - AI vision “strict JSON schema” validation
  - export column contract

### Authentication & Security

**Authentication:** Firebase Auth (Email/Password)

**Server interface (mobile → backend):** HTTPS Callable Functions (Cloud Functions)
- Rationale: callable requests automatically include Firebase Auth tokens and App Check tokens (when available), giving the backend a verified `context.auth` and simplifying client implementation.

**App hardening:** Firebase App Check enabled for MVP
- Android provider: Play Integrity
- iOS provider: App Attest
- Enforcement posture: ship with monitoring first, then enable enforcement once metrics confirm legitimate client coverage.

**Authorization & Isolation posture:** strict per-user isolation everywhere
- Firestore Rules: only allow reads/writes under the authenticated user’s `users/{uid}/...` path.
- Storage Rules: only allow reads/writes under `users/{uid}/...` with constraints (image-only + size limits).
- Functions: require authenticated callable context (`context.auth` present) for all sensitive operations (analyze, export, delete account) and enforce per-user rate limits/concurrency caps.

**Account deletion semantics (function-led deletion):**
- Client calls a callable function to request deletion.
- Function sets a “deleting” flag on the user record.
- Function orchestrates deletion of:
  - Firestore docs in `users/{uid}/items/**` and related collections (e.g., exports)
  - Storage objects under `users/{uid}/...`
- Function finally removes/disables the Auth user.
- User-facing behavior: immediate logout/disable, while backend cleanup completes asynchronously.

### API & Communication Patterns

**Backend interface:** Firebase HTTPS Callable Functions (mobile → backend)

**Callable function surface (MVP):**
- `analyzeItem`
  - Purpose: run server-side AI extraction (Gemini) for a given `itemId`, validate strict JSON schema, persist results to Firestore.
  - Notes: enforces “only one active analysis per item”; supports retries.
- `exportInventoryCsv`
  - Purpose: generate CSV export for a chosen scope and include **7-day signed image URLs**.
  - Notes: signed URL generation is done inside this function to minimize round-trips for the “Weekly Export” ritual.
- `requestAccountDeletion`
  - Purpose: initiate function-led account deletion orchestration (flag → cleanup → remove/disable auth).

**Error handling standard (client-visible contract):**
- Use `HttpsError` with a small taxonomy + `details`:
  - `invalid-argument`: validation errors / schema mismatch / bad params
    - Client behavior: if AI output fails validation → route to manual edit fallback (anti-fragility path).
  - `unauthenticated` / `permission-denied`: auth/rules violations
    - Client behavior: force re-auth; block sensitive actions.
  - `failed-precondition`: item not in a valid state for requested action
    - Client behavior: refresh item + show actionable guidance.
  - `resource-exhausted`: rate limited / concurrency cap reached
    - Client behavior: show “Throttled” UI state with countdown using `details.retryAfterSeconds`.
  - `internal`: unexpected server error
    - Client behavior: show Retry CTA; keep captured photos safe.

**Idempotency & retry safety:**
- Deterministic image storage path: `users/{uid}/items/{itemId}/original.jpg`
  - Repeated uploads overwrite safely (supports offline retries).
- Server-side concurrency guard: `analyzeItem` checks item status / in-flight markers to ensure **only one active analysis per item**.
- Analysis attempts tracked on the item (e.g., attempt counters + timestamps) to support “retry once → manual fallback”.

**Rate limiting signaling (metadata over new status):**
- Keep the primary status enum clean; represent throttling via metadata:
  - `throttledUntil: timestamp`
  - `isThrottled: boolean`
- UI may show “Uploading/Analyzing (Throttled)” while preserving the underlying progress state.

### Frontend Architecture

**Offline persistence (drafts + queue state):** SQLite (Expo SQLite)
- Rationale: durable local store for draft metadata + queue jobs; supports efficient queries/filters by status and survives app termination.
- Approach:
  - Store draft/item metadata and queue job rows in SQLite (e.g., `write_jobs` / `items_local` tables).
  - Store images in the device file system; persist `localUri` / file path references in SQLite.

**Client state management split:** React Query + Zustand
- React Query (`@tanstack/react-query`) manages “server state” (Firestore subscriptions/results), caching, and background refetch behavior.
- Zustand manages local UI state and the queue engine’s in-flight progress, without Redux-level overhead.

**Queue engine architecture:** standalone module (decoupled from screens)
- Responsibilities:
  - On-device image compression (< 500KB target) using `expo-image-manipulator`
  - Durable job execution from SQLite queue tables
  - Concurrency control (cap 2 parallel analyses)
  - Respect backend throttling via `throttledUntil` metadata
  - Continue processing across app navigation (and recover after restart)

**UI system:** Tamagui (adopt now)
- Rationale: supports dense, high-performance UI (inventory rows + instrument panel), theming/tokens, and aligns with the “pro-tool” UX direction despite being RC at the time of decision.

### Infrastructure & Deployment

**Build & release pipeline:** EAS Build + EAS Submit
- Rationale: reproducible, automated iOS/Android builds suitable for a professional portfolio MVP.
- Approach: maintain build profiles (development/preview/production) with `eas.json`; use EAS Submit for store uploads.
- Notes: native dependencies (e.g., Crashlytics) imply EAS builds (custom dev client when needed).

**OTA updates:** Expo Updates
- Use `expo-updates@29.0.16` with channels (e.g., `preview`, `production`) and a pinned runtime version strategy to avoid breaking native compatibility.

**Secrets & configuration posture (NFR12):** no secrets shipped in the app
- Mobile app contains only non-secret identifiers (Firebase config, project IDs).
- All AI keys and any signing secrets remain server-side in Firebase Secret Manager.
- Cloud Functions read secrets at runtime; secrets are never committed to the repo.

**Functions region:** `asia-south1` (Mumbai)
- Rationale: minimizes latency for Sri Lanka-based usage and reduces end-to-end time for upload → analyze → ready.

**Observability (lean MVP stack):** Firebase Crashlytics + Cloud Functions logs
- Client: Firebase Crashlytics (`@react-native-firebase/crashlytics@23.8.6`) for crash reporting.
- Server: Cloud Functions structured logs for pipeline events (upload received, analysis started/completed, export started/completed).
- Privacy: log correlation IDs and high-level status only; do not log raw images or full AI payloads.

**CI/CD automation:** GitHub Actions (repo-wide)
- Run linting, typechecking, and tests for both `mobile/` and `functions/`.
- Prefer separate jobs per package (path filters) to keep CI fast and isolate failures.

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

To prevent incompatible implementations across agents, we standardize:

- Firestore field naming and serialization
- Callable Functions success payload shape + error taxonomy usage
- Timestamp representation crossing app ↔ functions boundaries
- SQLite schema naming vs in-memory TypeScript naming
- File naming vs component naming conventions in the monorepo
- End-to-end logging correlation for queue/analyze/export flows

### Naming Patterns

**Firestore / Shared Contracts:**
- Firestore document fields: `camelCase` only (no mapping layer).
- Shared schema source of truth: Zod schemas and enums in `contracts/`.
- Enum/string literals must match contracts exactly (no ad-hoc string values in app or functions).

**SQLite (local persistence):**
- SQLite tables and columns: `snake_case` (SQL convention).
- Mapping boundary: local DB rows map into TypeScript domain models (camelCase) in a single data-access layer.
- Never expose raw SQLite row objects to UI components.

**Code & Files:**
- React components: `PascalCase` symbol names (e.g., `ItemCard`).
- Hooks: `useThing` naming.
- Files: `kebab-case` everywhere (e.g., `item-card.tsx`, `queue-engine.ts`, `analyze-item.ts`).
- Directory names: `kebab-case` preferred for consistency.

### Format Patterns

**Callable Functions responses (success path):**
- Callable Functions return the **raw payload** (no `{ ok, data }` wrapper).
- Error path: use `HttpsError` with consistent codes:
  - `invalid-argument`, `unauthenticated`, `permission-denied`, `failed-precondition`, `resource-exhausted`, `internal`
- `resource-exhausted` should include structured `details`:
  - `retryAfterSeconds` (number)
  - `throttledUntilIso` (string, ISO-8601) when applicable

**Dates / timestamps across boundaries:**
- Firestore storage: native `Timestamp` fields.
- Functions → app: timestamps serialized as ISO strings (`toISOString()`), not epoch millis.
- App local storage (SQLite): ISO strings stored in text columns (or normalized integer columns if needed later), but app domain models should treat them as ISO strings.
- CSV export: use ISO strings for `createdAt`, `updatedAt`, `confirmedAt`, etc., unless a column explicitly requires a human-formatted date.

**JSON field naming:**
- Over-the-wire payloads between app and functions: `camelCase` keys.

### Structure Patterns

**Monorepo boundaries:**
- `mobile/`: UI, navigation, queue orchestration, local persistence, and Firebase client integration.
- `functions/`: callable endpoints, AI integration, signing/export, deletion orchestration, rate limiting.
- `contracts/`: shared Zod schemas, enums, and helper validators used by both `mobile/` and `functions/`.

**Layering rules (to avoid leakage):**
- UI components never call Firebase/Functions directly; they call a thin application service layer.
- Queue engine is UI-agnostic and exposes events/state via a small interface; screens only subscribe/render.
- All Firestore/Storage path building lives in one shared helper module to prevent drift.

### Process Patterns

**Logging & correlation (client + server):**
- Every queue job generates a `correlationId` at creation time and keeps it stable through retries.
- Every log entry includes:
  - `correlationId`
  - `uid` (when authenticated)
  - `itemId` (for item flows) and/or `exportId` (for export flows)
- Cloud Functions logs are structured (JSON-ish) and include:
  - `eventName` (e.g., `analyze.started`, `analyze.completed`, `export.started`, `export.completed`)
  - `durationMs`
  - high-level outcome fields (no raw images, no full model output)
- Client logs mirror the same `eventName` values where applicable for easy traceability.

**Error handling & recovery:**
- App treats `HttpsError` codes as the contract; UI behavior is driven by the code and `details`.
- Invalid AI output:
  - Retry exactly once server-side.
  - If still invalid: set item to a recoverable state and route user to manual edit (never dead-end).
- Throttling:
  - Represent with `throttledUntil` metadata (not a new status).
  - Queue respects throttling and schedules the next attempt after `throttledUntil`.

**Idempotency & retries:**
- Retries must be safe by design:
  - Deterministic storage paths are overwritten (upload retries).
  - Functions guard against duplicate “in-flight” analysis per item.
  - Queue jobs are de-duplicated by `(uid, itemId, jobType)` when creating new jobs.

## Project Structure & Boundaries

### Complete Project Directory Structure

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
├── eslint.config.js                     # unified lint config (per-package overrides)
├── .prettierrc.cjs
├── .prettierignore
├── .github/
│   └── workflows/
│       └── ci.yml                       # lint/typecheck/test for mobile + functions + contracts
├── firebase.json
├── .firebaserc
├── firestore.indexes.json
├── firestore.rules
├── storage.rules
├── docs/
│   ├── project-context.md               # optional: generated/maintained knowledge
│   └── api-contracts.md                 # callable payloads + schemas summary
├── scripts/
│   ├── check-workspaces.mjs             # guard: installs + workspace integrity
│   └── gen-correlation-id.mjs           # optional helper for tests/dev
├── contracts/                           # shared Zod schemas + enums (workspace)
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
├── functions/                            # Firebase Cloud Functions (workspace)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.cjs                     # override if needed (or rely on root eslint config)
│   ├── jest.config.cjs
│   └── src/
│       ├── index.ts                      # exports callable functions
│       ├── config/
│       │   ├── region.ts                 # asia-south1
│       │   ├── secrets.ts                # Secret Manager bindings
│       │   └── env.ts                    # non-secret env validation
│       ├── callable/
│       │   ├── analyze-item.ts
│       │   ├── export-inventory-csv.ts
│       │   └── request-account-deletion.ts
│       ├── services/
│       │   ├── ai/
│       │   │   ├── gemini-client.ts
│       │   │   ├── prompt-builder.ts
│       │   │   └── response-validator.ts
│       │   ├── exports/
│       │   │   ├── csv-writer.ts
│       │   │   └── signed-url.ts
│       │   └── deletion/
│       │       ├── delete-user-data.ts
│       │       └── delete-storage.ts
│       ├── data/
│       │   ├── firestore-paths.ts         # canonical path builders
│       │   ├── storage-paths.ts
│       │   └── repositories/
│       │       ├── items.repo.ts
│       │       └── exports.repo.ts
│       ├── middleware/
│       │   ├── require-auth.ts            # context.auth enforcement
│       │   ├── rate-limit.ts              # 20/5min and concurrency caps
│       │   └── app-check.ts               # optional enforcement helper
│       ├── observability/
│       │   ├── logger.ts                  # structured logs w/ correlationId
│       │   └── metrics.ts                 # optional timing helpers
│       └── utils/
│           ├── time.ts                    # ISO helpers
│           └── errors.ts                  # HttpsError helpers
├── mobile/                               # Expo app (workspace)
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json
│   ├── eas.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── jest.config.cjs
│   ├── assets/
│   ├── app/                              # Expo Router routes ONLY
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── queue.tsx
│   │   │   ├── inventory.tsx
│   │   │   └── settings.tsx
│   │   └── capture/
│   │       ├── _layout.tsx
│   │       ├── camera.tsx
│   │       └── review.tsx
│   └── src/                              # core logic + UI components (non-routes)
│       ├── bootstrap/
│       │   ├── init-firebase.ts
│       │   ├── init-crashlytics.ts
│       │   └── init-logging.ts
│       ├── config/
│       │   ├── firebase-config.ts         # non-secret IDs only
│       │   └── build-info.ts
│       ├── data/
│       │   ├── firestore/
│       │   │   ├── firestore-paths.ts     # must match functions
│       │   │   └── items.store.ts         # queries/subscriptions (React Query)
│       │   ├── storage/
│       │   │   └── storage-paths.ts
│       │   └── local-db/
│       │       ├── schema.sql             # snake_case tables/columns
│       │       ├── db.ts
│       │       ├── migrations.ts
│       │       ├── items.dao.ts
│       │       └── queue-jobs.dao.ts
│       ├── queue/
│       │   ├── queue-engine.ts            # UI-agnostic engine
│       │   ├── queue-scheduler.ts         # concurrency=2, throttling-aware
│       │   ├── queue-types.ts
│       │   └── queue-dedupe.ts
│       ├── services/
│       │   ├── callable/
│       │   │   ├── analyze-item.ts
│       │   │   ├── export-inventory-csv.ts
│       │   │   └── request-account-deletion.ts
│       │   ├── images/
│       │   │   ├── image-compress.ts      # <500KB target
│       │   │   └── image-hash.ts
│       │   └── auth/
│       │       ├── auth.service.ts
│       │       └── auth-session.ts
│       ├── state/
│       │   ├── queue.store.ts             # Zustand store
│       │   └── ui.store.ts
│       ├── ui/
│       │   ├── components/
│       │   │   ├── item-card.tsx
│       │   │   ├── instrument-panel.tsx
│       │   │   └── throttled-banner.tsx
│       │   ├── theme/
│       │   │   ├── tamagui.config.ts
│       │   │   └── tokens.ts
│       │   └── screens/                   # optional screen-level components
│       ├── observability/
│       │   ├── logger.ts                  # includes correlationId/uid/itemId
│       │   └── correlation-id.ts
│       ├── utils/
│       │   ├── time.ts                    # ISO helpers
│       │   ├── ids.ts
│       │   └── errors.ts                  # normalize HttpsError for UI
│       └── __tests__/
│           ├── queue-engine.test.ts
│           └── callable-contracts.test.ts
└── _bmad-output/
    └── planning-artifacts/
        └── architecture.md
```

### Architectural Boundaries

**API Boundaries:**
- Only Cloud Functions expose privileged operations:
  - `analyzeItem`, `exportInventoryCsv`, `requestAccountDeletion`
- Mobile app never talks directly to Gemini or holds any AI/signing secrets.
- Callable Functions return raw payload on success; failures are `HttpsError` with structured `details`.

**Component Boundaries:**
- `mobile/app/` contains route + navigation composition only.
- `mobile/src/` contains all reusable UI components and logic:
  - UI components do not call Firebase/Functions directly.
  - UI components interact with a thin service layer in `mobile/src/services/`.
- Queue engine (`mobile/src/queue/`) is UI-agnostic; screens subscribe to state.

**Service Boundaries:**
- `contracts/` is the single source of truth for schemas/enums; both `mobile/` and `functions/` import it.
- `functions/src/services/ai/` owns prompt building, model invocation, validation, and “retry once then fail safe”.
- `functions/src/services/exports/` owns CSV generation and signed URL issuance.
- `functions/src/services/deletion/` owns deletion orchestration.

**Data Boundaries:**
- Firestore fields: `camelCase` only (no mapping layer).
- SQLite tables/columns: `snake_case` (mapping occurs only in `mobile/src/data/local-db/`).
- Path builders must be centralized and mirrored:
  - `functions/src/data/*-paths.ts`
  - `mobile/src/data/*/*-paths.ts`

### Requirements to Structure Mapping

**Feature Mapping (by FR groups):**
- Auth + settings + account deletion
  - Mobile UI/routes: `mobile/app/(tabs)/settings.tsx`
  - Mobile auth services: `mobile/src/services/auth/*`
  - Backend callable: `functions/src/callable/request-account-deletion.ts`
  - Backend deletion orchestration: `functions/src/services/deletion/*`

- Burst capture + offline drafts
  - Routes: `mobile/app/capture/*`
  - Local persistence: `mobile/src/data/local-db/*` + image file storage helpers
  - Queue engine: `mobile/src/queue/*`

- Upload + analyze + state machine
  - Queue scheduling + concurrency + throttling: `mobile/src/queue/queue-scheduler.ts`
  - Callable client: `mobile/src/services/callable/analyze-item.ts`
  - Backend callable: `functions/src/callable/analyze-item.ts`
  - AI integration + schema validation: `functions/src/services/ai/*`
  - Shared schemas/status enum: `contracts/src/*`

- Review/edit/confirm loop
  - UI components: `mobile/src/ui/components/item-card.tsx`, `instrument-panel.tsx`
  - State: `mobile/src/state/*`
  - Firestore store/query layer: `mobile/src/data/firestore/items.store.ts`

- Export CSV with signed image URLs (7-day)
  - Callable client: `mobile/src/services/callable/export-inventory-csv.ts`
  - Backend callable: `functions/src/callable/export-inventory-csv.ts`
  - Export services: `functions/src/services/exports/*`
  - Contract for columns: `contracts/src/schemas/export.schema.ts`

**Cross-Cutting Concerns:**
- Rate limiting + concurrency caps
  - Server enforcement: `functions/src/middleware/rate-limit.ts`
  - Client compliance: `mobile/src/queue/queue-scheduler.ts`

- Observability + correlation IDs
  - Mobile logger: `mobile/src/observability/logger.ts`
  - Functions logger: `functions/src/observability/logger.ts`
  - Correlation propagation via queue jobs + callable payloads

- Error taxonomy + retries
  - Shared error normalization patterns: `mobile/src/utils/errors.ts`, `functions/src/utils/errors.ts`

### Integration Points

**Internal Communication:**
- `mobile/src/services/callable/*` is the only layer that talks to Functions.
- `mobile/src/data/firestore/*` is the only layer that talks to Firestore directly (reads/subscriptions).
- Queue engine pulls from SQLite DAOs and emits state updates via Zustand store.

**External Integrations:**
- Firebase: Auth, Firestore, Storage, Functions, App Check, Crashlytics.
- Google AI: only from `functions/` via server-side SDK.
- EAS: build profiles and submit pipeline from `mobile/eas.json`.

**Data Flow (happy path):**
1) Capture → image file saved locally + SQLite draft row (`DRAFT_LOCAL`)
2) Queue picks job → compress image → upload to Storage → mark Firestore status `UPLOADING`
3) Queue calls `analyzeItem` → Functions invokes Gemini → validates Zod schema → writes Firestore parsed fields → status `READY`
4) User reviews/edits → status `CONFIRMED`
5) Export → `exportInventoryCsv` → Functions writes CSV + issues signed URLs (7-day) → returns export payload

### File Organization Patterns

**Configuration Files:**
- Root owns shared lint/format/TS baseline and CI workflow.
- `mobile/` owns Expo/EAS configs (`app.json`, `eas.json`).
- `functions/` owns Firebase runtime config (region, secrets binding).

**Source Organization:**
- Route-only in `mobile/app/`; all other code in `mobile/src/`.
- Kebab-case files everywhere; PascalCase component symbols.

**Test Organization:**
- Jest across all packages.
- `mobile/`: unit tests under `mobile/src/__tests__/` (and/or co-located where appropriate).
- `functions/`: tests under `functions/src/**/__tests__/` (or `functions/test/`), keeping Jest config consistent.

**Asset Organization:**
- Static assets under `mobile/assets/`.
- Captured photos stored in device file system; only references stored in SQLite and then Storage.

### Development Workflow Integration

**Development Server Structure:**
- `npm install` at repo root installs all workspaces.
- Mobile dev: `npm run dev -w mobile` (Expo start).
- Functions dev: `npm run serve -w functions` (Firebase emulator) where applicable.

**Build Process Structure:**
- CI runs per workspace:
  - lint → typecheck → test (mobile/functions/contracts)
- EAS builds consume only `mobile/` but rely on workspace `contracts/` during install.

**Deployment Structure:**
- Firebase deploy targets `functions/`, rules, and indexes at root.
- EAS Submit publishes iOS/Android builds from `mobile/`.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Expo (mobile) + Firebase (Auth/Firestore/Storage/Functions) + shared Zod contracts are compatible and mutually reinforcing.
- “Secrets server-side” is consistently enforced via Functions + Secret Manager; the mobile bundle holds only non-secret IDs.
- Callable Functions + App Check aligns with the chosen security posture and reduces client complexity.
- Region choice (`asia-south1`) matches the performance intent for Sri Lanka-based usage.

**Pattern Consistency:**
- Firestore `camelCase` + callable payload `camelCase` is consistent with TypeScript and avoids mapping layers.
- SQLite `snake_case` is explicitly isolated behind DAOs; the mapping boundary is clearly defined.
- Raw callable payloads on success + `HttpsError` taxonomy for failures is consistent and keeps client happy-path code simple.
- Correlation-first logging is coherent with the offline queue + retry-heavy workflow.

**Structure Alignment:**
- `mobile/app/` route-only + `mobile/src/` core logic enforces the layering rules and prevents UI → backend coupling.
- `contracts/` as a workspace package provides a single source of truth for enums/schemas across mobile + functions.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- Burst capture + non-blocking intake: supported via `mobile/app/capture/*` routes + `mobile/src/queue/*` + local persistence.
- Offline-first drafts: supported via SQLite + filesystem, with resumable queue scheduling.
- AI extraction with strict schema: supported via server-side Gemini call + Zod validation in `functions/` + manual fallback path.
- Review/edit/confirm loop: supported via READY/CONFIRMED status transitions and UI component boundaries.
- Export CSV with signed image URLs (7-day): supported via callable export function + server-side signing.
- Account deletion: supported via function-led deletion orchestration.

**Non-Functional Requirements Coverage:**
- Performance: concurrency cap (2) and regional Functions deployment support latency targets; compression target (<500KB) reduces upload time.
- Reliability: deterministic storage paths + idempotent retries + explicit failure metadata prevent dead-ends.
- Security/privacy: per-user path isolation + App Check + server-side secrets meet NFR12.
- Observability: Crashlytics + structured Functions logs + correlation IDs provide end-to-end traceability without logging sensitive payloads.

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Core stack and key versions are recorded; infra/deploy decisions (EAS, region, observability, CI) are specified.

**Pattern Completeness:**
- Naming, response formats, timestamp rules, retry semantics, and correlation logging are explicit enough to prevent agent drift.

**Structure Completeness:**
- Project tree is concrete and maps to requirements; boundaries are specified so multiple agents can work in parallel safely.

### Gap Analysis Results

**Critical Gaps:** None identified that block MVP implementation.

**Important Clarifications (resolved as part of validation):**
1) **Contracts package import path**
  - Resolution: Treat `contracts/` as an npm workspace package and import it from both `mobile/` and `functions/` (no copying of schema files).

2) **What the mobile app may write directly vs Functions-only**
  - Resolution: Mobile may create/update docs under `users/{uid}/items/{itemId}` for user-editable fields and client-managed status transitions.
  - Functions own: AI-derived fields, export generation records, signed URL generation, and deletion orchestration.
  - Action: encode this as allowlists in Firestore Rules (field-level constraints) and mirror enforcement in callable handlers.

3) **CSV export artifact location & persistence**
  - Resolution: `exportInventoryCsv` writes the CSV to Cloud Storage under `users/{uid}/exports/{exportId}/inventory.csv`, persists an export record in `users/{uid}/exports/{exportId}`, and returns a payload containing:
    - a signed URL to the CSV (short-lived)
    - signed image URLs per row (7-day TTL)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION