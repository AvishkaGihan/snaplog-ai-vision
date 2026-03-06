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

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
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

  throw new Error("withRetry: unreachable");
}
