"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand";
import { Icon } from "@/components/ui/icon";
import { Avatar, cx } from "@/components/ui/primitives";
import { NAV, NAV_GROUPS } from "./nav";

export function DashboardShell({
  user,
  topbar,
  children,
}: {
  user: { name: string; email: string; avatar_url: string | null; plan: string; isAdmin: boolean };
  topbar: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const active = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between px-5">
        <Link href="/dashboard" aria-label="Dashboard home">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 lg:hidden"
          aria-label="Close menu"
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      <nav className="thin-scroll flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group} className="mb-5">
            <p className="mb-1.5 px-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-400">
              {group}
            </p>
            {NAV.filter((n) => n.group === group).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                  active(item)
                    ? "bg-ink-950 text-white"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-950",
                )}
              >
                <Icon name={item.icon} size={17} className={active(item) ? "" : "text-ink-400"} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-ink-200 p-3">
        {user.isAdmin && (
          <Link
            href="/admin"
            className={cx(
              "mb-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-ink-950 text-white"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-950",
            )}
          >
            <Icon name="shield" size={16} className="text-ink-400" />
            Operator console
          </Link>
        )}
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-ink-100"
        >
          <Avatar src={user.avatar_url} name={user.name} size={32} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink-950">{user.name}</span>
            <span className="block truncate text-[11.5px] capitalize text-ink-400">{user.plan} plan</span>
          </span>
          <Icon name="chevron" size={14} className="text-ink-300" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-ink-200 bg-white lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-ink-200 bg-white">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden"
            aria-label="Open menu"
          >
            <Icon name="menu" size={18} />
          </button>
          {topbar}
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
