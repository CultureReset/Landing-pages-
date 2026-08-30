import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { Icon } from "@/components/ui/icon";
import { Badge, buttonClass } from "@/components/ui/primitives";
import { requireAdmin } from "@/lib/guard";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge tone="dark">Operator</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[12.5px] text-ink-500 sm:block">{admin.email}</span>
            <Link href="/dashboard" className={buttonClass("secondary", "sm")}>
              <Icon name="arrowRight" size={14} />
              My dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6">{children}</main>
    </div>
  );
}
