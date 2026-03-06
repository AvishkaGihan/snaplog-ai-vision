export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  requestCount: number;
  windowStart: number;
}

export const MAX_REQUESTS_PER_WINDOW = 20;
export const WINDOW_DURATION_MS = 3_600_000;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_STORE_SIZE = 10000;

function cleanupStore(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > WINDOW_DURATION_MS) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Checks whether a user has exceeded the rate limit and records the request.
 *
 * **Algorithm** (fixed sliding window, per-user, in-memory):
 * - Each user `uid` has an entry `{ count, windowStart }` in `rateLimitStore`.
 * - When the entry is absent or the window has expired (`now - windowStart > WINDOW_DURATION_MS`),
 *   a fresh window is started with `count = 1`.
 * - If `count >= MAX_REQUESTS_PER_WINDOW`, the request is denied and
 *   `retryAfterSeconds` is calculated from the remaining window time.
 * - Otherwise `count` is incremented and the request is allowed.
 * - As a memory safety guard, if the store grows beyond `MAX_STORE_SIZE` (10 000 entries),
 *   all expired entries are synchronously purged before processing the current request.
 *
 * @param uid - The authenticated Firebase user ID to check.
 * @returns `RateLimitResult` with `allowed: true` on success, or
 *   `allowed: false` with `retryAfterSeconds` when the limit is exceeded.
 */
export function checkRateLimit(uid: string): RateLimitResult {
  const now = Date.now();

  if (rateLimitStore.size > MAX_STORE_SIZE) {
    cleanupStore(now);
  }

  const entry = rateLimitStore.get(uid);

  if (!entry || now - entry.windowStart > WINDOW_DURATION_MS) {
    rateLimitStore.set(uid, { count: 1, windowStart: now });
    return { allowed: true, requestCount: 1, windowStart: now };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = entry.windowStart + WINDOW_DURATION_MS - now;
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

    return {
      allowed: false,
      retryAfterSeconds,
      requestCount: entry.count,
      windowStart: entry.windowStart,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    requestCount: entry.count,
    windowStart: entry.windowStart,
  };
}
