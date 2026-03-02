import { checkRateLimit, MAX_REQUESTS_PER_WINDOW, WINDOW_DURATION_MS } from "../src/middleware/rateLimiter";

describe("rateLimiter", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Simulate clearing the instance-level store by letting timers run and checking expiration?
    // Actually, checkRateLimit operates on simple Map. We can't clear it explicitly,
    // but we can use different uids.
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should allow requests under the limit", () => {
    const uid = "user_1";
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
        const result = checkRateLimit(uid);
        expect(result.allowed).toBe(true);
        expect(result.requestCount).toBe(i + 1);
    }
    const result = checkRateLimit(uid);
    expect(result.allowed).toBe(false);
  });

  it("should allow requests again after window expires", () => {
    const uid = "user_2";
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
        checkRateLimit(uid);
    }

    expect(checkRateLimit(uid).allowed).toBe(false);

    // Advance time past the window duration
    jest.advanceTimersByTime(WINDOW_DURATION_MS + 1000);

    // Should be allowed again
    const result = checkRateLimit(uid);
    expect(result.allowed).toBe(true);
    expect(result.requestCount).toBe(1);
  });
});
