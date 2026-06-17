type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export type RateLimitSuccess = {
  ok: true;
  remaining: number;
  limit: number;
  resetAt: number;
};

export type RateLimitFailure = {
  ok: false;
  retryAfterSec: number;
  limit: number;
  resetAt: number;
};

export type RateLimitResult = RateLimitSuccess | RateLimitFailure;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function pruneExpiredRateLimitEntries(now = Date.now()) {
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  pruneExpiredRateLimitEntries(now);

  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });

    return {
      ok: true,
      remaining: Math.max(0, limit - 1),
      limit,
      resetAt,
    };
  }

  if (entry.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      limit,
      resetAt: entry.resetAt,
    };
  }

  entry.count += 1;

  return {
    ok: true,
    remaining: Math.max(0, limit - entry.count),
    limit,
    resetAt: entry.resetAt,
  };
}

export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const resetSec = String(Math.ceil(result.resetAt / 1000));

  if (!result.ok) {
    return {
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": resetSec,
      "Retry-After": String(result.retryAfterSec),
    };
  }

  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": resetSec,
  };
}
