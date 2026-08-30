import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { FeatureRow, PhoneFrame, Section, SectionHead, Eyebrow } from "@/components/marketing/sections";
import { Icon } from "@/components/ui/icon";
import { Disclosure } from "@/components/ui/interactive";
import { buttonClass, cx } from "@/components/ui/primitives";
import { currentUser } from "@/lib/auth";
import { featuredSites } from "@/lib/repo";
import { vocab } from "@/lib/vocab";
import { brand, pagePath } from "@/config/brand";
import { features } from "@/config/features";
import { marketing } from "@/config/marketing";
import { TRIAL_DAYS, formatPlanPrice, publicPlans } from "@/config/plans";

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline.replace(/\.$/, "").toLowerCase()}`,
  description:
    "One link for your whole business: listings, services, links and every way to reach you — with a dashboard for leads, analytics and QR codes behind it.",
};

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await currentUser();
  // Only pages an operator has explicitly featured. A customer's page is never
  // advertised here just because it happens to be published.
  const sites = features.publicDirectory ? featuredSites(6) : [];
  const hero = sites[0];

  return (
    <div className="bg-white">
      <MarketingNav signedIn={!!user} />

      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 15% 0%, rgba(248,72,26,0.13) 0%, transparent 62%), radial-gradient(50% 55% at 88% 8%, rgba(30,86,217,0.10) 0%, transparent 64%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Eyebrow>
              <span className="size-1.5 rounded-full bg-brand-500" />
              {marketing.hero.eyebrow}
            </Eyebrow>

            <h1 className="mt-5 text-[clamp(2.3rem,6vw,3.9rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-ink-950 text-balance-tight">
              {marketing.hero.title}
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-600 sm:text-[18px]">
              {marketing.hero.body}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className={buttonClass("primary", "lg")}>
                {marketing.hero.primaryCta}
                <Icon name="arrowRight" size={17} />
              </Link>
              {hero && (
                <Link href={pagePath(hero.slug)} className={buttonClass("secondary", "lg")}>
                  <Icon name="play" size={17} />
                  {marketing.hero.secondaryCta}
                </Link>
              )}
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-200 pt-7">
              {marketing.hero.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[22px] font-semibold tracking-[-0.03em] text-ink-950">{stat.value}</dt>
                  <dd className="mt-1 text-[12.5px] leading-snug text-ink-500">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {hero ? (
            <div className="relative">
              <div
                className="absolute inset-x-8 top-8 bottom-8 rounded-[3rem] bg-ink-950/[0.04] blur-2xl"
                aria-hidden
              />
              <PhoneFrame
                src={`${pagePath(hero.slug)}?preview=1`}
                label={`${hero.business_name} — live ${brand.name} page`}
                height={620}
              />
              <p className="relative mt-5 text-center text-[12.5px] text-ink-400">
                A real page, rendered live —{" "}
                <Link href={pagePath(hero.slug)} className="font-medium text-ink-700 underline underline-offset-4">
                  open it full size
                </Link>
              </p>
            </div>
          ) : (
            <HeroPlaceholder />
          )}
        </div>
      </section>

      {/* ------------------------------------------------------- how it works */}
      <Section id="how" tone="muted">
        <SectionHead
          eyebrow="How it works"
          title="Live by this afternoon, not next quarter."
          description="No templates to wrestle with, no builder to learn. Three steps and you have something you'd actually send to a client."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {marketing.how.map((s) => (
            <div key={s.step} className="rounded-2xl border border-ink-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-ink-950 text-white">
                  <Icon name={s.icon} size={18} />
                </span>
                <span className="font-mono text-[12px] text-ink-300">{s.step}</span>
              </div>
              <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.02em] text-ink-950">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-500">{s.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- examples */}
      {sites.length > 0 && (
      <Section id="examples">
        <SectionHead
          eyebrow="Live examples"
          title="One engine. Every kind of business."
          description={`These are real pages running on ${brand.name} right now — different trades, different themes, the same dashboard behind each one. Open any of them.`}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((s) => {
            const v = vocab(s.business_type);
            return (
              <Link
                key={s.id}
                href={pagePath(s.slug)}
                className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-lift"
              >
                <div className="relative h-32 overflow-hidden" style={{ background: s.theme.bg }}>
                  {s.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.cover_url} alt="" className="size-full object-cover opacity-80" loading="lazy" />
                  )}
                  <span
                    className="absolute bottom-2.5 left-3 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]"
                    style={{ background: s.theme.accent, color: s.theme.accentText }}
                  >
                    {v.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-4">
                  {s.avatar_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.avatar_url}
                      alt=""
                      className="size-10 shrink-0 rounded-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-ink-950">
                      {s.owner_name || s.business_name}
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-500">{s.headline}</span>
                  </span>
                  <Icon
                    name="arrowUpRight"
                    size={16}
                    className="shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-700"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </Section>
      )}

      {/* ---------------------------------------------------------- features */}
      <Section id="features" tone="muted" className="space-y-24 sm:space-y-28">
        <FeatureRow
          eyebrow="Full control"
          title="Your dashboard, not a support ticket."
          description="Everything a visitor sees is a field you own. Change a price at 11pm and it's live at 11:01 — no agency, no invoice, no waiting."
          bullets={[
            { icon: "grid", title: "Unlimited listings", detail: "Photos, prices, specs, status. Reorder them by dragging.", },
            { icon: "palette", title: "Eight themes, fully editable", detail: "Colour, typeface, corners, header layout, section order.", },
            { icon: "eye", title: "Live preview as you work", detail: "The real page, in a phone frame, beside the form you're filling in.", },
          ]}
          cta={{ href: "/signup", label: "Try the builder" }}
          visual={
            <div className="rounded-2xl border border-ink-200 bg-white p-2 shadow-lift">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <span className="size-2.5 rounded-full bg-ink-200" />
                <span className="size-2.5 rounded-full bg-ink-200" />
                <span className="size-2.5 rounded-full bg-ink-200" />
                <span className="ml-2 rounded-md bg-ink-100 px-2 py-0.5 font-mono text-[10.5px] text-ink-500">
                  frontdesk.app/dashboard/builder
                </span>
              </div>
              <BuilderMock />
            </div>
          }
        />

        <FeatureRow
          reverse
          eyebrow="Leads"
          title="Every enquiry, with the context attached."
          description="You don't get “someone messaged you”. You get who, what they were looking at, how they found you, and a pipeline to move them through."
          bullets={[
            { icon: "inbox", title: "Enquiries land with context", detail: "Name, email, phone, message and the exact listing they opened.", },
            { icon: "sort", title: "A pipeline that fits in your head", detail: "New, contacted, qualified, won, lost. Notes on every one.", },
            { icon: "download", title: "Yours to take", detail: "Export the lot to CSV whenever you want it.", },
          ]}
          cta={{ href: "/signup", label: "See it with demo data" }}
          visual={<LeadsMock />}
        />

        <FeatureRow
          eyebrow="Off the screen"
          title="Works on a sign, a card, and a handshake."
          description={`A link is only useful where people are. ${brand.name} gives you the same page as a QR code, an NFC tap and a contact card that saves straight to a phone.`}
          bullets={[
            { icon: "qr", title: "QR codes in your own colours", detail: "Download as SVG, print at any size. Scans are tagged as QR traffic.", },
            { icon: "nfc", title: "NFC cards", detail: "Write your link to a blank card in about a minute. No app for them to install.", },
            { icon: "download", title: "Save Contact", detail: "One tap drops your name, number, email and page into their phone.", },
          ]}
          visual={<ShareMock slug={hero?.slug ?? null} name={hero?.owner_name ?? brand.name} />}
        />

        <FeatureRow
          reverse
          eyebrow="Analytics"
          title="Know which link earns the tap."
          description="Views, taps, saves and enquiries — day by day, with the drop-off between each step. Move what works to the top and watch it move."
          bullets={[
            { icon: "chart", title: "Traffic and taps over time", detail: "Seven, thirty or ninety days, with the change on the period before.", },
            { icon: "trending", title: "Your top links and listings", detail: "Ranked, so reordering isn't guesswork.", },
            { icon: "target", title: "View-to-enquiry funnel", detail: "Exactly where people stop, and how many make it through.", },
          ]}
          visual={<AnalyticsMock />}
        />
      </Section>

      {/* -------------------------------------------------------- integrations */}
      <Section tone="dark">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
              Your tools
            </span>
            <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-balance-tight">
              Everything you already use, in one place people can act on.
            </h2>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white/55">
              {brand.name} doesn&apos;t ask you to move. If it has a link, it goes on your page — booking system, CRM,
              payment link, socials, the PDF you keep emailing people.
            </p>
            <Link href="/signup" className={cx(buttonClass("secondary", "lg"), "mt-8 !border-white/20 !bg-white !text-ink-950")}>
              Start free
              <Icon name="arrowRight" size={17} />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {marketing.channels.map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-2 text-[13px] text-white/75"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ pricing */}
      <Section id="pricing">
        <SectionHead
          align="center"
          eyebrow="Pricing"
          title="One price. Everything included."
          description="Seven days free on either plan. No card to start, and no feature held back to sell you an upgrade later."
        />

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
          {publicPlans().map((plan) => (
            <div
              key={plan.id}
              className={cx(
                "flex flex-col rounded-2xl border p-7",
                plan.highlight ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-white",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{plan.name}</h3>
                {plan.highlight && (
                  <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]">
                    Most chosen
                  </span>
                )}
              </div>
              <p className={cx("mt-1.5 text-[13.5px]", plan.highlight ? "text-white/55" : "text-ink-500")}>
                {plan.blurb}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-[38px] font-semibold tracking-[-0.04em]">{formatPlanPrice(plan)}</span>
                <span className={cx("text-[13px]", plan.highlight ? "text-white/55" : "text-ink-500")}>
                  {plan.price.cadence}
                </span>
              </div>

              <ul className="mt-7 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={cx("flex items-start gap-2.5 text-[14px]", plan.highlight ? "text-white/85" : "text-ink-700")}
                  >
                    <Icon
                      name="check"
                      size={16}
                      className={cx("mt-0.5 shrink-0", plan.highlight ? "text-brand-400" : "text-brand-500")}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/signup?plan=${plan.id}`}
                className={cx(
                  buttonClass(plan.highlight ? "secondary" : "primary", "lg"),
                  "mt-8 w-full",
                  plan.highlight && "!border-transparent !bg-white !text-ink-950",
                )}
              >
                Start {TRIAL_DAYS} days free
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[13px] text-ink-400">
          Cancel during the trial and you&apos;re never charged. Cancel after and your page stays live until the term ends.
        </p>
      </Section>

      {/* ---------------------------------------------------------------- FAQ */}
      <Section id="faq" tone="muted">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead
            eyebrow="FAQ"
            title="The questions people ask before they start."
            description="If yours isn't here, the trial answers most of them faster than we can."
          />
          <div className="rounded-2xl border border-ink-200 bg-white px-6">
            {marketing.faq.map((f, i) => (
              <Disclosure key={f.q} title={f.q} defaultOpen={i === 0}>
                {f.a}
              </Disclosure>
            ))}
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------- final CTA */}
      <Section tone="dark" className="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-[clamp(1.9rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-balance-tight">
            {marketing.finalCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16.5px] leading-relaxed text-white/55">
            {marketing.finalCta.body}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={cx(buttonClass("secondary", "lg"), "!border-transparent !bg-white !text-ink-950")}>
              {marketing.hero.primaryCta}
              <Icon name="arrowRight" size={17} />
            </Link>
            {features.demoAccount && (
              <Link href="/login" className={cx(buttonClass("ghost", "lg"), "!text-white hover:!bg-white/10")}>
                Explore the demo account
              </Link>
            )}
          </div>
        </div>
      </Section>

      <MarketingFooter />
    </div>
  );
}

/* --------------------------------------------------------------- mock art */

function BuilderMock() {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl bg-ink-50 p-3 sm:grid-cols-[1fr_100px]">
      <div className="space-y-2.5">
        {[
          { label: "Business name", value: "Vance & Co. Realty" },
          { label: "One-line pitch", value: "Buying, selling and everything in the middle." },
          { label: "Area you cover", value: "Beacon, NY" },
        ].map((f) => (
          <div key={f.label} className="rounded-lg border border-ink-200 bg-white p-2.5">
            <p className="text-[9.5px] font-medium uppercase tracking-[0.1em] text-ink-400">{f.label}</p>
            <p className="mt-1 truncate text-[12px] text-ink-800">{f.value}</p>
          </div>
        ))}
        <div className="flex gap-1.5">
          {["#0a0a0b", "#f6f5f1", "#070b1a", "#f7efe4", "#fdf2f4"].map((c, i) => (
            <span
              key={c}
              className={cx(
                "size-7 rounded-lg border",
                i === 0 ? "border-ink-950 ring-2 ring-ink-950/15" : "border-ink-200",
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div className="hidden rounded-xl bg-ink-950 p-1 sm:block">
        <div className="h-full rounded-[10px] bg-ink-900 p-2">
          <div className="h-10 rounded bg-white/10" />
          <div className="mt-2 size-7 rounded-full bg-brand-500" />
          <div className="mt-2 h-1.5 w-16 rounded bg-white/25" />
          <div className="mt-1.5 h-1.5 w-12 rounded bg-white/15" />
          <div className="mt-3 grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-5 rounded bg-white/10" />
            ))}
          </div>
          <div className="mt-2 space-y-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className={cx("block h-4 rounded", i === 0 ? "bg-brand-500" : "bg-white/10")} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadsMock() {
  const rows = [
    { name: "Alicia Moreau", note: "Saw the listing on Instagram — is it still available?", tag: "New", tone: "bg-brand-50 text-brand-700 border-brand-200" },
    { name: "Ben Osei", note: "What's the earliest appointment you have?", tag: "Contacted", tone: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Marguerite Cole", note: "Interested in the featured one. Can I get a call?", tag: "Qualified", tone: "bg-amber-50 text-amber-700 border-amber-200" },
    { name: "Devon Ashby", note: "Quick question about availability for six.", tag: "Won", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift">
      <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
        <span className="text-[13px] font-semibold text-ink-950">Leads</span>
        <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] text-ink-600">14 all time</span>
      </div>
      <ul className="divide-y divide-ink-100">
        {rows.map((r) => (
          <li key={r.name} className="flex items-start gap-3 px-4 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink-900 text-[10.5px] font-semibold text-white">
              {r.name.split(" ").map((p) => p[0]).join("")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-ink-950">{r.name}</span>
                <span className={cx("rounded-full border px-2 py-0.5 text-[10px] font-medium", r.tone)}>{r.tag}</span>
              </span>
              <span className="mt-0.5 block truncate text-[12px] text-ink-500">{r.note}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShareMock({ slug, name }: { slug: string | null; name: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-200 bg-white p-6 shadow-lift">
        {slug ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/qr/${slug}`} alt="Example QR code" width={132} height={132} loading="lazy" />
            <p className="mt-3 font-mono text-[11px] text-ink-400">{pagePath(slug)}</p>
          </>
        ) : (
          <span className="grid size-[132px] place-items-center rounded-xl border border-dashed border-ink-200 text-ink-300">
            <Icon name="qr" size={38} />
          </span>
        )}
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-ink-200 bg-ink-950 p-5 text-white shadow-lift">
          <p className="text-[14px] font-semibold">{name}</p>
          <p className="mt-0.5 text-[11.5px] text-white/50">{brand.name}</p>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
            <Icon name="nfc" size={15} />
            <span className="text-[11.5px]">Tap to open</span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white">
            <Icon name="download" size={18} />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-ink-950">Save Contact</span>
            <span className="block text-[11.5px] text-ink-500">Straight into their phone</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function AnalyticsMock() {
  const bars = [34, 52, 41, 66, 48, 72, 58, 84, 61, 92, 74, 100];
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-lift">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-ink-950">Page views</span>
        <span className="text-[12px] font-medium text-emerald-600">+57%</span>
      </div>
      <div className="mt-4 flex h-28 items-end gap-1.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className={cx("flex-1 rounded-t", i === bars.length - 1 ? "bg-brand-500" : "bg-ink-200")}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-5 space-y-2.5 border-t border-ink-200 pt-4">
        {[
          ["Get a free home valuation", 66],
          ["Book a private viewing", 64],
          ["Visit the office", 58],
        ].map(([label, count]) => (
          <div key={label as string} className="flex items-center justify-between gap-3">
            <span className="truncate text-[12.5px] text-ink-700">{label}</span>
            <span className="text-[12.5px] font-semibold tabular-nums text-ink-950">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shown on a fresh install, before any page has been featured. */
function HeroPlaceholder() {
  return (
    <div className="relative mx-auto w-full max-w-[318px] rounded-[2.4rem] border border-ink-800 bg-ink-950 p-2.5 shadow-pop">
      <span className="absolute left-1/2 top-4 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-ink-950" />
      <div className="flex h-[620px] flex-col items-center justify-center gap-4 rounded-[1.9rem] bg-ink-900 px-8 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-white/60">
          <Icon name="bolt" size={24} />
        </span>
        <p className="text-[15px] font-semibold text-white">Your page goes here</p>
        <p className="text-[13px] leading-relaxed text-white/45">
          Create an account and this is what your customers will see.
        </p>
      </div>
    </div>
  );
}
