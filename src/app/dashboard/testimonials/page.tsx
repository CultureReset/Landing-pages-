import type { Metadata } from "next";
import { TestimonialsManager } from "@/components/dashboard/testimonials-manager";
import { PageHeader } from "@/components/ui/primitives";
import { requireSite } from "@/lib/guard";
import { testimonialsForSite } from "@/lib/repo";

export const metadata: Metadata = { title: "Testimonials" };
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const { site } = await requireSite();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Social proof, in your clients' own words. It sits between your showcase and your contact form for a reason."
      />
      <TestimonialsManager items={testimonialsForSite(site.id)} />
    </div>
  );
}
