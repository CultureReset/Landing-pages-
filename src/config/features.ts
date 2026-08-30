/**
 * Operational switches. These decide what a deployment offers, so the same
 * codebase can run as an open self-serve product, a closed invite-only tool,
 * or a private single-tenant install.
 */

const flag = (key: string, fallback: boolean) => {
  const raw = process.env[key]?.trim().toLowerCase();
  if (raw === undefined || raw === "") return fallback;
  return raw === "1" || raw === "true" || raw === "yes";
};

const list = (key: string): string[] =>
  (process.env[key] ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export const features = {
  /** Anyone can create an account. Turn off to run invite-only. */
  signupsOpen: flag("SIGNUPS_OPEN", true),

  /** Require a code at sign-up. Codes are listed in SIGNUP_INVITE_CODES. */
  inviteOnly: flag("SIGNUP_INVITE_ONLY", false),
  inviteCodes: list("SIGNUP_INVITE_CODES"),

  /**
   * Show the "one-click demo account" button. Should be off in production —
   * it signs anyone in as the demo tenant.
   */
  demoAccount: flag("NEXT_PUBLIC_DEMO_ACCOUNT", process.env.NODE_ENV !== "production"),
  demoEmail: process.env.DEMO_ACCOUNT_EMAIL?.trim() || "demo@frontdesk.app",

  /**
   * Advertise customer pages on the marketing site. Only pages an operator has
   * explicitly featured are ever shown — never automatic, never opt-out.
   */
  publicDirectory: flag("PUBLIC_DIRECTORY", true),

  /** Accept file uploads. Off forces image URLs only. */
  uploads: flag("UPLOADS_ENABLED", true),

  /** Let tenants change their own handle after onboarding. */
  handleChanges: flag("HANDLE_CHANGES", true),
} as const;

/** Accounts allowed into the operator console at /admin. */
export function adminEmails(): string[] {
  return list("ADMIN_EMAILS");
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = adminEmails();
  return admins.length > 0 && admins.includes(email.trim().toLowerCase());
}

export function inviteCodeValid(code: string): boolean {
  if (!features.inviteOnly) return true;
  const normalised = code.trim().toLowerCase();
  return normalised.length > 0 && features.inviteCodes.includes(normalised);
}
