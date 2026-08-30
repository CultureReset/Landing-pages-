"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/interactive";
import { cx } from "@/components/ui/primitives";

/** Multi-image field. Serialises to a newline-joined hidden textarea. */
export function MultiImagePicker({
  name,
  defaultValue = [],
  max = 12,
}: {
  name: string;
  defaultValue?: string[];
  max?: number;
}) {
  const [images, setImages] = useState<string[]>(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [urlDraft, setUrlDraft] = useState("");

  async function upload(files: FileList) {
    setBusy(true);
    setError("");
    const next = [...images];
    for (const file of Array.from(files).slice(0, max - images.length)) {
      const body = new FormData();
      body.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        next.push(json.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setImages(next);
    setBusy(false);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImages(next);
  }

  return (
    <div>
      <textarea name={name} value={images.join("\n")} readOnly hidden />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={src + i}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-ink-200 bg-ink-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                Cover
              </span>
            )}
            <div className="absolute inset-x-1 bottom-1 flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                className="grid size-7 place-items-center rounded-lg bg-white/95 text-ink-700 shadow-sm hover:text-ink-950"
                aria-label="Move left"
              >
                <Icon name="chevron" size={13} className="rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                className="grid size-7 place-items-center rounded-lg bg-white/95 text-ink-700 shadow-sm hover:text-[var(--color-negative)]"
                aria-label="Remove image"
              >
                <Icon name="trash" size={13} />
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                className="grid size-7 place-items-center rounded-lg bg-white/95 text-ink-700 shadow-sm hover:text-ink-950"
                aria-label="Move right"
              >
                <Icon name="chevron" size={13} />
              </button>
            </div>
          </div>
        ))}

        <label
          className={cx(
            "grid aspect-[4/3] cursor-pointer place-items-center rounded-xl border border-dashed border-ink-300 bg-ink-50 text-ink-400 transition-colors hover:border-ink-400 hover:text-ink-600",
            images.length >= max && "pointer-events-none opacity-40",
          )}
        >
          <span className="flex flex-col items-center gap-1">
            {busy ? <Spinner size={18} /> : <Icon name="plus" size={18} />}
            <span className="text-[11px] font-medium">Add</span>
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="…or paste an image URL"
          className="h-9 flex-1 rounded-lg border border-ink-200 bg-white px-2.5 font-mono text-[12px] placeholder:font-sans placeholder:text-ink-400 focus:border-ink-950 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            if (!urlDraft.trim() || images.length >= max) return;
            setImages([...images, urlDraft.trim()]);
            setUrlDraft("");
          }}
          className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-[12.5px] font-medium text-ink-700 hover:border-ink-300"
        >
          Add URL
        </button>
      </div>

      <p className="mt-2 text-[12px] text-ink-400">
        {error ? (
          <span className="text-[var(--color-negative)]">{error}</span>
        ) : (
          `${images.length} of ${max}. The first image is the cover — drag order with the arrows.`
        )}
      </p>
    </div>
  );
}
