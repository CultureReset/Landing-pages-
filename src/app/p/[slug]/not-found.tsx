import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-6 text-center text-white">
      <div>
        <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/5">
          <Icon name="search" size={24} />
        </span>
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">This page isn&apos;t live</h1>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-white/55">
          The link may be wrong, or the business may have unpublished their page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-ink-950"
        >
          <Icon name="bolt" size={16} />
          Make your own Frontdesk
        </Link>
      </div>
    </main>
  );
}
