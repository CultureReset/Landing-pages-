import type { Metadata } from "next";
import { ShareKit } from "@/components/dashboard/share-kit";
import { PageHeader } from "@/components/ui/primitives";
import { requireSite } from "@/lib/guard";

export const metadata: Metadata = { title: "Share & QR" };
export const dynamic = "force-dynamic";

export default async function SharePage() {
  const { site } = await requireSite();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Share & QR"
        description="Everything you need to get your page in front of people — online, on print, and in the room."
      />
      <ShareKit
        slug={site.slug}
        businessName={site.business_name}
        ownerName={site.owner_name}
        accent={site.theme.accent}
      />
    </div>
  );
}
