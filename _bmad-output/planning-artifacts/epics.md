---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# snaplog-ai-vision - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for snaplog-ai-vision, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can create an account using email/password.
FR2: User can sign in and sign out.
FR3: User can reset their password.
FR4: User can delete their account from within the app.
FR5: System can remove the user’s cloud data when account deletion is requested.
FR6: System can prevent a deleted/disabled user from accessing authenticated features.
FR7: User can access a Settings/Profile screen to view app info, privacy policy, and manage account actions.
FR8: User can capture a new item photo using the device camera.
FR9: User can import an existing photo from the device photo library.
FR10: System can create a new item draft from a captured/imported image.
FR11: User can scan items in a burst flow without waiting for analysis to complete for each item.
FR12: System can enforce a maximum burst batch size of 20 items.
FR13: System can store draft item photos locally on the device.
FR14: System can store draft metadata locally on the device.
FR15: User can continue creating drafts when the device is offline.
FR16: System can resume processing drafts when connectivity returns.
FR17: User can view which items are Draft, Uploading, Analyzing, Ready, Failed, or Confirmed.
FR18: User can delete local drafts.
FR19: System can enqueue items for upload and analysis.
FR20: System can process queued items sequentially, with optional parallel processing capped at 2 items concurrently.
FR21: System can retry processing for failed items.
FR22: System can show an error state and recovery action when processing fails.
FR23: User can manually trigger retry for an individual failed item.
FR24: System can preserve queue state across app restarts.
FR25: System can extract structured item data from an image via an AI vision service.
FR26: System can enforce that AI output conforms to a strict JSON schema.
FR27: System can validate extracted fields before presenting them to the user.
FR28: System can fall back to manual entry/editing when AI output is invalid or incomplete.
FR29: System uses a fixed, pre-defined taxonomy configuration for item categorization.
FR30: System can constrain item category to the predefined taxonomy (15–20 categories).
FR31: System can prevent storing buyer/supplier PII as part of item fields.
FR32: User can review AI-generated item details before saving.
FR33: User can edit item fields: Title, Brand, Category, Size, Color, Condition, Description, Tags[].
FR34: User can save an item to their inventory.
FR35: User can edit an already-saved item.
FR36: User can delete an item from their inventory.
FR37: User can view a list of items in their inventory.
FR38: User can search items by keyword (e.g., title/brand/tags).
FR39: User can filter items by category and/or status.
FR40: User can view item detail screens from the inventory list.
FR41: User can export their inventory as a CSV file.
FR42: Exported CSV can include image links for each item.
FR43: System can generate time-limited signed URLs for exported image links (7-day expiry).
FR44: System can ensure exports only include the authenticated user’s inventory.
FR45: System can notify the user locally when a batch finishes processing.
FR46: System can notify the user locally when items are ready for review.
FR47: System can ensure users can only access their own inventory items.
FR48: System can ensure users can only access their own images.
FR49: System can ensure users can only export their own inventory.

### NonFunctional Requirements

NFR1: End-to-end “upload + analyze + parse + ready-to-review” latency is p50 < 4s on Wi‑Fi and strong 4G/LTE.
NFR2: End-to-end latency is p95 < 8s on Wi‑Fi and strong 4G/LTE.
NFR3: App remains responsive during burst scanning and queue processing up to 20 items per batch.
NFR4: On-device image compression targets < 500KB per uploaded image.
NFR5: Offline capture succeeds without network; drafts persist across app restarts until synced or deleted.
NFR6: Queue processing is safe to retry without creating irreconcilable duplicates.
NFR7: If AI response is invalid JSON, system retries once, then degrades gracefully to manual edit without blocking save.
NFR8: If export generation fails, the app shows an actionable error message and a retry option within 2 seconds of failure, and the user’s inventory data remains unchanged.
NFR9: All data in transit uses TLS.
NFR10: Firestore/Storage access is restricted to the authenticated user’s data.
NFR11: CSV export links use signed URLs with 7-day expiry; exports are generated only for the authenticated user.
NFR12: API keys and secrets are never shipped in the mobile bundle; secrets remain server-side.
NFR13: Item schema excludes buyer/supplier PII; prompts instruct AI to exclude names/addresses if OCR detects them.
NFR14: App provides a Privacy Policy link in Settings.
NFR15: “Delete Account” initiates immediate user-facing logout/disable and triggers asynchronous deletion of cloud data; local drafts/photos are removed best-effort.
NFR16: Backend enforces per-user AI analysis limits of ≤ 20 requests / 5 minutes and ≤ 2 concurrent analyses; excess requests return a rate-limit response that the client surfaces as a queued/throttled status.
NFR17: Queue concurrency is controlled to avoid exceeding model/API quotas and to protect device stability.
NFR18: System logs key processing events server-side without logging sensitive content.
NFR19: Errors include correlation identifiers so a failed item can be traced across client → function → model call.
NFR20: Core flows meet basic accessibility: WCAG 2.1 AA intent, accessible labels for primary actions, and support font scaling/dynamic type up to 200% without loss of core functionality (manual VoiceOver/TalkBack pass).

### Additional Requirements

- Selected starter: Expo Router Tabs (TypeScript) + Firebase (Auth, Firestore, Storage, Cloud Functions TypeScript) in a monorepo.
- Implementation must begin by scaffolding the repo and Firebase project config (expo app + firebase init) and establishing shared contracts early.
- Shared contracts package (e.g., `contracts/`) must define and enforce: item schema, AI response schema (strict JSON-only), status enum + transition rules, export column contract.
- Item status state machine must support: DRAFT_LOCAL → UPLOADING → ANALYZING → READY → CONFIRMED, plus FAILED with failure metadata; retries must be safe/idempotent.
- Storage paths and per-user isolation must be enforced consistently (Firestore + Storage rules and Functions auth checks); all sensitive ops require authenticated context.
- Callable Functions surface must cover: `analyzeItem`, `exportInventoryCsv` (with 7-day signed image URLs), `requestAccountDeletion` (async orchestration).
- Rate limiting and concurrency caps must be enforced server-side and surfaced to client (e.g., throttled metadata + “Throttled” UI state).
- Observability: correlation IDs across client → function → model; structured server logs without sensitive payloads.
- Offline persistence: local drafts + queue state must survive app termination (SQLite for metadata/jobs; device filesystem for images).
- UX must never block the camera during burst capture; provide immediate “snap-to-queue” proof of capture and persistent local-save indicators (“Saved locally”).
- Error handling UX is workflow-first: failures are common, visible, actionable, and never dead-end; messages follow trust-first pattern (what happened → what’s safe → what to do).
- Loading states should prefer skeletons for dense lists and avoid blocking spinners (except initial bootstrap with explicit status text).
- Search/filter placement must be consistent (top of Queue/Inventory); filters as chips with counts; Clear All always available.
- Responsive support: phone-first portrait; tablet enhancements allowed (optional two-pane for Queue/Inventory in landscape); capture UI remains singular.
- Accessibility baseline: minimum 44x44 touch targets, readable contrast, reduce-motion supported, never rely on color alone for status.

### FR Coverage Map

### FR Coverage Map

FR1: Epic 1 - Account creation
FR2: Epic 1 - Sign in/out
FR3: Epic 1 - Password reset
FR4: Epic 1 - In-app account deletion request
FR5: Epic 1 - Cloud data removal during account deletion
FR6: Epic 1 - Block access for deleted/disabled users
FR7: Epic 1 - Settings/Profile screen (privacy policy + account actions)
FR8: Epic 2 - Capture photo via camera
FR9: Epic 2 - Import photo from library
FR10: Epic 2 - Create item draft from captured/imported image
FR11: Epic 2 - Burst capture flow without waiting per item
FR12: Epic 2 - Enforce max burst batch size (20)
FR13: Epic 2 - Store draft photos locally on device
FR14: Epic 2 - Store draft metadata locally on device
FR15: Epic 2 - Continue creating drafts offline
FR16: Epic 3 - Resume processing drafts when connectivity returns
FR17: Epic 3 - Show per-item status (Draft/Uploading/Analyzing/Ready/Failed/Confirmed)
FR18: Epic 2 - Delete local drafts
FR19: Epic 3 - Enqueue items for upload and analysis
FR20: Epic 3 - Queue processing with concurrency cap (2)
FR21: Epic 3 - Retry processing for failed items
FR22: Epic 3 - Error state and recovery actions
FR23: Epic 3 - Manual retry for an individual failed item
FR24: Epic 3 - Preserve queue state across app restarts
FR25: Epic 4 - AI vision extraction to structured item data
FR26: Epic 4 - Enforce AI output strict JSON schema
FR27: Epic 4 - Validate extracted fields before user review
FR28: Epic 4 - Manual entry/edit fallback when AI invalid/incomplete
FR29: Epic 4 - Fixed taxonomy configuration
FR30: Epic 4 - Constrain category to predefined taxonomy
FR31: Epic 4 - Prevent buyer/supplier PII storage in item fields
FR32: Epic 4 - Review AI-generated item details before saving
FR33: Epic 4 - Edit item fields (title/brand/category/size/color/condition/description/tags)
FR34: Epic 4 - Save item to inventory
FR35: Epic 5 - Edit an already-saved item
FR36: Epic 5 - Delete an item from inventory
FR37: Epic 5 - View inventory list
FR38: Epic 5 - Search inventory by keyword
FR39: Epic 5 - Filter inventory by category/status
FR40: Epic 5 - View item detail screen
FR41: Epic 6 - Export inventory as CSV
FR42: Epic 6 - CSV includes image links
FR43: Epic 6 - Generate 7-day signed URLs for exported image links
FR44: Epic 6 - Export authorization (only authenticated user’s inventory)
FR45: Epic 6 - Local notification when batch finishes
FR46: Epic 6 - Local notification when items ready for review
FR47: Epic 1 - Per-user access control for inventory items
FR48: Epic 1 - Per-user access control for images
FR49: Epic 1 - Per-user access control for exports

## Epic List

### Epic 1: Account, Settings, and Secure Foundations
Users can create/sign in to an account, manage basic settings, and the system enforces per-user isolation from day one.
**FRs covered:** FR1–FR7, FR47–FR49

### Epic 2: Capture + Drafts (Offline-First Burst Intake)
Users can rapidly capture/import up to 20 items per burst, with drafts safely stored on-device and manageable offline.
**FRs covered:** FR8–FR15, FR18

### Epic 3: Background Queue Processing (Upload/Analyze/Retry)
Users can rely on an async pipeline that uploads/analyzes drafts, shows accurate statuses, supports retries, and survives restarts.
**FRs covered:** FR16–FR17, FR19–FR24

### Epic 4: AI Extraction + Review-First Item Creation
Users get structured AI results (schema-validated + taxonomy constrained), can review/edit, and save items to inventory.
**FRs covered:** FR25–FR34

### Epic 5: Inventory Management (Browse/Search/Filter/Edit/Delete)
Users can manage their saved inventory: list, search/filter, view details, and maintain items over time.
**FRs covered:** FR35–FR40

### Epic 6: Export + Local Notifications
Users can export inventory to CSV (including signed image links), and get local notifications when batches finish / items are ready.
**FRs covered:** FR41–FR46

## Epic 1: Account, Settings, and Secure Foundations

Users can create/sign in to an account, manage basic settings, and the system enforces per-user isolation from day one.

### Story 1.1: Scaffold app + backend + shared contracts

**Implements:** Additional Requirement - starter scaffolding + shared contracts (anti-drift)

As a developer,
I want a scaffolded Expo app and Firebase backend with shared contracts,
So that we can ship features safely without schema and status drift.

**Acceptance Criteria:**

**Given** a new clone of the repo
**When** I run the documented install/start steps for the app and functions
**Then** the Expo app boots successfully and Firebase Functions compile successfully
**And** the project is initialized from the selected starter (Expo Router tabs template + Firebase project scaffolding)
**And** a shared contracts module exists defining (at minimum) the item status enum and AI response schema validator

### Story 1.2: Email/password registration

**Implements:** FR1

As a new user,
I want to create an account with email and password,
So that my inventory data is tied to me securely.

**Acceptance Criteria:**

**Given** I am logged out
**When** I submit a valid email and password on the registration screen
**Then** my account is created in Firebase Auth
**And** I am signed in and routed into the app

### Story 1.3: Sign in and sign out

**Implements:** FR2

As a returning user,
I want to sign in and sign out,
So that I can access my inventory securely and end my session when needed.

**Acceptance Criteria:**

**Given** I have an existing account
**When** I sign in with valid credentials
**Then** I gain access to authenticated screens
**And** when I choose Sign out from Settings I return to the logged-out state and authenticated views are blocked

### Story 1.4: Password reset

**Implements:** FR3

As a user who forgot my password,
I want to request a password reset,
So that I can regain access without support.

**Acceptance Criteria:**

**Given** I am logged out
**When** I request a password reset for a registered email
**Then** the app triggers Firebase Auth password reset flow
**And** the UI confirms the request without leaking whether the email exists

### Story 1.5: Settings/Profile screen with privacy policy and account actions

**Implements:** FR7

As a user,
I want a Settings/Profile screen,
So that I can find the privacy policy and manage my account.

**Acceptance Criteria:**

**Given** I am signed in
**When** I open Settings/Profile
**Then** I can access a Privacy Policy link
**And** I can access account actions including Sign out and Delete account

### Story 1.6: Delete account request with immediate logout and backend cleanup

**Implements:** FR4, FR5, FR6

As a user,
I want to delete my account from within the app,
So that my account and cloud data are removed.

**Acceptance Criteria:**

**Given** I am signed in
**When** I confirm Delete account
**Then** the app immediately signs me out / disables access to authenticated features
**And** a backend callable function is invoked to orchestrate deletion of the user’s Firestore docs and Storage objects

### Story 1.7: Per-user security isolation and secrets posture

**Implements:** FR47, FR48, FR49

As a user,
I want my data and images isolated to my account,
So that other users cannot access them.

**Acceptance Criteria:**

**Given** two different authenticated users exist
**When** one user attempts to read or write another user’s items/images/exports
**Then** Firestore/Storage rules deny the operation
**And** backend functions reject unauthenticated or unauthorized access

## Epic 2: Capture + Drafts (Offline-First Burst Intake)

Users can rapidly capture/import up to 20 items per burst, with drafts safely stored on-device and manageable offline.

### Story 2.1: Capture a new item photo into a local draft

**Implements:** FR8, FR10

As a reseller,
I want to capture an item photo with the device camera,
So that I can start an item draft immediately.

**Acceptance Criteria:**

**Given** I am signed in
**When** I tap the shutter
**Then** the capture experience remains responsive (camera does not block waiting on network/AI)
**And** a local draft is created for the captured image

### Story 2.2: Import an existing photo into a local draft

**Implements:** FR9, FR10

As a reseller,
I want to import a photo from my library,
So that I can create drafts from existing images.

**Acceptance Criteria:**

**Given** I am signed in
**When** I import a valid image from the photo library
**Then** a local draft is created from that image
**And** the draft is visible in the intake/queue surfaces

### Story 2.3: Burst capture mode with batch cap and “proof of capture” feedback

**Implements:** FR11, FR12

As a reseller processing a haul,
I want to capture items in a burst flow,
So that I can keep momentum without waiting per item.

**Acceptance Criteria:**

**Given** I am in the capture flow
**When** I take multiple photos rapidly
**Then** each photo is acknowledged immediately (e.g., counter increment + snap-to-queue feedback)
**And** the system enforces a maximum of 20 items per burst batch

### Story 2.4: Local persistence for drafts (photos + metadata) with offline proof

**Implements:** FR13, FR14, FR15

As a reseller,
I want drafts saved locally with an explicit “Saved locally” state,
So that I can trust the system even when offline.

**Acceptance Criteria:**

**Given** I capture or import an image
**When** the device is offline or I force close the app
**Then** the draft photo is stored on the device and the draft metadata persists across restarts
**And** the UI explicitly indicates the draft is saved locally

### Story 2.5: Delete a local draft

**Implements:** FR18

As a reseller,
I want to delete a local draft,
So that I can remove bad shots or items I no longer want to process.

**Acceptance Criteria:**

**Given** I have a local draft
**When** I choose Delete draft and confirm
**Then** the draft metadata and local image are removed
**And** the draft no longer appears in queue/review surfaces

## Epic 3: Background Queue Processing (Upload/Analyze/Retry)

Users can rely on an async pipeline that uploads/analyzes drafts, shows accurate statuses, supports retries, and survives restarts.

### Story 3.1: Queue job model and persistence across app restarts

**Implements:** FR24

As a reseller,
I want the app to preserve queue state across restarts,
So that I never lose progress.

**Acceptance Criteria:**

**Given** I have multiple drafts pending processing
**When** I close and reopen the app
**Then** the queue state is restored and processing can continue
**And** each draft still has a correct status

### Story 3.2: Upload processing with concurrency cap

**Implements:** FR19, FR20

As a reseller,
I want drafts uploaded in the background with a safe concurrency limit,
So that my device stays responsive and quotas are respected.

**Acceptance Criteria:**

**Given** I have multiple drafts in the queue
**When** background processing runs
**Then** uploads occur sequentially with optional parallelism capped at 2 concurrent items
**And** items transition to an Uploading status while in progress

### Story 3.3: Resume processing when connectivity returns

**Implements:** FR16

As a reseller,
I want processing to resume automatically when I regain connectivity,
So that offline capture turns into completed items without manual babysitting.

**Acceptance Criteria:**

**Given** I created drafts while offline
**When** connectivity returns
**Then** the app resumes queue processing automatically
**And** drafts transition through uploading/analyzing without losing local safety guarantees

### Story 3.4: Failure states and retry workflow

**Implements:** FR21, FR22, FR23

As a reseller,
I want failed items to be visible and recoverable,
So that errors never dead-end.

**Acceptance Criteria:**

**Given** an upload or analysis fails
**When** I view the item in the queue
**Then** the item is marked Failed with a reason and a clear Retry action
**And** I can retry an individual failed item without duplicating or corrupting the item

### Story 3.5: Queue screen with consistent statuses and actionable errors

**Implements:** FR17

As a reseller,
I want a queue view that shows Draft/Uploading/Analyzing/Ready/Failed/Confirmed,
So that I can understand progress at a glance.

**Acceptance Criteria:**

**Given** I have items in multiple states
**When** I open the Queue screen
**Then** each item displays one of the supported statuses consistently
**And** failures are prominently actionable and never hidden

## Epic 4: AI Extraction + Review-First Item Creation

Users get structured AI results (schema-validated + taxonomy constrained), can review/edit, and save items to inventory.

### Story 4.1: Server-side AI extraction with strict schema validation and taxonomy constraints

**Implements:** FR25, FR26, FR29, FR30

As a reseller,
I want the system to extract structured item data from an image,
So that I get listing-ready fields quickly.

**Acceptance Criteria:**

**Given** an item is ready for analysis
**When** the backend runs AI extraction
**Then** the AI output is validated as strict JSON against the shared schema
**And** the category is constrained to the predefined taxonomy

### Story 4.2: Validate extracted fields and protect against PII

**Implements:** FR27, FR31

As a reseller,
I want extracted fields validated and scrubbed of buyer/supplier PII,
So that saved items remain compliant.

**Acceptance Criteria:**

**Given** AI extraction produces candidate fields
**When** the system validates the fields
**Then** invalid/incomplete outputs are detected deterministically
**And** buyer/supplier PII is not persisted in item fields

### Story 4.3: Review-first flow for AI-generated item details

**Implements:** FR32

As a reseller,
I want to review AI-generated item details before saving,
So that I can confirm accuracy quickly.

**Acceptance Criteria:**

**Given** an item reaches Ready status
**When** I open the item review screen
**Then** I can see the extracted details in a scannable layout
**And** I can confirm and move to the next ready item efficiently

### Story 4.4: Edit item fields during review

**Implements:** FR33

As a reseller,
I want to edit key item fields during review,
So that I can correct AI mistakes.

**Acceptance Criteria:**

**Given** I am reviewing an item
**When** I edit any of: Title, Brand, Category, Size, Color, Condition, Description, Tags
**Then** field validation runs before save
**And** my edits persist for that item

### Story 4.5: Manual fallback flow when AI output is invalid

**Implements:** FR28

As a reseller,
I want to manually enter or fix details when AI fails,
So that I can still save the item without being blocked.

**Acceptance Criteria:**

**Given** AI output is invalid JSON or fails schema validation
**When** the system retries once and still cannot validate
**Then** I am routed to a manual entry/edit flow
**And** I can save the item successfully without losing the captured photo

### Story 4.6: Save reviewed item into inventory

**Implements:** FR34

As a reseller,
I want to save a reviewed item to my inventory,
So that it becomes export-ready and trackable.

**Acceptance Criteria:**

**Given** I have reviewed an item
**When** I tap Save/Confirm
**Then** the item is persisted to my per-user inventory store
**And** the item status becomes Confirmed

## Epic 5: Inventory Management (Browse/Search/Filter/Edit/Delete)

Users can manage their saved inventory: list, search/filter, view details, and maintain items over time.

### Story 5.1: Inventory list with search and filters

**Implements:** FR37, FR38, FR39

As a reseller,
I want to browse my inventory list with search and filters,
So that I can find items quickly.

**Acceptance Criteria:**

**Given** I have saved items
**When** I open the Inventory screen
**Then** I can see a list of items
**And** I can search by keyword and filter by category and/or status

### Story 5.2: Inventory item detail screen

**Implements:** FR40

As a reseller,
I want to open an item detail screen from the inventory list,
So that I can review the full information for an item.

**Acceptance Criteria:**

**Given** I am viewing the inventory list
**When** I tap an item
**Then** I see an item detail screen with its fields and image
**And** navigation back to the list preserves my scroll and filters

### Story 5.3: Edit an already-saved item

**Implements:** FR35

As a reseller,
I want to edit a saved inventory item,
So that I can correct information later.

**Acceptance Criteria:**

**Given** an item exists in my inventory
**When** I edit and save changes
**Then** the updated fields persist to the inventory
**And** validation prevents invalid values from being saved

### Story 5.4: Delete an inventory item

**Implements:** FR36

As a reseller,
I want to delete an item from my inventory,
So that I can remove mistakes or sold/irrelevant entries.

**Acceptance Criteria:**

**Given** an item exists in my inventory
**When** I choose Delete and confirm
**Then** the item is removed from my inventory list
**And** the deletion cannot affect other users’ data

## Epic 6: Export + Local Notifications

Users can export inventory to CSV (including signed image links), and get local notifications when batches finish / items are ready.

### Story 6.1: Export inventory as CSV with signed image links

**Implements:** FR41, FR42, FR43

As a reseller,
I want to export my inventory to a CSV file,
So that I can use it in my weekly listing workflow.

**Acceptance Criteria:**

**Given** I am signed in and have inventory items
**When** I trigger an export
**Then** a CSV is generated containing my inventory fields
**And** image links in the CSV are time-limited signed URLs with 7-day expiry

### Story 6.2: Export authorization and per-user scoping

**Implements:** FR44

As a user,
I want exports to include only my inventory,
So that no other user’s data can leak into my export.

**Acceptance Criteria:**

**Given** I am signed in
**When** the backend generates an export
**Then** only items belonging to my user are included
**And** signed URLs are generated only for my images and respect the 7-day TTL policy

### Story 6.3: Export failure UX with actionable retry

**Implements:** FR41 (error handling path)

As a reseller,
I want export failures to be actionable and fast to recover from,
So that errors don’t derail my workflow.

**Acceptance Criteria:**

**Given** an export attempt fails
**When** the failure is detected
**Then** the app shows an actionable error message and a retry option within 2 seconds
**And** a retry does not modify or corrupt inventory data

### Story 6.4: Local notifications for batch completion and items ready

**Implements:** FR45, FR46

As a reseller,
I want local notifications when a batch finishes or items become ready,
So that I can return to review at the right time.

**Acceptance Criteria:**

**Given** notifications are permitted
**When** a batch completes processing
**Then** the system sends a local notification
**And** when items become ready for review the system can notify me without spamming duplicates
