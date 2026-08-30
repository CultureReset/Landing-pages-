"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/interactive";
import { Card, CardHeader, Field, Input, cx } from "@/components/ui/primitives";
import {
  onboardingFinish,
  onboardingStepOne,
  onboardingStepThree,
  onboardingStepTwo,
} from "@/lib/actions/onboarding";
import { THEME_PRESETS } from "@/lib/themes";
import { BUSINESS_ICON } from "@/components/ui/icon";
import { BUSINESS_TYPES, VOCAB } from "@/lib/vocab";
import type { ActionState } from "@/lib/actions/site";
import { brand, pagePath } from "@/config/brand";
import type { Site } from "@/lib/types";

function Error({ state }: { state: ActionState }) {
  if (!state.error) return null;
  return (
    <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
      <Icon name="alert" size={14} />
      {state.error}
    </p>
  );
}

export function OnboardingStep({ step, site }: { step: number; site: Site }) {
  if (step === 2) return <StepTwo site={site} />;
  if (step === 3) return <StepThree site={site} />;
  if (step === 4) return <StepFour site={site} />;
  return <StepOne site={site} />;
}

function StepOne({ site }: { site: Site }) {
  const [state, action] = useActionState<ActionState, FormData>(onboardingStepOne, {});
  const [type, setType] = useState(site.business_type ?? "other");

  return (
    <Card>
      <CardHeader
        title="What kind of business is this?"
        description="It sets the language across your dashboard — listings, menu, services, inventory. You can change it later."
      />
      <form action={action}>
        <div className="space-y-5 p-5">
          <input type="hidden" name="business_type" value={type} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BUSINESS_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cx(
                  "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all",
                  type === t ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 hover:border-ink-300",
                )}
              >
                <Icon name={BUSINESS_ICON[t] ?? "layers"} size={18} className={type === t ? "" : "text-ink-400"} />
                <span className="text-[13px] font-medium leading-tight">{VOCAB[t].label}</span>
              </button>
            ))}
          </div>

          <Field label="Business name" required>
            <Input
              name="business_name"
              defaultValue={site.business_name}
              placeholder={type === "other" ? "Your business" : VOCAB[type].sample.title}
              required
              autoFocus
            />
          </Field>

          <Error state={state} />
        </div>
        <div className="flex justify-end border-t border-ink-200 bg-ink-50 px-5 py-3.5">
          <SubmitButton icon="arrowRight" pendingLabel="Next…">
            Continue
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}

function StepTwo({ site }: { site: Site }) {
  const [state, action] = useActionState<ActionState, FormData>(onboardingStepTwo, {});
  const v = VOCAB[site.business_type] ?? VOCAB.other;

  return (
    <Card>
      <CardHeader
        title="Who's behind it?"
        description="This is the top of your page — the bit people read before they decide to stay."
      />
      <form action={action}>
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name">
              <Input name="owner_name" defaultValue={site.owner_name} placeholder="Nora Vance" autoFocus />
            </Field>
            <Field label="What you do" hint="Role or speciality.">
              <Input name="headline" defaultValue={site.headline} placeholder="Broker Associate · Hudson Valley" />
            </Field>
          </div>

          <Field label="One-line pitch" hint="The sentence that makes someone stay on the page.">
            <Input name="tagline" defaultValue={site.tagline} placeholder="Buying, selling and everything in the middle." />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Where">
              <Input name="location" defaultValue={site.location} placeholder="Beacon, NY" />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={site.phone} placeholder="+1 845 555 0142" />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={site.email} placeholder="you@business.com" />
            </Field>
          </div>

          <p className="rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-500">
            We&apos;ll turn your phone and email into Call, WhatsApp and Email buttons on your page. You can add
            booking links, socials and {v.itemPlural.toLowerCase()} straight after this.
          </p>

          <Error state={state} />
        </div>
        <div className="flex justify-end border-t border-ink-200 bg-ink-50 px-5 py-3.5">
          <SubmitButton icon="arrowRight" pendingLabel="Next…">
            Continue
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}

function StepThree({ site }: { site: Site }) {
  const [state, action] = useActionState<ActionState, FormData>(onboardingStepThree, {});
  const [preset, setPreset] = useState(site.theme.preset);
  const active = THEME_PRESETS.find((p) => p.id === preset) ?? THEME_PRESETS[0];

  return (
    <Card>
      <CardHeader title="Pick a look" description="Every part of it is editable later — colours, fonts, corners, layout." />
      <form action={action}>
        <div className="space-y-5 p-5">
          <input type="hidden" name="preset" value={preset} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {THEME_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={cx(
                  "rounded-xl border p-2.5 text-left transition-all",
                  preset === p.id ? "border-ink-950 ring-2 ring-ink-950/10" : "border-ink-200 hover:border-ink-300",
                )}
              >
                <span
                  className="mb-2 flex h-16 flex-col justify-end gap-1 rounded-lg p-2"
                  style={{ background: p.bg, border: `1px solid ${p.border}` }}
                >
                  <span className="h-1.5 w-8 rounded-full" style={{ background: p.text, opacity: 0.55 }} />
                  <span className="h-3 w-full rounded" style={{ background: p.accent }} />
                </span>
                <span className="text-[12.5px] font-medium text-ink-900">{p.name}</span>
              </button>
            ))}
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{ background: active.bg, borderColor: active.border, color: active.text }}
          >
            <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: active.muted }}>
              Preview
            </p>
            <p className="mt-2 text-[18px] font-semibold tracking-[-0.02em]">
              {site.owner_name || site.business_name || "Your name"}
            </p>
            <p className="mt-0.5 text-[13px]" style={{ color: active.muted }}>
              {site.headline || "What you do"}
            </p>
            <span
              className="mt-4 inline-flex h-9 items-center rounded-xl px-4 text-[13px] font-semibold"
              style={{ background: active.accent, color: active.accentText }}
            >
              Get in touch
            </span>
          </div>

          <Error state={state} />
        </div>
        <div className="flex justify-end border-t border-ink-200 bg-ink-50 px-5 py-3.5">
          <SubmitButton icon="arrowRight" pendingLabel="Next…">
            Continue
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}

function StepFour({ site }: { site: Site }) {
  const [state, action] = useActionState<ActionState, FormData>(onboardingFinish, {});
  const [slug, setSlug] = useState(site.slug);

  return (
    <Card>
      <CardHeader
        title="Claim your link"
        description="This is what goes in your bio, on your cards and under your QR code. Keep it short."
      />
      <form action={action}>
        <div className="space-y-5 p-5">
          <Field label="Your address" required>
            <div className="flex items-center">
              <span className="flex h-10 items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 font-mono text-[13px] text-ink-500">
                /{brand.pagePrefix}/
              </span>
              <Input
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-l-none font-mono"
                required
                autoFocus
              />
            </div>
          </Field>

          <div className="rounded-2xl border border-ink-200 bg-ink-950 p-5 text-center text-white">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/40">Your page will live at</p>
            <p className="mt-2 break-all font-mono text-[15px]">{pagePath(slug || "your-name")}</p>
          </div>

          <ul className="space-y-2">
            {[
              "Your page goes live the moment you finish.",
              "Add listings, links and photos from the dashboard.",
              "Your QR code and contact card are generated automatically.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-[13.5px] text-ink-600">
                <Icon name="check" size={15} className="mt-0.5 shrink-0 text-brand-500" />
                {line}
              </li>
            ))}
          </ul>

          <Error state={state} />
        </div>
        <div className="flex justify-end border-t border-ink-200 bg-ink-50 px-5 py-3.5">
          <SubmitButton icon="bolt" size="lg" pendingLabel="Publishing…">
            Publish my page
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}
