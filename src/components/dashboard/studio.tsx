"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { CopyButton, Spinner, SubmitButton } from "@/components/ui/interactive";
import {
  Badge,
  Card,
  CardHeader,
  Field,
  Select,
  Textarea,
  cx,
} from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/interactive";
import { applyDescriptionAction, draftForItemAction, type DraftResult } from "@/lib/actions/studio";
import { money } from "@/lib/format";
import type { Item, Vocabulary } from "@/lib/types";

export function Studio({
  items,
  vocab,
  credits,
  accent,
  businessName,
}: {
  items: Item[];
  vocab: Vocabulary;
  credits: number;
  accent: string;
  businessName: string;
}) {
  return (
    <Tabs
      tabs={[
        {
          id: "copy",
          label: "Draft copy",
          icon: "edit",
          content: <CopyTool items={items} vocab={vocab} credits={credits} />,
        },
        {
          id: "cover",
          label: "Branded covers",
          icon: "image",
          content: <CoverTool items={items} vocab={vocab} accent={accent} businessName={businessName} />,
        },
      ]}
    />
  );
}

/* ------------------------------------------------------------- copy tool */

function CopyTool({ items, vocab, credits }: { items: Item[]; vocab: Vocabulary; credits: number }) {
  const [state, action] = useActionState<DraftResult, FormData>(draftForItemAction, {});
  const [applied, setApplied] = useState(false);
  const [pending, start] = useTransition();
  const [description, setDescription] = useState("");

  const current = state.description ?? description;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader
          title="Draft a description"
          description="Builds copy from the facts already on the entry — the title, specs, price and highlights. Nothing is invented."
          action={<Badge tone={credits > 5 ? "neutral" : "caution"}>{state.credits ?? credits} credits</Badge>}
        />
        <form action={action}>
          <div className="space-y-4 p-5">
            <Field label={`Which ${vocab.itemSingular.toLowerCase()}?`} required>
              <Select name="itemId" required defaultValue={items[0]?.id}>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-[12.5px] leading-relaxed text-ink-600">
              <p className="mb-2 flex items-center gap-1.5 font-medium text-ink-900">
                <Icon name="info" size={14} />
                How this works
              </p>
              The draft writer runs locally from your own data — no external service, nothing sent anywhere, and no
              claims it can&apos;t support. Treat the output as a first pass and edit it in your own voice before you
              publish.
            </div>

            {state.error && (
              <p className="flex items-center gap-2 text-[12.5px] text-[var(--color-negative)]">
                <Icon name="alert" size={14} />
                {state.error}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-ink-200 bg-ink-50 px-5 py-3.5">
            <span className="text-[12px] text-ink-400">Costs 1 credit</span>
            <SubmitButton size="sm" icon="sparkles" pendingLabel="Writing…">
              Write a draft
            </SubmitButton>
          </div>
        </form>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader
            title="Description"
            action={current ? <CopyButton value={current} /> : undefined}
          />
          <div className="p-5">
            {current ? (
              <>
                <Textarea
                  value={current}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setApplied(false);
                  }}
                  rows={12}
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={pending || !state.itemId}
                    onClick={() =>
                      start(async () => {
                        await applyDescriptionAction(state.itemId!, current);
                        setApplied(true);
                      })
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink-950 px-3.5 text-[13px] font-medium text-white disabled:opacity-50"
                  >
                    {pending ? <Spinner size={14} /> : <Icon name="save" size={14} />}
                    Save to entry
                  </button>
                  {applied && <span className="text-[12.5px] text-emerald-700">Saved to the entry.</span>}
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-[13px] text-ink-400">
                Pick something and write a draft — it appears here, ready to edit.
              </p>
            )}
          </div>
        </Card>

        {state.caption && (
          <Card>
            <CardHeader title="Social caption" action={<CopyButton value={state.caption} />} />
            <pre className="whitespace-pre-wrap px-5 py-4 font-sans text-[13.5px] leading-relaxed text-ink-700">
              {state.caption}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ cover tool */

const RATIOS = [
  { id: "square", label: "Square · 1:1", note: "Instagram feed" },
  { id: "story", label: "Story · 9:16", note: "Stories & Reels" },
  { id: "landscape", label: "Landscape · 16:9", note: "Link previews" },
];

function CoverTool({
  items,
  vocab,
  accent,
  businessName,
}: {
  items: Item[];
  vocab: Vocabulary;
  accent: string;
  businessName: string;
}) {
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [ratio, setRatio] = useState("square");
  const [showBrand, setShowBrand] = useState(true);

  const item = items.find((i) => i.id === itemId);

  const src = useMemo(() => {
    if (!item) return "";
    const params = new URLSearchParams({
      title: item.title,
      subtitle: item.subtitle,
      price: item.price != null ? money(item.price, item.currency) : item.price_note,
      badge: vocab.statusLabels[item.status] ?? "",
      brand: showBrand ? businessName : "",
      accent,
      ratio,
    });
    if (item.images[0]) params.set("image", item.images[0]);
    return `/api/cover?${params.toString()}`;
  }, [item, ratio, showBrand, accent, businessName, vocab]);

  if (!items.length) {
    return (
      <Card>
        <p className="px-5 py-12 text-center text-[13.5px] text-ink-400">
          Add something to your showcase first — covers are built from its photo and details.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card>
        <CardHeader title="Cover composer" description="Your photo, your accent, the details laid over it." />
        <div className="space-y-4 p-5">
          <Field label={vocab.itemSingular}>
            <Select value={itemId} onChange={(e) => setItemId(e.target.value)}>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </Select>
          </Field>

          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-ink-800">Size</span>
            <div className="space-y-1.5">
              {RATIOS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRatio(r.id)}
                  className={cx(
                    "flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                    ratio === r.id ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 hover:border-ink-300",
                  )}
                >
                  <span className="text-[13px] font-medium">{r.label}</span>
                  <span className={cx("text-[11.5px]", ratio === r.id ? "text-white/55" : "text-ink-400")}>
                    {r.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-[13px] text-ink-700">
            <input
              type="checkbox"
              checked={showBrand}
              onChange={(e) => setShowBrand(e.target.checked)}
              className="size-4 rounded border-ink-300"
            />
            Include business name
          </label>

          <a
            href={src}
            download={`${item?.title.replace(/\W+/g, "-").toLowerCase()}-cover.svg`}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink-950 text-[14px] font-medium text-white"
          >
            <Icon name="download" size={16} />
            Download SVG
          </a>
          <p className="text-[12px] leading-relaxed text-ink-400">
            SVG stays sharp at any size. Open it in any design tool, or drop it straight into a post.
          </p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Preview" description={item?.title} />
        <div className="grid place-items-center bg-ink-100 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Branded cover preview"
            className="max-h-[520px] w-auto max-w-full rounded-xl shadow-pop"
          />
        </div>
      </Card>
    </div>
  );
}
