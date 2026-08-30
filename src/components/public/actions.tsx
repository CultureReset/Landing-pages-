"use client";

import { Icon, KIND_ICON } from "@/components/ui/icon";
import { linkHref, isExternal } from "@/lib/links";
import type { SiteLink, SiteStat, ThemeConfig } from "@/lib/types";
import { track } from "./track";

export function ActionRow({
  siteId,
  actions,
  theme,
  slug,
}: {
  siteId: string;
  actions: SiteLink[];
  theme: ThemeConfig;
  slug: string;
}) {
  const items = [
    ...actions.map((a) => ({
      key: a.id,
      icon: KIND_ICON[a.kind] ?? "link",
      label: a.label || a.kind,
      href: linkHref(a),
      external: isExternal(a.kind, linkHref(a)),
      onClick: () => track(siteId, "action_click", a.id, a.label || a.kind),
    })),
    {
      key: "save",
      icon: "download",
      label: "Save contact",
      href: `/api/vcard/${slug}`,
      external: false,
      onClick: () => track(siteId, "save_contact", null, "Save contact"),
    },
  ];

  const solid = theme.buttonStyle === "solid";

  return (
    <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0">
      {items.map((a) => (
        <a
          key={a.key}
          href={a.href}
          target={a.external ? "_blank" : undefined}
          rel={a.external ? "noopener noreferrer" : undefined}
          onClick={a.onClick}
          className="group flex min-w-[74px] flex-col items-center gap-2 py-3 text-center transition-transform active:scale-95"
          style={{
            background: solid ? "var(--s-surface)" : "transparent",
            border: `1px solid var(--s-border)`,
            borderRadius: "var(--s-card-radius)",
          }}
        >
          <span
            className="grid size-9 place-items-center rounded-full transition-colors"
            style={{ background: "var(--s-accent)", color: "var(--s-accent-text)" }}
          >
            <Icon name={a.icon} size={17} strokeWidth={1.8} />
          </span>
          <span className="px-1 text-[11.5px] font-medium leading-tight">{a.label}</span>
        </a>
      ))}
    </div>
  );
}

export function LinkStack({
  siteId,
  links,
  theme,
}: {
  siteId: string;
  links: SiteLink[];
  theme: ThemeConfig;
}) {
  if (!links.length) return null;
  return (
    <div className="space-y-2.5">
      {links.map((l) => {
        const href = linkHref(l);
        const external = isExternal(l.kind, href);
        const highlight = l.highlight === 1;
        const filled = highlight || theme.buttonStyle === "solid";
        return (
          <a
            key={l.id}
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            onClick={() => track(siteId, "link_click", l.id, l.label)}
            className="group flex items-center gap-3.5 px-4 py-3.5 transition-all duration-150 hover:-translate-y-px active:scale-[0.99]"
            style={{
              background: highlight
                ? "var(--s-accent)"
                : filled
                  ? "var(--s-surface)"
                  : "transparent",
              color: highlight ? "var(--s-accent-text)" : "var(--s-text)",
              border: `1px solid ${highlight ? "transparent" : "var(--s-border)"}`,
              borderRadius: "var(--s-radius)",
            }}
          >
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full"
              style={{
                background: highlight ? "rgba(0,0,0,0.12)" : "var(--s-bg)",
                border: highlight ? "none" : `1px solid var(--s-border)`,
              }}
            >
              <Icon name={KIND_ICON[l.kind] ?? "link"} size={16} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-medium leading-snug">{l.label}</span>
              {l.sublabel && (
                <span
                  className="mt-0.5 block truncate text-[12.5px]"
                  style={{ color: highlight ? "inherit" : "var(--s-muted)", opacity: highlight ? 0.75 : 1 }}
                >
                  {l.sublabel}
                </span>
              )}
            </span>
            <Icon
              name={external ? "arrowUpRight" : "chevron"}
              size={16}
              className="shrink-0 transition-transform group-hover:translate-x-0.5"
              style={{ color: highlight ? "inherit" : "var(--s-muted)", opacity: 0.7 }}
            />
          </a>
        );
      })}
    </div>
  );
}

export function StatRow({ stats }: { stats: SiteStat[] }) {
  if (!stats.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.slice(0, 3).map((s, i) => (
        <div
          key={s.label + i}
          className="px-3 py-3.5 text-center"
          style={{
            background: "var(--s-surface)",
            border: `1px solid var(--s-border)`,
            borderRadius: "var(--s-card-radius)",
          }}
        >
          <div className="text-[19px] font-semibold tracking-[-0.02em]">{s.value}</div>
          <div className="mt-0.5 text-[11px] leading-tight" style={{ color: "var(--s-muted)" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
