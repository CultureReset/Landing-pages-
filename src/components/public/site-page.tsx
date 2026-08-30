import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { backdropStyle, themeVars } from "@/lib/themes";
import { vocab } from "@/lib/vocab";
import type { Item, Site, SiteLink, Testimonial } from "@/lib/types";
import { ActionRow, LinkStack, StatRow } from "./actions";
import { Section } from "./chrome";
import { Gallery } from "./gallery";
import { PublicHeader } from "./header";
import { LeadForm } from "./lead-form";
import { About, Hours, MapBlock, Testimonials } from "./sections";
import { ShareButton } from "./share";
import { Showcase } from "./showcase";
import { TrackView } from "./track";

export interface PageData {
  site: Site;
  actions: SiteLink[];
  links: SiteLink[];
  items: Item[];
  testimonials: Testimonial[];
}

/** Renders a business's public page. `preview` disables tracking + the footer. */
export function SitePage({ data, preview = false }: { data: PageData; preview?: boolean }) {
  const { site, actions, links, items, testimonials } = data;
  const v = vocab(site.business_type);
  const enabled = new Map<string, (typeof site.layout)[number]>(site.layout.map((s) => [s.id as string, s]));

  const has = (id: string) => enabled.get(id)?.enabled !== false;
  const title = (id: string, fallback: string) => enabled.get(id)?.title || fallback;

  const blocks: { id: string; node: React.ReactNode }[] = [
    {
      id: "actions",
      node: actions.length ? (
        <Section key="actions">
          <ActionRow siteId={site.id} actions={actions} theme={site.theme} slug={site.slug} />
        </Section>
      ) : null,
    },
    {
      id: "stats",
      node: site.stats.length ? (
        <Section key="stats">
          <StatRow stats={site.stats} />
        </Section>
      ) : null,
    },
    {
      id: "showcase",
      node: items.length ? (
        <Section key="showcase" title={title("showcase", v.itemPlural)}>
          <Showcase site={site} items={items} />
        </Section>
      ) : null,
    },
    {
      id: "links",
      node: links.length ? (
        <Section key="links" title={title("links", "Links")}>
          <LinkStack siteId={site.id} links={links} theme={site.theme} />
        </Section>
      ) : null,
    },
    {
      id: "gallery",
      node: site.gallery.length ? (
        <Section key="gallery" title={title("gallery", "Gallery")}>
          <Gallery images={site.gallery} />
        </Section>
      ) : null,
    },
    {
      id: "about",
      node: site.bio ? (
        <Section key="about" title={title("about", `About ${site.owner_name.split(" ")[0] || site.business_name}`)}>
          <About site={site} />
        </Section>
      ) : null,
    },
    {
      id: "testimonials",
      node: testimonials.length ? (
        <Section key="testimonials" title={title("testimonials", "What clients say")}>
          <Testimonials items={testimonials} />
        </Section>
      ) : null,
    },
    {
      id: "hours",
      node: site.hours.length ? (
        <Section key="hours" title={title("hours", "Hours")}>
          <Hours hours={site.hours} />
        </Section>
      ) : null,
    },
    {
      id: "lead_form",
      node: (
        <Section key="lead_form" title={title("lead_form", "Send a message")} id="enquire-section">
          <LeadForm siteId={site.id} ownerName={site.owner_name || site.business_name} />
        </Section>
      ),
    },
    {
      id: "map",
      node: site.address ? (
        <Section key="map" title={title("map", "Find us")}>
          <MapBlock site={site} />
        </Section>
      ) : null,
    },
  ];

  const ordered = site.layout
    .filter((s) => s.enabled)
    .map((s) => blocks.find((b) => b.id === s.id))
    .filter(Boolean) as { id: string; node: React.ReactNode }[];

  return (
    <div
      className="min-h-screen"
      style={{ ...themeVars(site.theme), background: "var(--s-bg)", color: "var(--s-text)", fontFamily: "var(--s-font)" }}
    >
      <div style={backdropStyle(site.theme, site.cover_url)}>
        <div className="mx-auto max-w-[600px] px-5 pb-16">
          {!preview && <TrackView siteId={site.id} />}

          <div className="flex justify-end pt-4">
            {!preview && <ShareButton siteId={site.id} slug={site.slug} name={site.business_name} />}
          </div>

          <PublicHeader site={site} />

          {ordered.map((b) => (has(b.id) ? b.node : null))}

          {!preview && (
            <footer className="mt-14 border-t pt-6 text-center" style={{ borderColor: "var(--s-border)" }}>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium opacity-60 transition-opacity hover:opacity-100"
                style={{ color: "var(--s-muted)" }}
              >
                <Icon name="bolt" size={13} />
                Built with Frontdesk
              </Link>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
