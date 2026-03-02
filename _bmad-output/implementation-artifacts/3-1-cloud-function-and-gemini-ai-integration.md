# Story 3.1: Cloud Function & Gemini AI Integration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a backend system,
I want a Cloud Function that receives an image URL and returns AI-analyzed item data,
So that the mobile app can display structured AI results without exposing API keys.

## Acceptance Criteria

**AC1 — Firebase Cloud Functions Project Initialized:**

- **Given** the project root directory
- **When** the developer initializes the Cloud Functions project
- **Then** a `functions/` directory exists at the project root with its own `package.json`, `tsconfig.json`, and `.eslintrc.js`
- **And** the runtime is Node.js 20
- **And** TypeScript compilation is configured (strict mode)
- **And** `firebase.json` references the functions directory with `"source": "functions"`
- **And** `functions/src/index.ts` exports all Cloud Functions

**AC2 — `analyzeItem` HTTPS Callable Function Exists:**

- **Given** the Firebase Cloud Functions project is initialized in `functions/`
- **When** the `analyzeItem` HTTPS Callable function is invoked with an `{ imageUrl: string }` payload
- **Then** the function is properly exported from `functions/src/index.ts` as an HTTPS Callable function
- **And** the function accepts requests only from authenticated callers (NFR-S3)
- **And** unauthenticated calls are rejected with a `functions.https.HttpsError('unauthenticated', ...)`

**AC3 — Authentication Enforcement:**

- **Given** the `analyzeItem` function receives a request
- **When** the caller has no Firebase Auth token
- **Then** the function throws `HttpsError('unauthenticated', 'Must be authenticated')`
- **And** no Gemini API call is made for unauthenticated requests

**AC4 — Gemini 2.0 Flash API Call:**

- **Given** the caller is authenticated and provides a valid `imageUrl`
- **When** the function processes the request
- **Then** it calls the Gemini 2.0 Flash model (`gemini-2.0-flash`) via `@google/generative-ai` SDK using the `GEMINI_API_KEY` from Firebase environment config
- **And** the request includes the image as an `inlineData` or `fileData` part with the `imageUrl`
- **And** the prompt text is loaded from `functions/src/prompts/itemAnalysis.ts` (FR30)
- **And** the prompt instructs Gemini to return ONLY raw JSON with no markdown

**AC5 — Server-Side Prompt Stored at `functions/src/prompts/itemAnalysis.ts`:**

- **Given** the Cloud Function processes a request
- **When** the Gemini prompt is needed
- **Then** the prompt is imported from `functions/src/prompts/itemAnalysis.ts` — not hardcoded inline in `analyzeItem.ts`
- **And** the prompt content instructs Gemini to analyze an image and return a strict JSON object with fields: `title`, `category`, `color`, `condition`
- **And** `condition` must be one of: `"Excellent"`, `"Good"`, `"Fair"`, `"Poor"`

**AC6 — Markdown Fence Stripping:**

- **Given** the raw Gemini response text is received
- **When** `functions/src/utils/responseParser.ts` processes the response
- **Then** any leading/trailing markdown code fences (` ```json ` / ` ``` `) are stripped before JSON parsing
- **And** the stripped text is valid JSON if Gemini returned a correct response

**AC7 — Zod Schema Validation:**

- **Given** the raw JSON text is parsed
- **When** `functions/src/validators/itemSchema.ts` validates the parsed object
- **Then** the schema enforces: `title: string`, `category: string`, `color: string`, `condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor'])`
- **And** Zod `.safeParse()` is used — never `.parse()` (which throws)
- **And** on validation failure, the function returns `{ success: false, error: { code: 'AI_PARSE_FAILURE', message: '...' } }`

**AC8 — Success Response:**

- **Given** Gemini returns a valid response that passes Zod validation
- **When** the function completes
- **Then** it returns `{ success: true, data: { title: string, category: string, color: string, condition: string } }`
- **And** the response matches the `AnalyzeItemResponse` type defined in `functions/src/types.ts`

**AC9 — Error Response Format:**

- **Given** any processing error occurs (Gemini timeout, parse failure, invalid image)
- **When** the function handles the error
- **Then** it returns `{ success: false, error: { code: ErrorCode, message: string } }` where `ErrorCode` is one of: `'RATE_LIMITED' | 'AI_PARSE_FAILURE' | 'AI_TIMEOUT' | 'INVALID_IMAGE'`
- **And** the function does NOT throw HttpsError for business-logic failures (only for auth); it returns structured error objects
- **And** AI parse failures are logged with `functions.logger.error(...)` including: user UID, timestamp, raw response text, and specific parse error (FR29)

**AC10 — Gemini API Key Security:**

- **Given** the functions project is deployed
- **When** the Cloud Function runs
- **Then** the Gemini API key is loaded exclusively from `process.env.GEMINI_API_KEY` (Firebase environment config)
- **And** the API key is NEVER hardcoded in any source file (NFR-S1)
- **And** `functions/.env.example` documents the required `GEMINI_API_KEY` variable

**AC11 — `aiService.ts` Client on Mobile App:**

- **Given** the mobile app needs to call the `analyzeItem` Cloud Function
- **When** `services/aiService.ts` is created in the mobile client (`src/services/aiService.ts`)
- **Then** it exports `analyzeItem(imageUrl: string): Promise<AnalyzeItemResponse>`
- **And** it calls the Cloud Function using `httpsCallable(functions, 'analyzeItem')` from Firebase SDK
- **And** the Firebase functions instance is imported from `services/firebaseConfig.ts`
- **And** it uses `AnalyzeItemRequest` and `AnalyzeItemResponse` types from `src/types/api.types.ts`

**AC12 — `api.types.ts` Created:**

- **Given** the mobile client needs typed API contracts
- **When** `src/types/api.types.ts` is created
- **Then** it exports `AnalyzeItemRequest`, `AnalyzeItemResponse`, and `AnalyzeItemErrorCode` types matching the Cloud Function contract exactly

**AC13 — Build Verification:**

- **Given** the complete implementation
- **When** the developer runs verification commands
- **Then** `cd functions && npx tsc --noEmit` passes with zero errors
- **And** `npx tsc --noEmit` (from project root, for mobile client types) passes with zero errors
- **And** `npx eslint src/` (from project root) passes with zero errors

## Tasks / Subtasks

- [x] **Task 1: Initialize Firebase Cloud Functions project** (AC: 1)
  - [x] Run `firebase init functions` in the project root (choose TypeScript, Node.js 20)
  - [x] Verify `functions/package.json` has `"engines": { "node": "20" }`
  - [x] Ensure `functions/tsconfig.json` has `"strict": true`
  - [x] Verify `firebase.json` references `"functions": { "source": "functions" }`
  - [x] Install Gemini SDK: `cd functions && npm install @google/generative-ai`
  - [x] Install Zod in functions: `cd functions && npm install zod`

- [x] **Task 2: Create Cloud Functions file structure** (AC: 1, 5, 6, 7)
  - [x] Create `functions/src/prompts/itemAnalysis.ts` — export `ITEM_ANALYSIS_PROMPT` constant
  - [x] Create `functions/src/validators/itemSchema.ts` — Zod schema for AI response
  - [x] Create `functions/src/utils/responseParser.ts` — strip markdown fences + parse JSON
  - [x] Create `functions/src/utils/geminiClient.ts` — Gemini API client wrapper
  - [x] Create `functions/src/utils/logger.ts` — structured logging helper
  - [x] Create `functions/src/middleware/rateLimiter.ts` — rate limiting (used in Story 3.2, scaffold now)
  - [x] Create `functions/.env.example` documenting `GEMINI_API_KEY`

- [x] **Task 3: Implement `analyzeItem` Cloud Function** (AC: 2, 3, 4, 6, 7, 8, 9, 10)
  - [x] Create `functions/src/analyzeItem.ts` — main function implementation
  - [x] Enforce authentication check at function entry
  - [x] Load Gemini API key from `process.env.GEMINI_API_KEY`
  - [x] Call Gemini 2.0 Flash with imageUrl and prompt from `itemAnalysis.ts`
  - [x] Strip markdown fences via `responseParser.ts`
  - [x] Validate with Zod schema via `itemSchema.ts`
  - [x] Return `{ success: true, data: {...} }` or `{ success: false, error: {...} }`
  - [x] Log AI parse failures with `functions.logger.error(...)` including uid, raw response

- [x] **Task 4: Export function in `functions/src/index.ts`** (AC: 2)
  - [x] Export `analyzeItem` as HTTPS Callable from `index.ts`

- [x] **Task 5: Create `src/types/api.types.ts` on mobile client** (AC: 12)
  - [x] Define `AnalyzeItemRequest`: `{ imageUrl: string }`
  - [x] Define `AnalyzeItemResponse`: `{ success: boolean; data?: { title, category, color, condition }; error?: { code, message } }`
  - [x] Define `AnalyzeItemErrorCode` union type

- [x] **Task 6: Add Firebase Functions to `firebaseConfig.ts`** (AC: 11)
  - [x] Import `getFunctions` from `firebase/functions` in `src/services/firebaseConfig.ts`
  - [x] Export a `functions` instance initialized with the Firebase app

- [x] **Task 7: Create `src/services/aiService.ts` on mobile client** (AC: 11)
  - [x] Import `httpsCallable` from `firebase/functions`
  - [x] Import `functions` from `@/services/firebaseConfig`
  - [x] Import `AnalyzeItemRequest`, `AnalyzeItemResponse` from `@/types/api.types`
  - [x] Export `analyzeItem(imageUrl: string): Promise<AnalyzeItemResponse>`

- [x] **Task 8: Build verification** (AC: 13)
  - [x] `cd functions && npx tsc --noEmit` — zero errors
  - [x] `npx tsc --noEmit` from project root — zero errors
  - [x] `npx eslint src/` — zero errors

### Review Follow-ups (AI)
- [x] [AI-Review][High] Fix ESLint v9 configuration to use flat config (`eslint.config.mjs`) to pass build verification.
- [x] [AI-Review][Medium] Fix Gemini API `fileUri` usage by downloading the HTTPS URL and passing as base64 `inlineData`.
- [x] [AI-Review][Medium] Enhance error parsing in `aiService.ts` to cleanly handle Firebase `HttpsError` code objects.

## Dev Notes

### Critical Architecture Rules

#### The functions/ directory does NOT currently exist

The `functions/` directory has not been initialized in this project. This story requires its full creation. All files listed must be **created from scratch**.

#### What ALREADY EXISTS in the mobile client (Do NOT Recreate)

Current mobile services in `src/services/`:

- `firebaseConfig.ts` — Firebase app initialization (auth, firestore, storage already exported)
- `authService.ts` — Auth operations
- `imageService.ts` — Image compression (Story 2.4)

What `firebaseConfig.ts` currently exports: Firebase `app`, Firebase `auth`, Firebase `db` (Firestore), Firebase `storage`. You will ADD `functions` export to this file — do NOT recreate it.

#### What NEEDS TO BE CREATED

**In `functions/` (new Cloud Functions project):**

1. Full `functions/` directory via `firebase init functions`
2. `functions/src/index.ts` — Cloud Function exports
3. `functions/src/analyzeItem.ts` — Main function
4. `functions/src/prompts/itemAnalysis.ts` — Server-side prompt (FR30)
5. `functions/src/validators/itemSchema.ts` — Zod schema
6. `functions/src/middleware/rateLimiter.ts` — Rate limiter scaffold (Story 3.2)
7. `functions/src/utils/geminiClient.ts` — Gemini wrapper
8. `functions/src/utils/responseParser.ts` — JSON parser
9. `functions/src/utils/logger.ts` — Logging helper
10. `functions/.env.example` — Environment variable template

**In mobile client `src/` (new files):**

1. `src/types/api.types.ts` — API type definitions
2. `src/services/aiService.ts` — Cloud Function caller

**Modify (mobile client):**

1. `src/services/firebaseConfig.ts` — Add `getFunctions` export

---

### Key Implementation Details

#### Cloud Function Setup — `firebase init` flags

```bash
# Run in project root
firebase init functions
# When prompted:
# - Use existing project
# - Language: TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
```

After init, verify `functions/package.json`:

```json
{
  "engines": { "node": "20" },
  "dependencies": {
    "firebase-admin": "^12.x",
    "firebase-functions": "^6.x"
  }
}
```

Then install extra dependencies:

```bash
cd functions
npm install @google/generative-ai zod
```

#### `functions/src/prompts/itemAnalysis.ts` — The Prompt (FR30)

```typescript
// functions/src/prompts/itemAnalysis.ts

export const ITEM_ANALYSIS_PROMPT = `You are an inventory cataloging assistant.
Analyze the provided image and return a JSON object describing the item.

CRITICAL: Return ONLY raw JSON. No markdown, no code fences, no explanation.

Required JSON format:
{
  "title": "Brief descriptive name of the item (e.g., 'Vintage Leather Jacket')",
  "category": "Single category (e.g., 'Clothing', 'Electronics', 'Furniture', 'Books', 'Tools', 'Sports', 'Jewelry', 'Other')",
  "color": "Primary color of the item (e.g., 'Black', 'Navy Blue', 'Multicolor')",
  "condition": "One of exactly: Excellent, Good, Fair, Poor"
}

Condition guide:
- Excellent: Like new, no visible wear
- Good: Minor wear, fully functional
- Fair: Noticeable wear, still usable
- Poor: Heavy wear, damaged, or incomplete`;
```

#### `functions/src/validators/itemSchema.ts` — Zod Schema (FR8)

```typescript
// functions/src/validators/itemSchema.ts
import { z } from "zod";

export const itemAnalysisSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  color: z.string().min(1).max(100),
  condition: z.enum(["Excellent", "Good", "Fair", "Poor"]),
});

export type ItemAnalysisResult = z.infer<typeof itemAnalysisSchema>;
```

#### `functions/src/utils/responseParser.ts` — Strip Markdown Fences

````typescript
// functions/src/utils/responseParser.ts

/**
 * Strips markdown code fences from Gemini's raw text response.
 * Gemini sometimes wraps JSON in ```json ... ``` despite instructions not to.
 */
export function parseAIResponse(rawText: string): unknown {
  // Remove leading/trailing whitespace
  let cleaned = rawText.trim();

  // Strip ```json or ``` code fences
  if (cleaned.startsWith("```")) {
    // Remove opening fence line
    cleaned = cleaned.replace(/^```(?:json)?\s*/im, "");
    // Remove closing fence
    cleaned = cleaned.replace(/\s*```\s*$/m, "");
  }

  return JSON.parse(cleaned);
}
````

#### `functions/src/utils/geminiClient.ts` — Gemini API Client

```typescript
// functions/src/utils/geminiClient.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export function createGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeImageWithGemini(
  imageUrl: string,
  prompt: string,
): Promise<string> {
  const genAI = createGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        // Gemini supports URL-based image analysis via fileData
        // For publicly accessible Cloud Storage URLs, use fileData
        mimeType: "image/jpeg",
        data: "", // unused when using fileData
      },
    },
    prompt,
  ]);

  // ✅ CORRECT pattern for URL-based images:
  // Use fileData part with the public image URL
  const result2 = await model.generateContent([
    {
      fileData: {
        mimeType: "image/jpeg",
        fileUri: imageUrl,
      },
    },
    { text: prompt },
  ]);

  return result2.response.text();
}
```

> **⚠️ IMPORTANT**: Gemini 2.0 Flash requires the image to be accessible via public URL. The `imageUrl` passed to the Cloud Function must be the Firebase Storage **download URL** (which is publicly accessible). The mobile client uploads the image to Cloud Storage FIRST and gets a download URL, then sends that URL to `analyzeItem`.

#### `functions/src/analyzeItem.ts` — Main Cloud Function

```typescript
// functions/src/analyzeItem.ts
import * as functions from "firebase-functions";
import { ITEM_ANALYSIS_PROMPT } from "./prompts/itemAnalysis";
import { itemAnalysisSchema } from "./validators/itemSchema";
import { parseAIResponse } from "./utils/responseParser";
import { analyzeImageWithGemini } from "./utils/geminiClient";

interface AnalyzeItemData {
  imageUrl: string;
}

interface AnalyzeItemResponse {
  success: boolean;
  data?: { title: string; category: string; color: string; condition: string };
  error?: { code: string; message: string };
}

export const analyzeItem = functions.https.onCall(
  async (data: AnalyzeItemData, context): Promise<AnalyzeItemResponse> => {
    // AC3: Auth enforcement
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated to analyze items",
      );
    }

    const { imageUrl } = data;
    const uid = context.auth.uid;

    if (!imageUrl || typeof imageUrl !== "string") {
      return {
        success: false,
        error: { code: "INVALID_IMAGE", message: "imageUrl is required" },
      };
    }

    try {
      // Call Gemini API
      const rawText = await analyzeImageWithGemini(
        imageUrl,
        ITEM_ANALYSIS_PROMPT,
      );

      // Strip markdown fences and parse
      let parsed: unknown;
      try {
        parsed = parseAIResponse(rawText);
      } catch (parseError) {
        functions.logger.error("AI response JSON parse failure", {
          uid,
          rawResponse: rawText,
          parseError: String(parseError),
          timestamp: new Date().toISOString(),
        });
        return {
          success: false,
          error: {
            code: "AI_PARSE_FAILURE",
            message: "AI returned an invalid response format",
          },
        };
      }

      // Validate with Zod
      const validation = itemAnalysisSchema.safeParse(parsed);
      if (!validation.success) {
        functions.logger.error("AI response Zod validation failure", {
          uid,
          rawResponse: rawText,
          zodError: validation.error.message,
          timestamp: new Date().toISOString(),
        });
        return {
          success: false,
          error: {
            code: "AI_PARSE_FAILURE",
            message: "AI response did not match expected schema",
          },
        };
      }

      return { success: true, data: validation.data };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Detect timeout errors
      if (
        errorMessage.toLowerCase().includes("timeout") ||
        errorMessage.toLowerCase().includes("deadline")
      ) {
        return {
          success: false,
          error: { code: "AI_TIMEOUT", message: "AI analysis timed out" },
        };
      }

      functions.logger.error("Unexpected analyzeItem error", {
        uid,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: {
          code: "AI_PARSE_FAILURE",
          message: "An unexpected error occurred",
        },
      };
    }
  },
);
```

#### `functions/src/index.ts` — Exports

```typescript
// functions/src/index.ts
export { analyzeItem } from "./analyzeItem";
// Future: export { rateLimitedAnalyzeItem } from './analyzeItem'; // after Story 3.2
```

#### Mobile Client — `src/types/api.types.ts`

```typescript
// src/types/api.types.ts

export type AnalyzeItemErrorCode =
  | "RATE_LIMITED"
  | "AI_PARSE_FAILURE"
  | "AI_TIMEOUT"
  | "INVALID_IMAGE";

export interface AnalyzeItemRequest {
  imageUrl: string;
}

export interface AnalyzeItemResponseData {
  title: string;
  category: string;
  color: string;
  condition: string;
}

export interface AnalyzeItemResponse {
  success: boolean;
  data?: AnalyzeItemResponseData;
  error?: {
    code: AnalyzeItemErrorCode;
    message: string;
  };
}
```

#### Mobile Client — Add to `src/services/firebaseConfig.ts`

```typescript
// ADD to existing firebaseConfig.ts — DO NOT recreate the whole file
import { getFunctions } from "firebase/functions";

// After existing app initialization:
export const functions = getFunctions(app);
// NOTE: If using Functions emulator for local dev:
// connectFunctionsEmulator(functions, 'localhost', 5001);
```

#### Mobile Client — `src/services/aiService.ts`

```typescript
// src/services/aiService.ts
import { httpsCallable } from "firebase/functions";
import { functions } from "@/services/firebaseConfig";
import type {
  AnalyzeItemRequest,
  AnalyzeItemResponse,
} from "@/types/api.types";

export async function analyzeItem(
  imageUrl: string,
): Promise<AnalyzeItemResponse> {
  const analyzeItemFn = httpsCallable<AnalyzeItemRequest, AnalyzeItemResponse>(
    functions,
    "analyzeItem",
  );

  try {
    const result = await analyzeItemFn({ imageUrl });
    return result.data;
  } catch (error: unknown) {
    // Firebase callable errors have a code property
    return {
      success: false,
      error: {
        code: "AI_PARSE_FAILURE",
        message:
          error instanceof Error
            ? error.message
            : "Network error calling AI service",
      },
    };
  }
}
```

---

### Anti-Patterns to Avoid

```typescript
// ❌ WRONG: Never call Gemini directly from mobile client (NFR-S1)
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // NEVER in client

// ❌ WRONG: Never use firebase/compat imports
import firebase from "firebase/compat/app"; // NEVER

// ❌ WRONG: Never hardcode the API key
const apiKey = "AIzaSy..."; // NEVER

// ❌ WRONG: Never use .parse() instead of .safeParse()
const result = schema.parse(data); // THROWS — use safeParse instead

// ❌ WRONG: Do not return HttpsError for business failures
throw new functions.https.HttpsError("internal", "AI failed"); // Wrong for business errors

// ✅ CORRECT: Return structured object for business failures
return { success: false, error: { code: "AI_PARSE_FAILURE", message: "..." } };

// ✅ CORRECT: Only use HttpsError for auth errors
throw new functions.https.HttpsError(
  "unauthenticated",
  "Must be authenticated",
);
```

---

### Data Flow for This Story

```
Mobile App (CameraScreen after Story 2.4):
  compressImage(uri) → compressed.uri (local)
    → storageService.upload(compressed.uri) [Story 3.3 adds this]
    → imageUrl (Cloud Storage download URL)
      → aiService.analyzeItem(imageUrl)
        → analyzeItem Cloud Function
          → Auth check (uid)
          → Gemini 2.0 Flash API
          → stripMarkdownFences(rawText)
          → JSON.parse(cleaned)
          → itemAnalysisSchema.safeParse(parsed)
          → { success: true, data: { title, category, color, condition } }
        ← AnalyzeItemResponse
      ← { success: true, data }
```

> **Note:** The image upload to Cloud Storage (`storageService.ts`) and the ReviewFormScreen integration are handled in Stories 3.3 and 4.2. This story only creates the Cloud Function endpoint and the `aiService.ts` callable client. The `aiService.analyzeItem()` function can be called once the mobile app is ready to pass a Cloud Storage download URL.

---

### Files to Create / Modify

| File                                      | Action     | Notes                                   |
| ----------------------------------------- | ---------- | --------------------------------------- |
| `functions/` (entire dir)                 | **INIT**   | Via `firebase init functions`           |
| `functions/src/index.ts`                  | **NEW**    | Export `analyzeItem`                    |
| `functions/src/analyzeItem.ts`            | **NEW**    | Main Cloud Function                     |
| `functions/src/prompts/itemAnalysis.ts`   | **NEW**    | Gemini prompt (FR30)                    |
| `functions/src/validators/itemSchema.ts`  | **NEW**    | Zod validation schema                   |
| `functions/src/middleware/rateLimiter.ts` | **NEW**    | Scaffold only (Story 3.2 fills in)      |
| `functions/src/utils/geminiClient.ts`     | **NEW**    | Gemini API wrapper                      |
| `functions/src/utils/responseParser.ts`   | **NEW**    | Markdown fence stripper                 |
| `functions/src/utils/logger.ts`           | **NEW**    | Structured logging helper               |
| `functions/.env.example`                  | **NEW**    | Document `GEMINI_API_KEY`               |
| `src/types/api.types.ts`                  | **NEW**    | API type definitions                    |
| `src/services/aiService.ts`               | **NEW**    | Cloud Function caller                   |
| `src/services/firebaseConfig.ts`          | **MODIFY** | Add `getFunctions` + export `functions` |

**DO NOT MODIFY:**

- `src/screens/CameraScreen.tsx` — No integration yet (Story 3.3)
- `src/screens/ReviewFormScreen.tsx` — Not yet exists (Story 4.1)
- `src/stores/*` — No store changes in this story
- Existing Firebase services (auth, firestore, storage) in `firebaseConfig.ts`

**DO NOT CREATE:**

- `src/services/storageService.ts` — Story 3.3
- `src/components/ScanLoadingOverlay.tsx` — Story 3.3

---

### Previous Story Intelligence

**From Story 2.4 (Image Compression Pipeline):**

1. **`isMounted` ref pattern** — Used in CameraScreen for safe async state updates. Follow same pattern in any new screen/component work.
2. **`isNavigating` ref pattern** — Used to prevent double navigation. Relevant for ReviewForm integration (Story 3.3).
3. **Services directory conventions** — Services use named exports, camelCase function names, and are in `src/services/`. The new `aiService.ts` follows this exactly.
4. **`CompressedImageResult`** interface is in `src/services/imageService.ts` — The `uri` from this result is what gets uploaded and becomes `imageUrl` for the Cloud Function.
5. **ReviewForm navigation param**: `navigation.navigate("ReviewForm", { imageUri: compressed.uri })` — currently passes the local URI. Story 3.3 will change this to upload to storage and pass the Cloud Storage URL.

**From Epics 1 stories (Firebase setup):**

- Firebase is initialized in `src/services/firebaseConfig.ts` using environment variables from `.env`
- Auth Service (`authService.ts`) is in place — anonymous + Google Sign-In working
- The Firebase project is already connected (`firebase.json` and `.firebaserc` exist at root)

---

### Git Intelligence

**Recent commits on `develop` branch:**

- `0127fa1` — HEAD: Merging/updating sprint status after Story 2.4
- `3b9dc9e` — feat/2-1: Camera screen initial implementation
- `996e593` — chore: Finalize Epic 2 (stories 2.1–2.4 merged)

**Branch to create:** `feat/3-1-cloud-function-and-gemini-ai-integration` from `develop`

**Files to stage on commit:**

- `functions/` (entire directory — new)
- `src/types/api.types.ts` (new)
- `src/services/aiService.ts` (new)
- `src/services/firebaseConfig.ts` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status update)

---

### Environment Configuration

**Firebase environment config (for deployment):**

```bash
# Set the API key in Firebase environment
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

**For local emulator testing:**

```bash
# Create functions/.env.local (not committed)
GEMINI_API_KEY=your_api_key_here
```

**`functions/.env.example`:**

```
# Required: Google Gemini API key for image analysis
GEMINI_API_KEY=your_gemini_api_key_here
```

**Do NOT use Firebase Functions v2 `defineSecret()`** unless you specifically upgrade to Gen 2 functions. The architecture specifies standard `process.env.*` environment config.

---

### Latest Technical Information

**`@google/generative-ai` SDK (as of 2026):**

- Package: `@google/generative-ai` — Use this direct SDK in Cloud Functions (NOT Firebase AI Logic which is for client SDKs)
- Model: `gemini-2.0-flash` — Specified in architecture; fast, cost-effective for structured output tasks
- For URL-based images: Use `fileData: { mimeType: 'image/jpeg', fileUri: publicImageUrl }` part
- Response text: Access via `result.response.text()`
- API Key auth: Pass directly to `GoogleGenerativeAI(apiKey)` constructor

**Firebase Cloud Functions (Gen 1 via `firebase-functions` v6.x):**

- HTTPS Callable: `functions.https.onCall(async (data, context) => { ... })`
- Auth context: `context.auth` (null if unauthenticated)
- Logging: `functions.logger.info()`, `functions.logger.error()`, `functions.logger.warn()`
- HttpsError codes for auth: `'unauthenticated'`

**Zod 4.3.x (as in project context):**

- `.safeParse()` returns `{ success: true, data }` or `{ success: false, error }`
- `z.enum(['A', 'B'])` for string enums
- `z.infer<typeof schema>` for TypeScript type extraction

---

### Project Context Reference

See `_bmad-output/project-context.md` for:

- Technology stack versions (Firebase SDK 12.9.0, Zod 4.3.x, TypeScript strict mode)
- Naming conventions (camelCase functions, PascalCase types, SCREAMING_SNAKE_CASE constants)
- Architectural boundary rules (Cloud Function → Gemini is the ONLY allowed path for AI)
- Anti-patterns to avoid (firebase/compat, raw API calls from UI, hardcoded keys)
- Error handling patterns (try/catch everywhere, structured error objects)

---

### References

- Story 3.1 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Story 3.1 section]
- API contract: [Source: `_bmad-output/planning-artifacts/architecture.md` — Cloud Function API Contract]
- Project structure: [Source: `_bmad-output/planning-artifacts/architecture.md` — Complete Project Directory Structure]
- Security rules: [Source: `_bmad-output/planning-artifacts/architecture.md` — Authentication & Security]
- FR6, FR7, FR8, FR29, FR30 requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Requirements Inventory]
- NFR-S1, NFR-S3: [Source: `_bmad-output/planning-artifacts/architecture.md` — NFR Coverage]
- Error handling patterns: [Source: `_bmad-output/project-context.md` — Error Handling Patterns]
- Naming conventions: [Source: `_bmad-output/project-context.md` — Naming Conventions]
- Architectural boundaries: [Source: `_bmad-output/project-context.md` — Architectural Boundary Rules]
- Previous story: [Source: `_bmad-output/implementation-artifacts/2-4-image-compression-pipeline.md`]
- Gemini API: [Source: `@google/generative-ai` NPM package docs]
- Firebase Cloud Functions: [Source: `firebase-functions` NPM package docs]

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- `npm install` (in `functions/`)
- `npx tsc --noEmit` (in `functions/`) ✅
- `npx tsc --noEmit` (project root) ✅
- `npx eslint src/` (project root) ✅

### Completion Notes List

- Implemented Firebase Cloud Functions scaffold with Node.js 20, strict TypeScript, and ESLint.
- Added `analyzeItem` callable function with auth enforcement, Gemini 2.0 Flash call, markdown fence stripping, Zod safe parsing, and structured success/error responses.
- Added Cloud Function prompt, schema validator, response parser, logging helper, and rate limiter scaffold.
- Added mobile API integration via `src/services/aiService.ts` and exported Functions instance from `src/services/firebaseConfig.ts`.
- Updated shared API contracts in `src/types/api.types.ts` to include `AnalyzeItemErrorCode` and strict condition union.

### File List

- `firebase.json`
- `functions/.env.example`
- `functions/eslint.config.mjs`
- `functions/package-lock.json`
- `functions/package.json`
- `functions/tsconfig.json`
- `functions/src/analyzeItem.ts`
- `functions/src/index.ts`
- `functions/src/middleware/rateLimiter.ts`
- `functions/src/prompts/itemAnalysis.ts`
- `functions/src/types.ts`
- `functions/src/utils/geminiClient.ts`
- `functions/src/utils/logger.ts`
- `functions/src/utils/responseParser.ts`
- `functions/src/validators/itemSchema.ts`
- `src/services/aiService.ts`
- `src/services/firebaseConfig.ts`
- `src/types/api.types.ts`

### Change Log

- 2026-03-02: Implemented Story 3.1 Cloud Function and Gemini integration, mobile callable client/types wiring, and AC13 verification passes.
