"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { money } from "@/lib/format";
import { vocab } from "@/lib/vocab";
import { itemPath } from "@/config/brand";
import type { Item, Site } from "@/lib/types";
import { track } from "./track";

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  sold: { bg: "rgba(120,120,120,0.16)", fg: "var(--s-muted)" },
  pending: { bg: "rgba(180,120,20,0.18)", fg: "#d69a3c" },
  coming_soon: { bg: "rgba(60,120,220,0.18)", fg: "#79a8f5" },
  featured_deal: { bg: "var(--s-accent)", fg: "var(--s-accent-text)" },
  available: { bg: "rgba(30,160,110,0.16)", fg: "#3fbf8f" },
};

export function Showcase({ site, items }: { site: Site; items: Item[] }) {
  const v = vocab(site.business_type);
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
    [items],
  );
  const [filter, setFilter] = useState<string>("all");

  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
  const list = site.theme.showcase === "list";

  return (
    <div>
      {categories.length > 1 && (
        <div className="no-scrollbar -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {[{ id: "all", label: `All ${v.itemPlural.toLowerCase()}` }, ...categories.map((c) => ({ id: c, label: c }))].map(
            (c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className="shrink-0 whitespace-nowrap px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
                style={{
                  borderRadius: 999,
                  background: filter === c.id ? "var(--s-accent)" : "transparent",
                  color: filter === c.id ? "var(--s-accent-text)" : "var(--s-muted)",
                  border: `1px solid ${filter === c.id ? "transparent" : "var(--s-border)"}`,
                }}
              >
                {c.label}
              </button>
            ),
          )}
        </div>
      )}

      <div className={list ? "space-y-3" : "grid grid-cols-1 gap-3.5 sm:grid-cols-2"}>
        {visible.map((item) => (
          <ItemCard key={item.id} site={site} item={item} list={list} />
        ))}
      </div>

      {!visible.length && (
        <p className="py-8 text-center text-[13.5px]" style={{ color: "var(--s-muted)" }}>
          Nothing here yet.
        </p>
      )}
    </div>
  );
}

export function ItemCard({ site, item, list }: { site: Site; item: Item; list?: boolean }) {
  const v = vocab(site.business_type);
  const tone = STATUS_TONE[item.status] ?? STATUS_TONE.available;
  const price = item.price != null ? money(item.price, item.currency) : item.price_note;
  const dim = item.status === "sold";

  return (
    <Link
      href={itemPath(site.slug, item.id)}
      onClick={() => track(site.id, "item_view", item.id, item.title)}
      className={`group block overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${list ? "flex gap-0" : ""}`}
      style={{
        background: "var(--s-surface)",
        border: `1px solid var(--s-border)`,
        borderRadius: "var(--s-card-radius)",
      }}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-black/20 ${list ? "aspect-square w-[116px]" : "aspect-[4/3] w-full"}`}
      >
        {item.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.images[0]}
            alt={item.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ opacity: dim ? 0.55 : 1 }}
            loading="lazy"
          />
        ) : (
          <div className="grid size-full place-items-center" style={{ color: "var(--s-muted)" }}>
            <Icon name="image" size={22} />
          </div>
        )}
        {!list && (
          <span
            className="absolute left-2.5 top-2.5 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]"
            style={{ borderRadius: 999, background: tone.bg, color: tone.fg, backdropFilter: "blur(6px)" }}
          >
            {v.statusLabels[item.status] ?? item.status}
          </span>
        )}
        {item.featured === 1 && !list && (
          <span
            className="absolute right-2.5 top-2.5 grid size-6 place-items-center"
            style={{ borderRadius: 999, background: "var(--s-accent)", color: "var(--s-accent-text)" }}
            title="Featured"
          >
            <Icon name="star" size={12} strokeWidth={2} />
          </span>
        )}
      </div>

      <div className={`min-w-0 flex-1 ${list ? "px-3.5 py-3" : "px-4 py-3.5"}`}>
        {list && (
          <span
            className="mb-1.5 inline-block px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em]"
            style={{ borderRadius: 999, background: tone.bg, color: tone.fg }}
          >
            {v.statusLabels[item.status] ?? item.status}
          </span>
        )}
        <h3 className="truncate text-[14.5px] font-semibold tracking-[-0.01em]">{item.title}</h3>
        {item.subtitle && (
          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug" style={{ color: "var(--s-muted)" }}>
            {item.subtitle}
          </p>
        )}
        <div className="mt-2.5 flex items-baseline justify-between gap-2">
          <span className="text-[15px] font-semibold tabular-nums tracking-[-0.02em]">
            {price || "—"}
            {item.price != null && item.price_note && (
              <span className="ml-1 text-[11px] font-normal" style={{ color: "var(--s-muted)" }}>
                {item.price_note}
              </span>
            )}
          </span>
          <Icon
            name="arrowRight"
            size={15}
            className="shrink-0 transition-transform group-hover:translate-x-0.5"
            style={{ color: "var(--s-muted)" }}
          />
        </div>
        {!list && item.specs.length > 0 && (
          <div
            className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t pt-2.5 text-[11.5px]"
            style={{ borderColor: "var(--s-border)", color: "var(--s-muted)" }}
          >
            {item.specs.slice(0, 3).map((s) => (
              <span key={s.label}>
                <b className="font-semibold" style={{ color: "var(--s-text)" }}>
                  {s.value}
                </b>{" "}
                {s.label.toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
