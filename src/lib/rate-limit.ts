import "server-only";

/**
 * Fixed-window limiter with a bounded map.
 *
 * Deliberately in-process: it protects a single instance from abuse without a
 * Redis dependency. Behind more than one instance the effective allowance is
 * multiplied by the instance count — swap `hit()` for a shared store when you
 * scale horizontally; every caller already goes through this one function.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_KEYS = 10_000;
const buckets = new Map<string, Bucket>();

/** Drops expired entries, and the oldest ones if the map is still oversized. */
function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size <= MAX_KEYS) return;
  const overflow = buckets.size - MAX_KEYS;
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (++removed >= overflow) break;
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function hit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  if (buckets.size > MAX_KEYS / 2) sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const ok = existing.count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: ok ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Clears a key early, e.g. after a successful sign-in. */
export function reset(key: string): void {
  buckets.delete(key);
}

/** Best-effort client address. Trusts the proxy headers your host sets. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "local";
}

export const LIMITS = {
  /** Enquiry submissions, per site per address. */
  leads: { limit: 5, windowSeconds: 600 },
  /** Sign-in attempts per address, to blunt credential stuffing. */
  loginByIp: { limit: 10, windowSeconds: 900 },
  /** Sign-in attempts per account, so one target cannot be ground down. */
  loginByAccount: { limit: 5, windowSeconds: 900 },
  /** New accounts per address. */
  signup: { limit: 5, windowSeconds: 3600 },
  /** Uploads per user. */
  uploads: { limit: 60, windowSeconds: 3600 },
  /** Analytics beacons per address, per site. */
  track: { limit: 120, windowSeconds: 60 },
} as const;
