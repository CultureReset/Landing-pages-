"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { ConfirmButton, ReorderList, Spinner } from "@/components/ui/interactive";
import { Field, Input, Select, Switch, Textarea, cx } from "@/components/ui/primitives";
import { Card, CardHeader } from "@/components/ui/primitives";
import { FormCard } from "@/components/dashboard/form-card";
import { ImagePicker } from "@/components/dashboard/image-picker";
import {
  addGalleryImageAction,
  applyPresetAction,
  removeGalleryImageAction,
  saveHoursAction,
  saveProfileAction,
  saveSeoAction,
  saveSlugAction,
  saveStatsAction,
  saveThemeAction,
  saveSectionsAction,
} from "@/lib/actions/site";
import { SECTION_META, THEME_PRESETS } from "@/lib/themes";
import { BUSINESS_TYPES, VOCAB } from "@/lib/vocab";
import { brand, pagePath } from "@/config/brand";
import type { DayHours, SectionConfig, Site, SiteStat } from "@/lib/types";

/* ---------------------------------------------------------------- Profile */

export function ProfilePanel({ site }: { site: Site }) {
  return (
    <div className="space-y-5">
      <FormCard
        title="Profile"
        description="The identity at the top of your page."
        action={saveProfileAction}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ImagePicker name="avatar_url" label="Profile photo" defaultValue={site.avatar_url} hint="Square works best. Shown at 92px." />
          <ImagePicker name="cover_url" label="Cover image" defaultValue={site.cover_url} aspect="wide" hint="Wide banner behind your name." />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" required>
            <Input name="business_name" defaultValue={site.business_name} placeholder="Vance & Co. Realty" required />
          </Field>
          <Field label="Your name" hint="Leave blank if you trade as the business only.">
            <Input name="owner_name" defaultValue={site.owner_name} placeholder="Nora Vance" />
          </Field>
        </div>

        <Field label="What you do" hint="Role, speciality or category. Shown under your name.">
          <Input name="headline" defaultValue={site.headline} placeholder="Broker Associate · Hudson Valley" />
        </Field>

        <Field label="One-line pitch" hint="The single sentence that makes someone stay.">
          <Input name="tagline" defaultValue={site.tagline} placeholder="Buying, selling and everything in the middle." />
        </Field>

        <Field label="About" hint="Two or three sentences. This fills the About section.">
          <Textarea name="bio" defaultValue={site.bio} rows={5} placeholder="What you do, who you do it for, and why people pick you." />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business type" hint="Sets the vocabulary across your dashboard.">
            <Select name="business_type" defaultValue={site.business_type}>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {VOCAB[t].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Credential or licence" hint="Optional. Adds a trust line to your header.">
            <Input name="credential" defaultValue={site.credential} placeholder="NY Lic. #10401288764" />
          </Field>
        </div>
      </FormCard>

      <FormCard title="Contact details" description="Powers your quick actions, vCard and enquiry routing." action={saveProfileAction}>
        {/* Hidden fields keep the profile values intact when saving contact only. */}
        <input type="hidden" name="business_name" value={site.business_name} />
        <input type="hidden" name="owner_name" value={site.owner_name} />
        <input type="hidden" name="headline" value={site.headline} />
        <input type="hidden" name="tagline" value={site.tagline} />
        <input type="hidden" name="bio" value={site.bio} />
        <input type="hidden" name="business_type" value={site.business_type} />
        <input type="hidden" name="credential" value={site.credential} />
        <input type="hidden" name="avatar_url" value={site.avatar_url ?? ""} />
        <input type="hidden" name="cover_url" value={site.cover_url ?? ""} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <Input name="phone" defaultValue={site.phone} placeholder="+1 845 555 0142" />
          </Field>
          <Field label="WhatsApp" hint="Digits only, with country code.">
            <Input name="whatsapp" defaultValue={site.whatsapp} placeholder="18455550142" />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" defaultValue={site.email} placeholder="you@business.com" />
          </Field>
          <Field label="Website">
            <Input name="website" defaultValue={site.website} placeholder="https://yourbusiness.com" />
          </Field>
          <Field label="Area you cover" hint="Shown in the header.">
            <Input name="location" defaultValue={site.location} placeholder="Beacon, NY" />
          </Field>
          <Field label="Street address" hint="Used by the map section and vCard.">
            <Input name="address" defaultValue={site.address} placeholder="18 Main Street, Beacon, NY 12508" />
          </Field>
        </div>
      </FormCard>
    </div>
  );
}

/* ------------------------------------------------------------------ Theme */

export function ThemePanel({ site }: { site: Site }) {
  const [pending, start] = useTransition();
  const [preset, setPreset] = useState(site.theme.preset);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Theme" description="Pick a starting point, then fine-tune below." />
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          {THEME_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={pending}
              onClick={() => {
                setPreset(p.id);
                start(async () => void (await applyPresetAction(p.id)));
              }}
              className={cx(
                "group rounded-xl border p-2.5 text-left transition-all",
                preset === p.id ? "border-ink-950 ring-2 ring-ink-950/10" : "border-ink-200 hover:border-ink-300",
              )}
            >
              <span
                className="mb-2 flex h-14 items-end gap-1 rounded-lg p-2"
                style={{ background: p.bg, border: `1px solid ${p.border}` }}
              >
                <span className="h-2.5 flex-1 rounded-full" style={{ background: p.accent }} />
                <span className="h-2.5 w-4 rounded-full" style={{ background: p.text, opacity: 0.5 }} />
              </span>
              <span className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-ink-900">{p.name}</span>
                {preset === p.id && (pending ? <Spinner size={12} /> : <Icon name="check" size={13} />)}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <FormCard title="Fine-tuning" description="Overrides applied on top of the preset." action={saveThemeAction}>
        <input type="hidden" name="preset" value={site.theme.preset} />

        <Field label="Accent colour" hint="Used for buttons, badges and highlights.">
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="accent"
              defaultValue={site.theme.accent}
              className="h-10 w-16 cursor-pointer rounded-lg border border-ink-200 bg-white p-1"
            />
            <code className="rounded-lg bg-ink-100 px-2.5 py-1.5 font-mono text-[12px] text-ink-600">
              {site.theme.accent}
            </code>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Typeface">
            <Select name="font" defaultValue={site.theme.font}>
              <option value="sans">Inter — clean and modern</option>
              <option value="serif">Instrument Serif — editorial</option>
              <option value="display">Space Grotesk — bold</option>
            </Select>
          </Field>
          <Field label="Corner style">
            <Select name="radius" defaultValue={site.theme.radius}>
              <option value="rounded">Rounded</option>
              <option value="sharp">Sharp</option>
              <option value="pill">Pill</option>
            </Select>
          </Field>
          <Field label="Button style">
            <Select name="buttonStyle" defaultValue={site.theme.buttonStyle}>
              <option value="solid">Solid cards</option>
              <option value="outline">Outlined</option>
              <option value="soft">Soft</option>
              <option value="glass">Glass</option>
            </Select>
          </Field>
          <Field label="Background">
            <Select name="backdrop" defaultValue={site.theme.backdrop}>
              <option value="gradient">Accent glow</option>
              <option value="mesh">Mesh</option>
              <option value="plain">Plain</option>
              <option value="cover">Blurred cover image</option>
            </Select>
          </Field>
          <Field label="Header layout">
            <Select name="header" defaultValue={site.theme.header}>
              <option value="cover">Cover image</option>
              <option value="centered">Centred</option>
              <option value="split">Split</option>
            </Select>
          </Field>
          <Field label="Showcase layout">
            <Select name="showcase" defaultValue={site.theme.showcase}>
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </Select>
          </Field>
        </div>
      </FormCard>
    </div>
  );
}

/* --------------------------------------------------------------- Sections */

export function SectionsPanel({ sections }: { sections: SectionConfig[] }) {
  const [order, setOrder] = useState(sections);
  const [, start] = useTransition();

  function persist(next: SectionConfig[]) {
    setOrder(next);
    start(async () => void (await saveSectionsAction(next)));
  }

  return (
    <Card>
      <CardHeader
        title="Sections"
        description="Drag to reorder, rename the headings, or switch a section off entirely."
      />
      <div className="p-3">
        <ReorderList
          ids={order.map((s) => s.id as string)}
          onReorder={(ids) => {
            const next = ids.map((id) => order.find((s) => s.id === id)!).filter(Boolean);
            persist(next);
          }}
        >
          {(sectionId, handle) => {
            const section = order.find((s) => s.id === sectionId);
            if (!section) return null;
            const meta = SECTION_META[sectionId] ?? { name: sectionId, description: "", icon: "layers" };
            return (
              <div
                className={cx(
                  "mb-1.5 flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition-opacity",
                  section.enabled ? "border-ink-200" : "border-dashed border-ink-200 opacity-60",
                )}
              >
                <span
                  {...handle.drag}
                  className="cursor-grab text-ink-300 transition-colors hover:text-ink-600 active:cursor-grabbing"
                  aria-hidden
                >
                  <Icon name="drag" size={16} />
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600">
                  <Icon name={meta.icon} size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <input
                    value={section.title}
                    onChange={(e) =>
                      persist(order.map((s) => (s.id === sectionId ? { ...s, title: e.target.value } : s)))
                    }
                    className="w-full bg-transparent text-[13.5px] font-medium text-ink-950 focus:outline-none"
                    aria-label={`${meta.name} heading`}
                  />
                  <span className="block truncate text-[11.5px] text-ink-400">{meta.description}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={handle.moveUp}
                    className="grid size-7 place-items-center rounded-md text-ink-300 hover:bg-ink-100 hover:text-ink-700"
                    aria-label="Move up"
                  >
                    <Icon name="arrowUp" size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={handle.moveDown}
                    className="grid size-7 place-items-center rounded-md text-ink-300 hover:bg-ink-100 hover:text-ink-700"
                    aria-label="Move down"
                  >
                    <Icon name="arrowUp" size={13} className="rotate-180" />
                  </button>
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) =>
                      persist(order.map((s) => (s.id === sectionId ? { ...s, enabled: e.target.checked } : s)))
                    }
                    className="peer sr-only"
                    id={`sec-${sectionId}`}
                  />
                  <label
                    htmlFor={`sec-${sectionId}`}
                    className="relative ml-1 block h-5 w-9 cursor-pointer rounded-full bg-ink-200 transition-colors peer-checked:bg-ink-950"
                    aria-label={`Show ${meta.name}`}
                  >
                    <span
                      className={cx(
                        "absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform",
                        section.enabled && "translate-x-4",
                      )}
                    />
                  </label>
                </span>
              </div>
            );
          }}
        </ReorderList>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------- Highlights */

export function HighlightsPanel({ stats }: { stats: SiteStat[] }) {
  const rows = [0, 1, 2].map((i) => stats[i] ?? { value: "", label: "" });
  return (
    <FormCard
      title="Highlights"
      description="Three numbers that answer “why you”. Leave blank to hide the row."
      action={saveStatsAction}
    >
      {rows.map((s, i) => (
        <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-[130px_1fr]">
          <Field label={i === 0 ? "Figure" : undefined}>
            <Input name={`stat_value_${i}`} defaultValue={s.value} placeholder="14" maxLength={12} />
          </Field>
          <Field label={i === 0 ? "Caption" : undefined}>
            <Input name={`stat_label_${i}`} defaultValue={s.label} placeholder="years in the business" maxLength={32} />
          </Field>
        </div>
      ))}
    </FormCard>
  );
}

/* ------------------------------------------------------------------ Hours */

export function HoursPanel({ hours }: { hours: DayHours[] }) {
  return (
    <FormCard title="Opening hours" description="Today's row is highlighted on your page, with an open/closed badge." action={saveHoursAction}>
      <div className="space-y-2">
        {hours.map((h) => (
          <div key={h.day} className="grid grid-cols-[110px_1fr_1fr_auto] items-center gap-3">
            <span className="text-[13px] font-medium text-ink-800">{h.day}</span>
            <Input type="time" name={`open_${h.day}`} defaultValue={h.open} className="h-9" />
            <Input type="time" name={`close_${h.day}`} defaultValue={h.close} className="h-9" />
            <Switch name={`closed_${h.day}`} defaultChecked={h.closed} label="Closed" />
          </div>
        ))}
      </div>
    </FormCard>
  );
}

/* ---------------------------------------------------------------- Gallery */

export function GalleryPanel({ gallery }: { gallery: string[] }) {
  const [busy, setBusy] = useState(false);
  const [, start] = useTransition();

  async function upload(file: File) {
    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const json = await res.json();
    setBusy(false);
    if (res.ok) start(async () => void (await addGalleryImageAction(json.url)));
  }

  return (
    <Card>
      <CardHeader
        title="Gallery"
        description={`${gallery.length} of 24 images. A horizontal strip on your page — tap to open full size.`}
      />
      <div className="grid grid-cols-3 gap-3 p-5 sm:grid-cols-5">
        {gallery.map((src) => (
          <div key={src} className="group relative aspect-square overflow-hidden rounded-xl border border-ink-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-cover" />
            <ConfirmButton
              action={() => removeGalleryImageAction(src)}
              message="Remove this image from your gallery?"
              variant="ghost"
              size="sm"
              className="!absolute inset-x-1 bottom-1 !h-7 justify-center !bg-white/90 !text-ink-800 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
              icon="trash"
            >
              Remove
            </ConfirmButton>
          </div>
        ))}

        <label
          className={cx(
            "grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-ink-300 bg-ink-50 text-ink-400 transition-colors hover:border-ink-400 hover:text-ink-600",
            gallery.length >= 24 && "pointer-events-none opacity-40",
          )}
        >
          {busy ? <Spinner size={18} /> : <Icon name="plus" size={20} />}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------- Address/SEO */

export function AddressPanel({ site }: { site: Site }) {
  return (
    <div className="space-y-5">
      <FormCard
        title="Page address"
        description="The link you'll print on cards, signs and QR codes."
        action={saveSlugAction}
        submitLabel="Update address"
        footer={<span className="font-mono text-ink-400">{pagePath(site.slug)}</span>}
      >
        <Field label="Your handle" hint="Letters, numbers and dashes. Changing it breaks existing printed links.">
          <div className="flex items-center gap-0">
            <span className="flex h-10 items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 font-mono text-[13px] text-ink-500">
              /{brand.pagePrefix}/
            </span>
            <Input name="slug" defaultValue={site.slug} className="rounded-l-none font-mono" required />
          </div>
        </Field>
      </FormCard>

      <FormCard
        title="Search &amp; sharing"
        description="How your page appears in Google results and link previews."
        action={saveSeoAction}
      >
        <Field label="Title" hint="Up to 70 characters.">
          <Input
            name="seo_title"
            defaultValue={site.seo.title}
            maxLength={70}
            placeholder={`${site.owner_name || site.business_name} — ${site.business_name}`}
          />
        </Field>
        <Field label="Description" hint="Up to 200 characters.">
          <Textarea name="seo_description" defaultValue={site.seo.description} maxLength={200} rows={3} placeholder={site.tagline} />
        </Field>

        <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">Preview</p>
          <p className="text-[13px] text-emerald-700">{brand.url.replace(/^https?:\/\//, "")} › {brand.pagePrefix} › {site.slug}</p>
          <p className="mt-0.5 text-[17px] leading-snug text-[#1a0dab]">
            {site.seo.title || `${site.owner_name || site.business_name} — ${site.business_name}`}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-600">
            {site.seo.description || site.tagline || "Add a description to control what people read here."}
          </p>
        </div>
      </FormCard>
    </div>
  );
}
