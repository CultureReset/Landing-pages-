import type { Metadata } from "next";
import { LeadsBoard } from "@/components/dashboard/leads-board";
import { ButtonLink, PageHeader, Stat } from "@/components/ui/primitives";
import { leadCounts } from "@/lib/analytics";
import { requireSite } from "@/lib/guard";
import { itemsForSite, leadsForSite } from "@/lib/repo";

export const metadata: Metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { site } = await requireSite();
  const { lead } = await searchParams;
  const leads = leadsForSite(site.id);
  const counts = leadCounts(site.id);
  const titles = Object.fromEntries(itemsForSite(site.id).map((i) => [i.id, i.title]));
  const conversion = counts.total ? Math.round((counts.won / counts.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Everyone who filled in your form, with what they asked about and where they came from."
        actions={
          <ButtonLink href="/api/leads/export" variant="secondary" size="sm" icon="download" prefetch={false}>
            Export CSV
          </ButtonLink>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="All time" value={counts.total} icon="inbox" />
        <Stat label="Waiting on you" value={counts.new} icon="alert" hint="Status still “new”" />
        <Stat label="Won" value={counts.won} icon="checkCircle" />
        <Stat label="Win rate" value={`${conversion}%`} icon="target" />
      </div>

      <LeadsBoard leads={leads} itemTitles={titles} initialLead={lead} />
    </div>
  );
}
