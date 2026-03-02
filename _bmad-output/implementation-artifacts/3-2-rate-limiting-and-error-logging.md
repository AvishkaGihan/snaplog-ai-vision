# Story 3.2: Rate Limiting & Error Logging

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an administrator,
I want AI requests rate-limited and all parse failures logged with the raw response,
So that I can control API costs and diagnose AI issues.

## Acceptance Criteria

**AC1 — In-Memory Rate Limiter Implemented:**

- **Given** the `functions/src/middleware/rateLimiter.ts` scaffold exists (from Story 3.1)
- **When** the rate limiter is fully implemented
- **Then** `checkRateLimit(uid: string)` tracks per-user request counts in an in-memory `Map<string, { count: number, windowStart: number }>`
- **And** the sliding window is 1 hour (3,600,000 ms) per user
- **And** the maximum allowed requests per window is 20 (FR28, NFR-SC2)
- **And** when the window has expired, the counter resets to 0
- **And** the function returns `{ allowed: true }` when under limit
- **And** the function returns `{ allowed: false, retryAfterSeconds: number }` when at or over limit
- **And** `retryAfterSeconds` is calculated as remaining time until window expiry in seconds (rounded up)

**AC2 — Rate Limiter Constants Configurable:**

- **Given** the rate limiter implementation
- **When** reviewing the code
- **Then** `MAX_REQUESTS_PER_WINDOW` is defined as a named constant (`20`)
- **And** `WINDOW_DURATION_MS` is defined as a named constant (`3600000`)
- **And** both constants are exported for testing

**AC3 — Rate Limiter Integrated in `analyzeItem` Cloud Function:**

- **Given** the `analyzeItem` function receives an authenticated request
- **When** the function processes the request (after auth check, before Gemini API call)
- **Then** `checkRateLimit(uid)` is called with the authenticated user's UID
- **And** if `allowed === false`, the function returns `{ success: false, error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Try again in X seconds.' } }` (FR28)
- **And** the rate limit check occurs BEFORE any Gemini API call to avoid wasted API costs
- **And** the rate counter is incremented ONLY on successful rate-limit-allowed calls (not on rejections)

**AC4 — Enhanced AI Parse Failure Logging:**

- **Given** the AI analysis returns an unparseable or schema-invalid response
- **When** the failure is logged
- **Then** `functions.logger.error(...)` is called with structured fields: `uid`, `timestamp`, `rawResponse` (the raw AI text), and `parseError` (the specific error string) (FR29)
- **And** the logging is handled by `logAiParseFailure()` in `functions/src/utils/logger.ts` (already exists from Story 3.1)
- **And** the existing logging already covers JSON parse failures AND Zod validation failures ✅ (verify no regression)

**AC5 — Rate Limit Event Logging:**

- **Given** a user is rate-limited
- **When** the rate limit rejection occurs
- **Then** `functions.logger.warn(...)` logs the event with: `uid`, `timestamp`, `requestCount` (current count), `windowStart` (when window began), and `retryAfterSeconds`
- **And** the log level is `warn` (not `error`) — rate limiting is expected behavior, not an error

**AC6 — Retry Logic in Cloud Function:**

- **Given** the Cloud Function calls Gemini and receives a transient error
- **When** the error is retryable (network timeout, server error — NOT a parse failure or rate limit)
- **Then** the function retries up to 2 times with exponential backoff (1s delay, then 2s delay)
- **And** a `withRetry<T>` utility function is created in `functions/src/utils/retry.ts`
- **And** the retry function accepts a `shouldRetry` predicate to distinguish retryable vs non-retryable errors
- **And** non-retryable errors (parse failures, validation errors) are NOT retried

**AC7 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `cd functions && npx tsc --noEmit` passes with zero errors
- **And** `cd functions && npx eslint "src/**/*.{js,ts}"` passes with zero errors

## Tasks / Subtasks

- [x] **Task 1: Implement full rate limiter** (AC: 1, 2)
  - [x] Replace the stub in `functions/src/middleware/rateLimiter.ts` with full in-memory implementation
  - [x] Define `MAX_REQUESTS_PER_WINDOW = 20` and `WINDOW_DURATION_MS = 3_600_000` as exported constants
  - [x] Implement `Map<string, { count: number; windowStart: number }>` in-memory store
  - [x] Implement window expiry check: if `now - windowStart > WINDOW_DURATION_MS`, reset counter
  - [x] Calculate `retryAfterSeconds` as `Math.ceil((windowStart + WINDOW_DURATION_MS - now) / 1000)`
  - [x] Increment counter ONLY when returning `allowed: true`

- [x] **Task 2: Integrate rate limiter into `analyzeItem`** (AC: 3, 5)
  - [x] Import `checkRateLimit` in `functions/src/analyzeItem.ts`
  - [x] Add rate limit check AFTER auth check, BEFORE Gemini API call
  - [x] On rate limit rejection: return `{ success: false, error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Try again in X seconds.' } }`
  - [x] Log rate limit events with `functions.logger.warn(...)` including uid, timestamp, requestCount, windowStart, retryAfterSeconds

- [x] **Task 3: Create `withRetry` utility** (AC: 6)
  - [x] Create `functions/src/utils/retry.ts`
  - [x] Implement `withRetry<T>(fn, options)` with max 2 retries and exponential backoff (1s, 2s base delay)
  - [x] Accept optional `shouldRetry` predicate that defaults to retrying on all errors
  - [x] Export `MAX_RETRIES` and `BASE_DELAY_MS` constants

- [x] **Task 4: Wrap Gemini call with `withRetry`** (AC: 6)
  - [x] In `analyzeItem.ts`, wrap the `analyzeImageWithGemini()` call in `withRetry()`
  - [x] Configure `shouldRetry` to retry on timeout/network errors but NOT on parse or validation failures
  - [x] Ensure parse failures still go through the existing `logAiParseFailure()` path (no regression)

- [x] **Task 5: Verify existing error logging** (AC: 4)
  - [x] Confirm `logAiParseFailure()` in `logger.ts` is called for JSON parse failures — ✅ already exists
  - [x] Confirm `logAiParseFailure()` is called for Zod validation failures — ✅ already exists
  - [x] Confirm logged fields include: uid, rawResponse, parseError, timestamp — ✅ already exists
  - [x] No changes needed to `logger.ts` unless bugs found

- [x] **Task 6: Build verification** (AC: 7)
  - [x] `cd functions && npx tsc --noEmit` — zero errors
  - [x] `cd functions && npx eslint "src/**/*.{js,ts}"` — zero errors

- [x] **Review Follow-ups (AI)**
  - [x] [AI-Review][Medium] Capped rateLimitStore Map size to 10k items with periodic cleanup.
  - [x] [AI-Review][Medium] Added Unit Tests: `rateLimiter.test.ts` and `retry.test.ts`, plus Jest setup.
  - [x] [AI-Review][Low] Added random jitter padding to exponential backoff delays in `retry.ts`.
  - [x] [AI-Review][Low] Enhanced AI parse error logging by checking `instanceof Error`.

## Dev Notes

### Critical Architecture Rules

#### What ALREADY EXISTS (Do NOT Recreate)

The following files exist from Story 3.1 and must be **modified in place**, not recreated:

| File                                      | Current State                                                                                  | This Story's Action                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `functions/src/middleware/rateLimiter.ts` | **Stub** — always returns `{ allowed: true }`                                                  | **REPLACE** with full implementation                            |
| `functions/src/analyzeItem.ts`            | Full Cloud Function — auth, Gemini call, parse, validate                                       | **MODIFY** — add rate limit check + wrap Gemini call with retry |
| `functions/src/utils/logger.ts`           | `logAiParseFailure()` function                                                                 | **VERIFY** — no changes needed unless bugs found                |
| `functions/src/types.ts`                  | `AnalyzeItemErrorCode`, `AnalyzeItemRequest`, `AnalyzeItemResponse`, `AnalyzeItemResponseData` | **NO CHANGES** — `RATE_LIMITED` code already defined            |
| `functions/src/index.ts`                  | Exports `analyzeItem`                                                                          | **NO CHANGES**                                                  |
| `functions/src/utils/geminiClient.ts`     | Fetches image, converts to base64, calls Gemini                                                | **NO CHANGES**                                                  |
| `functions/src/utils/responseParser.ts`   | `stripMarkdownFences()`, `parseAIResponse()`                                                   | **NO CHANGES**                                                  |
| `functions/src/validators/itemSchema.ts`  | Zod schema for AI response                                                                     | **NO CHANGES**                                                  |
| `functions/src/prompts/itemAnalysis.ts`   | Gemini prompt constant                                                                         | **NO CHANGES**                                                  |

#### What NEEDS TO BE CREATED

| File                           | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `functions/src/utils/retry.ts` | **NEW** — `withRetry<T>` utility for exponential backoff |

---

### Key Implementation Details

#### `functions/src/middleware/rateLimiter.ts` — Full Implementation

```typescript
// functions/src/middleware/rateLimiter.ts

/** Maximum AI analysis requests allowed per user per window */
export const MAX_REQUESTS_PER_WINDOW = 20;

/** Sliding window duration in milliseconds (1 hour) */
export const WINDOW_DURATION_MS = 3_600_000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

/** In-memory rate limit store — resets on Cloud Function cold start */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Checks whether a user is within the rate limit window.
 * Uses an in-memory Map per user UID.
 *
 * IMPORTANT: This is an in-memory counter.
 * - Resets on Cloud Function cold starts (acceptable for portfolio scale)
 * - Not shared across function instances (each instance has own counter)
 * - For production, consider Firestore or Redis-based counters
 */
export function checkRateLimit(uid: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(uid);

  // No entry or expired window — start fresh
  if (!entry || now - entry.windowStart > WINDOW_DURATION_MS) {
    rateLimitStore.set(uid, { count: 1, windowStart: now });
    return { allowed: true };
  }

  // Within window — check count
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = entry.windowStart + WINDOW_DURATION_MS - now;
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Within window and under limit — increment and allow
  entry.count += 1;
  return { allowed: true };
}
```

> **⚠️ IMPORTANT**: The rate limiter uses an in-memory `Map`. This means:
>
> 1. The counter resets when the Cloud Function cold-starts (a new instance starts)
> 2. Each Cloud Function instance has its own counter (not shared across instances)
> 3. This is acceptable for a portfolio project (architecture spec explicitly says "simple implementation; sufficient for portfolio scale")
> 4. For production, you'd use Firestore or Redis with atomic increment

#### `functions/src/utils/retry.ts` — Retry Utility (NEW)

```typescript
// functions/src/utils/retry.ts

/** Maximum number of retry attempts */
export const MAX_RETRIES = 2;

/** Base delay in milliseconds for exponential backoff */
export const BASE_DELAY_MS = 1000;

export interface RetryOptions {
  /** Maximum number of retries (default: MAX_RETRIES) */
  maxRetries?: number;
  /** Base delay in ms for exponential backoff (default: BASE_DELAY_MS) */
  baseDelayMs?: number;
  /** Predicate to determine if an error is retryable (default: retry all) */
  shouldRetry?: (error: unknown) => boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async function with exponential backoff.
 * Pattern: 1s, 2s (with MAX_RETRIES = 2)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? BASE_DELAY_MS;
  const shouldRetry = options.shouldRetry ?? (() => true);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt || !shouldRetry(error)) {
        throw error;
      }
      await delay(baseDelayMs * Math.pow(2, attempt));
    }
  }

  // Unreachable — TypeScript requires this
  throw new Error("withRetry: unreachable");
}
```

#### Modified `functions/src/analyzeItem.ts` — Integration Points

The `analyzeItem.ts` file needs two modifications:

**1. Add rate limit check (after auth, before Gemini call):**

```typescript
import { checkRateLimit } from "./middleware/rateLimiter";

// After auth check, before Gemini call:
const rateLimit = checkRateLimit(uid);
if (!rateLimit.allowed) {
  functions.logger.warn("Rate limit exceeded", {
    uid,
    timestamp: new Date().toISOString(),
    retryAfterSeconds: rateLimit.retryAfterSeconds,
  });
  return {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: `Rate limit exceeded. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
    },
  };
}
```

**2. Wrap Gemini call with `withRetry`:**

```typescript
import { withRetry } from "./utils/retry";

// Replace direct call:
// const rawResponse = await analyzeImageWithGemini(data.imageUrl, ITEM_ANALYSIS_PROMPT);

// With retry-wrapped call:
const rawResponse = await withRetry(
  () => analyzeImageWithGemini(data.imageUrl, ITEM_ANALYSIS_PROMPT),
  {
    shouldRetry: (error: unknown) => {
      // Only retry on transient errors (timeout, network)
      // Do NOT retry on parse or validation failures
      const msg = error instanceof Error ? error.message.toLowerCase() : "";
      return (
        msg.includes("timeout") ||
        msg.includes("deadline") ||
        msg.includes("network") ||
        msg.includes("econnreset") ||
        msg.includes("econnrefused") ||
        msg.includes("fetch")
      );
    },
  },
);
```

> **⚠️ CRITICAL**: The `shouldRetry` predicate MUST NOT retry on parse/validation failures — those are handled in the next block. only the Gemini API call itself is wrapped in retry. Everything after (parse, validate) is NOT retried.

---

### Current `analyzeItem.ts` Flow (Pre-Modification)

```
1. Auth check (context.auth)          ← existing
2. imageUrl validation                ← existing
3. analyzeImageWithGemini()           ← existing (wrap with withRetry)
4. parseAIResponse()                  ← existing (no change)
5. itemAnalysisSchema.safeParse()     ← existing (no change)
6. Return success/error               ← existing (no change)
```

### Target `analyzeItem.ts` Flow (Post-Modification)

```
1. Auth check (context.auth)          ← existing
2. imageUrl validation                ← existing
3. ★ checkRateLimit(uid) ★            ← NEW — reject if over limit
4. withRetry(analyzeImageWithGemini)  ← MODIFIED — wrapped with retry
5. parseAIResponse()                  ← existing (no change)
6. itemAnalysisSchema.safeParse()     ← existing (no change)
7. Return success/error               ← existing (no change)
```

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Incrementing counter on rate-limited requests
if (entry.count >= MAX) {
  entry.count += 1; // DON'T — only increment on allowed requests
  return { allowed: false };
}

// ❌ WRONG: Retrying on parse failures
const rawResponse = await withRetry(
  async () => {
    const raw = await analyzeImageWithGemini(url, prompt);
    const parsed = parseAIResponse(raw);  // DON'T — parse failures are not transient
    return parsed;
  },
);

// ❌ WRONG: Using global variables instead of a Map
let requestCount = 0; // DON'T — not per-user

// ❌ WRONG: Using error log level for rate limiting
functions.logger.error("Rate limited", { uid }); // DON'T — use warn

// ❌ WRONG: Async checkRateLimit when using in-memory store
export async function checkRateLimit(uid: string) // DON'T — synchronous is correct for in-memory

// ✅ CORRECT: Synchronous + Map-based + per-user
export function checkRateLimit(uid: string): RateLimitResult { ... }
```

---

### Previous Story Intelligence

**From Story 3.1 (Cloud Function & Gemini AI Integration):**

1. **Rate limiter scaffold** — A stub was created at `functions/src/middleware/rateLimiter.ts` that always returns `{ allowed: true }`. The `RateLimitResult` interface is already defined there. Replace the stub body, keep the interface.

2. **`logAiParseFailure()` already works** — The logger in `functions/src/utils/logger.ts` already logs AI parse failures with `uid`, `rawResponse`, `parseError`, and `timestamp`. No changes needed — just verify no regression.

3. **`RATE_LIMITED` error code already defined** — In `functions/src/types.ts`, the `AnalyzeItemErrorCode` union type already includes `'RATE_LIMITED'`. No type changes needed.

4. **`mapUnexpectedErrorToCode()` exists** — In `analyzeItem.ts`, a helper already maps error messages containing "429" or "rate" to `RATE_LIMITED`. This handles upstream Gemini rate limits. Our new `checkRateLimit` handles per-user application-level rate limiting.

5. **Review follow-ups from 3.1** — ESLint v9 flat config (`eslint.config.mjs`) was fixed; Gemini API uses base64 `inlineData` (downloads HTTPS URL first); `aiService.ts` handles `HttpsError` cleanly. All resolved.

6. **CI workflow** — `.github/workflows/ci.yml` runs `tsc --noEmit` in both root and `functions/` directories. Make sure the new `retry.ts` file compiles cleanly.

7. **Import pattern**: The functions project uses `firebase-functions/v1` imports (not the top-level `firebase-functions`). Follow the same pattern.

---

### Git Intelligence

**Recent commits on `develop` branch:**

- `d2d5ead` — HEAD: Most recent commit (Epic 2/3 related)
- `0127fa1` — docs: Add Epic 2 retrospective

**Branch to create:** `feat/3-2-rate-limiting-and-error-logging` from `develop`

**Files to stage on commit:**

- `functions/src/middleware/rateLimiter.ts` (modified — replaced stub)
- `functions/src/analyzeItem.ts` (modified — added rate limit + retry)
- `functions/src/utils/retry.ts` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status update)

---

### Files to Create / Modify

| File                                      | Action     | Notes                                         |
| ----------------------------------------- | ---------- | --------------------------------------------- |
| `functions/src/middleware/rateLimiter.ts` | **MODIFY** | Replace stub with full in-memory rate limiter |
| `functions/src/analyzeItem.ts`            | **MODIFY** | Add rate limit check + wrap Gemini with retry |
| `functions/src/utils/retry.ts`            | **NEW**    | `withRetry<T>` exponential backoff utility    |

**DO NOT MODIFY:**

- `functions/src/utils/logger.ts` — Already correctly logs parse failures
- `functions/src/types.ts` — `RATE_LIMITED` code already defined
- `functions/src/index.ts` — No new exports needed
- `functions/src/utils/geminiClient.ts` — No changes
- `functions/src/utils/responseParser.ts` — No changes
- `functions/src/validators/itemSchema.ts` — No changes
- `functions/src/prompts/itemAnalysis.ts` — No changes
- Any `src/` mobile client files — This story is backend-only

---

### Latest Technical Information

**In-Memory Rate Limiting Pattern for Cloud Functions:**

- In-memory `Map` is the correct approach for per-instance rate limiting at portfolio scale
- Cloud Functions may cold-start new instances, resetting counters — this is acceptable per architecture spec
- For production scale, migrate to Firestore with `FieldValue.increment()` or Redis (Cloud Memorystore)
- The `Map` approach has O(1) lookup and no external dependencies

**`firebase-functions/v1` (Gen 1) Logging:**

- `functions.logger.info(message, structuredData)` — informational
- `functions.logger.warn(message, structuredData)` — expected but noteworthy (use for rate limiting)
- `functions.logger.error(message, structuredData)` — unexpected failures (use for parse failures)
- Structured data objects appear as JSON in Cloud Function logs (Firebase Console / Cloud Logging)

**Exponential Backoff Pattern:**

- Base delay: 1000ms (1 second)
- Formula: `baseDelay * 2^attempt` → attempt 0: 1s, attempt 1: 2s
- Total worst-case latency added: 3 seconds (1s + 2s)
- Fits within the 6-second client timeout (from Story 3.4 spec)

---

### Project Context Reference

See `_bmad-output/project-context.md` for:

- Technology stack versions (Firebase Functions v6.x on Node.js 20)
- Naming conventions (camelCase functions, SCREAMING_SNAKE_CASE constants)
- Error handling patterns (try/catch, structured error objects, `functions.logger`)
- Retry pattern specification (max 2 retries, 1s/2s exponential backoff)
- Anti-patterns (no `firebase/compat`, no unhandled promises)

---

### References

- Story 3.2 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.2 section]
- Rate limit spec (FR28): [Source: `_bmad-output/planning-artifacts/epics.md` — FR28]
- Error logging spec (FR29): [Source: `_bmad-output/planning-artifacts/epics.md` — FR29]
- Rate limiter architecture: [Source: `_bmad-output/planning-artifacts/architecture.md` — API & Communication Patterns]
- Retry pattern: [Source: `_bmad-output/planning-artifacts/architecture.md` — Retry Pattern]
- Cloud Function file structure: [Source: `_bmad-output/planning-artifacts/architecture.md` — Complete Project Directory Structure]
- Error handling patterns: [Source: `_bmad-output/project-context.md` — Error Handling Patterns]
- NFR-SC2 (rate limit): [Source: `_bmad-output/planning-artifacts/architecture.md` — NFR Coverage]
- Previous story: [Source: `_bmad-output/implementation-artifacts/3-1-cloud-function-and-gemini-ai-integration.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Implemented in-memory rate limiter with exported constants and per-user Map tracking.
- Integrated pre-Gemini rate limit enforcement and warn-level structured logging.
- Added retry utility with exponential backoff and selective transient-error retry predicate.
- Validation checks: `npx tsc --noEmit`, `npm run lint`, and workspace diagnostics (`get_errors`) report no issues.

### Completion Notes List

- Implemented full `checkRateLimit(uid)` behavior with a 1-hour sliding window and max 20 allowed requests.
- Added structured rate-limit metadata (`requestCount`, `windowStart`, `retryAfterSeconds`) to support operational logging.
- Added `withRetry<T>` utility in `functions/src/utils/retry.ts` and wrapped `analyzeImageWithGemini()` calls in retry logic.
- Ensured retry behavior only targets transient network/timeout-style failures and does not retry parse/validation failures.
- Verified existing AI parse failure logging path remains intact for both parse and schema validation failures.

### File List

- functions/src/middleware/rateLimiter.ts
- functions/src/analyzeItem.ts
- functions/src/utils/retry.ts
- \_bmad-output/implementation-artifacts/sprint-status.yaml
- \_bmad-output/implementation-artifacts/3-2-rate-limiting-and-error-logging.md

## Change Log

- 2026-03-02: Implemented Story 3.2 rate limiter + retry integration, verified logging behavior, and completed AC7 build/lint checks.
- 2026-03-02: Completed AI code review, fixed 4 identified operational/quality issues automatically, and updated story status to 'done'.
