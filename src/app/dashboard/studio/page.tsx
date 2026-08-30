import type { Metadata } from "next";
import { Studio } from "@/components/dashboard/studio";
import { PageHeader } from "@/components/ui/primitives";
import { requireSite } from "@/lib/guard";
import { itemsForSite } from "@/lib/repo";
import { vocab } from "@/lib/vocab";

export const metadata: Metadata = { title: "Studio" };
export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const { user, site } = await requireSite();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Studio"
        description="Two tools that turn what's already in your dashboard into something you can publish: draft copy and branded share covers."
      />
      <Studio
        items={itemsForSite(site.id)}
        vocab={vocab(site.business_type)}
        credits={user.credits}
        accent={site.theme.accent}
        businessName={site.business_name}
      />
    </div>
  );
}
