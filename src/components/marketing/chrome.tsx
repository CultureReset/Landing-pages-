"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand";
import { Icon } from "@/components/ui/icon";
import { buttonClass, cx } from "@/components/ui/primitives";
import { brand } from "@/config/brand";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#examples", label: "Examples" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function MarketingNav({ signedIn }: { signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cx(
        "sticky top-0 z-50 transition-all duration-200",
        scrolled ? "border-b border-ink-200 bg-white/85 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" aria-label={`${brand.name} home`}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-[13.5px] font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link href="/dashboard" className={buttonClass("primary", "sm")}>
              Open dashboard
              <Icon name="arrowRight" size={15} />
            </Link>
          ) : (
            <>
              <Link href="/login" className={cx(buttonClass("ghost", "sm"), "hidden sm:inline-flex")}>
                Log in
              </Link>
              <Link href="/signup" className={buttonClass("primary", "sm")}>
                Start free
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 md:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            <Icon name={open ? "close" : "menu"} size={18} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink-200 bg-white px-5 py-3 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-ink-700 hover:bg-ink-100"
            >
              {l.label}
            </a>
          ))}
          <Link href="/login" className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-ink-700 hover:bg-ink-100">
            Log in
          </Link>
        </nav>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-ink-200 bg-ink-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-ink-500">
            One link that holds your listings, your services, your socials and every way to reach you — with a
            dashboard behind it.
          </p>
        </div>

        {[
          {
            title: "Product",
            links: [
              { href: "#how", label: "How it works" },
              { href: "#features", label: "Features" },
              { href: "#pricing", label: "Pricing" },
              { href: "#examples", label: "Live examples" },
            ],
          },
          {
            title: "Get started",
            links: [
              { href: "/signup", label: "Start free trial" },
              { href: "/login", label: "Log in" },
            ],
          },
          {
            title: "Legal",
            links: [
              { href: "/legal/privacy", label: "Privacy" },
              { href: "/legal/terms", label: "Terms" },
              { href: "/legal/refunds", label: "Refunds" },
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-400">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-[13.5px] text-ink-600 transition-colors hover:text-ink-950">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-[12.5px] text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
          <span>Built as a working demo — every page you see here is live.</span>
        </div>
      </div>
    </footer>
  );
}
