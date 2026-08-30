import { itemsForSite, linksForSite, siteBySlug, testimonialsForSite } from "./repo";
import type { PageDataResult } from "./types-page";

export function loadPageData(slug: string): PageDataResult | null {
  const site = siteBySlug(slug);
  if (!site) return null;
  const links = linksForSite(site.id, true);
  return {
    site,
    actions: links.filter((l) => l.is_action === 1),
    links: links.filter((l) => l.is_action !== 1),
    items: itemsForSite(site.id, true),
    testimonials: testimonialsForSite(site.id, true),
  };
}
