/**
 * Handles nobody may claim. Two reasons: words that would collide with a
 * current or future route, and words a visitor would reasonably read as
 * official ("admin", "support", "billing").
 */
export const RESERVED_HANDLES = new Set([
  // routes, current and likely
  "admin", "api", "app", "dashboard", "login", "logout", "signup", "signin",
  "register", "onboarding", "settings", "account", "billing", "pricing",
  "legal", "privacy", "terms", "refunds", "static", "public", "assets",
  "media", "img", "images", "qr", "vcard", "cover", "track", "upload", "p",
  // impersonation risks
  "support", "help", "security", "abuse", "root", "system", "official",
  "team", "staff", "moderator", "www", "mail", "email", "status", "docs",
  "blog", "news", "about", "contact", "careers", "jobs", "press",
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(handle.trim().toLowerCase());
}

/** Handles must be this long so the reserved list cannot be side-stepped. */
export const MIN_HANDLE_LENGTH = 3;
export const MAX_HANDLE_LENGTH = 40;
