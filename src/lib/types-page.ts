import type { Item, Site, SiteLink, Testimonial } from "./types";

export interface PageDataResult {
  site: Site;
  actions: SiteLink[];
  links: SiteLink[];
  items: Item[];
  testimonials: Testimonial[];
}
