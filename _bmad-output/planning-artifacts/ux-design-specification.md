---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
projectName: snaplog-ai-vision
userName: AvishkaGihan
date: 2026-02-04
lastStep: 14
---

# UX Design Specification snaplog-ai-vision

**Author:** AvishkaGihan
**Date:** 2026-02-04

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

SnapLog is a cross-platform mobile “industrial” inventory intake tool for high-volume resellers. Its defining mental model is the heartbeat workflow: users capture items in rapid bursts (up to ~20), while an asynchronous queue handles upload + AI extraction in the background. The product’s promise is not “AI magic”—it’s reliable throughput: photo → listing-ready structured data, with clear statuses and zero dead-ends.

The UX success metric is a calm, confident feeling of control: capture fast now, verify critical fields later, export weekly in one clean batch.

### Target Users

**Primary: High-volume reseller (“weekly haul” operator).**

- Works in constrained environments (garage/warehouse, inconsistent connectivity).
- Prioritizes speed and repeatability, but requires accuracy to avoid returns/refunds.
- Wants dense, utilitarian UI (high-contrast, pro tool vibe) optimized for one-handed, rapid interaction.

**Secondary: Builder/owner/admin (demo + tuning).**

- Needs to validate taxonomy consistency, troubleshoot failures, and ensure outputs are schema-valid.
- Values observability: clear error states, correlation, and safe retries.

### Key Design Challenges

1) **Trust at the offline edge (photos are sacred).**

- The biggest trust-killer is losing captured photos/drafts after a burst session.
- UX must make local persistence explicit and reassuring: “Saved on device” is a first-class state, not implied behavior.

2) **Queue transparency without cognitive overload.**

- The system is inherently asynchronous (Draft → Uploading → Analyzing → Ready/Failed).
- The UI must expose status + next actions (retry, edit, delete) clearly, while still enabling rapid capture without waiting.

3) **Review-first verification without destroying speed.**

- Users must verify Brand, Size, Condition before confirming because mistakes cause returns.
- We need a review-first flow that stays fast: highly scannable summaries, strong defaults, and minimal friction to correct the “hard filters.”

4) **Failure handling as a normal path, not an exception.**

- AI can output invalid JSON or incomplete fields.
- UX must gracefully degrade: retry once, then land the user in manual edit with confidence that nothing is lost.

5) **Pro-tool density on small screens.**

- “Linear/Superhuman for inventory” implies dense layouts, sharp hierarchy, and high information scent—without sacrificing tap targets and accessibility.

### Design Opportunities

1) **Make the heartbeat visible and calming.**

- A queue UI that feels like a reliable conveyor belt: clear counts, progress, and predictable completion signals.

2) **Trust-forward offline messaging.**

- Strong, repeated reassurance patterns (capture confirmation, draft counts, local storage indicators, safe-to-leave messaging) that turn “offline-first” into felt confidence.

3) **Verification UX built around the hard filters.**

- A review UI that prioritizes Brand / Size / Condition as “lock-in fields,” with quick correction controls and optional confidence cues.

4) **Weekly export as a ritual.**

- Treat export as a guided “Sunday listing session”: a batch review summary, last-minute fixes, and a clean CSV output moment with 7‑day image URL expectations made clear.

## Core User Experience

### Defining Experience

The core experience of SnapLog is “Burst Mode intake with a trusted async conveyor belt.” Users capture photos in rapid succession, and each capture immediately becomes a queued draft without blocking the camera. The system processes items asynchronously (upload + analyze + schema-validate), while the user keeps scanning. The product’s value is throughput with control: users can always see what’s happening, what’s next, and what’s ready to verify.

Critically, SnapLog is review-first: the app optimizes for speed, but the user must verify key revenue-protecting fields before confirming an item.

### Platform Strategy

- **Platform:** Mobile app only (iOS/Android via Expo)
- **Form factor:** Phone-first, portrait orientation
- **Primary input:** Touch-only (camera shutter + on-screen keyboard)
- **Offline strategy:** Capture-only offline (“gathering the haul”); analysis and efficient editing occur when connectivity returns and AI outputs are available

### Effortless Interactions

1) **Rapid capture loop (intake flow):**

- Shutter → instant “snap-to-queue” animation → camera resets immediately
- Zero perceived lag; the app never makes the user wait to take the next photo

2) **Batch overview (queue glanceability):**

- A persistent, readable queue summary (e.g., Draft / Uploading / Analyzing / Ready / Failed)
- Users can trust the system by seeing counts and status transitions at a glance

3) **Item review/edit (rapid verification):**

- Review-first flow optimized for fast correction of critical fields
- Clear hierarchy that foregrounds Brand / Size / Condition
- Minimal taps to fix mistakes and confirm

### Critical Success Moments

- **Moment of “this is better”:** The user realizes they can keep capturing while the machine works—no waiting, no uncertainty—because the queue makes progress visible.
- **Moment of success:** An item hits **Ready**, the user verifies Brand/Size/Condition quickly, and confidently confirms without fear of returns-driven mistakes.
- **Make-or-break failure:** The intake session must never feel fragile—capture must feel instantaneous and, above all, safe (no lost photos/drafts).

### Experience Principles

1) **Never block the camera:** Intake speed is sacred; capture stays responsive even while processing.
2) **Make background work legible:** The queue is an instrument panel—clear states, clear counts, clear next actions.
3) **Accuracy protects revenue:** Review-first, with Brand/Size/Condition prioritized as “hard filters.”
4) **Offline is for gathering, not guessing:** Be explicit offline; capture confidently now, analyze/verify later.
5) **Pro-tool density with clarity:** Dense, high-contrast UI that’s scannable and decisive on small screens.

## Desired Emotional Response

### Primary Emotional Goals

- **Unstoppable efficiency (Burst Mode):** The app should feel rhythmic and frictionless—users stay in motion.
- **Control (pro tool posture):** Users should feel they’re driving a reliable machine with clear states and clear actions.
- **Trust + safety:** Especially around offline capture, users must believe their work is protected.
- **Clarity (review-first verification):** High-contrast, scannable information makes mistakes obvious and corrections fast.
- **Accomplished + secure (post-batch):** The user feels the haul has been “converted from chaos into order” and safely stored.

### Emotional Journey Mapping

- **First 60 seconds (Capability):**
  - Immediate sense of speed: camera feels instant; capture feels responsive.
  - The product communicates competence through performance and crisp feedback.

- **During the heartbeat (Trust):**
  - The queue feels like an instrument panel: numbers move predictably, statuses are legible.
  - Users keep working without second-guessing whether the system is actually doing anything.

- **During verification (Clarity):**
  - Review surfaces the truth quickly: critical fields are visually prioritized and easy to scan.
  - Corrections feel fast and decisive; no ambiguity about what will be saved.

- **When something goes wrong (Informed + safe):**
  - The product responds with grounded reassurance and next steps (e.g., “Photos saved locally. Tap to retry.”).
  - Failure states are actionable and never imply loss.

- **After verification/confirmation (Accomplished + secure):**
  - A satisfying sense of closure: items are confirmed, export-ready, and safely stored for the weekly workflow.

### Micro-Emotions

**Optimize for (ranked):**

1) **Control** — “I’m driving a pro tool.”
2) **Speed/Flow** — “Don’t break my rhythm.”
3) **Trust** — “My photos won’t disappear.”

**Actively avoid (ranked):**

1) **Fragility** — “Will this crash if I go fast?”
2) **Anxiety** — “Is it actually working or just spinning?”

### Design Implications

- **Unstoppable / rhythm** → instant snap-to-queue feedback, minimal modal interruptions, fast camera reset.
- **Control** → explicit states, explicit next actions (retry/edit/delete), predictable navigation, no hidden work.
- **Trust / safe** → persistent local-save indicators, explicit offline copy, recovery-first error design, never ambiguous loss.
- **Clarity** → high-contrast hierarchy, scannable layouts, critical fields (Brand/Size/Condition) foregrounded, tight review UI.
- **Informed failures** → error messages that include: what happened, what is safe, and what the user can do now.

### Emotional Design Principles

1) **Pro-tool calm:** Dense UI, minimal decoration, maximum signal.
2) **Reassurance through evidence:** Say what’s safe (“Saved locally”) and show it consistently.
3) **Progress must be legible:** Replace “spinners” with state + counts + time/context where possible.
4) **Errors are workflows:** Treat failures as common, recoverable states with clear actions.
5) **Clarity over comfort:** Verification screens are optimized for fast truth-finding, not storytelling.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Linear — Status clarity**

- The UI makes state legible without effort: you can tell what’s happening at a glance.
- SnapLog translation: item statuses must be instantly readable (Draft / Uploading / Analyzing / Ready / Failed / Confirmed) with minimal “digging.”

**Superhuman — Thumb-speed triage**

- The experience is built around fast decision-making with minimal friction and predictable next steps.
- SnapLog translation: verification should feel like clearing an inbox: Verify → Next, Verify → Next, with strong defaults and fast corrections for critical fields.

**Apple Camera — Non-blocking capture**

- Capture is sacred; the shutter remains responsive and the system saves in the background.
- SnapLog translation: the “snap-to-queue” moment must never freeze the viewfinder; saving/processing is asynchronous.

**Google Photos — Trustworthy background progress**

- Subtle, persistent progress indicators (“Backing up 12 items…”) build confidence without demanding attention.
- SnapLog translation: a quiet but persistent queue indicator proves that drafts/photos are safe and processing is moving.

**Shopify Mobile — Data density without clutter**

- The UI shows critical business information on small screens with clear hierarchy.
- SnapLog translation: dense item cards and review layouts can be utilitarian as long as hierarchy is sharp and scan paths are obvious.

### Transferable UX Patterns

**Interaction patterns**

- **Non-blocking capture loop:** shutter always works; the system handles saving/uploading/processing asynchronously.
- **Snap-to-queue feedback:** immediate animation/acknowledgement that the photo is captured and safely stored.
- **Inbox-style verification:** one-item-at-a-time review flow with “confirm & next” pacing and fast correction controls.
- **Actionable failure states:** “Tap to retry” is always visible and always works; errors never dead-end.

**Information hierarchy patterns**

- **Instrument-panel queue summary:** persistent counts by status (e.g., Uploading / Analyzing / Ready / Failed) visible but not dominating.
- **Critical-field prioritization:** Brand / Size / Condition are foregrounded everywhere that matters (cards + review) to protect revenue.
- **Dense cards with clear scan lanes:** compact but readable item summaries that reward power users without punishing first-timers.

**Visual patterns**

- **High-contrast pro-tool styling:** minimal decoration, strong typography, clear separators, and “signal-first” layout.
- **Badges as truth, not decoration:** status badges communicate system reality; no celebratory/gamified noise.

### Anti-Patterns to Avoid

- **Blocking spinners:** never lock the UI while AI thinks; avoid “waiting rooms.”
- **Silent failures:** never let upload/analysis fail invisibly; failures must be explicit and actionable.
- **Modal hell:** avoid full-screen modal stacks for small edits; keep edits inline or in a single, focused screen.
- **Gamification clutter:** no badges/levels/confetti; this is a money-making workflow tool, not a game.

### Design Inspiration Strategy

**What to Adopt**

- **Linear-style status clarity** → a clean, consistent status system visible across list, queue, and item detail.
- **Apple Camera non-blocking capture** → keep shutter responsive; show progress without interrupting capture.

**What to Adapt**

- **Superhuman triage** → translate “inbox clearing” into “inventory verification,” tuned for touch (thumb reach, fewer gestures, fewer steps).
- **Google Photos backup indicator** → adapt into a subtle “Saved locally / Processing…” queue indicator that proves safety and progress.
- **Shopify data density** → adapt hierarchy and spacing to highlight the hard filters (Brand/Size/Condition) while keeping compact layouts.

**What to Avoid**

- **Spinner purgatory** → replace waiting with states + counts + actionable next steps.
- **Hidden errors** → make failures visible, recoverable, and non-catastrophic.
- **Fragmented editing** → avoid multi-modal, multi-step editing for small fixes.

## Design System Foundation

### 1.1 Design System Choice

**Chosen approach:** Themeable, token-driven design system (Balance approach) using a strong React Native component foundation plus a custom design token layer.

**Target aesthetic:** Neutral/Pro (“Linear/Superhuman”), dark-mode-first, data-dense, high-contrast, status-forward.

**Candidate implementation libraries (Expo-friendly):**

- **Tamagui** (recommended if we want a full component system + tokens + theming + performance)
- **Shopify Restyle** (recommended if we want lightweight tokens + build/select components ourselves)

### Rationale for Selection

- **Speed without generic look:** Pre-built primitives (inputs, buttons, lists) reduce build time while tokens (type/space/color/radius) deliver a distinct industrial feel.
- **Consistency across complex states:** A token system makes queue statuses, badges, and error states consistent everywhere (list → detail → review → export).
- **Dark-mode-first clarity:** Neutral base palette + semantic status tokens supports legibility and avoids “playful Material” styling.
- **Scalable maintainability:** Tokens + component variants prevent design drift as the app grows (capture, queue, review, export).

### Implementation Approach

**Token-first foundation**

- Define design tokens early: `color`, `typography`, `spacing`, `radius`, `elevation`, `motion`, `iconography`.
- Use **semantic tokens** (meaning-based) rather than raw colors:
  - `bg/app`, `bg/surface`, `text/primary`, `text/secondary`, `border/subtle`
  - `status/draft`, `status/uploading`, `status/analyzing`, `status/ready`, `status/failed`, `status/confirmed`
  - `action/primary`, `action/secondary`, `action/destructive`

**Component strategy**

- Use a component library for core primitives, then build a small set of “SnapLog signature components” that express the heartbeat:
  - Queue summary header (instrument panel)
  - Status badge system (truthful, consistent)
  - Dense item card (scan lanes for Brand/Size/Condition)
  - Review-first verification layout (thumb-speed triage)

**Accessibility baseline**

- Enforce contrast targets for dark mode (WCAG AA where feasible).
- Consistent focus states, tap targets, and readable type scale even in dense layouts.

### Customization Strategy

**Dark-mode-first palette**

- Neutral grayscale ramp for surfaces and text (minimize chroma).
- Reserve color saturation for meaning: status + actions only.
- Keep status colors consistent and distinguishable under low-light conditions.

**Typography + density rules**

- Tight line-height and purposeful spacing for “pro tool” density.
- Strong hierarchy: Brand/Size/Condition always visually prioritized in cards and review.

**Motion principles**

- Motion communicates state, not celebration:
  - Snap-to-queue animation = proof of capture + safety
  - Subtle progress transitions in the queue = proof of background work
  - No gamified effects (no confetti/badges-as-rewards)

**UI constraints**

- Minimal corner rounding, minimal shadows, maximum clarity.
- Avoid Material “playfulness” (over-rounded controls, bouncy motion, decorative surfaces).

## 2. Core User Experience

### 2.1 Defining Experience

**Defining interaction:** **Burst-Capture** — the user rapidly captures a haul in one continuous rhythm while processing happens asynchronously in the background.

The experience is defined by two connected loops:

- **Input loop (Conveyor Belt):** photos go in fast; the machine works in the background.
- **Output loop (Inbox Zero):** items arrive in Review; the user triages them to Done/Confirmed.

If we nail Burst-Capture + queue legibility, everything else follows.

### 2.2 User Mental Model

**Input mental model: Conveyor Belt**

- Each snap is a “unit of work” placed onto a belt.
- The system is expected to keep moving without blocking intake.

**Output mental model: Inbox Zero**

- “Review” is a queue of decisions.
- The user expects fast, repeatable actions: approve → next; fix → next.

**Expectation to design for (slightly novel):**

- Users may expect “snap → wait → edit” (traditional flow).
- SnapLog reframes it as “snap now, see data later,” so the UI must explicitly teach that waiting is unnecessary.

### 2.3 Success Criteria

**Signals that make users say “this just works”:**

- **Shutter responsiveness:** < 50ms perceived latency; shutter never blocks.
- **Immediate proof of capture:** heavy haptic tick + “fly-to-tray” animation on every snap.
- **Trust signal while capturing:** persistent queue counter visible during capture (e.g., “Queue: 5 Analyzing”).
- **Verification speed:** 1 tap to approve; < 3 taps to fix category.
- **Legible state everywhere:** Draft / Uploading / Analyzing / Ready / Failed / Confirmed are consistent and instantly readable.

### 2.4 Novel UX Patterns

**Novelty level:** Slightly novel (asynchronous “capture now, data later”).

**Education strategy:**

- Use a single, high-signal onboarding/empty-state tip:
  - “Snap your whole haul at once. We’ll process in the background.”
- Reinforce with interface truth (queue counters + statuses) rather than verbose tutorials.

**Familiar metaphors used:**

- Conveyor belt for intake.
- Inbox Zero for review/triage.

### 2.5 Experience Mechanics

**1) Initiation**

- User starts Burst-Capture via a large, thumb-friendly **Scan** FAB on the Dashboard.

**2) Interaction**

- **Controls:** on-screen shutter button; optional **volume keys** as a pro feature for one-handed capture.
- **Core loop:** tap shutter → item becomes a draft and enters the queue immediately → camera resets instantly for the next shot.

**3) Feedback**

- **Tactile:** heavy haptic “tick” on successful capture.
- **Visual:** “fly-to-tray” animation (thumbnail shrinks into a tray/stack) to prove the photo is safely captured.
- **Status:** queue counter increments and stays visible while capturing (“Queue: X Analyzing / Y Uploading / Z Ready”).

**4) Completion**

- A clear **Finish Batch** action exits the camera and lands the user in the Queue View.
- Queue View emphasizes status transitions (“lights turning green”) and provides direct paths into Review-first verification.

## Visual Design Foundation

### Color System

**Theme Direction:** Dark-mode-first “Graphite + Cyan” (neutral/pro, high-contrast, minimal decoration).

**Core palette (dark neutrals)**

- **Background:** #0A0D10
- **Surface:** #11161C
- **Surface-2:** #18212B
- **Border:** #2A3644
- **Text / Primary:** #EAF0F6
- **Text / Secondary:** #A7B2C2
- **Accent (Primary action):** #34D3FF (Electric Cyan)

**Semantic tokens (recommended naming)**

- `bg/app`, `bg/surface`, `bg/surface2`
- `text/primary`, `text/secondary`, `text/muted`
- `border/subtle`, `border/strong`
- `action/primary` (cyan), `action/destructive`, `action/secondary`

**Status system (color reserved for meaning)**

- **Draft:** #6B7280
- **Uploading:** #3B82F6
- **Analyzing:** #8B5CF6
- **Ready:** #22C55E
- **Failed:** #EF4444
- **Confirmed:** #14B8A6

**Usage rules**

- Neutrals carry 90% of the UI; saturated color is reserved for status + primary actions.
- Status is never “color only”: always pair with text label + icon/shape.
- Avoid overusing cyan; it must remain the “primary action + high-signal highlight.”

### Typography System

**Primary interface font:** Inter (UI + body)

- Clean, neutral, modern; supports data-dense layouts.

**Data / instrument font:** Monospace for selective fields (e.g., JetBrains Mono or Roboto Mono)

- Used for: queue counts, SKUs, prices, timestamps, IDs, and any “system truth” numbers.

**Type scale (dense but readable on phones)**

- Screen title: 20–22 / semibold
- Section header: 14–16 / semibold
- Body: 13–15 / regular/medium
- Labels + badges: 11–12 / medium
- Numeric counters (monospace): 12–14 / medium, tabular-like alignment preferred

**Hierarchy rule**

- Brand / Size / Condition get top hierarchy in cards and review screens (largest contrast + best placement).

### Spacing & Layout Foundation

**Density goal:** “Pro tool” compactness with disciplined scan lanes.

- **Base spacing unit:** 4px
- **Common increments:** 4 / 8 / 12 / 16 / 20 / 24
- **Corner radius:** 6–10 (minimal rounding)
- **Elevation:** minimal; prefer borders + surface contrast over shadows

**Layout principles**

- **Scan lanes:** consistent left-to-right structure on item rows/cards:
  - Left: image + status badge
  - Center: key fields (Brand / Size / Condition + Title)
  - Right: primary actions (Review/Retry)
- **Queue-as-instrument-panel:** counts and statuses always visible, readable, and stable in position.
- **Editing without modal hell:** prefer inline edits, bottom sheets, or a single dedicated edit screen (not stacked full-screen modals).

### Accessibility Considerations

- Contrast: target WCAG AA where feasible in dark mode; avoid gray-on-gray text.
- Touch targets: minimum ~44px for primary actions, even in dense layouts.
- Status redundancy: color + label + icon; never rely on color alone.
- Motion: short, purposeful, state-communicating; respect reduce-motion settings.

## Design Direction Decision

### Design Directions Explored

We explored multiple visual directions under the Graphite + Cyan foundation, all constrained by:

- Tabs + persistent mini-queue (instrument panel)
- Bottom tray + counter in capture (thumb ergonomics)
- Review-first verification and status clarity (Burst-Capture + async queue)

**Summary of explored themes:**

- Minimal instrument panel vs. more explicit operational UI
- Badge-light vs. badge-forward state communication
- Dense Shopify-style scan lanes vs. slightly roomier cards
- Review triage emphasis vs. balanced navigation emphasis
- Trust messaging visibility (Saved locally, queue proof) vs. quieter reassurance

### Chosen Direction

**Chosen Direction:** **D2 — Badge-First Conveyor**

**What defines D2:**

- Status is unmistakable at a glance (badges + separators + consistent labeling)
- Queue state feels operational and controllable (explicit counts, explicit next actions)
- Failures are never silent (clear “Tap to Retry” affordances)
- Visual weight is slightly higher to maximize legibility and reduce “fragility/anxiety”

### Design Rationale

D2 best supports the product’s defining experience and emotional goals:

- **Control + trust:** explicit state, explicit actions, explicit progress
- **Clarity in verification:** high-signal hierarchy that surfaces “hard filters” (Brand/Size/Condition)
- **Non-blocking capture:** reinforces “snap-to-queue” without blocking the camera
- **Anti-pattern protection:** avoids spinner lockups and hidden failures by design

### Implementation Approach

- Implement a **single source of truth** for status labels, colors, and badge variants (Draft/Uploading/Analyzing/Ready/Failed/Confirmed).
- Build “SnapLog signature components” in the D2 style:
  - Status badge system (bolder, more explicit)
  - Instrument-panel queue summary (counts always visible)
  - Dense item card with scan lanes + explicit failure CTA
  - Review-first triage layout with dominant “Confirm & Next”
- Keep cyan disciplined (primary actions + focus), while **status colors** remain semantic and consistent.

## User Journey Flows

### Journey 1 — Haul Intake (Burst-Capture) → Async Queue → Review-first Confirm

**Goal:** Capture up to 20 items without interruption, then verify and confirm with high accuracy (Brand/Size/Condition).

```mermaid
flowchart TD
  A[Dashboard] -->|Tap Scan FAB| B[Capture Tunnel: Burst-Capture]
  B --> C{User taps shutter\n(≤50ms feedback)}
  C -->|Each snap| D[Create Draft locally\nphoto saved on device]
  D --> E[Fly-to-tray animation\nCounter increments]
  E --> C

  B -->|User taps Finish Batch| F[Queue View]
  F --> G[Instrument Panel + Status Tabs\nDraft / Uploading / Analyzing / Ready / Failed / Confirmed]

  G -->|Processing tabs| H[Background queue runs\nUploads + AI + schema validation]
  H --> I{Result}
  I -->|Valid| J[Ready tab: item available]
  I -->|Invalid JSON / low confidence| K[Ready tab w/ Needs Review flag]
  I -->|Error| L[Failed tab: actionable error badge]

  J -->|Tap Review| M[Review Screen (Inbox Zero)]
  K -->|Tap Review| M

  M --> N{Verify Brand / Size / Condition}
  N -->|1-tap Confirm & Next| O[Confirmed]
  N -->|Edit fields| P[Edit (inline or single edit screen)]
  P --> M

  O --> Q[Confirmed tab]
```

**Notes (D2 emphasis):**

- Status is always explicit (badge + label + icon); failures always show a clear CTA (Retry).
- Review flow is triage-like: “Confirm & Next” dominates; edits are fast and contained.

---

### Journey 2 — Offline Capture-only → Later Sync → Review/Confirm

**Goal:** Users can “gather the haul” without connectivity, with absolute trust that photos are safe.

```mermaid
flowchart TD
  A[Dashboard] -->|Tap Scan FAB| B[Capture Tunnel]
  B --> C{Network available?}

  C -->|No| D[Offline Capture-only Mode]
  D --> E[Save photo locally\nCreate Draft = Local]
  E --> F[Tray + Counter + "Saved locally" proof]
  F --> D
  D -->|Finish Batch| G[Queue View]
  G --> H[Offline banner + Instrument Panel\n"Saved locally" + "Sync when online"]
  H --> I{Connectivity returns?}
  I -->|Yes| J[User taps Sync (or auto-sync triggers)]
  J --> K[Uploading tab]
  K --> L[Analyzing tab]
  L --> M[Ready tab]
  M --> N[Review → Confirmed]

  C -->|Yes| P[Online capture path\n(Queue runs automatically)]
  P -->|Finish Batch| G
```

**Trust-critical UX requirements:**

- Offline must clearly communicate: what’s safe, what will happen later, and what action is available now.
- Never imply loss; the UI always states “Saved locally” when true.

---

### Journey 3 — Failure Recovery (Upload/Analysis/Schema) → Retry → Manual Fallback

**Goal:** Failures are normal and recoverable; user never hits a dead end and never loses photos.

```mermaid
flowchart TD
  A[Queue View] --> B[Failed tab]
  B --> C[Failed item row\nError badge + reason + Retry CTA]

  C -->|Tap Retry| D{Failure type}
  D -->|Upload failed| E[Retry upload\n(backoff + limits)]
  D -->|Analysis failed| F[Retry analysis (once)]
  D -->|Invalid JSON| G[Retry parse/validate (once)]

  E --> H{Result}
  F --> H
  G --> H

  H -->|Success| I[Ready tab]
  H -->|Still fails| J[Safe fallback path]
  J --> K[Manual Edit Mode\n(no blocking)]
  K --> L[Save item → Confirmed]

  C -->|Tap Details| M[Failure details\nWhat happened + what's safe + what next]
  M --> B
```

**D2 “anti-fragility” design rules:**

- “Tap to Retry” is always visible; no silent failures.
- Every failure message includes: **what happened**, **what is safe (photos saved)**, and **what the user can do now**.

---

### Journey 4 — Weekly Export Ritual (Confirmed Inventory → CSV + 7-day URLs)

**Goal:** One clean weekly action that produces an import-ready CSV with time-limited image URLs.

```mermaid
flowchart TD
  A[Inventory / Confirmed tab] -->|Tap Export| B[Export Setup]
  B --> C[Choose scope\n(All / Filtered / Date range)]
  C --> D[Generate export]
  D --> E{Export result}
  E -->|Success| F[Download/Share CSV\nIncludes 7-day signed image URLs]
  E -->|Failure| G[Actionable error\nRetry without losing context]
  F --> H[Done]
```

**Notes:**

- Make the “7-day link expiry” explicit in microcopy (informed + safe).
- Export must never block ongoing capture/queue processing.

---

### Journey Patterns

- **State-first UI:** every item lives in an explicit state with consistent naming and consistent badge rules.
- **Instrument panel everywhere:** mini-queue + counts visible across tabs to build trust in background work.
- **Capture tunnel:** burst scanning is a protected mode; user exits deliberately via Finish Batch.
- **Triage loop:** Review is “Inbox Zero” with Confirm & Next pacing.
- **Failure = workflow:** failed items are first-class, actionable, and safe.

### Flow Optimization Principles

- Protect throughput: never block the camera or primary loop.
- Reduce cognitive load: separate “Ready attention” from “Processing background” via tabs/sections.
- Make truth visible: replace spinners with states, counts, and stable UI placement.
- Optimize for revenue correctness: Brand/Size/Condition prioritized in every review touchpoint.
- Preserve trust: offline proof + explicit reassurance beats vague “syncing…” language.

## Component Strategy

### Design System Components (Tamagui Foundation)

We will implement the UI with **Tamagui** as the component foundation, using a token-driven theme (Graphite + Cyan) and semantic status tokens.

**Foundation components (use from Tamagui / primitives first):**

- Layout: Stack / XStack / YStack, Separator, Card/Surface wrappers
- Typography: Text variants (title/section/body/label), mono Text for counters/IDs
- Inputs: TextInput, Select/Picker, Switch, Checkbox (if needed), Slider (optional)
- Actions: Button (primary/secondary/destructive), IconButton
- Feedback: Toast/Snackbar, InlineAlert, Progress indicator (non-blocking only)
- Overlays: Sheet/BottomSheet, Dialog (sparingly), Tooltip (if supported/needed)
- Navigation containers: TabBar styling hooks + shared AppBar region

**Design system rules (D2 compatibility):**

- Variants are explicit and semantic (e.g., `status=ready`, `tone=destructive`), not ad-hoc styling.
- Cyan is reserved for primary actions/focus; status colors are semantic and consistent.
- Density is achieved through spacing + type scale + scan lanes, not tiny tap targets.

### Custom Components (SnapLog Signature Components)

These components express the product’s defining experience (Burst-Capture + Instrument Panel + Inbox Zero).

#### StatusBadge (Badge + Icon)

**Purpose:** Communicate item state instantly and unambiguously in high-throughput lists.
**Usage:** Item rows/cards, queue tabs, detail headers, capture HUD summaries.
**Anatomy:** Icon + label + (optional) count.
**States:** Draft, Uploading, Analyzing, Ready, Failed, Confirmed, Needs Review.
**Variants:** `size=sm/md`, `style=solid/outline`, `density=d2`.
**Accessibility:** Text label always present; icon is decorative (aria-hidden equivalent) unless used without text (not recommended).
**Content Guidelines:** Keep labels short and consistent across app (“Uploading”, “Analyzing”, “Ready”, “Failed”).
**Interaction Behavior:** Non-interactive by default; can be used inside clickable rows.

#### QueueInstrumentPanel (Persistent Mini-Queue)

**Purpose:** Build trust by making background work legible everywhere.
**Content:** Counts by status (U/A/R/F) + optional “Saved locally” indicator when relevant.
**Actions:** Tap navigates to Queue tab; long-press optional for quick actions (e.g., Sync, Retry all failed) if later desired.
**States:** Normal, Offline (shows “Saved locally”), Throttled (rate limit), Error (shows failures count).
**Variants:** Compact pill (app bar), Expanded panel (Queue tab header).
**Accessibility:** Counts readable; icons redundant; supports dynamic type without truncating critical numbers.

#### ItemRowDense (D2 “Badge-First Conveyor” list row)

**Purpose:** Fast scanning + immediate action in Queue/Inventory.
**Content:** Thumbnail, Brand/Size/Condition (top priority), Title, SKU/ID (mono), StatusBadge.
**Actions:** Primary CTA (Review/Retry) + optional secondary (Details).
**States:** Default, Pressed, Selected, Disabled, Error emphasis (Failed), Ready emphasis.
**Variants:** `context=queue|inventory`, `status=*`, `density=ultra|dense`.
**Accessibility:** Entire row is tappable; primary CTA remains reachable; min 44px touch targets.

#### CaptureTray + FlyToTray Feedback

**Purpose:** Provide instant proof of capture and reinforce conveyor-belt mental model.
**Content:** Horizontal thumbnail strip + captured count + queue counter; “Saved locally” proof when offline.
**Actions:** Tap a thumbnail to preview/remove (optional); Finish Batch button exits capture.
**States:** Online, Offline (explicit), Storage warning (if later needed), Batch limit reached (20).
**Accessibility:** Motion is supplemental; always pair with haptic + count increment.

#### ReviewTriagePanel (Inbox Zero verification)

**Purpose:** Review-first, revenue-protecting verification at speed.
**Content:** Critical fields (Brand/Size/Condition) first; category next; title/description/tags below.
**Actions:** Confirm & Next (primary), Edit (secondary), Flag/Needs Review (optional).
**States:** Ready, Needs Review, Manual fallback, Save error (rare).
**Variants:** `mode=quick|full`, `confidence=low|normal` (if later added).
**Accessibility:** Keyboard-friendly fields; clear focus; avoid modal stacks for small edits.

#### FailureDetailsCard (Informed + Safe)

**Purpose:** Turn errors into workflows; prevent anxiety and “betrayal.”
**Content:** What happened + what is safe (photos saved) + next action.
**Actions:** Retry, Edit manually, See logs/correlation (admin-only if needed).
**States:** Upload failure, Analysis failure, Invalid JSON, Rate-limited.
**Accessibility:** Plain language, no jargon; actions are explicit and reachable.

### Component Implementation Strategy

- Build custom components as Tamagui variants composed from primitives (no one-off styling).
- Centralize status taxonomy as a single module: labels, icons, semantic colors, and allowed transitions.
- Keep motion purposeful and optional (reduce-motion support); never block capture or navigation.
- Ensure reusable “scan lane” layout patterns for lists and review screens.

### Implementation Roadmap

**Phase 1 — Core (MVP critical path)**

- StatusBadge (Badge + Icon)
- QueueInstrumentPanel (mini + expanded)
- ItemRowDense (Queue + Inventory)
- CaptureTray + Finish Batch button
- ReviewTriagePanel (Confirm & Next)

**Phase 2 — Reliability + Trust**

- FailureDetailsCard + Retry patterns
- Offline banner + “Saved locally” proof components
- Storage/queue safeguards (batch cap, warnings if needed)

**Phase 3 — Power-user Enhancements**

- Bulk actions (Retry all failed, bulk confirm flows)
- Advanced filters in Queue/Inventory
- Export setup panels + “7-day URL expiry” affordance components

## UX Consistency Patterns

### Button Hierarchy

**Primary rule:** every screen has one “next best action” that is visually dominant and consistently placed.

- **Primary CTA (Cyan / filled):**
  - Used for “Confirm & Next”, “Finish Batch”, “Retry”, “Save”
  - One per screen (exception: multi-step sheets where primary is inside the sheet)
- **Secondary (neutral / outline):**
  - Used for “Edit”, “Details”, “Cancel”, “View Queue”
- **Tertiary (text / subtle):**
  - Used for “Skip”, “Learn more”, “Why is this required?”
- **Destructive (red / explicit):**
  - Used for “Delete draft”, “Remove photo”, “Discard batch”
  - Always requires confirmation unless reversible with Undo

**Placement consistency:**

- On “work” screens (Review, Failure, Confirm): primary CTA is **sticky bottom** when the user’s thumb should drive throughput.
- On list screens (Queue, Inventory): primary actions are **row-level** (e.g., Review/Retry button) and optional screen-level bulk actions live in header menus.

**Disabled/loading:**

- Primary buttons show inline spinner + preserve label width.
- Never block navigation during background work; only block when a local save is at risk.

### Feedback Patterns

**Success**

- Use **subtle confirmation**: haptic + small toast (“Confirmed”) + row status change.
- Prefer “state change” over celebratory animations (pro tool vibe).

**Progress (non-blocking)**

- Global: `QueueInstrumentPanel` is the canonical progress surface.
- Per-item: `StatusBadge` reflects “Uploading/Analyzing” states.
- Capture flow: show immediate “captured count increment” + tray update.

**Errors (trust-first language)**

- First line: what happened (“Upload failed” / “Analysis failed”)
- Second line: what’s safe (“Photos are saved locally” when true)
- Third line: what to do (“Retry now” / “Retry on Wi‑Fi” / “Edit manually”)

**Undo**

- Use Undo only for reversible actions (remove item from batch, delete draft).
- Undo appears as a toast with a single action; no modal confirmation.

### Form Patterns

**Default posture:** AI pre-fills; human verifies fast.

- **Field priority order in ReviewTriagePanel:**
  1) Brand, Size, Condition (critical)
  2) Category
  3) Title, attributes, notes/tags
- **Validation timing:** on blur + on submit; never “error spam” while typing.
- **Required fields:** clearly marked; errors appear inline under field.
- **Confidence/uncertainty (optional future):**
  - If AI is unsure, show “Needs Review” state and visually highlight the fields to verify.
- **Keyboard + focus:**
  - Next/Done controls are consistent; “Confirm & Next” is always reachable.

### Navigation Patterns

**Primary navigation:** bottom tabs (Capture / Queue / Inventory / Settings or Export).

- Capture is a **tunnel**:
  - Enter capture → stay in capture until “Finish Batch” (no incidental detours)
  - Any advanced settings open as a sheet that can be dismissed instantly
- Queue is the **home of truth**:
  - The instrument panel always navigates to Queue
  - Status tabs/sections are consistent: Draft / Uploading / Analyzing / Ready / Failed / Confirmed
- Deep links:
  - From any row, “Details” goes to item detail screen; back returns to originating list state (filters preserved)

### Modal and Overlay Patterns

**Default overlay:** Bottom Sheet for secondary actions.

- **Use Sheets for:**
  - Filters/sort, bulk actions, minor settings, explanations (“Why we need Brand”)
- **Use Dialogs sparingly for:**
  - Destructive confirmations (delete/discard), irreversible actions
- **Never cover camera unnecessarily:**
  - Avoid modal stacks during capture; use lightweight HUD + tray + toasts

### Empty States and Loading States

**Empty Queue**

- Show “You’re clear” + the next action (“Start Capture”)
- Provide lightweight tips (“Try burst capture up to 20 items”)

**Empty Failed**

- Show reassurance (“Nothing lost; photos saved locally”) + primary action (“Retry all”)

**Loading**

- Skeletons for lists (dense rows)
- Never “full screen spinner” unless app bootstrap; even then show status text

### Search and Filtering Patterns

- Search is always in the same location on list screens (top of Queue/Inventory).
- Filters use chips with counts (e.g., Condition: 12).
- Saved filters (optional later) are named and appear as quick chips.
- Clear All is always available and visually secondary.

### Design System Integration (Tamagui + Tokens)

- All patterns map to semantic variants:
  - Buttons: `variant=primary|secondary|tertiary|destructive`
  - Feedback: `tone=success|warning|error|info`
  - Status: `status=draft|uploading|analyzing|ready|failed|confirmed|needsReview`
- Cyan is reserved for focus/primary; status colors are semantic and consistent.
- Accessibility: minimum 44px targets, readable contrast in Graphite theme, reduce-motion supported.

## Responsive Design & Accessibility

### Responsive Strategy

**Primary target:** phone-first portrait (camera workflow).
**Secondary support:** large phones + tablets (iPad/Android tablets) with improved density and split views where safe.
**Desktop/web:** not a primary target for the core capture/review loop; provide a functional fallback layout if a web shell exists later.

**Mobile (default)**

- Bottom tabs remain primary navigation.
- Capture is a “tunnel”: avoid UI that encourages leaving capture mid-batch.
- Sticky bottom primary actions on work screens (Review/Failure/Confirm).

**Large phones**

- Increase information density cautiously: keep tap targets and legibility constant.
- Lists gain a little more metadata (e.g., SKU/ID, confidence/flags if added later).

**Tablet**

- Prefer two-pane layouts only where it increases speed without confusion:
  - Queue: list (left) + details/review (right) when in landscape.
  - Inventory: list + details.
- Avoid two-pane during Capture; keep capture UI singular and stable.

**Orientation**

- Portrait is default.
- Landscape allowed on tablets; optional on phones. If landscape on phone, keep same hierarchy and avoid “new UI”.

### Breakpoint Strategy

Because this is React Native, breakpoints are treated as “layout tiers” rather than web CSS pixels.

**Recommended layout tiers (by window width):**

- **Compact phone:** < 360
- **Standard phone:** 360–429
- **Large phone:** 430–599
- **Tablet:** ≥ 600

**What changes across tiers**

- Spacing and typography scale modestly (no dramatic jumps).
- List rows: show/hide secondary metadata (e.g., SKU/ID line).
- Tablet landscape: enable optional two-pane for Queue/Inventory only.

### Accessibility Strategy

**Target compliance:** WCAG 2.2 **AA** intent (industry-standard), applied pragmatically for native apps.

**Non-negotiables**

- Touch targets: minimum 44x44.
- Contrast: ensure readable text/controls in Graphite theme; cyan is reserved for primary/focus, not body text.
- Status redundancy: never rely on color alone (Badge + Icon + label).
- Reduce Motion: animations are optional and never carry meaning (Fly-to-tray is supplemental).
- Screen reader support:
  - Meaningful labels on primary actions (“Confirm and go to next item”).
  - Status announced with text (“Status: Analyzing”).
  - Thumbnails have useful alt text only when they add meaning; otherwise mark decorative.

**Focus + navigation**

- Logical focus order in Review forms (critical fields first).
- Avoid modal stacks; sheets should trap focus appropriately and dismiss predictably.
- Clear focus indicators (especially for any future web/desktop shell).

**Offline trust messaging**

- When offline, announce and display explicit proof: “Saved locally”.
- Error messages follow trust-first pattern: what happened → what’s safe → what to do.

### Testing Strategy

**Responsive testing**

- Small phone + standard phone + large phone + tablet (portrait + landscape on tablet).
- Stress test dense lists: Queue at high volume (many items across statuses).
- Camera flow testing: ensure overlays/toasts don’t obstruct capture controls.

**Accessibility testing**

- Screen readers: iOS VoiceOver + Android TalkBack.
- Dynamic type / font scaling: verify Review fields and primary CTAs remain usable.
- Reduce Motion enabled: ensure workflows remain understandable.
- Color vision simulation + contrast checks for status tokens and cyan accents.

**Reliability/trust scenarios**

- Offline capture (airplane mode) → reopen app → verify “Saved locally” proof.
- Failure recovery: upload fail / analysis fail → retry + manual edit fallback.

### Implementation Guidelines

**Responsive implementation**

- Use Tamagui responsive props/tokens to express density tiers (spacing/type) consistently.
- Base layout decisions on window dimensions; avoid one-off per-device hacks.
- Preserve minimum tap targets even at high density (use spacing discipline, not tiny controls).

**Accessibility implementation**

- Ensure interactive elements have accessible labels/hints.
- Add haptics for key state changes (capture, confirm) but never as sole feedback.
- Use semantic status mapping in one place (labels + icons + colors + announcements).
- Support reduce-motion and avoid blocking spinners; show progress via the queue surfaces.
