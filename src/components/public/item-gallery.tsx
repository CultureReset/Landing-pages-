"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function ItemGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) {
    return (
      <div
        className="grid aspect-[4/3] w-full place-items-center"
        style={{ background: "var(--s-surface)", borderRadius: "var(--s-card-radius)", color: "var(--s-muted)" }}
      >
        <Icon name="image" size={28} />
      </div>
    );
  }
  return (
    <div>
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ borderRadius: "var(--s-card-radius)", border: `1px solid var(--s-border)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={alt} className="size-full object-cover" />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-transform active:scale-90"
              aria-label="Previous image"
            >
              <Icon name="chevron" size={16} className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => (i + 1) % images.length)}
              className="absolute right-2.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-transform active:scale-90"
              aria-label="Next image"
            >
              <Icon name="chevron" size={16} />
            </button>
            <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur tabular-nums">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className="size-16 shrink-0 overflow-hidden transition-opacity"
              style={{
                borderRadius: 10,
                border: `2px solid ${i === active ? "var(--s-accent)" : "var(--s-border)"}`,
                opacity: i === active ? 1 : 0.6,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
