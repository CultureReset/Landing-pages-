"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { track } from "./track";

export function ShareButton({ siteId, slug, name }: { siteId: string; slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin + `/p/${slug}` : `/p/${slug}`;

  async function nativeShare() {
    track(siteId, "share", null, "Share");
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch {
        /* user dismissed — fall through to the sheet */
      }
    }
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={nativeShare}
        className="grid size-9 place-items-center transition-transform active:scale-90"
        style={{
          background: "var(--s-surface)",
          border: `1px solid var(--s-border)`,
          borderRadius: 999,
          color: "var(--s-text)",
        }}
        aria-label="Share this page"
      >
        <Icon name="share" size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
          <div
            className="relative z-10 w-full max-w-sm p-5 text-center"
            style={{
              background: "var(--s-surface)",
              border: `1px solid var(--s-border)`,
              borderRadius: "var(--s-card-radius)",
              color: "var(--s-text)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Share this page</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ color: "var(--s-muted)" }}>
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr/${slug}`} alt={`QR code for ${name}`} width={188} height={188} />
            </div>
            <p className="mt-3 break-all text-[12.5px]" style={{ color: "var(--s-muted)" }}>
              {url}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(url).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 text-[13.5px] font-medium"
                style={{ border: `1px solid var(--s-border)`, borderRadius: "var(--s-radius)" }}
              >
                <Icon name={copied ? "check" : "copy"} size={15} />
                {copied ? "Copied" : "Copy link"}
              </button>
              <a
                href={`/api/vcard/${slug}`}
                onClick={() => track(siteId, "save_contact", null, "Save contact")}
                className="inline-flex h-10 items-center justify-center gap-2 text-[13.5px] font-semibold"
                style={{ background: "var(--s-accent)", color: "var(--s-accent-text)", borderRadius: "var(--s-radius)" }}
              >
                <Icon name="download" size={15} />
                Save contact
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
