import { all, get, id, json, now, run } from "./db";
import { DEFAULT_HOURS, DEFAULT_SECTIONS, DEFAULT_THEME } from "./themes";
import type {
  DayHours,
  Item,
  ItemStatus,
  Lead,
  LeadStatus,
  SectionConfig,
  Site,
  SiteEvent,
  SiteLink,
  SiteSeo,
  SiteStat,
  Testimonial,
  ThemeConfig,
} from "./types";

/* ------------------------------------------------------------------ sites */

type SiteRow = Omit<Site, "theme" | "layout" | "hours" | "gallery" | "stats" | "seo"> & {
  theme: string;
  layout: string;
  hours: string;
  gallery: string;
  stats: string;
  seo: string;
};

function mapSite(row: SiteRow | undefined): Site | null {
  if (!row) return null;
  return {
    ...row,
    theme: { ...DEFAULT_THEME, ...json<Partial<ThemeConfig>>(row.theme, {}) },
    layout: normaliseSections(json<SectionConfig[]>(row.layout, [])),
    hours: json<DayHours[]>(row.hours, DEFAULT_HOURS),
    gallery: json<string[]>(row.gallery, []),
    stats: json<SiteStat[]>(row.stats, []),
    seo: json<SiteSeo>(row.seo, { title: "", description: "" }),
  };
}

/** Guarantees every known section exists exactly once, preserving saved order. */
function normaliseSections(saved: SectionConfig[]): SectionConfig[] {
  const seen = new Set<string>();
  const out: SectionConfig[] = [];
  for (const s of saved) {
    const known = DEFAULT_SECTIONS.find((d) => d.id === s.id);
    if (!known || seen.has(s.id)) continue;
    seen.add(s.id);
    out.push({ id: s.id, title: s.title || known.title, enabled: !!s.enabled });
  }
  for (const d of DEFAULT_SECTIONS) {
    if (!seen.has(d.id)) out.push({ ...d });
  }
  return out;
}

export function siteByUser(userId: string): Site | null {
  return mapSite(get<SiteRow>("SELECT * FROM sites WHERE user_id = ? ORDER BY created_at LIMIT 1", userId));
}

export function siteBySlug(slug: string): Site | null {
  return mapSite(get<SiteRow>("SELECT * FROM sites WHERE slug = ?", slug.toLowerCase()));
}

export function siteById(siteId: string): Site | null {
  return mapSite(get<SiteRow>("SELECT * FROM sites WHERE id = ?", siteId));
}

export function allSites(): Site[] {
  return all<SiteRow>("SELECT * FROM sites ORDER BY created_at DESC").map((r) => mapSite(r)!);
}

export function slugTaken(slug: string, exceptSiteId?: string): boolean {
  const row = get<{ id: string }>("SELECT id FROM sites WHERE slug = ?", slug.toLowerCase());
  return !!row && row.id !== exceptSiteId;
}

export function uniqueSlug(base: string): string {
  const clean = slugify(base) || "page";
  let candidate = clean;
  let n = 1;
  while (slugTaken(candidate)) candidate = `${clean}-${++n}`;
  return candidate;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function createSite(userId: string, input: Partial<Site>): Site {
  const sid = id("site");
  const slug = uniqueSlug(input.slug || input.business_name || "page");
  run(
    `INSERT INTO sites (id, user_id, slug, business_name, owner_name, headline, tagline, bio, business_type,
      avatar_url, cover_url, logo_url, location, address, phone, email, whatsapp, website, credential,
      verified, published, theme, layout, hours, gallery, stats, seo, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    sid,
    userId,
    slug,
    input.business_name ?? "",
    input.owner_name ?? "",
    input.headline ?? "",
    input.tagline ?? "",
    input.bio ?? "",
    input.business_type ?? "other",
    input.avatar_url ?? null,
    input.cover_url ?? null,
    input.logo_url ?? null,
    input.location ?? "",
    input.address ?? "",
    input.phone ?? "",
    input.email ?? "",
    input.whatsapp ?? "",
    input.website ?? "",
    input.credential ?? "",
    input.verified ?? 0,
    input.published ?? 1,
    JSON.stringify(input.theme ?? DEFAULT_THEME),
    JSON.stringify(input.layout ?? DEFAULT_SECTIONS),
    JSON.stringify(input.hours ?? DEFAULT_HOURS),
    JSON.stringify(input.gallery ?? []),
    JSON.stringify(input.stats ?? []),
    JSON.stringify(input.seo ?? { title: "", description: "" }),
    now(),
    now(),
  );
  return siteById(sid)!;
}

const SITE_SCALARS = [
  "slug", "business_name", "owner_name", "headline", "tagline", "bio", "business_type",
  "avatar_url", "cover_url", "logo_url", "location", "address", "phone", "email",
  "whatsapp", "website", "credential", "verified", "published",
] as const;

const SITE_JSON = ["theme", "layout", "hours", "gallery", "stats", "seo"] as const;

export function updateSite(siteId: string, patch: Partial<Site>): Site | null {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const key of SITE_SCALARS) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push((patch as Record<string, unknown>)[key] ?? null);
    }
  }
  for (const key of SITE_JSON) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(JSON.stringify((patch as Record<string, unknown>)[key]));
    }
  }
  if (!sets.length) return siteById(siteId);
  sets.push("updated_at = ?");
  params.push(now(), siteId);
  run(`UPDATE sites SET ${sets.join(", ")} WHERE id = ?`, ...params);
  return siteById(siteId);
}

/* ------------------------------------------------------------------ links */

type LinkRow = SiteLink;

export function linksForSite(siteId: string, onlyActive = false): SiteLink[] {
  return all<LinkRow>(
    `SELECT * FROM links WHERE site_id = ?${onlyActive ? " AND active = 1" : ""} ORDER BY position, created_at`,
    siteId,
  );
}

export function linkById(linkId: string): SiteLink | undefined {
  return get<LinkRow>("SELECT * FROM links WHERE id = ?", linkId);
}

export function createLink(siteId: string, input: Partial<SiteLink>): SiteLink {
  const lid = id("lnk");
  const max = get<{ m: number | null }>("SELECT MAX(position) AS m FROM links WHERE site_id = ?", siteId);
  run(
    `INSERT INTO links (id, site_id, kind, label, sublabel, value, position, active, highlight, is_action, clicks, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    lid,
    siteId,
    input.kind ?? "link",
    input.label ?? "",
    input.sublabel ?? "",
    input.value ?? "",
    input.position ?? (max?.m ?? -1) + 1,
    input.active ?? 1,
    input.highlight ?? 0,
    input.is_action ?? 0,
    0,
    now(),
  );
  return linkById(lid)!;
}

export function updateLink(linkId: string, patch: Partial<SiteLink>): void {
  const keys = ["kind", "label", "sublabel", "value", "position", "active", "highlight", "is_action"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const k of keys) {
    if (k in patch) {
      sets.push(`${k} = ?`);
      params.push((patch as Record<string, unknown>)[k]);
    }
  }
  if (!sets.length) return;
  params.push(linkId);
  run(`UPDATE links SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteLink(linkId: string): void {
  run("DELETE FROM links WHERE id = ?", linkId);
}

export function reorderLinks(siteId: string, orderedIds: string[]): void {
  orderedIds.forEach((linkId, index) => {
    run("UPDATE links SET position = ? WHERE id = ? AND site_id = ?", index, linkId, siteId);
  });
}

/* ------------------------------------------------------------------ items */

type ItemRow = Omit<Item, "images" | "specs" | "features"> & {
  images: string;
  specs: string;
  features: string;
};

function mapItem(row: ItemRow | undefined): Item | null {
  if (!row) return null;
  return {
    ...row,
    images: json<string[]>(row.images, []),
    specs: json<Item["specs"]>(row.specs, []),
    features: json<string[]>(row.features, []),
  };
}

export function itemsForSite(siteId: string, onlyActive = false): Item[] {
  return all<ItemRow>(
    `SELECT * FROM items WHERE site_id = ?${onlyActive ? " AND active = 1" : ""} ORDER BY featured DESC, position, created_at DESC`,
    siteId,
  ).map((r) => mapItem(r)!);
}

export function itemById(itemId: string): Item | null {
  return mapItem(get<ItemRow>("SELECT * FROM items WHERE id = ?", itemId));
}

export function createItem(siteId: string, input: Partial<Item>): Item {
  const iid = id("itm");
  const max = get<{ m: number | null }>("SELECT MAX(position) AS m FROM items WHERE site_id = ?", siteId);
  run(
    `INSERT INTO items (id, site_id, title, subtitle, description, price, price_note, currency, status, category,
      location, images, specs, features, cta_label, cta_url, position, featured, active, views, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    iid,
    siteId,
    input.title ?? "Untitled",
    input.subtitle ?? "",
    input.description ?? "",
    input.price ?? null,
    input.price_note ?? "",
    input.currency ?? "USD",
    input.status ?? "available",
    input.category ?? "",
    input.location ?? "",
    JSON.stringify(input.images ?? []),
    JSON.stringify(input.specs ?? []),
    JSON.stringify(input.features ?? []),
    input.cta_label ?? "",
    input.cta_url ?? "",
    input.position ?? (max?.m ?? -1) + 1,
    input.featured ?? 0,
    input.active ?? 1,
    0,
    now(),
    now(),
  );
  return itemById(iid)!;
}

export function updateItem(itemId: string, patch: Partial<Item>): void {
  const scalars = [
    "title", "subtitle", "description", "price", "price_note", "currency", "status",
    "category", "location", "cta_label", "cta_url", "position", "featured", "active",
  ] as const;
  const jsonKeys = ["images", "specs", "features"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const k of scalars) {
    if (k in patch) {
      sets.push(`${k} = ?`);
      params.push((patch as Record<string, unknown>)[k] ?? null);
    }
  }
  for (const k of jsonKeys) {
    if (k in patch) {
      sets.push(`${k} = ?`);
      params.push(JSON.stringify((patch as Record<string, unknown>)[k]));
    }
  }
  if (!sets.length) return;
  sets.push("updated_at = ?");
  params.push(now(), itemId);
  run(`UPDATE items SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteItem(itemId: string): void {
  run("DELETE FROM items WHERE id = ?", itemId);
}

export function reorderItems(siteId: string, orderedIds: string[]): void {
  orderedIds.forEach((itemId, index) => {
    run("UPDATE items SET position = ? WHERE id = ? AND site_id = ?", index, itemId, siteId);
  });
}

export function itemCategories(siteId: string): string[] {
  return all<{ category: string }>(
    "SELECT DISTINCT category FROM items WHERE site_id = ? AND category <> '' ORDER BY category",
    siteId,
  ).map((r) => r.category);
}

/* ------------------------------------------------------------------ leads */

export function leadsForSite(siteId: string, status?: LeadStatus): Lead[] {
  return status
    ? all<Lead>("SELECT * FROM leads WHERE site_id = ? AND status = ? ORDER BY created_at DESC", siteId, status)
    : all<Lead>("SELECT * FROM leads WHERE site_id = ? ORDER BY created_at DESC", siteId);
}

export function leadById(leadId: string): Lead | undefined {
  return get<Lead>("SELECT * FROM leads WHERE id = ?", leadId);
}

export function createLead(siteId: string, input: Partial<Lead>): Lead {
  const lid = id("lead");
  run(
    `INSERT INTO leads (id, site_id, item_id, name, email, phone, message, source, status, notes, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    lid,
    siteId,
    input.item_id ?? null,
    input.name ?? "",
    input.email ?? "",
    input.phone ?? "",
    input.message ?? "",
    input.source ?? "page",
    input.status ?? "new",
    input.notes ?? "",
    input.created_at ?? now(),
  );
  return leadById(lid)!;
}

export function updateLead(leadId: string, patch: Partial<Lead>): void {
  const keys = ["status", "notes", "name", "email", "phone"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const k of keys) {
    if (k in patch) {
      sets.push(`${k} = ?`);
      params.push((patch as Record<string, unknown>)[k]);
    }
  }
  if (!sets.length) return;
  params.push(leadId);
  run(`UPDATE leads SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteLead(leadId: string): void {
  run("DELETE FROM leads WHERE id = ?", leadId);
}

/* ----------------------------------------------------------- testimonials */

export function testimonialsForSite(siteId: string, onlyActive = false): Testimonial[] {
  return all<Testimonial>(
    `SELECT * FROM testimonials WHERE site_id = ?${onlyActive ? " AND active = 1" : ""} ORDER BY position`,
    siteId,
  );
}

export function createTestimonial(siteId: string, input: Partial<Testimonial>): Testimonial {
  const tid = id("tst");
  const max = get<{ m: number | null }>("SELECT MAX(position) AS m FROM testimonials WHERE site_id = ?", siteId);
  run(
    `INSERT INTO testimonials (id, site_id, author, role, quote, rating, avatar_url, position, active)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    tid,
    siteId,
    input.author ?? "",
    input.role ?? "",
    input.quote ?? "",
    input.rating ?? 5,
    input.avatar_url ?? null,
    input.position ?? (max?.m ?? -1) + 1,
    input.active ?? 1,
  );
  return get<Testimonial>("SELECT * FROM testimonials WHERE id = ?", tid)!;
}

export function updateTestimonial(tid: string, patch: Partial<Testimonial>): void {
  const keys = ["author", "role", "quote", "rating", "active", "position"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const k of keys) {
    if (k in patch) {
      sets.push(`${k} = ?`);
      params.push((patch as Record<string, unknown>)[k]);
    }
  }
  if (!sets.length) return;
  params.push(tid);
  run(`UPDATE testimonials SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteTestimonial(tid: string): void {
  run("DELETE FROM testimonials WHERE id = ?", tid);
}

/* ----------------------------------------------------------------- events */

export function recordEvent(siteId: string, input: Partial<SiteEvent>): void {
  run(
    `INSERT INTO events (id, site_id, kind, target_id, target_label, referrer, device, created_at)
     VALUES (?,?,?,?,?,?,?,?)`,
    id("evt"),
    siteId,
    input.kind ?? "view",
    input.target_id ?? null,
    input.target_label ?? "",
    input.referrer ?? "",
    input.device ?? "",
    input.created_at ?? now(),
  );
}

export const STATUS_ORDER: ItemStatus[] = ["available", "featured_deal", "pending", "coming_soon", "sold"];
