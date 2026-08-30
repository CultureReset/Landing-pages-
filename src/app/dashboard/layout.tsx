import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { Topbar } from "@/components/dashboard/topbar";
import { requireSite } from "@/lib/guard";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, site } = await requireSite();
  return (
    <DashboardShell
      user={{ name: user.name, email: user.email, avatar_url: user.avatar_url, plan: user.plan }}
      topbar={<Topbar slug={site.slug} published={site.published === 1} credits={user.credits} />}
    >
      {children}
    </DashboardShell>
  );
}
