import * as functions from 'firebase-functions/v1';
import { checkRateLimit } from './middleware/rateLimiter';
import { ITEM_ANALYSIS_PROMPT } from './prompts/itemAnalysis';
import { analyzeImageWithGemini } from './utils/geminiClient';
import { logAiParseFailure } from './utils/logger';
import { withRetry } from './utils/retry';
import { parseAIResponse } from './utils/responseParser';
import type { AnalyzeItemRequest, AnalyzeItemResponse, AnalyzeItemResponseData } from './types';
import { itemAnalysisSchema } from './validators/itemSchema';

/**
 * Maps an unexpected error message string to the closest typed error code.
 * Used as a fallback when the error is not a Zod validation failure or
 * a recognised Firebase / HTTP status code.
 *
 * @param message - The error's `.message` string (case-insensitive matching).
 * @returns One of `"RATE_LIMITED"`, `"AI_TIMEOUT"`, or `"AI_PARSE_FAILURE"`.
 */
function mapUnexpectedErrorToCode(
  message: string
): 'RATE_LIMITED' | 'AI_TIMEOUT' | 'AI_PARSE_FAILURE' {
  const lowered = message.toLowerCase();

  if (lowered.includes('429') || lowered.includes('rate')) {
    return 'RATE_LIMITED';
  }

  if (lowered.includes('timeout') || lowered.includes('deadline')) {
    return 'AI_TIMEOUT';
  }

  return 'AI_PARSE_FAILURE';
}

/**
 * HTTPS callable Cloud Function that analyses an item image with Gemini AI
 * and returns structured catalog data (title, category, color, condition).
 *
 * **Request flow**:
 * 1. **Auth check** — rejects unauthenticated callers with an `HttpsError`.
 * 2. **Input validation** — `imageUrl` must be a valid HTTPS URL; returns
 *    `INVALID_IMAGE` if not.
 * 3. **Rate limiting** — `checkRateLimit(uid)` enforces 20 req/hour/user
 *    (in-memory); returns `RATE_LIMITED` with a `retryAfterSeconds` hint if exceeded.
 * 4. **Gemini call** — `analyzeImageWithGemini` fetches the image and sends it
 *    to `gemini-2.5-flash` (v1beta API). The call is wrapped in `withRetry`
 *    with a `shouldRetry` predicate that matches network-level transient errors
 *    (timeout, ECONNRESET, etc.).
 * 5. **Response parsing** — `parseAIResponse` extracts a JSON object from the
 *    raw text (handles markdown code fences). Parse failures are logged to
 *    Firestore and returned as `AI_PARSE_FAILURE`.
 * 6. **Zod validation** — `itemAnalysisSchema.safeParse` ensures the shape
 *    matches `AnalyzeItemResponseData`. Invalid shapes are also logged and
 *    returned as `AI_PARSE_FAILURE`.
 *
 * @param data - `{ imageUrl: string }` — HTTPS URL of the compressed item image.
 * @param context - Firebase callable context containing `context.auth.uid`.
 * @returns `{ success: true, data: AnalyzeItemResponseData }` on success, or
 *   `{ success: false, error: { code, message } }` on any handled failure.
 * @throws {functions.https.HttpsError} With `"unauthenticated"` if the caller
 *   has no Firebase Auth token.
 */
export const analyzeItem = functions.https.onCall(
  async (
    data: AnalyzeItemRequest,
    context: functions.https.CallableContext
  ): Promise<AnalyzeItemResponse> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const uid = context.auth.uid;

    if (!data?.imageUrl || typeof data.imageUrl !== 'string') {
      return {
        success: false,
        error: {
          code: 'INVALID_IMAGE',
          message: 'imageUrl is required',
        },
      };
    }

    try {
      const normalizedUrl = new URL(data.imageUrl);
      if (!normalizedUrl.protocol.startsWith('http')) {
        return {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'imageUrl must be an http or https URL',
          },
        };
      }
    } catch {
      return {
        success: false,
        error: {
          code: 'INVALID_IMAGE',
          message: 'imageUrl must be a valid URL',
        },
      };
    }

    const rateLimit = checkRateLimit(uid);

    if (!rateLimit.allowed) {
      functions.logger.warn('Rate limit exceeded', {
        uid,
        timestamp: new Date().toISOString(),
        requestCount: rateLimit.requestCount,
        windowStart: rateLimit.windowStart,
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      });

      const retryAfterSeconds = rateLimit.retryAfterSeconds ?? 0;

      return {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
        },
      };
    }

    try {
      const rawResponse = await withRetry(
        () => analyzeImageWithGemini(data.imageUrl, ITEM_ANALYSIS_PROMPT),
        {
          shouldRetry: (error: unknown): boolean => {
            const message =
              error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

            return (
              message.includes('timeout') ||
              message.includes('deadline') ||
              message.includes('network') ||
              message.includes('econnreset') ||
              message.includes('econnrefused') ||
              message.includes('fetch')
            );
          },
        }
      );

      let parsedResponse: unknown;

      try {
        parsedResponse = parseAIResponse(rawResponse);
      } catch (parseError) {
        logAiParseFailure({
          uid,
          rawResponse,
          parseError: parseError instanceof Error ? parseError.message : String(parseError),
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          error: {
            code: 'AI_PARSE_FAILURE',
            message: 'AI returned invalid JSON',
          },
        };
      }

      const validation = itemAnalysisSchema.safeParse(parsedResponse);

      if (!validation.success) {
        logAiParseFailure({
          uid,
          rawResponse,
          parseError: validation.error.message,
          timestamp: new Date().toISOString(),
        });

        return {
          success: false,
          error: {
            code: 'AI_PARSE_FAILURE',
            message: 'AI response failed schema validation',
          },
        };
      }

      const responseData: AnalyzeItemResponseData = validation.data;

      return {
        success: true,
        data: responseData,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const code = mapUnexpectedErrorToCode(message);

      functions.logger.error('analyzeItem failure', {
        uid,
        message,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: {
          code,
          message: 'Failed to analyze image',
        },
      };
    }
  }
);
