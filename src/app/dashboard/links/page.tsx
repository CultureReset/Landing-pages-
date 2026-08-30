import type { Metadata } from "next";
import { LinksManager } from "@/components/dashboard/links-manager";
import { PageHeader } from "@/components/ui/primitives";
import { requireSite } from "@/lib/guard";
import { linksForSite } from "@/lib/repo";

export const metadata: Metadata = { title: "Links & actions" };
export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const { site } = await requireSite();
  const all = linksForSite(site.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Links & actions"
        description="Every way a visitor can reach you or move to the next step. Order matters — most taps land in the first three."
      />
      <LinksManager
        actions={all.filter((l) => l.is_action === 1)}
        links={all.filter((l) => l.is_action !== 1)}
      />
    </div>
  );
}
