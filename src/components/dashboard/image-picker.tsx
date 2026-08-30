"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/interactive";
import { cx } from "@/components/ui/primitives";

/**
 * Upload or paste an image URL. Keeps the resolved URL in a hidden input so it
 * submits with the surrounding server-action form.
 */
export function ImagePicker({
  name,
  label,
  defaultValue,
  aspect = "square",
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  aspect?: "square" | "wide";
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-800">{label}</span>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={cx(
            "group relative shrink-0 overflow-hidden border border-dashed border-ink-300 bg-ink-50 transition-colors hover:border-ink-400",
            aspect === "square" ? "size-20 rounded-2xl" : "h-20 w-36 rounded-xl",
          )}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-ink-400">
              <Icon name="image" size={20} />
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-white/70 text-ink-700">
              <Spinner size={18} />
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 bg-ink-950/70 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            Change
          </span>
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste an image URL, or upload"
            className="h-9 w-full rounded-lg border border-ink-200 bg-white px-2.5 font-mono text-[12px] text-ink-700 placeholder:font-sans placeholder:text-ink-400 focus:border-ink-950 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 text-[12.5px] font-medium text-ink-700 hover:border-ink-300"
            >
              <Icon name="download" size={13} className="rotate-180" />
              Upload
            </button>
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-950"
              >
                <Icon name="trash" size={13} />
                Remove
              </button>
            )}
          </div>
          {error ? (
            <p className="text-[12px] text-[var(--color-negative)]">{error}</p>
          ) : (
            hint && <p className="text-[12px] leading-relaxed text-ink-400">{hint}</p>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
