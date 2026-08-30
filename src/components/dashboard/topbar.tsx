"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { CopyButton, Spinner } from "@/components/ui/interactive";
import { buttonClass, cx } from "@/components/ui/primitives";
import { setPublishedAction } from "@/lib/actions/site";
import { pagePath } from "@/config/brand";

export function Topbar({
  slug,
  published,
  credits,
}: {
  slug: string;
  published: boolean;
  credits: number;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cx(
            "hidden shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:inline-flex",
            published
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700",
          )}
        >
          <span className={cx("size-1.5 rounded-full", published ? "bg-emerald-500" : "bg-amber-500")} />
          {published ? "Live" : "Draft"}
        </span>
        <code className="truncate rounded-lg bg-ink-100 px-2.5 py-1.5 font-mono text-[12px] text-ink-700">
          {pagePath(slug)}
        </code>
        <CopyButton value={pagePath(slug)} variant="ghost" size="sm" iconOnly label="Copy page link" />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-ink-200 px-2.5 py-1 text-[11.5px] font-medium text-ink-600 md:inline-flex">
          <Icon name="sparkles" size={13} className="text-brand-500" />
          {credits} credits
        </span>

        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => void (await setPublishedAction(!published)))}
          className={buttonClass(published ? "secondary" : "primary", "sm")}
        >
          {pending ? <Spinner size={13} /> : <Icon name={published ? "eye" : "bolt"} size={14} />}
          {published ? "Unpublish" : "Publish"}
        </button>

        <Link
          href={pagePath(slug)}
          target="_blank"
          className={buttonClass("secondary", "sm")}
        >
          <Icon name="arrowUpRight" size={14} />
          <span className="hidden sm:inline">View page</span>
        </Link>
      </div>
    </div>
  );
}
