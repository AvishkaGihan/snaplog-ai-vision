---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments: []
workflowType: 'prd'
classification:
  projectType: mobile_app
  domain: e-commerce / inventory management
  complexity: medium
  projectContext: greenfield
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
date: '2026-02-25'
---

# Product Requirements Document - SnapLog AI Vision

**Author:** Avish
**Date:** 2026-02-25

---

## Executive Summary

SnapLog is a React Native (Expo) mobile application that eliminates manual data entry for item cataloging. Users photograph any physical object — a laptop, sneaker, power tool, or household item — and on-device image compression followed by AI-powered multimodal analysis instantly populates a structured item record: title, category, color, condition, tags. The item is saved to Firebase Firestore and the photo to Firebase Cloud Storage, all within a ten-second end-to-end flow.

The core market truth: resellers, warehouse operators, and homeowners tolerate manual inventory entry only because no sufficiently fast, accurate alternative exists for mobile-first workflows. SnapLog replaces a multi-minute manual form with a two-tap camera interaction.

### What Makes This Special

SnapLog's differentiation is **structured AI output, not conversational AI**. Rather than generating chat text, SnapLog uses Gemini 2.0 Flash to return a strict JSON object validated by Zod. This "vision-to-form" pattern is the product's core technical thesis and its primary portfolio demonstration value: the ability to consume multimodal AI output and bind it directly to a UI form, with graceful degradation to manual entry when AI confidence is low or network is unavailable.

## Project Classification

| Attribute | Value |
|---|---|
| **Project Type** | Mobile Application (React Native / Expo) |
| **Domain** | E-Commerce / Inventory Management |
| **Complexity** | Medium |
| **Project Context** | Greenfield |
| **Primary AI Model** | Gemini 2.0 Flash (Multimodal) |
| **Backend** | Firebase (Cloud Functions, Firestore, Cloud Storage) |

---

## Success Criteria

### User Success

- User completes a full catalog flow (photo → AI analysis → edit → save) in **under 10 seconds** from the moment they tap "Scan".
- AI-generated fields are correct enough that the user makes **zero or one edit** per item at least 80% of the time.
- Users can find a previously cataloged item using search within **3 taps** from the dashboard.
- The app remains usable (capture + draft save) with **zero network connectivity**.

### Business Success

- AI category detection accuracy exceeds **80%** on a representative test set of common resale items (electronics, footwear, clothing, tools).
- Image upload + AI analysis round-trip completes in **under 4 seconds** on a mid-tier Android device on a 4G network.
- Portfolio demonstration converts at least one client enquiry into a paid engagement within 90 days of launch.

### Technical Success

- Gemini API returns valid, parseable JSON on **≥95%** of requests under normal conditions.
- Client-side image compression reduces file size to **<500 KB** before upload in all cases.
- Firebase Cloud Functions rate-limiting blocks more than **20 AI requests per user per hour** to control API costs.
- App passes `expo lint` and `flutter analyze` equivalent checks with zero errors on CI.

### Measurable Outcomes

| Metric | Target | Measurement Method |
|---|---|---|
| End-to-end catalog time | < 10 seconds | Manual demo timing |
| AI field accuracy | > 80% correct category | Batch test against 50 known items |
| Image upload + analysis time | < 4 seconds | Firebase performance monitoring |
| Image compression | < 500 KB uploaded | Cloud Storage metadata |
| JSON parse success rate | ≥ 95% | Cloud Function error logs |
| App crash rate | < 1% of sessions | Expo / Firebase Crashlytics |

## Product Scope

### MVP — Minimum Viable Product

Everything required for the portfolio demo flow to work end-to-end:

- Camera capture and gallery picker with device permission handling
- On-device image compression via `expo-image-manipulator`
- Firebase Cloud Function that receives image, calls Gemini 2.0 Flash, returns parsed JSON
- Zod validation of AI response with fallback to manual entry on failure
- Review/edit screen pre-populated with AI fields (title, category, color, condition)
- Save to Firestore + image to Cloud Storage
- Dashboard listing all saved items with basic search
- Offline draft queue — save locally when no network, sync on reconnect
- CSV export of item list

### Growth Features (Post-MVP)

Competitive improvements after core validation:

- Batch scanning mode (multiple items in a single session)
- Item condition photo comparison (before/after)
- Barcode / QR code scan fallback for common retail items
- Sharing a catalog item as a formatted card (for eBay/Vinted listing)
- Simple analytics dashboard (items scanned per day, category breakdown)
- Multi-user workspace / shared inventory

### Vision (Future)

Long-term product direction:

- OCR extraction of serial numbers and purchase receipts
- Automated pricing suggestions via Sold Listings API (eBay, StockX)
- AR overlay mode (point camera at a shelf and see item data overlaid in real time)
- White-label SDK for client integrations in logistics and insurance apps

---

## User Journeys

### Journey 1 — Marcus: The Weekend Reseller (Primary User — Success Path)

Marcus flips sneakers on weekends. After thrift store runs, he sits in his car with 12 pairs of shoes and a dread he knows well: typing each listing manually onto his phone. Brand, colorway, size, condition — four minutes per pair, minimum.

He opens SnapLog. The dashboard shows his existing 47 items. He taps the floating **Scan** button. The camera opens full-screen. He holds up the first pair — a near-mint Jordan 1 Retro — and takes the photo. A loading overlay appears: *"AI is analyzing..."*. In 2.8 seconds, an edit form populates:

- **Title:** Nike Air Jordan 1 Retro High OG
- **Category:** Footwear / Sneakers
- **Color:** University Blue / White
- **Condition:** Good

Marcus glances at it, taps the condition field to change it to "Excellent", and hits Confirm. The item is saved. He picks up the next pair.

**What this journey reveals:** The product must nail perceived speed (loading state), pre-populated accuracy, and a one-tap confirm experience. The edit screen must be the path of least resistance.

---

### Journey 2 — Marcus: Network Drops Mid-Session (Primary User — Edge Case)

Marcus is in a basement warehouse with poor signal. He scans a laptop. The AI call times out after 6 seconds. The app doesn't crash — it shows a gentle toast: *"Couldn't reach AI — fill in the details manually or retry."* Marcus fills in the three fields himself and taps Confirm. The item saves locally as a draft. When he drives home and the network returns, the app syncs the photo to Cloud Storage and marks the item as synced.

**What this journey reveals:** Offline-first draft queue is not optional. Manual entry fallback must be a first-class path, not an afterthought. No crashes, no data loss.

---

### Journey 3 — Sarah: The Homeowner Building an Insurance Inventory (Secondary User — Different Goal)

Sarah just bought a house and her insurance agent told her to document her valuables. She's heard of spread sheets but has never used one. She opens SnapLog, takes photos of her laptop, TV, camera lenses, and coffee machine. She doesn't edit any AI-generated fields — they're close enough. When she's done, she taps **Export → CSV**, attaches the file to an email, and sends it to her agent.

**What this journey reveals:** Export is a critical feature for secondary users. The UI must not require prior technical knowledge — onboarding must be zero-friction.

---

### Journey 4 — Avish: The Developer Reviewing System Health (Admin / Ops)

Avish checks the Firebase console after going live. He reviews Cloud Function invocation counts and error rates. He sees three failed JSON parse attempts in the logs — Gemini returned valid text but wrapped in Markdown code fences instead of raw JSON. He updates the prompt in the Cloud Function to enforce `"Return ONLY a raw JSON object, no markdown fences"` and redeploys. No app update required.

**What this journey reveals:** The AI prompt must be configurable server-side (in the Cloud Function, not baked into the mobile bundle). Error logging in Cloud Functions must be actionable.

---

### Journey Requirements Summary

| Journey | Capabilities Revealed |
|---|---|
| Marcus — Success Path | Camera access, AI analysis, pre-populated edit form, fast confirm, Firestore save |
| Marcus — Offline | Draft queue, manual entry fallback, background sync, graceful error messages |
| Sarah — Export | CSV export, zero-friction UX, no required account setup friction |
| Avish — Admin | Server-side prompt management, structured error logging, rate limiting |

---

## Innovation & Novel Patterns

### Detected Innovation Areas

**Vision-to-Structured-Form (V2SF) Pattern:** SnapLog's core innovation is not AI image recognition per se (that is commodity) — it is the binding of AI multimodal output directly to an editable mobile form with schema validation at the boundary. The Zod validation layer between the AI response and the UI form is the architectural novelty: it makes the AI output behave like a typed API, with graceful degradation on schema failure.

**Offline-First AI Workflow:** Most AI-powered apps fail gracefully only when online. SnapLog's draft queue allows the full cataloging workflow to complete offline, with AI enrichment applied retroactively when connectivity returns. This is a meaningful UX pattern distinction from naive AI integrations.

### Market Context & Competitive Landscape

Existing tools (eBay's camera listing, Google Lens) return search results, not structured inventory records. SnapLog returns a form-ready JSON object validated against a schema — the distinction between "here are some results" and "here is your data" is the entire product value.

### Validation Approach

- Test with 50 diverse item photos across 5 categories (electronics, footwear, clothing, tools, furniture)
- Record category accuracy rate, field accuracy, and parse success rate
- Use failed parses to refine the Gemini prompt iteratively

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| Gemini returns Markdown-wrapped JSON | Strip code fences in Cloud Function before parsing |
| Gemini returns conversational text | Zod validation fails → present manual entry form |
| Response latency > 4s | Timeout at 6s; show retry prompt with manual fallback |
| API cost overrun | Rate limit at 20 calls/user/hour in Cloud Function |

---

## Mobile App Specific Requirements

### Project-Type Overview

SnapLog is a cross-platform mobile application built with React Native / Expo. It is camera-primary — the camera interaction is the product's hero feature. The app must run on both iOS and Android with feature parity.

### Platform Requirements & Distribution

| Platform | Minimum OS | Distribution Method |
|---|---|---|
| Android | Android 10 (API 29) | Side-loaded `.apk` |
| iOS | iOS 15 | Expo Go (demo) |

**App Store Compliance:** N/A for MVP. The app is distributed privately for portfolio demonstration purposes and does not need to adhere to Apple App Store or Google Play Store review guidelines at this time.

**Push Notification Strategy:** N/A for MVP. The app relies on synchronous user flows and local background syncing rather than server-originated push notifications.

### Device Permissions

| Permission | When Requested | Why |
|---|---|---|
| Camera | On first "Scan" tap | Capture item photos |
| Photo Library / Media | On "Pick from Gallery" tap | Alternate image source |
| Network State | App launch | Determine online/offline mode |

### Offline Mode

- Items created offline are stored locally exclusively using MMKV (via Zustand persist) with a `syncStatus: 'pending'` flag.
- When network is restored, the app uploads photos to Cloud Storage and syncs Firestore records.
- UI indicates sync status per item (pending / synced).

### Navigation Architecture

- **Tab Navigator** — `Dashboard` | `Settings`
- **Floating Action Button (FAB)** — Camera scan trigger, always visible on Dashboard; opens the camera as a full-screen modal (camera is a transient task, not a persistent tab destination)
- **Stack Navigator** (within Dashboard tab) — `ItemList → ItemDetail → EditItem`
- **Modal** — Camera screen presented as full-screen modal

### State Management

- **Zustand** for all global app state (item list, network status, loading/error states, and data fetching)
- No other state management libraries are permitted (React Query explicitly forbidden to maintain architecture boundaries)

### Technical Architecture Considerations

- Image is compressed client-side to `<500 KB` and `max 1280px` long edge before upload
- Image uploaded to Firebase Cloud Storage; download URL passed to Cloud Function
- Cloud Function calls Gemini 2.0 Flash with the image URL and a strict JSON prompt
- Cloud Function returns parsed, Zod-validated JSON to the mobile client
- API key stored in Firebase environment config (`GEMINI_API_KEY`), never in the mobile bundle

### Implementation Considerations

- Use `expo-camera` for camera access and `expo-image-manipulator` for compression
- Use `expo-file-system` and `expo-sharing` for CSV export
- Firebase JS SDK v9+ (modular) to minimize bundle size
- Implement retry logic (max 2 retries, exponential backoff) in the Cloud Function HTTP client

---

## Functional Requirements

### Camera & Image Capture

- **FR1:** User can open a full-screen camera view from the main dashboard with a single tap.
- **FR2:** User can capture a photo using the device camera.
- **FR3:** User can select an existing photo from the device gallery as an alternative to camera capture.
- **FR4:** The system can compress the captured image to below 500 KB before uploading.
- **FR5:** The system can request camera and photo library permissions and handle denial gracefully (explains why permission is needed).

### AI Analysis

- **FR6:** The system can send the captured image to a backend service for AI-powered analysis.
- **FR7:** The backend service can return a structured item record containing: Title, Category, Color, Condition.
- **FR8:** The backend service can validate the AI response against a defined schema before returning it to the client.
- **FR9:** The system can present a manual entry form instead of crashing if AI analysis fails or returns an invalid schema.
- **FR10:** User can see a loading state indicator during AI analysis.

### Item Review & Editing

- **FR11:** After AI analysis, user sees a pre-populated form with AI-generated fields.
- **FR12:** User can edit any AI-generated field before saving.
- **FR13:** User can add additional notes or tags to an item beyond the AI-generated fields.
- **FR14:** User can confirm and save an item after reviewing/editing the AI-generated data.
- **FR15:** User can discard a scan and return to the dashboard without saving.
- **FR31:** User can delete a cataloged item, removing it from the database and deleting its associated photo from cloud storage.

### Item Storage

- **FR16:** The system can persist confirmed items to a cloud database.
- **FR17:** The system can store item photos in cloud storage and make them accessible by item record.
- **FR18:** The system can save items created without network connectivity as local drafts.
- **FR19:** The system can automatically sync local drafts to cloud storage when network connectivity is restored.
- **FR20:** User can view the sync status (pending / synced) for each item record.

### Dashboard & Discovery

- **FR21:** User can view a list of all cataloged items on the main dashboard.
- **FR22:** User can see at minimum: item title, category, thumbnail image, and sync status in the item list.
- **FR23:** User can search items by title or category using a text search input.
- **FR24:** User can filter items by category.
- **FR25:** User can tap an item in the list to view its full details.

### Export

- **FR26:** User can export the full item list as a CSV file.
- **FR27:** User can share the exported CSV file via the native OS share sheet (email, Airdrop, Slack, etc.).

### API & Rate Limiting (Backend)

- **FR28:** The backend can enforce a maximum of 20 AI analysis requests per user per hour.
- **FR29:** The backend can log all AI parse failures with the raw AI response for diagnosis.
- **FR30:** Administrator can configure the AI prompt server-side without requiring a mobile app update.

---

## Non-Functional Requirements

### Performance

- **NFR-P1:** The system shall complete client-side image compression in under 2 seconds for a 12MP image as measured by client-side performance timing on mid-tier hardware.
- **NFR-P2:** The system shall return the structured JSON item record in under 4 seconds (95th percentile) from image upload initiation as measured by backend telemetry on a standard 4G connection.
- **NFR-P3:** The system shall render the item list dashboard with 500 items while maintaining a 60fps scroll rate (< 16ms frame time) as measured by mobile performance profiling tools.
- **NFR-P4:** The system shall become interactive from a warm start in under 3 seconds as measured by launch time profiling.

### Security

- **NFR-S1:** The system shall enforce backend-only access to 3rd-party AI services, avoiding embedding credentials in the client bundle, as measured by bundle analysis.
- **NFR-S2:** The system shall enforce data isolation such that users can only read/write their own item records and images as measured by automated security rules testing.
- **NFR-S3:** The system shall require an authenticated session (anonymous or authenticated) prior to allowing any AI API invocations as measured by endpoint access tests.

### Reliability

- **NFR-R1:** The system shall maintain a 0% crash rate resulting from AI parsing failures, network timeouts, or camera permission denials as measured by crash reporting telemetry.
- **NFR-R2:** The system shall successfully retry failed user-initiated data operations (save, sync) up to 2 times with backoff before surfacing a failure state as measured by network simulation testing.
- **NFR-R3:** The system shall persist unsynced local drafts across application force-quits and device restarts with 100% reliability as measured by manual lifecycle testing.

### Scalability

- **NFR-SC1:** The system shall utilize elastic cloud infrastructure capable of scaling automatically without manual intervention as measured by architecture review.
- **NFR-SC2:** The system shall enforce a strict rate limit of 20 AI analysis requests per user per hour to prevent quota exhaustion as measured by load testing the backend endpoint.

### Compatibility

- **NFR-C1:** The system shall be implemented using a cross-platform mobile framework that compiles to native code without requiring manual ejection to native project files as measured by repository analysis.
- **NFR-C2:** The system shall successfully install and operate with full feature parity on iOS 15+ and Android 10+ (API 29) as measured by device compatibility testing.
- **NFR-C3:** The system shall perform all camera operations using the device's rear-facing camera as measured by functional testing.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini returns non-JSON or Markdown-wrapped JSON | Medium | High | Strip code fences server-side; Zod validation catch triggers manual entry fallback |
| Image upload fails on slow/no network | High | Medium | Offline draft queue; retry with exponential backoff |
| AI category detection accuracy < 80% on real items | Medium | Medium | Iterative prompt engineering; add few-shot examples in prompt |
| Firebase free tier quota exceeded during demo | Low | High | Rate limiter; monitor usage in Firebase console |
| Expo SDK breaking change during build | Low | Medium | Pin Expo SDK version; test builds weekly |
| Camera permission denial breaks core flow | Medium | High | Graceful permission denied state; fallback to gallery picker |

---

## Technical Stack Summary

| Component | Tool / Technology | Purpose |
|---|---|---|
| Mobile Framework | React Native (Expo Managed Workflow) | Cross-platform iOS + Android |
| UI Library | React Native Paper | Material-style components |
| Navigation | React Navigation (Stack + Tab) | Screen routing |
| State Management | Zustand | Global app state |
| Image Handling | expo-image-manipulator | Resize + compress before upload |
| AI Validation | Zod | Schema validation of Gemini JSON output |
| Backend Runtime | Firebase Cloud Functions (Node.js 20) | AI orchestration, rate limiting |
| Database | Firebase Firestore | Item record storage |
| File Storage | Firebase Cloud Storage | Photo storage |
| AI Vision | Gemini 2.0 Flash (Google AI) | Multimodal image analysis → JSON |
| Authentication | Firebase Auth (Anonymous + Google) | User scoping and security |
| CI | GitHub Actions | Lint + type check on PR |

---

## Estimated Build Timeline (Solo Dev)

| Day | Focus |
|---|---|
| Day 1 | Expo init, navigation setup (Tab + Stack), camera permission flow |
| Day 2 | Firebase integration — Auth, Firestore rules, Cloud Storage rules |
| Day 3 | Cloud Function setup + Gemini Vision API + Zod validation |
| Day 4 | UI wiring — Edit form, Dashboard list, search, CSV export |
| Day 5 | Offline draft queue + sync logic + edge case testing |
| Day 6 | Demo recording, README, GitHub polish |

---

## Portfolio Presentation Notes

- **GitHub Repo:** `snaplog-ai-vision`
- **Key Screenshot:** Split-screen "Real Photo" vs "App Form Populated" — the visual proof of the V2SF pattern
- **Demo Video Flow:** Camera opens → Photo taken → 2.8s spinner → Text fields fill up → User taps Confirm → Item appears on Dashboard
- **Client Pitch Angle:** "This is the same pattern you'd use for insurance asset tracking, logistics intake, field inspection apps, or any workflow where users currently type what they can see."
