import Link from "next/link";
import { Logo } from "@/components/brand";
import { Icon } from "@/components/ui/icon";
import { buttonClass } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <Logo className="mx-auto" />
        <p className="mt-8 font-mono text-[13px] text-ink-400">404</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink-950">
          There&apos;s nothing at this address
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-500">
          The link may be mistyped, or the page may have moved.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link href="/" className={buttonClass("primary", "md")}>
            <Icon name="home" size={16} />
            Back home
          </Link>
          <Link href="/dashboard" className={buttonClass("secondary", "md")}>
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
