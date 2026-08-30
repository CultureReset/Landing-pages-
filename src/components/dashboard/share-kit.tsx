"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { CopyButton } from "@/components/ui/interactive";
import { Card, CardHeader, Field, Input, Select, cx } from "@/components/ui/primitives";
import { pagePath } from "@/config/brand";

export function ShareKit({
  slug,
  businessName,
  ownerName,
  accent,
}: {
  slug: string;
  businessName: string;
  ownerName: string;
  accent: string;
}) {
  const [dark, setDark] = useState("#0a0a0b");
  const [light, setLight] = useState("#ffffff");
  const [margin, setMargin] = useState("1");
  const [origin, setOrigin] = useState("");

  // Resolved after mount so the server and client render the same markup.
  useEffect(() => setOrigin(window.location.origin), []);

  const qrSrc = `/api/qr/${slug}?dark=${encodeURIComponent(dark)}&light=${encodeURIComponent(light)}&margin=${margin}`;
  const fullUrl = `${origin}${pagePath(slug)}`;
  const embed = `<iframe src="${fullUrl}" width="100%" height="720" style="border:0;border-radius:16px" title="${businessName}" loading="lazy"></iframe>`;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <Card>
          <CardHeader title="Your link" description="Short enough to say out loud and print on a card." />
          <div className="space-y-3 p-5">
            <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-3">
              <Icon name="globe" size={16} className="shrink-0 text-ink-400" />
              <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink-800">{fullUrl}</code>
              <CopyButton value={fullUrl} />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { label: "Share on WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(fullUrl)}`, icon: "whatsapp" },
                { label: "Email the link", href: `mailto:?subject=${encodeURIComponent(businessName)}&body=${encodeURIComponent(fullUrl)}`, icon: "mail" },
                { label: "Post to LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`, icon: "linkedin" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 text-[13px] font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                >
                  <Icon name={s.icon} size={15} />
                  {s.label.split(" ")[0]}
                </a>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="QR code"
            description="Signs, windows, business cards, brochures. Scans open your page with the source tagged as “QR code”."
          />
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-2xl border border-ink-200 p-3" style={{ background: light }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt={`QR code for ${businessName}`} width={168} height={168} />
              </div>
              <a
                href={qrSrc}
                download={`${slug}-qr.svg`}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink-950 px-3.5 text-[13px] font-medium text-white"
              >
                <Icon name="download" size={15} />
                Download SVG
              </a>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Foreground">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={dark}
                      onChange={(e) => setDark(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-ink-200 bg-white p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setDark(accent)}
                      className="h-10 rounded-lg border border-ink-200 px-2.5 text-[12px] font-medium text-ink-600 hover:border-ink-300"
                    >
                      Use accent
                    </button>
                  </div>
                </Field>
                <Field label="Background">
                  <input
                    type="color"
                    value={light}
                    onChange={(e) => setLight(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-ink-200 bg-white p-1"
                  />
                </Field>
              </div>
              <Field label="Quiet zone" hint="Printers need a margin. Keep at least 1.">
                <Select value={margin} onChange={(e) => setMargin(e.target.value)}>
                  <option value="0">None</option>
                  <option value="1">Tight (1)</option>
                  <option value="2">Standard (2)</option>
                  <option value="4">Generous (4)</option>
                </Select>
              </Field>
              <p className="rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-600">
                <b className="text-ink-900">Printing tip:</b> keep the code at least 25&nbsp;mm across, put it somewhere
                a phone can get within arm&apos;s reach, and always print the URL underneath as a fallback.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="NFC cards" description="Tap-to-open cards and stickers, no app required." />
          <div className="space-y-4 p-5">
            <ol className="space-y-3">
              {[
                "Buy blank NTAG213 or NTAG215 cards — any brand works.",
                "Install a free NFC writing app (NFC Tools on iOS or Android).",
                "Choose “Write” → “URL/URI” and paste your link.",
                "Hold the card to the back of your phone until it confirms.",
                "Lock the tag if you want it read-only, then test it.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3 text-[13.5px] leading-relaxed text-ink-700">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-100 text-[11.5px] font-semibold text-ink-700">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-3">
              <Icon name="nfc" size={16} className="shrink-0 text-ink-400" />
              <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink-700">
                {fullUrl}?src=NFC%20card
              </code>
              <CopyButton value={`${fullUrl}?src=NFC%20card`} label="Copy" />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Embed" description="Drop your page inside an existing website." />
          <div className="p-5">
            <pre className="thin-scroll overflow-x-auto rounded-xl border border-ink-200 bg-ink-950 p-4 font-mono text-[12px] leading-relaxed text-ink-100">
              {embed}
            </pre>
            <div className="mt-3">
              <CopyButton value={embed} label="Copy embed code" />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="overflow-hidden">
          <CardHeader title="Business card preview" description="How the printed side could look." />
          <div className="bg-ink-100 p-6">
            <div
              className={cx("mx-auto flex aspect-[85/55] w-full max-w-[300px] flex-col justify-between rounded-xl p-5 shadow-lift")}
              style={{ background: "#0a0a0b", color: "#fff" }}
            >
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.02em]">{ownerName || businessName}</p>
                <p className="mt-0.5 text-[11.5px] text-white/50">{businessName}</p>
              </div>
              <div className="flex items-end justify-between gap-3">
                <p className="font-mono text-[10.5px] leading-tight text-white/70">
                  {fullUrl.replace(/^https?:\/\//, "")}
                </p>
                <div className="rounded-md bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/qr/${slug}?margin=0`} alt="" width={46} height={46} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Where to put it" />
          <ul className="divide-y divide-ink-100">
            {[
              { icon: "instagram", label: "Your Instagram bio", detail: "The single link slot" },
              { icon: "mail", label: "Email signature", detail: "Under your name" },
              { icon: "pin", label: "Window or yard sign", detail: "QR at eye height" },
              { icon: "card", label: "Business cards", detail: "QR on the back" },
              { icon: "nfc", label: "NFC card in your wallet", detail: "For meetings" },
              { icon: "ticket", label: "Printed brochures", detail: "Beside the price" },
            ].map((row) => (
              <li key={row.label} className="flex items-center gap-3 px-5 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600">
                  <Icon name={row.icon} size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-ink-900">{row.label}</span>
                  <span className="block text-[11.5px] text-ink-400">{row.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
