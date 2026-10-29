// Retry helper for idempotent D1 reads. Cloudflare documents a handful of
// transient D1 errors that are safe to retry; anything else is rethrown.
const RETRYABLE = [
  "Network connection lost",
  "storage caused object to be reset",
  "reset because its code was updated",
  "internal error",
]

function isRetryable(err: unknown): boolean {
  const msg = String((err as any)?.message ?? err).toLowerCase()
  return RETRYABLE.some((s) => msg.includes(s.toLowerCase()))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (!isRetryable(err) || i === attempts - 1) break
      await new Promise((r) => setTimeout(r, 50 * 2 ** i + Math.random() * 50))
    }
  }
  throw lastErr
}
