import type { ReactNode } from "react";
import Link from "next/link";
import { LogoLink } from "@/components/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,44%)]">
      <main className="flex flex-col px-6 py-8 sm:px-10">
        <LogoLink />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <footer className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-ink-400">
          <span>© {new Date().getFullYear()} Frontdesk</span>
          <Link href="/legal/privacy" className="hover:text-ink-700">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-ink-700">Terms</Link>
        </footer>
      </main>

      <aside className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(70% 55% at 20% 0%, rgba(248,72,26,0.34) 0%, transparent 62%), radial-gradient(60% 50% at 90% 20%, rgba(30,86,217,0.26) 0%, transparent 66%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-white/45">
            One link. Everything you sell.
          </p>
          <div>
            <blockquote className="max-w-md text-[26px] font-semibold leading-[1.25] tracking-[-0.03em]">
              “People find me on Instagram, tap one link, and by the time they call they already know what I have and
              what it costs.”
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-white/10 text-[13px] font-semibold">
                NV
              </span>
              <span className="text-[13.5px]">
                <b className="block font-medium">Nora Vance</b>
                <span className="text-white/50">Vance &amp; Co. Realty</span>
              </span>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-7">
            {[
              ["11k", "page views / mo"],
              ["4.6%", "view to enquiry"],
              ["48h", "to go live"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-[22px] font-semibold tracking-[-0.03em]">{value}</dt>
                <dd className="mt-0.5 text-[12px] text-white/45">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
