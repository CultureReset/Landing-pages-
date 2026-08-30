import { all, get, id, json, now, run } from "./db";
import { DEFAULT_HOURS, DEFAULT_SECTIONS, DEFAULT_THEME } from "./themes";
import { isReservedHandle } from "@/config/reserved";
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
  const row = get<{ id: string }>("SELECT id FROM sites WHERE lower(slug) = ?", slug.toLowerCase());
  return !!row && row.id !== exceptSiteId;
}

/** True when SQLite rejected a write because a unique index already holds it. */
function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed/i.test(error.message);
}

/**
 * A free handle suggestion. Advisory only — two simultaneous signups can be
 * handed the same answer, so the write path must still handle a collision.
 */
export function uniqueSlug(base: string): string {
  const clean = slugify(base) || "page";
  let candidate = clean;
  let n = 1;
  while (isReservedHandle(candidate) || slugTaken(candidate)) {
    candidate = `${clean}-${++n}`;
  }
  return candidate;
}

/** Appends a short random suffix, for retrying after a collision. */
function jitterSlug(base: string): string {
  const clean = slugify(base) || "page";
  return `${clean}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Claims a handle for an existing site. Returns false when another tenant
 * already holds it. The unique index is the arbiter, not a prior read, so two
 * concurrent claims cannot both succeed.
 */
export function claimHandle(siteId: string, handle: string): boolean {
  const slug = slugify(handle);
  if (!slug || isReservedHandle(slug)) return false;
  try {
    run("UPDATE sites SET slug = ?, updated_at = ? WHERE id = ?", slug, now(), siteId);
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
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
  const base = input.slug || input.business_name || "page";
  // Retry rather than trust the pre-read: concurrent signups race for handles.
  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = attempt === 0 ? uniqueSlug(base) : jitterSlug(base);
    try {
      return insertSite(userId, slug, input);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new Error("Could not allocate a unique handle after several attempts");
}

function insertSite(userId: string, slug: string, input: Partial<Site>): Site {
  const sid = id("site");
  run(
    `INSERT INTO sites (id, user_id, slug, business_name, owner_name, headline, tagline, bio, business_type,
      avatar_url, cover_url, logo_url, location, address, phone, email, whatsapp, website, credential,
      verified, published, featured, suspended, theme, layout, hours, gallery, stats, seo,
      created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
    input.featured ?? 0,
    input.suspended ?? 0,
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
  "whatsapp", "website", "credential", "verified", "published", "featured", "suspended",
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

/* ------------------------------------------------------- counts & scoping */

function count(sql: string, ...params: unknown[]): number {
  return get<{ c: number }>(sql, ...params)?.c ?? 0;
}

export function countItems(siteId: string): number {
  return count("SELECT COUNT(*) AS c FROM items WHERE site_id = ?", siteId);
}

export function countLinks(siteId: string, isAction: boolean): number {
  return count(
    "SELECT COUNT(*) AS c FROM links WHERE site_id = ? AND is_action = ?",
    siteId,
    isAction ? 1 : 0,
  );
}

export function countTestimonials(siteId: string): number {
  return count("SELECT COUNT(*) AS c FROM testimonials WHERE site_id = ?", siteId);
}

export function storageUsedBytes(siteId: string): number {
  return get<{ total: number | null }>(
    "SELECT COALESCE(SUM(size), 0) AS total FROM media WHERE site_id = ?",
    siteId,
  )?.total ?? 0;
}

/** Sites belonging to a known set of users — used by the team roll-up. */
export function sitesForUsers(userIds: string[]): Site[] {
  if (!userIds.length) return [];
  const marks = userIds.map(() => "?").join(",");
  return all<SiteRow>(`SELECT * FROM sites WHERE user_id IN (${marks})`, ...userIds).map(
    (r) => mapSite(r)!,
  );
}

/**
 * Pages the operator has explicitly featured. Customer pages are never
 * advertised automatically — featuring is an opt-in an admin performs.
 */
export function featuredSites(limit = 6): Site[] {
  return all<SiteRow>(
    `SELECT * FROM sites
     WHERE featured = 1 AND published = 1 AND suspended = 0
     ORDER BY created_at LIMIT ?`,
    limit,
  ).map((r) => mapSite(r)!);
}

export function setFeatured(siteId: string, featured: boolean): void {
  run("UPDATE sites SET featured = ? WHERE id = ?", featured ? 1 : 0, siteId);
}

export function setSuspended(siteId: string, suspended: boolean): void {
  run("UPDATE sites SET suspended = ? WHERE id = ?", suspended ? 1 : 0, siteId);
}

/* ------------------------------------------------------- operator queries */

export interface TenantSummary {
  site_id: string;
  slug: string;
  business_name: string;
  business_type: string;
  published: number;
  featured: number;
  suspended: number;
  created_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
  plan: string;
  items: number;
  leads: number;
  views: number;
}

export function tenantSummaries(options: { query?: string; limit?: number; offset?: number } = {}) {
  const { query = "", limit = 50, offset = 0 } = options;
  const like = `%${query.toLowerCase()}%`;
  const where = query
    ? `WHERE lower(s.slug) LIKE ? OR lower(s.business_name) LIKE ? OR lower(u.email) LIKE ? OR lower(u.name) LIKE ?`
    : "";
  const params = query ? [like, like, like, like] : [];

  const rows = all<TenantSummary>(
    `SELECT s.id AS site_id, s.slug, s.business_name, s.business_type, s.published,
            s.featured, s.suspended, s.created_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email, u.plan,
            (SELECT COUNT(*) FROM items i WHERE i.site_id = s.id) AS items,
            (SELECT COUNT(*) FROM leads l WHERE l.site_id = s.id) AS leads,
            (SELECT COUNT(*) FROM events e WHERE e.site_id = s.id AND e.kind = 'view') AS views
     FROM sites s
     JOIN users u ON u.id = s.user_id
     ${where}
     ORDER BY s.created_at DESC
     LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );

  const total = count(
    `SELECT COUNT(*) AS c FROM sites s JOIN users u ON u.id = s.user_id ${where}`,
    ...params,
  );

  return { rows, total };
}

export function platformStats() {
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();
  return {
    tenants: count("SELECT COUNT(*) AS c FROM sites"),
    published: count("SELECT COUNT(*) AS c FROM sites WHERE published = 1 AND suspended = 0"),
    users: count("SELECT COUNT(*) AS c FROM users"),
    newThisMonth: count("SELECT COUNT(*) AS c FROM users WHERE created_at >= ?", since30),
    leads: count("SELECT COUNT(*) AS c FROM leads"),
    views30: count("SELECT COUNT(*) AS c FROM events WHERE kind = 'view' AND created_at >= ?", since30),
    storageBytes:
      get<{ total: number | null }>("SELECT COALESCE(SUM(size), 0) AS total FROM media")?.total ?? 0,
    byPlan: all<{ plan: string; c: number }>(
      "SELECT plan, COUNT(*) AS c FROM users GROUP BY plan ORDER BY c DESC",
    ),
  };
}
