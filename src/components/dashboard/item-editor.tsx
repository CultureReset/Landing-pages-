"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ConfirmButton, SubmitButton } from "@/components/ui/interactive";
import { MultiImagePicker } from "@/components/dashboard/multi-image";
import {
  Badge,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Switch,
  Textarea,
  cx,
} from "@/components/ui/primitives";
import { deleteItemAction, duplicateItemAction, saveItemAction } from "@/lib/actions/items";
import { money } from "@/lib/format";
import type { Item, Vocabulary } from "@/lib/types";
import type { ActionState } from "@/lib/actions/site";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "AED", "CHF", "SEK", "NZD", "ZAR"];

export function ItemEditor({
  item,
  vocab,
  slug,
  categories,
  defaultLocation,
}: {
  item?: Item;
  vocab: Vocabulary;
  slug: string;
  categories: string[];
  defaultLocation: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(saveItemAction, {});
  const [title, setTitle] = useState(item?.title ?? "");
  const [price, setPrice] = useState(item?.price != null ? String(item.price) : "");
  const [currency, setCurrency] = useState(item?.currency ?? "USD");

  const specs = [...(item?.specs ?? [])];
  while (specs.length < 6) specs.push({ label: "", value: "" });

  return (
    <form action={action} className="space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="The basics" />
            <div className="space-y-4 p-5">
              <Field label="Title" required>
                <Input
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={vocab.sample.title}
                  required
                  autoFocus={!item}
                />
              </Field>

              <Field label="Supporting line" hint="The one line under the title on the card.">
                <Input name="subtitle" defaultValue={item?.subtitle} placeholder={vocab.sample.subtitle} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={vocab.categoryLabel} hint="Groups become filter tabs on your page.">
                  <Input
                    name="category"
                    defaultValue={item?.category}
                    placeholder="Single family"
                    list="fd-categories"
                  />
                  <datalist id="fd-categories">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Status">
                  <Select name="status" defaultValue={item?.status ?? "available"}>
                    {Object.entries(vocab.statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Location" hint="Optional. Shown on the detail page.">
                <Input name="location" defaultValue={item?.location ?? defaultLocation} placeholder={defaultLocation} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              title={vocab.priceLabel}
              description="Leave the figure blank and use the note for “Price on application”."
            />
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-[110px_1fr_1fr]">
              <Field label="Currency">
                <Select name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Figure">
                <Input
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="895000"
                />
              </Field>
              <Field label="Note" hint="e.g. “per month”, “from”, “per person”.">
                <Input name="price_note" defaultValue={item?.price_note} placeholder="per month" />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Photos" description="First image is the cover. Up to twelve." />
            <div className="p-5">
              <MultiImagePicker name="images" defaultValue={item?.images ?? []} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Description" description="The long version. Line breaks are kept." />
            <div className="p-5">
              <Textarea
                name="description"
                defaultValue={item?.description}
                rows={9}
                placeholder="What makes this one worth someone's time? Write it the way you'd say it."
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Specifications"
              description={`Shown as a grid on the detail page. Try: ${vocab.specHints.slice(0, 4).join(", ")}.`}
            />
            <div className="space-y-2.5 p-5">
              {specs.slice(0, 6).map((spec, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr] gap-3">
                  <Input
                    name={`spec_label_${i}`}
                    defaultValue={spec.label}
                    placeholder={vocab.specHints[i] ?? "Label"}
                    className="h-9"
                  />
                  <Input name={`spec_value_${i}`} defaultValue={spec.value} placeholder="Value" className="h-9" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Highlights" description="One per line. Rendered as a ticked list." />
            <div className="p-5">
              <Textarea
                name="features"
                defaultValue={item?.features.join("\n")}
                rows={6}
                placeholder={"Renovated kitchen\nScreened porch\nWired barn / studio"}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Call to action" description="An extra button at the bottom of the detail page." />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Button label">
                <Input name="cta_label" defaultValue={item?.cta_label} placeholder="Download the brochure" />
              </Field>
              <Field label="Link">
                <Input name="cta_url" defaultValue={item?.cta_url} placeholder="https://…" />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="sticky top-20 space-y-5">
            <Card>
              <CardHeader title="Visibility" />
              <div className="space-y-3.5 p-5">
                <Switch
                  name="active"
                  defaultChecked={item ? item.active === 1 : true}
                  label="Show on my page"
                  description="Off keeps it in your dashboard only."
                />
                <Switch
                  name="featured"
                  defaultChecked={item?.featured === 1}
                  label="Feature it"
                  description="Pins it to the top with a star."
                />
              </div>
              <div className="border-t border-ink-200 p-5">
                <SubmitButton className="w-full" size="lg" icon="save">
                  {item ? "Save changes" : `Create ${vocab.itemSingular.toLowerCase()}`}
                </SubmitButton>

                {state.error && (
                  <p className="mt-3 flex items-center gap-2 text-[12.5px] text-[var(--color-negative)]">
                    <Icon name="alert" size={14} />
                    {state.error}
                  </p>
                )}
                {state.ok && state.message && (
                  <p className="mt-3 flex items-center gap-2 text-[12.5px] text-emerald-700">
                    <Icon name="checkCircle" size={14} />
                    {state.message}
                  </p>
                )}
              </div>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader title="Card preview" description="Roughly how it looks on your page." />
              <div className="bg-ink-950 p-4">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <div className="grid aspect-[4/3] place-items-center bg-white/5 text-white/25">
                    {item?.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.images[0]} alt="" className="size-full object-cover" />
                    ) : (
                      <Icon name="image" size={22} />
                    )}
                  </div>
                  <div className="p-3.5">
                    <p className="truncate text-[13.5px] font-semibold text-white">{title || vocab.sample.title}</p>
                    <p className="mt-0.5 text-[14px] font-semibold text-white/90 tabular-nums">
                      {price ? money(Number(price), currency) : vocab.sample.price}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {item && (
              <Card>
                <CardHeader title="Manage" />
                <div className="flex flex-wrap gap-2 p-5">
                  <Link
                    href={`/p/${slug}/i/${item.id}`}
                    target="_blank"
                    className={cx(
                      "inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-[12.5px] font-medium text-ink-700 hover:border-ink-300",
                    )}
                  >
                    <Icon name="arrowUpRight" size={14} />
                    View live
                  </Link>
                  <ConfirmButton
                    action={() => duplicateItemAction(item.id)}
                    message="Create a copy of this entry?"
                    variant="secondary"
                    icon="copy"
                  >
                    Duplicate
                  </ConfirmButton>
                  <ConfirmButton
                    action={() => deleteItemAction(item.id)}
                    message={`Delete “${item.title}”? This can't be undone.`}
                    icon="trash"
                  >
                    Delete
                  </ConfirmButton>
                </div>
                <div className="border-t border-ink-200 px-5 py-3 text-[12px] text-ink-400">
                  <Badge tone="neutral">{item.views} detail views</Badge>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
