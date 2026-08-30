"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/components/ui/primitives";

/**
 * Renders the real public page inside an iframe so media queries and theme
 * variables behave exactly as they will for a visitor.
 */
export function LivePreview({
  slug,
  version,
  className,
}: {
  slug: string;
  version: string;
  className?: string;
}) {
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [nonce, setNonce] = useState(0);
  const src = `/p/${slug}?preview=1&v=${encodeURIComponent(version)}&n=${nonce}`;

  return (
    <div className={cx("flex flex-col items-center", className)}>
      <div className="mb-3 flex w-full items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">Live preview</span>
        <div className="flex items-center gap-1">
          <div className="flex rounded-lg border border-ink-200 bg-white p-0.5">
            {(["phone", "desktop"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className={cx(
                  "grid size-7 place-items-center rounded-md transition-colors",
                  device === d ? "bg-ink-950 text-white" : "text-ink-400 hover:text-ink-800",
                )}
                aria-label={d === "phone" ? "Phone preview" : "Desktop preview"}
              >
                <Icon name={d === "phone" ? "card" : "building"} size={14} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            className="grid size-8 place-items-center rounded-lg border border-ink-200 bg-white text-ink-400 transition-colors hover:text-ink-800"
            aria-label="Refresh preview"
          >
            <Icon name="refresh" size={14} />
          </button>
        </div>
      </div>

      <div
        className={cx(
          "relative overflow-hidden bg-ink-950 shadow-pop transition-all duration-300",
          device === "phone" ? "rounded-[2.2rem] p-2.5" : "rounded-2xl p-2",
        )}
        style={{ width: device === "phone" ? 340 : "100%" }}
      >
        {device === "phone" && (
          <span className="absolute left-1/2 top-4 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-ink-950" />
        )}
        <iframe
          key={src}
          src={src}
          title="Public page preview"
          className={cx("block w-full border-0 bg-white", device === "phone" ? "rounded-[1.7rem]" : "rounded-xl")}
          style={{ height: device === "phone" ? 690 : 760 }}
        />
      </div>

      <p className="mt-3 text-center text-[11.5px] leading-relaxed text-ink-400">
        Saved changes appear here immediately.
        <br />
        Visitors see this at <code className="font-mono">/p/{slug}</code>
      </p>
    </div>
  );
}
