"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/interactive";
import { track } from "./track";

export function LeadForm({
  siteId,
  itemId,
  itemTitle,
  compact,
  ownerName,
}: {
  siteId: string;
  itemId?: string;
  itemTitle?: string;
  compact?: boolean;
  ownerName: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const inputStyle: React.CSSProperties = {
    background: "var(--s-bg)",
    border: `1px solid var(--s-border)`,
    borderRadius: "var(--s-radius)",
    color: "var(--s-text)",
  };

  if (state === "sent") {
    return (
      <div
        className="flex flex-col items-center px-6 py-9 text-center"
        style={{
          background: "var(--s-surface)",
          border: `1px solid var(--s-border)`,
          borderRadius: "var(--s-card-radius)",
        }}
      >
        <span
          className="mb-3 grid size-11 place-items-center rounded-full"
          style={{ background: "var(--s-accent)", color: "var(--s-accent-text)" }}
        >
          <Icon name="check" size={20} strokeWidth={2.4} />
        </span>
        <p className="text-[15px] font-semibold">Message sent</p>
        <p className="mt-1 max-w-[34ch] text-[13px] leading-relaxed" style={{ color: "var(--s-muted)" }}>
          {ownerName.split(" ")[0]} has it and will come back to you directly.
        </p>
      </div>
    );
  }

  return (
    <form
      id="enquire"
      className="space-y-2.5 p-4"
      style={{
        background: "var(--s-surface)",
        border: `1px solid var(--s-border)`,
        borderRadius: "var(--s-card-radius)",
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        setState("sending");
        setError("");
        try {
          const res = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, siteId, itemId: itemId ?? null }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || "Something went wrong");
          }
          track(siteId, "lead", itemId ?? null, itemTitle || "Enquiry");
          setState("sent");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong");
          setState("error");
        }
      }}
    >
      {itemTitle && (
        <p className="pb-1 text-[12.5px]" style={{ color: "var(--s-muted)" }}>
          Enquiring about <b style={{ color: "var(--s-text)" }}>{itemTitle}</b>
        </p>
      )}
      <div className={compact ? "space-y-2.5" : "grid gap-2.5 sm:grid-cols-2"}>
        <input
          name="name"
          required
          placeholder="Your name"
          className="h-11 w-full px-3.5 text-[14px] outline-none placeholder:opacity-50 focus:ring-2"
          style={inputStyle}
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="h-11 w-full px-3.5 text-[14px] outline-none placeholder:opacity-50"
          style={inputStyle}
        />
      </div>
      <input
        name="phone"
        placeholder="Phone (optional)"
        className="h-11 w-full px-3.5 text-[14px] outline-none placeholder:opacity-50"
        style={inputStyle}
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder={itemTitle ? "When would you like to see it?" : "How can we help?"}
        className="w-full resize-y px-3.5 py-3 text-[14px] leading-relaxed outline-none placeholder:opacity-50"
        style={inputStyle}
      />
      {/* Honeypot — bots fill this, humans never see it */}
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {error && (
        <p className="text-[12.5px]" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex h-11 w-full items-center justify-center gap-2 text-[14.5px] font-semibold transition-transform active:scale-[0.99] disabled:opacity-60"
        style={{
          background: "var(--s-accent)",
          color: "var(--s-accent-text)",
          borderRadius: "var(--s-radius)",
        }}
      >
        {state === "sending" ? <Spinner size={16} /> : <Icon name="arrowRight" size={16} />}
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="pt-0.5 text-center text-[11px]" style={{ color: "var(--s-muted)" }}>
        Goes straight to {ownerName}. No newsletter, no third parties.
      </p>
    </form>
  );
}
