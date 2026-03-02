export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(_uid: string): Promise<RateLimitResult> {
  return { allowed: true };
}
