import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebaseConfig';
import type { AnalyzeItemRequest, AnalyzeItemResponse } from '@/types/api.types';

/**
 * Calls the `analyzeItem` HTTPS callable Cloud Function with a compressed image URL
 * and returns structured AI analysis data (title, category, color, condition).
 *
 * Firebase error codes are mapped to app-specific error codes so callers
 * don't need to know Firebase internals:
 * - `deadline-exceeded` → `AI_TIMEOUT`
 * - `resource-exhausted` → `RATE_LIMITED`
 * - `invalid-argument` → `INVALID_IMAGE`
 * - anything else → `AI_PARSE_FAILURE`
 *
 * @param imageUrl - HTTPS URL of the already-uploaded and compressed item image.
 * @returns A resolved `AnalyzeItemResponse`. On failure the promise still resolves
 *   (never rejects) with `{ success: false, error: { code, message } }`.
 */
export async function analyzeItem(imageUrl: string): Promise<AnalyzeItemResponse> {
  const analyzeItemCallable = httpsCallable<AnalyzeItemRequest, AnalyzeItemResponse>(
    functions,
    'analyzeItem'
  );

  try {
    const result = await analyzeItemCallable({ imageUrl });
    return result.data;
  } catch (error: any) {
    const code = error?.code || '';
    let errorCode: 'AI_TIMEOUT' | 'RATE_LIMITED' | 'INVALID_IMAGE' | 'AI_PARSE_FAILURE' =
      'AI_PARSE_FAILURE';
    let message = error?.message || 'Unknown AI error';

    if (typeof code === 'string') {
      if (code.includes('deadline-exceeded')) {
        errorCode = 'AI_TIMEOUT';
      } else if (code.includes('resource-exhausted')) {
        errorCode = 'RATE_LIMITED';
      } else if (code.includes('invalid-argument')) {
        errorCode = 'INVALID_IMAGE';
      }
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message,
      },
    };
  }
}
