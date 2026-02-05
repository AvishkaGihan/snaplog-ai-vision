---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments: []
workflowType: 'prd'
projectName: snaplog-ai-vision
userName: AvishkaGihan
date: 2026-02-04
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: mobile_app
  domain: e-commerce / inventory ops
  complexity: medium
  projectContext: greenfield
  authRequired: true
---

# Product Requirements Document - SnapLog (AI Visual Inventory Assistant)

**Author:** AvishkaGihan
**Date:** 2026-02-04

## Executive Summary

SnapLog is a cross-platform mobile app that turns a product photo into a listing-ready inventory record. It targets power resellers who process items in weekly “hauls” and need speed, consistency, and portability of their data.

The core experience is burst scanning: users capture up to 20 items quickly while analysis runs asynchronously (Draft → Uploading → Analyzing → Ready). The product stays usable offline by persisting the exact photos locally and syncing later.

Key differentiators:

- Multimodal AI returns **strict JSON only** (schema-validated) instead of chat text.
- Burst scanning with a background queue for high-throughput intake.
- Offline-first drafts that preserve photos and metadata across restarts.
- CSV export with **7-day signed image URLs** suitable for marketplace import workflows.
- Store-ready account hygiene (in-app delete account with asynchronous cleanup).

## Project Classification

- **Project Type:** Mobile app (React Native / Expo)
- **Domain:** E-commerce / reseller inventory ops
- **Complexity:** Medium (camera + offline drafts + async queue + AI structured output + secure export)
- **Context:** Greenfield

## Success Criteria

### User Success

- Catalog an item end-to-end (open scan → confirm saved item) in **≤ 10 seconds**.
- After capture, fields populate automatically; user typically makes minor edits.
- Offline scanning preserves the exact photos and drafts sync later without re-capture.

### Business Success

- Demonstrates multimodal AI with strict structured output (JSON) and validation/fallbacks.
- Demonstrates real authentication + per-user isolation via backend rules.
- Supports a credible portfolio pitch: “~90% less manual data entry”.

### Technical Success

- End-to-end analysis round-trip meets performance targets (see NFRs).
- On-device compression keeps uploads bandwidth-efficient.
- Category detection exceeds 80% accuracy against a fixed 15–20 category taxonomy.
- Invalid model output never blocks the user (retry once → manual edit fallback).

## Product Scope & Phased Development

### MVP Strategy & Philosophy

Workflow/experience MVP: prove the “photo → structured listing-ready data” loop is fast, reliable, and offline-tolerant for burst scanning.

### Phase 1 (MVP)

- Mobile app (iOS + Android) with camera capture and photo-library import
- On-device resize/compress (target < 500KB per image)
- Authentication (Firebase Email/Password) and strict per-user data isolation
- Burst scanning with a background queue (cap **20 items per batch**) and per-item statuses
- AI extraction to strict JSON schema with validation and graceful fallback
- Editable item fields: **Title, Brand, Category, Size, Color, Condition, Description, Tags[]**
- Dashboard list with search/filter and item detail view
- Offline drafts: store photos locally + metadata; resumable sync; user can delete drafts
- Local notifications for batch completion / items ready
- Export inventory as **CSV** including **7-day signed image URLs** (server-generated)
- In-app Delete Account with immediate user-facing logout/disable and asynchronous backend cleanup

### Explicitly Out of Scope (Phase 1 / MVP)

- Remote push notifications
- Web/desktop client
- Multi-photo per item
- Team/warehouse mode (multi-user collaboration)
- Direct marketplace publishing/integrations (eBay/Shopify, etc.)
- OCR/barcode scanning and price estimation/comps

### Phase 2 (Growth)

- Batch scan enhancements (bulk edit, quick confirm, smarter retries/backoff)
- Confidence scoring and “needs review” flags
- Better taxonomy tooling (custom categories, tag rules) and richer filters/sorting
- Additional export options (JSON, expanded templates) without changing the MVP contract

### Phase 3 (Expansion)

- OCR/barcode scanning (model/serial)
- Marketplace listing draft generation (eBay/Shopify templates)
- Price estimation/comps
- Multi-photo per item and team/warehouse mode

### Risk Mitigation Strategy

- Queue/async instability: cap batch size, cap concurrency, persist queue state, always show per-item status.
- AI inconsistency: taxonomy + schema validation + retry + manual correction.
- Offline storage growth: monitor local usage; warn and provide draft management.
- Delete-account timeouts: asynchronous cleanup triggered server-side.

## User Personas

- **Primary:** Alex, high-volume vintage clothing reseller processing weekly hauls.
- **Secondary:** Builder/owner configuring taxonomy and debugging failures during demos.

## User Journeys

### Journey 1 — Primary User (Alex) “Haul Intake in Bursts”

Alex returns from sourcing with ~15 items and wants to capture inventory quickly.

1) Open Dashboard → tap Scan
2) Capture items repeatedly; each capture creates a draft and starts background processing
3) Items transition to Ready for review as results arrive
4) Alex reviews one-by-one, makes minor edits, and confirms

Failure handling: AI errors or misclassification route to manual edit; stuck items can be retried.

### Journey 2 — Primary User (Alex) “Offline Draft → Later Sync”

In a warehouse/garage with weak signal, Alex scans items as normal.

1) App stores photos locally with draft metadata
2) When network returns, queued items upload and analyze automatically (or via a manual Sync action)
3) Items become Ready without re-capture

Failure handling: low storage warnings; per-item retry on upload/analysis failures.

### Journey 3 — Ops/Admin (Builder/Owner) “Make Results Consistent”

The builder defines the fixed 15–20 category taxonomy, tunes the JSON schema/prompt, and validates outputs against a small evaluation set.

### Journey 4 — Support/Troubleshooting “Unblock the User”

When an item fails upload/analysis or returns invalid JSON, the user still reaches a manual edit flow and can save the item.

### Journey Requirements Summary

- Burst scanning + background queue with persistent state
- Offline drafts with local photo storage and resumable sync
- Clear per-item statuses, retries, and fallback edit paths
- Fixed taxonomy enforcement in prompt + UI

## Domain-Specific Requirements

### Compliance & Regulatory

- In-app account deletion is required (submission-plausible).
- Store item data only plus user email for authentication; exclude buyer/supplier PII.

### Technical Constraints

- Prompt guardrail instructs the model to exclude names/addresses if OCR detects them.
- Account deletion triggers asynchronous cleanup of Firestore docs and Storage images; local cleanup is best-effort.
- Exports are authorized per-user; no arbitrary userId export.

### Integration Requirements

- CSV export is import-friendly for reseller workflows.
- Exported image links are server-generated signed URLs with 7-day expiry.

### Risk Mitigations

- Signed URLs limit exposure window; regenerate per export.
- Delete-account cleanup runs asynchronously to avoid timeouts.
- Manual review/edit prevents AI output from being auto-published.

## Innovation & Novel Patterns

### Detected Innovation Areas

- Burst scanning with a background queue (high-throughput intake)
- Offline-first photo-preserving drafts (no re-capture)
- Vision-to-JSON pipeline with schema enforcement and deterministic-ish behavior
- Secure portability via signed export URLs

### Validation Approach

- Measure p50/p95 latency on Wi‑Fi and strong LTE; include cold start impacts.
- Track JSON validity, retries, and fallback rate.
- Evaluate category accuracy against the 15–20 taxonomy.

### Risk Mitigation

- Cap concurrency and backpressure the queue to avoid rate limits.
- Constrain categories and require user confirmation/edit.

## Mobile App Specific Requirements

### Project-Type Overview

- Cross-platform React Native (Expo) targeting iOS + Android.
- Local notifications only (no remote push infra in MVP).

### Platform Requirements

- Feature parity across iOS/Android for scanning, offline drafts, queue processing, and editing.
- App stays responsive during burst capture.

### Device Permissions

- Camera (capture)
- Photo library/media library (import)
- File system/storage (offline draft photos)

### Offline Mode

- Offline drafts persist across restarts and sync later.

### Store Compliance (Submission Plausible)

- Settings/Profile screen includes privacy policy link and account actions (including delete account).
- Permission prompts use professional rationale copy.

## Functional Requirements

### Authentication & Account

- FR1: User can create an account using email/password.
- FR2: User can sign in and sign out.
- FR3: User can reset their password.
- FR4: User can delete their account from within the app.
- FR5: System can remove the user’s cloud data when account deletion is requested.
- FR6: System can prevent a deleted/disabled user from accessing authenticated features.
- FR7: User can access a Settings/Profile screen to view app info, privacy policy, and manage account actions.

### Inventory Item Capture & Import

- FR8: User can capture a new item photo using the device camera.
- FR9: User can import an existing photo from the device photo library.
- FR10: System can create a new item draft from a captured/imported image.
- FR11: User can scan items in a burst flow without waiting for analysis to complete for each item.
- FR12: System can enforce a maximum burst batch size of 20 items.

### On-Device Drafts & Offline Mode

- FR13: System can store draft item photos locally on the device.
- FR14: System can store draft metadata locally on the device.
- FR15: User can continue creating drafts when the device is offline.
- FR16: System can resume processing drafts when connectivity returns.
- FR17: User can view which items are Draft, Uploading, Analyzing, Ready, Failed, or Confirmed.
- FR18: User can delete local drafts.

### Analysis Queue & Processing

- FR19: System can enqueue items for upload and analysis.
- FR20: System can process queued items sequentially, with optional parallel processing capped at **2 items concurrently**.
- FR21: System can retry processing for failed items.
- FR22: System can show an error state and recovery action when processing fails.
- FR23: User can manually trigger retry for an individual failed item.
- FR24: System can preserve queue state across app restarts.

### AI Extraction & Structured Output

- FR25: System can extract structured item data from an image via an AI vision service.
- FR26: System can enforce that AI output conforms to a strict JSON schema.
- FR27: System can validate extracted fields before presenting them to the user.
- FR28: System can fall back to manual entry/editing when AI output is invalid or incomplete.
- FR29: System uses a fixed, pre-defined taxonomy configuration for item categorization.
- FR30: System can constrain item category to the predefined taxonomy (15–20 categories).
- FR31: System can prevent storing buyer/supplier PII as part of item fields.

### Item Review, Edit, and Save

- FR32: User can review AI-generated item details before saving.
- FR33: User can edit item fields: Title, Brand, Category, Size, Color, Condition, Description, Tags[].
- FR34: User can save an item to their inventory.
- FR35: User can edit an already-saved item.
- FR36: User can delete an item from their inventory.

### Dashboard, Search & Filtering

- FR37: User can view a list of items in their inventory.
- FR38: User can search items by keyword (e.g., title/brand/tags).
- FR39: User can filter items by category and/or status.
- FR40: User can view item detail screens from the inventory list.

### Export & Portability

- FR41: User can export their inventory as a CSV file.
- FR42: Exported CSV can include image links for each item.
- FR43: System can generate time-limited signed URLs for exported image links (7-day expiry).
- FR44: System can ensure exports only include the authenticated user’s inventory.

### Notifications & User Feedback

- FR45: System can notify the user locally when a batch finishes processing.
- FR46: System can notify the user locally when items are ready for review.

### Security & Data Isolation

- FR47: System can ensure users can only access their own inventory items.
- FR48: System can ensure users can only access their own images.
- FR49: System can ensure users can only export their own inventory.

## Non-Functional Requirements

### Performance

- NFR1: End-to-end “upload + analyze + parse + ready-to-review” latency is **p50 < 4s** on Wi‑Fi and strong 4G/LTE.
- NFR2: End-to-end latency is **p95 < 8s** on Wi‑Fi and strong 4G/LTE.
- NFR3: App remains responsive during burst scanning and queue processing up to **20 items per batch**.
- NFR4: On-device image compression targets **< 500KB** per uploaded image.

### Reliability & Resilience

- NFR5: Offline capture succeeds without network; drafts persist across app restarts until synced or deleted.
- NFR6: Queue processing is safe to retry without creating irreconcilable duplicates.
- NFR7: If AI response is invalid JSON, system retries once, then degrades gracefully to manual edit without blocking save.
- NFR8: If export generation fails, the app shows an actionable error message and a retry option within **2 seconds** of failure, and the user’s inventory data remains unchanged.

### Security

- NFR9: All data in transit uses TLS.
- NFR10: Firestore/Storage access is restricted to the authenticated user’s data.
- NFR11: CSV export links use signed URLs with **7-day expiry**; exports are generated only for the authenticated user.
- NFR12: API keys and secrets are never shipped in the mobile bundle; secrets remain server-side.

### Privacy & Data Minimization

- NFR13: Item schema excludes buyer/supplier PII; prompts instruct AI to exclude names/addresses if OCR detects them.
- NFR14: App provides a Privacy Policy link in Settings.
- NFR15: “Delete Account” initiates immediate user-facing logout/disable and triggers asynchronous deletion of cloud data; local drafts/photos are removed best-effort.

### Scalability & Rate Limiting (Lean)

- NFR16: Backend enforces per-user AI analysis limits of **≤ 20 requests / 5 minutes** and **≤ 2 concurrent analyses**; excess requests return a rate-limit response that the client surfaces as a queued/throttled status.
- NFR17: Queue concurrency is controlled to avoid exceeding model/API quotas and to protect device stability.

### Observability

- NFR18: System logs key processing events server-side without logging sensitive content.
- NFR19: Errors include correlation identifiers so a failed item can be traced across client → function → model call.

### Accessibility (Pragmatic)

- NFR20: Core flows meet basic accessibility: text contrast consistent with **WCAG 2.1 AA**, accessible labels for primary actions, and support font scaling/dynamic type up to **200%** without loss of core functionality (validated via a manual VoiceOver/TalkBack pass).
