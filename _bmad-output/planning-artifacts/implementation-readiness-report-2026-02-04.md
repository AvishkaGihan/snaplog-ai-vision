---
name: implementation-readiness-report
date: 2026-02-04
project_name: snaplog-ai-vision
stepsCompleted:
	- step-01-document-discovery
	- step-02-prd-analysis
	- step-03-epic-coverage-validation
	- step-04-ux-alignment
	- step-05-epic-quality-review
	- step-06-final-assessment
selectedDocuments:
	prd: "{project-root}/_bmad-output/planning-artifacts/prd.md"
	architecture: "{project-root}/_bmad-output/planning-artifacts/architecture.md"
	epics: "{project-root}/_bmad-output/planning-artifacts/epics.md"
	ux_spec: "{project-root}/_bmad-output/planning-artifacts/ux-design-specification.md"
	ux_supporting:
		- "{project-root}/_bmad-output/planning-artifacts/ux-design-directions.html"
---

# Implementation Readiness Assessment Report

**Date:** 2026-02-04  
**Project:** snaplog-ai-vision

## Step 1 — Document Discovery (Inventory)

### PRD
- Whole: _bmad-output/planning-artifacts/prd.md (15.7 KB, modified 2026-02-04 18:26:41)
- Supporting: _bmad-output/planning-artifacts/prd-validation-report.md (14.5 KB, modified 2026-02-04 18:30:44)
- Sharded: None found

### Architecture
- Whole: _bmad-output/planning-artifacts/architecture.md (39.7 KB, modified 2026-02-04 20:54:43)
- Sharded: None found

### Epics & Stories
- Whole: _bmad-output/planning-artifacts/epics.md (27.8 KB, modified 2026-02-04 21:13:15)
- Sharded: None found

### UX
- Whole: _bmad-output/planning-artifacts/ux-design-specification.md (45.6 KB, modified 2026-02-04 19:44:54)
- Supporting: _bmad-output/planning-artifacts/ux-design-directions.html (43.5 KB, modified 2026-02-04 19:18:28)
- Sharded: None found

## PRD Analysis

### Functional Requirements Extracted

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
FR20: System can process queued items sequentially, with optional parallel processing capped at **2 items concurrently**.
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

Total FRs: 49

### Non-Functional Requirements Extracted

NFR1: End-to-end “upload + analyze + parse + ready-to-review” latency is **p50 < 4s** on Wi‑Fi and strong 4G/LTE.
NFR2: End-to-end latency is **p95 < 8s** on Wi‑Fi and strong 4G/LTE.
NFR3: App remains responsive during burst scanning and queue processing up to **20 items per batch**.
NFR4: On-device image compression targets **< 500KB** per uploaded image.

NFR5: Offline capture succeeds without network; drafts persist across app restarts until synced or deleted.
NFR6: Queue processing is safe to retry without creating irreconcilable duplicates.
NFR7: If AI response is invalid JSON, system retries once, then degrades gracefully to manual edit without blocking save.
NFR8: If export generation fails, the app shows an actionable error message and a retry option within **2 seconds** of failure, and the user’s inventory data remains unchanged.

NFR9: All data in transit uses TLS.
NFR10: Firestore/Storage access is restricted to the authenticated user’s data.
NFR11: CSV export links use signed URLs with **7-day expiry**; exports are generated only for the authenticated user.
NFR12: API keys and secrets are never shipped in the mobile bundle; secrets remain server-side.

NFR13: Item schema excludes buyer/supplier PII; prompts instruct AI to exclude names/addresses if OCR detects them.
NFR14: App provides a Privacy Policy link in Settings.
NFR15: “Delete Account” initiates immediate user-facing logout/disable and triggers asynchronous deletion of cloud data; local drafts/photos are removed best-effort.

NFR16: Backend enforces per-user AI analysis limits of **≤ 20 requests / 5 minutes** and **≤ 2 concurrent analyses**; excess requests return a rate-limit response that the client surfaces as a queued/throttled status.
NFR17: Queue concurrency is controlled to avoid exceeding model/API quotas and to protect device stability.

NFR18: System logs key processing events server-side without logging sensitive content.
NFR19: Errors include correlation identifiers so a failed item can be traced across client → function → model call.

NFR20: Core flows meet basic accessibility: text contrast consistent with **WCAG 2.1 AA**, accessible labels for primary actions, and support font scaling/dynamic type up to **200%** without loss of core functionality (validated via a manual VoiceOver/TalkBack pass).

Total NFRs: 20

### Additional Requirements (Constraints, Scope, Integrations)

- Multimodal AI returns **strict JSON only** (schema-validated) instead of chat text.
- Burst scanning: users capture up to 20 items quickly while analysis runs asynchronously (Draft → Uploading → Analyzing → Ready).
- Offline-first drafts that preserve photos and metadata across restarts.
- CSV export with **7-day signed image URLs** suitable for marketplace import workflows.
- Store-ready account hygiene (in-app delete account with asynchronous cleanup).

**Explicitly Out of Scope (Phase 1 / MVP)**
- Remote push notifications
- Web/desktop client
- Multi-photo per item
- Team/warehouse mode (multi-user collaboration)
- Direct marketplace publishing/integrations (eBay/Shopify, etc.)
- OCR/barcode scanning and price estimation/comps

**Technical Constraints**
- Prompt guardrail instructs the model to exclude names/addresses if OCR detects them.
- Account deletion triggers asynchronous cleanup of Firestore docs and Storage images; local cleanup is best-effort.
- Exports are authorized per-user; no arbitrary userId export.

**Integration Requirements**
- CSV export is import-friendly for reseller workflows.
- Exported image links are server-generated signed URLs with 7-day expiry.

### PRD Completeness Assessment

- Requirements coverage is strong: 49 FRs and 20 NFRs are clearly enumerated with measurable targets (latency, concurrency, image size, rate limits).
- A few acceptance-level details remain implicit (e.g., exact “Confirmed” semantics, conflict handling if the same photo is imported twice, and what “manual Sync action” looks like), but they can be captured as story acceptance criteria in Step 3–5.

## Epic Coverage Validation

### Epic FR Coverage Extracted

FR1: Covered in Epic 1 - Account creation
FR2: Covered in Epic 1 - Sign in/out
FR3: Covered in Epic 1 - Password reset
FR4: Covered in Epic 1 - In-app account deletion request
FR5: Covered in Epic 1 - Cloud data removal during account deletion
FR6: Covered in Epic 1 - Block access for deleted/disabled users
FR7: Covered in Epic 1 - Settings/Profile screen (privacy policy + account actions)
FR8: Covered in Epic 2 - Capture photo via camera
FR9: Covered in Epic 2 - Import photo from library
FR10: Covered in Epic 2 - Create item draft from captured/imported image
FR11: Covered in Epic 2 - Burst capture flow without waiting per item
FR12: Covered in Epic 2 - Enforce max burst batch size (20)
FR13: Covered in Epic 2 - Store draft photos locally on device
FR14: Covered in Epic 2 - Store draft metadata locally on device
FR15: Covered in Epic 2 - Continue creating drafts offline
FR16: Covered in Epic 3 - Resume processing drafts when connectivity returns
FR17: Covered in Epic 3 - Show per-item status (Draft/Uploading/Analyzing/Ready/Failed/Confirmed)
FR18: Covered in Epic 2 - Delete local drafts
FR19: Covered in Epic 3 - Enqueue items for upload and analysis
FR20: Covered in Epic 3 - Queue processing with concurrency cap (2)
FR21: Covered in Epic 3 - Retry processing for failed items
FR22: Covered in Epic 3 - Error state and recovery actions
FR23: Covered in Epic 3 - Manual retry for an individual failed item
FR24: Covered in Epic 3 - Preserve queue state across app restarts
FR25: Covered in Epic 4 - AI vision extraction to structured item data
FR26: Covered in Epic 4 - Enforce AI output strict JSON schema
FR27: Covered in Epic 4 - Validate extracted fields before user review
FR28: Covered in Epic 4 - Manual entry/edit fallback when AI invalid/incomplete
FR29: Covered in Epic 4 - Fixed taxonomy configuration
FR30: Covered in Epic 4 - Constrain category to predefined taxonomy
FR31: Covered in Epic 4 - Prevent buyer/supplier PII storage in item fields
FR32: Covered in Epic 4 - Review AI-generated item details before saving
FR33: Covered in Epic 4 - Edit item fields (title/brand/category/size/color/condition/description/tags)
FR34: Covered in Epic 4 - Save item to inventory
FR35: Covered in Epic 5 - Edit an already-saved item
FR36: Covered in Epic 5 - Delete an item from inventory
FR37: Covered in Epic 5 - View inventory list
FR38: Covered in Epic 5 - Search inventory by keyword
FR39: Covered in Epic 5 - Filter inventory by category/status
FR40: Covered in Epic 5 - View item detail screen
FR41: Covered in Epic 6 - Export inventory as CSV
FR42: Covered in Epic 6 - CSV includes image links
FR43: Covered in Epic 6 - Generate 7-day signed URLs for exported image links
FR44: Covered in Epic 6 - Export authorization (only authenticated user’s inventory)
FR45: Covered in Epic 6 - Local notification when batch finishes
FR46: Covered in Epic 6 - Local notification when items ready for review
FR47: Covered in Epic 1 - Per-user access control for inventory items
FR48: Covered in Epic 1 - Per-user access control for images
FR49: Covered in Epic 1 - Per-user access control for exports

Total FRs in epics coverage map: 49

### Coverage Matrix

| FR Number | PRD Requirement | Epic Coverage | Status |
| --------- | --------------- | ------------ | ------ |
| FR1 | User can create an account using email/password. | Epic 1 / Story 1.2 (Email/password registration) | ✓ Covered |
| FR2 | User can sign in and sign out. | Epic 1 / Story 1.3 (Sign in and sign out) | ✓ Covered |
| FR3 | User can reset their password. | Epic 1 / Story 1.4 (Password reset) | ✓ Covered |
| FR4 | User can delete their account from within the app. | Epic 1 / Story 1.6 (Delete account request with immediate logout and backend cleanup) | ✓ Covered |
| FR5 | System can remove the user’s cloud data when account deletion is requested. | Epic 1 / Story 1.6 (Delete account request with immediate logout and backend cleanup) | ✓ Covered |
| FR6 | System can prevent a deleted/disabled user from accessing authenticated features. | Epic 1 / Story 1.6 (Delete account request with immediate logout and backend cleanup) | ✓ Covered |
| FR7 | User can access a Settings/Profile screen to view app info, privacy policy, and manage account actions. | Epic 1 / Story 1.5 (Settings/Profile screen with privacy policy and account actions) | ✓ Covered |
| FR8 | User can capture a new item photo using the device camera. | Epic 2 / Story 2.1 (Capture a new item photo into a local draft) | ✓ Covered |
| FR9 | User can import an existing photo from the device photo library. | Epic 2 / Story 2.2 (Import an existing photo into a local draft) | ✓ Covered |
| FR10 | System can create a new item draft from a captured/imported image. | Epic 2 / Story 2.1 (Capture a new item photo into a local draft); Epic 2 / Story 2.2 (Import an existing photo into a local draft) | ✓ Covered |
| FR11 | User can scan items in a burst flow without waiting for analysis to complete for each item. | Epic 2 / Story 2.3 (Burst capture mode with batch cap and “proof of capture” feedback) | ✓ Covered |
| FR12 | System can enforce a maximum burst batch size of 20 items. | Epic 2 / Story 2.3 (Burst capture mode with batch cap and “proof of capture” feedback) | ✓ Covered |
| FR13 | System can store draft item photos locally on the device. | Epic 2 / Story 2.4 (Local persistence for drafts (photos + metadata) with offline proof) | ✓ Covered |
| FR14 | System can store draft metadata locally on the device. | Epic 2 / Story 2.4 (Local persistence for drafts (photos + metadata) with offline proof) | ✓ Covered |
| FR15 | User can continue creating drafts when the device is offline. | Epic 2 / Story 2.4 (Local persistence for drafts (photos + metadata) with offline proof) | ✓ Covered |
| FR16 | System can resume processing drafts when connectivity returns. | Epic 3 / Story 3.3 (Resume processing when connectivity returns) | ✓ Covered |
| FR17 | User can view which items are Draft, Uploading, Analyzing, Ready, Failed, or Confirmed. | Epic 3 / Story 3.5 (Queue screen with consistent statuses and actionable errors) | ✓ Covered |
| FR18 | User can delete local drafts. | Epic 2 / Story 2.5 (Delete a local draft) | ✓ Covered |
| FR19 | System can enqueue items for upload and analysis. | Epic 3 / Story 3.2 (Upload processing with concurrency cap) | ✓ Covered |
| FR20 | System can process queued items sequentially, with optional parallel processing capped at **2 items concurrently**. | Epic 3 / Story 3.2 (Upload processing with concurrency cap) | ✓ Covered |
| FR21 | System can retry processing for failed items. | Epic 3 / Story 3.4 (Failure states and retry workflow) | ✓ Covered |
| FR22 | System can show an error state and recovery action when processing fails. | Epic 3 / Story 3.4 (Failure states and retry workflow) | ✓ Covered |
| FR23 | User can manually trigger retry for an individual failed item. | Epic 3 / Story 3.4 (Failure states and retry workflow) | ✓ Covered |
| FR24 | System can preserve queue state across app restarts. | Epic 3 / Story 3.1 (Queue job model and persistence across app restarts) | ✓ Covered |
| FR25 | System can extract structured item data from an image via an AI vision service. | Epic 4 / Story 4.1 (Server-side AI extraction with strict schema validation and taxonomy constraints) | ✓ Covered |
| FR26 | System can enforce that AI output conforms to a strict JSON schema. | Epic 4 / Story 4.1 (Server-side AI extraction with strict schema validation and taxonomy constraints) | ✓ Covered |
| FR27 | System can validate extracted fields before presenting them to the user. | Epic 4 / Story 4.2 (Validate extracted fields and protect against PII) | ✓ Covered |
| FR28 | System can fall back to manual entry/editing when AI output is invalid or incomplete. | Epic 4 / Story 4.5 (Manual fallback flow when AI output is invalid) | ✓ Covered |
| FR29 | System uses a fixed, pre-defined taxonomy configuration for item categorization. | Epic 4 / Story 4.1 (Server-side AI extraction with strict schema validation and taxonomy constraints) | ✓ Covered |
| FR30 | System can constrain item category to the predefined taxonomy (15–20 categories). | Epic 4 / Story 4.1 (Server-side AI extraction with strict schema validation and taxonomy constraints) | ✓ Covered |
| FR31 | System can prevent storing buyer/supplier PII as part of item fields. | Epic 4 / Story 4.2 (Validate extracted fields and protect against PII) | ✓ Covered |
| FR32 | User can review AI-generated item details before saving. | Epic 4 / Story 4.3 (Review-first flow for AI-generated item details) | ✓ Covered |
| FR33 | User can edit item fields: Title, Brand, Category, Size, Color, Condition, Description, Tags[]. | Epic 4 / Story 4.4 (Edit item fields during review) | ✓ Covered |
| FR34 | User can save an item to their inventory. | Epic 4 / Story 4.6 (Save reviewed item into inventory) | ✓ Covered |
| FR35 | User can edit an already-saved item. | Epic 5 / Story 5.3 (Edit an already-saved item) | ✓ Covered |
| FR36 | User can delete an item from their inventory. | Epic 5 / Story 5.4 (Delete an inventory item) | ✓ Covered |
| FR37 | User can view a list of items in their inventory. | Epic 5 / Story 5.1 (Inventory list with search and filters) | ✓ Covered |
| FR38 | User can search items by keyword (e.g., title/brand/tags). | Epic 5 / Story 5.1 (Inventory list with search and filters) | ✓ Covered |
| FR39 | User can filter items by category and/or status. | Epic 5 / Story 5.1 (Inventory list with search and filters) | ✓ Covered |
| FR40 | User can view item detail screens from the inventory list. | Epic 5 / Story 5.2 (Inventory item detail screen) | ✓ Covered |
| FR41 | User can export their inventory as a CSV file. | Epic 6 / Story 6.1 (Export inventory as CSV with signed image links); Epic 6 / Story 6.3 (Export failure UX with actionable retry) | ✓ Covered |
| FR42 | Exported CSV can include image links for each item. | Epic 6 / Story 6.1 (Export inventory as CSV with signed image links) | ✓ Covered |
| FR43 | System can generate time-limited signed URLs for exported image links (7-day expiry). | Epic 6 / Story 6.1 (Export inventory as CSV with signed image links) | ✓ Covered |
| FR44 | System can ensure exports only include the authenticated user’s inventory. | Epic 6 / Story 6.2 (Export authorization and per-user scoping) | ✓ Covered |
| FR45 | System can notify the user locally when a batch finishes processing. | Epic 6 / Story 6.4 (Local notifications for batch completion and items ready) | ✓ Covered |
| FR46 | System can notify the user locally when items are ready for review. | Epic 6 / Story 6.4 (Local notifications for batch completion and items ready) | ✓ Covered |
| FR47 | System can ensure users can only access their own inventory items. | Epic 1 / Story 1.7 (Per-user security isolation and secrets posture) | ✓ Covered |
| FR48 | System can ensure users can only access their own images. | Epic 1 / Story 1.7 (Per-user security isolation and secrets posture) | ✓ Covered |
| FR49 | System can ensure users can only export their own inventory. | Epic 1 / Story 1.7 (Per-user security isolation and secrets posture) | ✓ Covered |

### Missing Requirements

No missing FRs detected. All FR1–FR49 appear in the Epics FR Coverage Map and are implemented by at least one story.

### Coverage Statistics

- Total PRD FRs: 49
- FRs covered in epics (coverage map): 49
- FRs covered with explicit story tags: 49
- Coverage percentage (story-tagged): 100.0%

## UX Alignment Assessment

### UX Document Status

Found:
- _bmad-output/planning-artifacts/ux-design-specification.md
- _bmad-output/planning-artifacts/ux-design-directions.html (supporting)

### Alignment Issues

1) **Status taxonomy drift risk**
- UX introduces a `Needs Review` state in the `StatusBadge` list.
- PRD and Architecture define statuses as: Draft / Uploading / Analyzing / Ready / Failed / Confirmed (and Architecture explicitly avoids a separate `needsReview` flag).
- Recommendation: treat “Needs Review” as a **UI label/derived badge** (e.g., `status=READY` implies “Needs review”), not a persisted status value.

2) **Export scope expansion (potential implementation mismatch)**
- UX Journey 4 shows export scope options: “All / Filtered / Date range”.
- PRD requires CSV export (and signed URLs), but does not require date-range export or filter-aware export.
- Recommendation: either (a) implement scope support explicitly in `exportInventoryCsv`, or (b) constrain MVP UX to “All confirmed” / “All inventory” only, deferring advanced scopes.

### Warnings

- None blocking for MVP: core UX flows (burst capture, offline drafts, queue transparency, retry/fallback, review-first confirm, signed-URL export) align with both PRD requirements and the chosen architecture (Expo Router tabs + Firebase + Functions + SQLite offline persistence).

## Epic Quality Review

### Summary

- Epic structure is user-outcome oriented and maps cleanly to the product workflow (Auth → Capture/Drafts → Queue → AI Review → Inventory → Export/Notifications).
- No forward-dependency anti-patterns detected (stories do not reference future story work explicitly).
- Story sizing is generally “single-agent completable” and uses Given/When/Then consistently.

### 🔴 Critical Violations

- None detected.

### 🟠 Major Issues

1) **Cross-cutting NFRs not consistently enforced in story acceptance criteria**
- NFRs such as rate-limiting/throttling (NFR16), observability/correlation IDs (NFR19), and “secrets never shipped” (NFR12) are strong in Architecture/PRD but are not consistently reflected as explicit acceptance criteria where they matter.
- Recommendation: add explicit AC bullets (or dedicated enabler stories) for:
	- Throttling UX/state surfaced to client when `resource-exhausted` occurs.
	- Correlation IDs propagated client → function → model call and logged server-side.
	- Secrets usage only in Functions; mobile bundle has no AI keys.

2) **Error/edge-case coverage is thin on several core workflow stories**
- Several stories describe happy paths but do not explicitly specify permission-denied, low-storage, offline transitions, or idempotency guarantees.
- Recommendation: expand ACs (not new scope) for:
	- Story 2.1/2.2: camera/library permission denied; local save failure; storage-full warnings.
	- Story 3.2/3.4: idempotent retries (no duplicates), backoff behavior, and clear failureStage/failureReason semantics.
	- Story 6.1/6.3: export in-progress UI vs background processing; retry semantics; handling partial failures.

### 🟡 Minor Concerns

- Epic 1 includes an explicit developer-enabler story (Story 1.1). This is justified (greenfield scaffolding + contracts) but should remain tightly scoped to “minimum needed to start shipping” to avoid a large upfront technical milestone.
- Some acceptance criteria could be made more measurable by referencing PRD/NFR thresholds directly (e.g., image compression <500KB target, queue concurrency cap 2, batch cap 20).

## Summary and Recommendations

### Overall Readiness Status

NEEDS WORK

Rationale: the core requirements are well captured, FR coverage is complete (49/49), and architecture + UX directions are coherent. However, there are a few planning-level gaps that can cause implementation drift (especially status taxonomy) and missed NFR enforcement unless addressed now.

### Critical Issues Requiring Immediate Action

1) **Status taxonomy drift risk (UX vs PRD/Architecture)**
- Resolve the “Needs Review” status so it is derived/presentational (not a persisted backend status), keeping the shared status enum aligned across `contracts/`, Firestore, Functions, and UI.

2) **NFR enforcement not fully embedded into stories**
- Ensure rate limiting/throttling behavior (NFR16), correlation IDs/observability (NFR19), and secrets posture (NFR12) are explicitly testable via acceptance criteria and/or dedicated enabler stories.

### Recommended Next Steps

1. Update UX spec and shared contracts to clarify that “Needs Review” is a UI badge derived from `READY` (or remove it as a state).
2. Update `epics.md` to add explicit AC lines (or add small enabler stories) covering:
	- `resource-exhausted` throttling UX + retry-after semantics
	- correlation IDs across client → function → model + structured server logs
	- secrets stored server-side only (no AI keys in the app bundle)
3. Add edge-case ACs to core workflow stories (permissions, storage full, offline/online transitions, idempotent retries) to reduce implementation ambiguity.

### Final Note

Assessor: Winston (Architect agent)  
This assessment identified 6 actionable gaps across UX alignment and epic/story quality. Address the critical issues before starting Phase 4 implementation to prevent drift and rework; then proceed with confidence.
