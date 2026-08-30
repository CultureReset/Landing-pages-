import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, KIND_ICON } from "@/components/ui/icon";
import { ItemGallery } from "@/components/public/item-gallery";
import { LeadForm } from "@/components/public/lead-form";
import { ItemCard } from "@/components/public/showcase";
import { TrackView } from "@/components/public/track";
import { money } from "@/lib/format";
import { linkHref, isExternal } from "@/lib/links";
import { itemById, linksForSite } from "@/lib/repo";
import { backdropStyle, themeVars } from "@/lib/themes";
import { loadPageData } from "@/lib/page-data";
import { vocab } from "@/lib/vocab";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}): Promise<Metadata> {
  const { slug, id } = await params;
  const data = loadPageData(slug);
  const item = itemById(id);
  if (!data || !item) return { title: "Not found" };
  return {
    title: `${item.title} · ${data.site.business_name}`,
    description: item.subtitle || item.description.slice(0, 160),
    openGraph: {
      title: item.title,
      description: item.subtitle || item.description.slice(0, 160),
      images: item.images[0] ? [item.images[0]] : undefined,
    },
  };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const data = loadPageData(slug);
  const item = itemById(id);
  if (!data || !item || item.site_id !== data.site.id || item.active !== 1) notFound();

  const { site } = data;
  const v = vocab(site.business_type);
  const actions = linksForSite(site.id, true).filter((l) => l.is_action === 1).slice(0, 3);
  const related = data.items.filter((i) => i.id !== item.id).slice(0, 4);
  const price = item.price != null ? money(item.price, item.currency) : item.price_note;

  return (
    <div
      className="min-h-screen"
      style={{ ...themeVars(site.theme), background: "var(--s-bg)", color: "var(--s-text)", fontFamily: "var(--s-font)" }}
    >
      <div style={backdropStyle(site.theme, null)}>
        <div className="mx-auto max-w-[600px] px-5 pb-16">
          <TrackView siteId={site.id} kind="item_view" targetId={item.id} label={item.title} />

          <div className="flex items-center justify-between py-4">
            <Link
              href={`/p/${site.slug}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--s-muted)" }}
            >
              <Icon name="chevron" size={15} className="rotate-180" />
              {site.business_name}
            </Link>
            <span
              className="px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]"
              style={{ borderRadius: 999, background: "var(--s-accent)", color: "var(--s-accent-text)" }}
            >
              {v.statusLabels[item.status] ?? item.status}
            </span>
          </div>

          <ItemGallery images={item.images} alt={item.title} />

          <div className="mt-5">
            {item.category && (
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--s-muted)" }}>
                {item.category}
              </p>
            )}
            <h1 className="mt-1.5 text-[26px] font-semibold leading-tight tracking-[-0.03em]">{item.title}</h1>
            {item.subtitle && (
              <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: "var(--s-muted)" }}>
                {item.subtitle}
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-[28px] font-semibold tracking-[-0.03em] tabular-nums">{price || "Enquire"}</span>
              {item.price != null && item.price_note && (
                <span className="text-[13px]" style={{ color: "var(--s-muted)" }}>
                  {item.price_note}
                </span>
              )}
            </div>

            {item.location && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[13px]" style={{ color: "var(--s-muted)" }}>
                <Icon name="pin" size={14} />
                {item.location}
              </p>
            )}
          </div>

          {actions.length > 0 && (
            <div className="mt-5 grid gap-2.5" style={{ gridTemplateColumns: `repeat(${actions.length}, minmax(0,1fr))` }}>
              {actions.map((a) => {
                const href = linkHref(a);
                return (
                  <a
                    key={a.id}
                    href={href}
                    target={isExternal(a.kind, href) ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 text-[13.5px] font-semibold transition-transform active:scale-[0.98]"
                    style={{
                      background: "var(--s-accent)",
                      color: "var(--s-accent-text)",
                      borderRadius: "var(--s-radius)",
                    }}
                  >
                    <Icon name={KIND_ICON[a.kind] ?? "link"} size={16} />
                    {a.label}
                  </a>
                );
              })}
            </div>
          )}

          {item.specs.length > 0 && (
            <div
              className="mt-6 grid grid-cols-2 overflow-hidden sm:grid-cols-3"
              style={{ border: `1px solid var(--s-border)`, borderRadius: "var(--s-card-radius)" }}
            >
              {item.specs.map((s, i) => (
                <div
                  key={s.label + i}
                  className="px-4 py-3"
                  style={{
                    borderRight: `1px solid var(--s-border)`,
                    borderTop: i >= 2 ? `1px solid var(--s-border)` : undefined,
                    background: "var(--s-surface)",
                  }}
                >
                  <div className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--s-muted)" }}>
                    {s.label}
                  </div>
                  <div className="mt-1 text-[14.5px] font-semibold tabular-nums">{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {item.description && (
            <div className="mt-6">
              <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--s-muted)" }}>
                Details
              </h2>
              <p className="whitespace-pre-line text-[15px] leading-[1.7]">{item.description}</p>
            </div>
          )}

          {item.features.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--s-muted)" }}>
                Highlights
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {item.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[14px]">
                    <Icon name="check" size={15} className="mt-0.5 shrink-0" style={{ color: "var(--s-accent)" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.cta_url && (
            <a
              href={item.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 text-[15px] font-semibold"
              style={{ background: "var(--s-accent)", color: "var(--s-accent-text)", borderRadius: "var(--s-radius)" }}
            >
              {item.cta_label || "Learn more"}
              <Icon name="arrowUpRight" size={16} />
            </a>
          )}

          <div className="mt-8">
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--s-muted)" }}>
              Ask about this {v.itemSingular.toLowerCase()}
            </h2>
            <LeadForm
              siteId={site.id}
              itemId={item.id}
              itemTitle={item.title}
              ownerName={site.owner_name || site.business_name}
              compact
            />
          </div>

          <div
            className="mt-8 flex items-center gap-3.5 px-4 py-4"
            style={{ background: "var(--s-surface)", border: `1px solid var(--s-border)`, borderRadius: "var(--s-card-radius)" }}
          >
            {site.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.avatar_url} alt="" className="size-12 rounded-full object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-semibold">{site.owner_name || site.business_name}</p>
              <p className="truncate text-[12.5px]" style={{ color: "var(--s-muted)" }}>
                {site.headline || site.business_name}
              </p>
            </div>
            <Link
              href={`/p/${site.slug}`}
              className="shrink-0 px-3.5 py-2 text-[12.5px] font-semibold"
              style={{ border: `1px solid var(--s-border)`, borderRadius: "var(--s-radius)" }}
            >
              View page
            </Link>
          </div>

          {related.length > 0 && (
            <div className="mt-9">
              <h2 className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--s-muted)" }}>
                More {v.itemPlural.toLowerCase()}
              </h2>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {related.map((r) => (
                  <ItemCard key={r.id} site={site} item={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
