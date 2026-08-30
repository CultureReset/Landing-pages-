"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

export function Gallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  if (!images.length) return null;

  return (
    <>
      <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpen(i)}
            className="relative size-[132px] shrink-0 overflow-hidden transition-transform active:scale-95"
            style={{ borderRadius: "var(--s-card-radius)", border: `1px solid var(--s-border)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[open]}
            alt=""
            className="max-h-[86vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur"
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? null : (i - 1 + images.length) % images.length));
                }}
                className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur"
                aria-label="Previous"
              >
                <Icon name="chevron" size={18} className="rotate-180" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? null : (i + 1) % images.length));
                }}
                className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur"
                aria-label="Next"
              >
                <Icon name="chevron" size={18} />
              </button>
              <span className="absolute bottom-5 rounded-full bg-white/10 px-3 py-1 text-[12px] text-white backdrop-blur">
                {open + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
}
