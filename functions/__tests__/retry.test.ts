import { withRetry } from "../src/utils/retry";

describe("withRetry", () => {
  it("should return result if fn succeeds on first try", async () => {
    const fn = jest.fn().mockResolvedValue("success");
    const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 10 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and eventually succeed", async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("success");

    const promise = withRetry(fn, { maxRetries: 2, baseDelayMs: 10 });

    const result = await promise;
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should fail after max retries", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("fail"));

    const promise = withRetry(fn, { maxRetries: 2, baseDelayMs: 10 });

    await expect(promise).rejects.toThrow("fail");
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it("should not retry if shouldRetry returns false", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("fatal"));
    const shouldRetry = (err: unknown) => err instanceof Error && err.message !== "fatal";

    const promise = withRetry(fn, { maxRetries: 2, baseDelayMs: 10, shouldRetry });

    await expect(promise).rejects.toThrow("fatal");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
