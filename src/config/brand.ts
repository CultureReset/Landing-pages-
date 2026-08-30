/**
 * Everything that identifies *your* product rather than the software.
 * Change this file to white-label the whole platform — nothing outside it
 * should contain your brand name.
 */

const env = (key: string, fallback: string) => process.env[key]?.trim() || fallback;

export const brand = {
  /** Product name, used in navigation, titles, emails and the page footer. */
  name: env("NEXT_PUBLIC_BRAND_NAME", "Frontdesk"),

  /** One line under the name wherever a strapline is shown. */
  tagline: env("NEXT_PUBLIC_BRAND_TAGLINE", "Turn interest into the first interaction."),

  /** Used for canonical URLs, QR targets and share links. */
  url: env("NEXT_PUBLIC_BASE_URL", "http://localhost:3000").replace(/\/$/, ""),

  /**
   * URL segment public pages live under, i.e. /{pagePrefix}/{handle}.
   * Changing this also means renaming `src/app/p` to match — it is the one
   * structural value Next's file router cannot read from config.
   */
  pagePrefix: env("NEXT_PUBLIC_PAGE_PREFIX", "p"),

  /** Shown in the footer of every public page. Set to false to remove it. */
  showPoweredBy: env("NEXT_PUBLIC_SHOW_POWERED_BY", "true") !== "false",

  support: {
    privacy: env("SUPPORT_PRIVACY_EMAIL", "privacy@frontdesk.example"),
    billing: env("SUPPORT_BILLING_EMAIL", "billing@frontdesk.example"),
    general: env("SUPPORT_EMAIL", "hello@frontdesk.example"),
  },

  /** Accent used by the marketing site and dashboard chrome. */
  accent: "#f8481a",
} as const;

/** Path to a tenant's public page. Always build links through this. */
export function pagePath(handle: string): string {
  return `/${brand.pagePrefix}/${handle}`;
}

/** Absolute URL to a tenant's public page. */
export function pageUrl(handle: string, origin?: string): string {
  return `${(origin ?? brand.url).replace(/\/$/, "")}${pagePath(handle)}`;
}

/** Path to a single showcase entry on a tenant's page. */
export function itemPath(handle: string, itemId: string): string {
  return `${pagePath(handle)}/i/${itemId}`;
}
