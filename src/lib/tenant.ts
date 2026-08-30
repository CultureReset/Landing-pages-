import "server-only";
import { get } from "./db";
import { requireSite } from "./guard";
import { itemById, leadById, linkById } from "./repo";
import type { Item, Lead, SessionUser, Site, SiteLink, Testimonial } from "./types";

/**
 * Every mutation that accepts an id from the client goes through one of these.
 *
 * The rule: a row is only reachable if its `site_id` matches the site owned by
 * the caller's session. Ids are unguessable, but that is defence in depth, not
 * the control — this is the control.
 */

export interface TenantContext {
  user: SessionUser;
  site: Site;
}

export async function tenant(): Promise<TenantContext> {
  return requireSite();
}

/** Result of an ownership lookup: the row plus the context that owns it. */
export type Owned<T> = (TenantContext & { row: T }) | null;

async function scoped<T extends { site_id: string }>(
  id: string,
  load: (id: string) => T | null | undefined,
): Promise<Owned<T>> {
  const ctx = await tenant();
  if (!id) return null;
  const row = load(id);
  if (!row || row.site_id !== ctx.site.id) return null;
  return { ...ctx, row };
}

export function ownedItem(id: string): Promise<Owned<Item>> {
  return scoped<Item>(id, (x) => itemById(x));
}

export function ownedLink(id: string): Promise<Owned<SiteLink>> {
  return scoped<SiteLink>(id, (x) => linkById(x));
}

export function ownedLead(id: string): Promise<Owned<Lead>> {
  return scoped<Lead>(id, (x) => leadById(x));
}

export function ownedTestimonial(id: string): Promise<Owned<Testimonial>> {
  return scoped<Testimonial>(id, (x) =>
    get<Testimonial>("SELECT * FROM testimonials WHERE id = ?", x),
  );
}

/**
 * Media is served publicly (it is on public pages), but deleting or accounting
 * for it must still be tenant-scoped.
 */
export async function ownedMedia(id: string): Promise<Owned<{ id: string; site_id: string; size: number }>> {
  return scoped<{ id: string; site_id: string; size: number }>(id, (x) =>
    get<{ id: string; site_id: string; size: number }>(
      "SELECT id, site_id, size FROM media WHERE id = ?",
      x,
    ),
  );
}

/** Standard refusal, worded the same everywhere so it is never a hint. */
export const NOT_YOURS = "That item no longer exists.";
