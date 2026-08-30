import { ensureHttp, mapsHref, telHref, waHref } from "./format";
import type { SiteLink } from "./types";

/** Resolves a link's stored value into an href the browser can follow. */
export function linkHref(link: Pick<SiteLink, "kind" | "value">): string {
  const v = (link.value ?? "").trim();
  if (!v) return "#";
  switch (link.kind) {
    case "call":
      return telHref(v);
    case "sms":
      return `sms:${v.replace(/[^\d+]/g, "")}`;
    case "email":
      return v.startsWith("mailto:") ? v : `mailto:${v}`;
    case "whatsapp":
      return v.startsWith("http") ? v : waHref(v);
    case "maps":
      return v.startsWith("http") ? v : mapsHref(v);
    default:
      return ensureHttp(v);
  }
}

/** Links that open outside the page get target=_blank. */
export function isExternal(kind: string, href: string): boolean {
  if (href.startsWith("#")) return false;
  return !["call", "sms", "email", "whatsapp"].includes(kind) && /^https?:/i.test(href);
}

export const LINK_KIND_OPTIONS: { value: string; label: string; group: string; placeholder: string }[] = [
  { value: "link", label: "Website / custom link", group: "General", placeholder: "https://example.com" },
  { value: "form", label: "Enquiry form (on this page)", group: "General", placeholder: "#enquire" },
  { value: "file", label: "File or download", group: "General", placeholder: "https://example.com/guide.pdf" },
  { value: "payment", label: "Payment or checkout", group: "General", placeholder: "https://buy.stripe.com/..." },
  { value: "review", label: "Reviews", group: "General", placeholder: "https://g.page/.../review" },
  { value: "call", label: "Phone call", group: "Contact", placeholder: "+1 555 000 1234" },
  { value: "sms", label: "Text message", group: "Contact", placeholder: "+1 555 000 1234" },
  { value: "whatsapp", label: "WhatsApp", group: "Contact", placeholder: "+1 555 000 1234" },
  { value: "email", label: "Email", group: "Contact", placeholder: "you@business.com" },
  { value: "booking", label: "Booking / calendar", group: "Contact", placeholder: "https://cal.com/you" },
  { value: "maps", label: "Map / directions", group: "Contact", placeholder: "12 High Street, Town" },
  { value: "instagram", label: "Instagram", group: "Social", placeholder: "https://instagram.com/you" },
  { value: "tiktok", label: "TikTok", group: "Social", placeholder: "https://tiktok.com/@you" },
  { value: "linkedin", label: "LinkedIn", group: "Social", placeholder: "https://linkedin.com/in/you" },
  { value: "facebook", label: "Facebook", group: "Social", placeholder: "https://facebook.com/you" },
  { value: "youtube", label: "YouTube", group: "Social", placeholder: "https://youtube.com/@you" },
  { value: "x", label: "X", group: "Social", placeholder: "https://x.com/you" },
];

export function kindLabel(kind: string): string {
  return LINK_KIND_OPTIONS.find((o) => o.value === kind)?.label ?? kind;
}

export function kindPlaceholder(kind: string): string {
  return LINK_KIND_OPTIONS.find((o) => o.value === kind)?.placeholder ?? "https://example.com";
}
