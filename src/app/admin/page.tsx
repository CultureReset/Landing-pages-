import type { Metadata } from "next";
import { AdminTenants } from "@/components/admin/tenants";
import { Card, CardHeader, PageHeader, Stat } from "@/components/ui/primitives";
import { compact } from "@/lib/format";
import { requireAdmin } from "@/lib/guard";
import { platformStats, tenantSummaries } from "@/lib/repo";
import { PLANS, planById } from "@/config/plans";

export const metadata: Metadata = { title: "Operator console" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const admin = await requireAdmin();
  const { q = "", page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage ?? 1) || 1);

  const stats = platformStats();
  const { rows, total } = tenantSummaries({
    query: q,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const storageGb = (stats.storageBytes / 1024 / 1024 / 1024).toFixed(2);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operator console"
        description="Everyone signed up on this deployment. Only accounts listed in ADMIN_EMAILS can see this."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tenants" value={compact(stats.tenants)} icon="users" hint={`${stats.published} live`} />
        <Stat label="New this month" value={compact(stats.newThisMonth)} icon="trending" />
        <Stat label="Views (30d)" value={compact(stats.views30)} icon="eye" />
        <Stat label="Leads captured" value={compact(stats.leads)} icon="inbox" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
        <AdminTenants
          rows={rows}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          query={q}
          plans={PLANS.map((p) => ({ id: p.id, name: p.name }))}
          adminUserId={admin.id}
        />

        <Card className="h-fit">
          <CardHeader title="Mix" description="Accounts by plan" />
          <ul className="divide-y divide-ink-100">
            {stats.byPlan.map((row) => (
              <li key={row.plan} className="flex items-center justify-between px-5 py-3 text-[13px]">
                <span className="text-ink-700">{planById(row.plan).name}</span>
                <span className="font-semibold tabular-nums text-ink-950">{row.c}</span>
              </li>
            ))}
            <li className="flex items-center justify-between px-5 py-3 text-[13px]">
              <span className="text-ink-700">Uploads</span>
              <span className="font-semibold tabular-nums text-ink-950">{storageGb} GB</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
