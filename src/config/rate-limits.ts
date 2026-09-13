/**
 * Abuse thresholds. Tunable because the right numbers depend on how you are
 * deployed — behind a shared NAT a per-address limit is far blunter than on
 * consumer connections, and a test or staging environment needs headroom.
 *
 * Each entry is `limit` events per `windowSeconds`, keyed per address (and,
 * for sign-in, also per account).
 */

const num = (key: string, fallback: number) => {
  const raw = Number(process.env[key]);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
};

export const RATE_LIMITS = {
  /** Enquiry submissions, per site per address. */
  leads: { limit: num("RATE_LIMIT_LEADS", 5), windowSeconds: 600 },

  /** Sign-in attempts per address — blunts credential stuffing. */
  loginByIp: { limit: num("RATE_LIMIT_LOGIN_IP", 10), windowSeconds: 900 },

  /** Sign-in attempts per account — so one target cannot be ground down. */
  loginByAccount: { limit: num("RATE_LIMIT_LOGIN_ACCOUNT", 5), windowSeconds: 900 },

  /**
   * New accounts per address per hour. Raise it for automated tests, which
   * create several tenants per run: RATE_LIMIT_SIGNUP=50
   */
  signup: { limit: num("RATE_LIMIT_SIGNUP", 5), windowSeconds: 3600 },

  /** Uploads per user. */
  uploads: { limit: num("RATE_LIMIT_UPLOADS", 60), windowSeconds: 3600 },

  /** Analytics beacons per address, per site. */
  track: { limit: num("RATE_LIMIT_TRACK", 120), windowSeconds: 60 },
} as const;
