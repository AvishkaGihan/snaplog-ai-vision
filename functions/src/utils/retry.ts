export const MAX_RETRIES = 2;
export const BASE_DELAY_MS = 1000;

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Calls `fn` and retries it up to `maxRetries` times on failure, using
 * exponential backoff with random jitter between attempts.
 *
 * **Backoff formula**: `baseDelayMs × 2^attempt + jitter`
 * where `jitter` is a uniformly random value in `[0, 1000)` ms.
 *
 * The retry loop only continues if `shouldRetry(error)` returns `true`;
 * non-retryable errors are re-thrown immediately.
 *
 * @param fn - Async function to call. Receives no arguments.
 * @param options.maxRetries - Maximum number of retry attempts after the initial
 *   call (default: `MAX_RETRIES` = 2, so up to 3 total attempts).
 * @param options.baseDelayMs - Base delay in milliseconds for the first retry
 *   (default: `BASE_DELAY_MS` = 1000 ms).
 * @param options.shouldRetry - Predicate that receives the caught error and
 *   returns `true` if the error is retryable (default: always `true`).
 * @returns The resolved value of `fn` on success.
 * @throws The last error thrown by `fn` if all attempts are exhausted or
 *   `shouldRetry` returns `false`.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? BASE_DELAY_MS;
  const shouldRetry = options.shouldRetry ?? (() => true);

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt || !shouldRetry(error)) {
        throw error;
      }

      const delayMs = baseDelayMs * 2 ** attempt;
      const jitterMs = Math.floor(Math.random() * 1000);
      await delay(delayMs + jitterMs);
    }
  }

  throw new Error('withRetry: unreachable');
}
