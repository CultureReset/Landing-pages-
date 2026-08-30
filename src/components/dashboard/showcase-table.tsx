"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { ReorderList, Spinner, type ReorderHandle } from "@/components/ui/interactive";
import { Badge, Button, Card, EmptyState, Input, Select, cx } from "@/components/ui/primitives";
import { reorderItemsAction, toggleFeaturedAction, toggleItemAction } from "@/lib/actions/items";
import { money, relativeTime } from "@/lib/format";
import { itemPath } from "@/config/brand";
import type { Item, Vocabulary } from "@/lib/types";

const STATUS_TONE: Record<string, string> = {
  available: "positive",
  featured_deal: "brand",
  pending: "caution",
  coming_soon: "info",
  sold: "neutral",
};

export function ShowcaseTable({
  items,
  vocab,
  categories,
  slug,
}: {
  items: Item[];
  vocab: Vocabulary;
  categories: string[];
  slug: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        if (status !== "all" && i.status !== status) return false;
        if (category !== "all" && i.category !== category) return false;
        if (query) {
          const q = query.toLowerCase();
          if (
            !i.title.toLowerCase().includes(q) &&
            !i.subtitle.toLowerCase().includes(q) &&
            !i.category.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      }),
    [items, query, status, category],
  );

  const filtering = query !== "" || status !== "all" || category !== "all";

  if (!items.length) {
    return (
      <Card>
        <EmptyState
          icon="grid"
          title={`No ${vocab.itemPlural.toLowerCase()} yet`}
          description={`Add your first ${vocab.itemSingular.toLowerCase()} — a title, a photo and a price is enough to start.`}
          action={
            <Link href="/dashboard/showcase/new">
              <Button icon="plus">Add {vocab.itemSingular.toLowerCase()}</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-200 p-3">
        <div className="relative min-w-[180px] flex-1">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${vocab.itemPlural.toLowerCase()}…`}
            className="h-9 pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 w-auto min-w-[150px]">
          <option value="all">Any status</option>
          {Object.entries(vocab.statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        {categories.length > 0 && (
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 w-auto min-w-[150px]">
            <option value="all">Any {vocab.categoryLabel.toLowerCase()}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
        <span className="ml-auto text-[12.5px] text-ink-400">
          {filtered.length} of {items.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-12 text-center text-[13.5px] text-ink-400">
          Nothing matches those filters.
        </p>
      ) : filtering ? (
        <div className="p-3">
          {filtered.map((item) => (
            <Row key={item.id} item={item} vocab={vocab} slug={slug} />
          ))}
        </div>
      ) : (
        <div className="p-3">
          <ReorderList ids={filtered.map((i) => i.id)} onReorder={reorderItemsAction}>
            {(id, handle) => {
              const item = filtered.find((i) => i.id === id);
              return item ? <Row item={item} vocab={vocab} slug={slug} handle={handle} /> : null;
            }}
          </ReorderList>
        </div>
      )}
    </Card>
  );
}

function Row({
  item,
  vocab,
  slug,
  handle,
}: {
  item: Item;
  vocab: Vocabulary;
  slug: string;
  handle?: ReorderHandle;
}) {
  const [pending, start] = useTransition();

  return (
    <div
      className={cx(
        "mb-2 flex items-center gap-3 rounded-xl border bg-white p-2.5 transition-all",
        item.active === 1 ? "border-ink-200" : "border-dashed border-ink-200 opacity-65",
      )}
    >
      {handle && (
        <span
          {...handle.drag}
          className="cursor-grab text-ink-300 hover:text-ink-600 active:cursor-grabbing"
          aria-hidden
        >
          <Icon name="drag" size={16} />
        </span>
      )}

      <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-100">
        {item.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.images[0]} alt="" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-ink-300">
            <Icon name="image" size={16} />
          </span>
        )}
      </div>

      <Link href={`/dashboard/showcase/${item.id}`} className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[13.5px] font-medium text-ink-950">{item.title}</span>
          <Badge tone={STATUS_TONE[item.status] ?? "neutral"}>{vocab.statusLabels[item.status]}</Badge>
          {item.featured === 1 && <Badge tone="dark">Featured</Badge>}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-ink-500">{item.subtitle || item.category || "—"}</span>
      </Link>

      <span className="hidden w-24 shrink-0 text-right text-[13px] font-semibold tabular-nums text-ink-950 sm:block">
        {item.price != null ? money(item.price, item.currency) : item.price_note || "—"}
      </span>

      <span className="hidden w-20 shrink-0 text-right text-[11.5px] text-ink-400 lg:block">
        {relativeTime(item.updated_at)}
      </span>

      <span className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => start(async () => void (await toggleFeaturedAction(item.id, item.featured !== 1)))}
          className={cx(
            "grid size-8 place-items-center rounded-lg transition-colors",
            item.featured === 1 ? "text-brand-500" : "text-ink-300 hover:bg-ink-100 hover:text-ink-700",
          )}
          aria-label={item.featured === 1 ? "Unfeature" : "Feature"}
        >
          {pending ? <Spinner size={14} /> : <Icon name="star" size={15} className={item.featured === 1 ? "fill-current" : ""} />}
        </button>
        <Link
          href={itemPath(slug, item.id)}
          target="_blank"
          className="grid size-8 place-items-center rounded-lg text-ink-300 hover:bg-ink-100 hover:text-ink-700"
          aria-label="View live"
        >
          <Icon name="arrowUpRight" size={15} />
        </Link>
        <input
          type="checkbox"
          id={`item-${item.id}`}
          checked={item.active === 1}
          onChange={(e) => {
            const next = e.target.checked;
            start(async () => void (await toggleItemAction(item.id, next)));
          }}
          className="peer sr-only"
        />
        <label
          htmlFor={`item-${item.id}`}
          className="relative ml-1 block h-5 w-9 cursor-pointer rounded-full bg-ink-200 transition-colors peer-checked:bg-ink-950"
        >
          <span className="sr-only">Show {item.title}</span>
          <span
            className={cx(
              "absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform",
              item.active === 1 && "translate-x-4",
            )}
          />
        </label>
      </span>
    </div>
  );
}
