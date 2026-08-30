import type { Metadata } from "next";
import { LivePreview } from "@/components/dashboard/preview";
import {
  AddressPanel,
  GalleryPanel,
  HighlightsPanel,
  HoursPanel,
  ProfilePanel,
  SectionsPanel,
  ThemePanel,
} from "@/components/dashboard/builder/panels";
import { Tabs } from "@/components/ui/interactive";
import { PageHeader } from "@/components/ui/primitives";
import { requireSite } from "@/lib/guard";

export const metadata: Metadata = { title: "Page builder" };
export const dynamic = "force-dynamic";

export default async function BuilderPage() {
  const { site } = await requireSite();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Page builder"
        description="Everything a visitor sees, in one place. Changes save straight to your live page."
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <Tabs
            tabs={[
              { id: "profile", label: "Profile", icon: "user", content: <ProfilePanel site={site} /> },
              { id: "theme", label: "Theme", icon: "palette", content: <ThemePanel site={site} /> },
              { id: "sections", label: "Sections", icon: "layers", content: <SectionsPanel sections={site.layout} /> },
              { id: "highlights", label: "Highlights", icon: "chart", content: <HighlightsPanel stats={site.stats} /> },
              { id: "gallery", label: "Gallery", icon: "image", content: <GalleryPanel gallery={site.gallery} /> },
              { id: "hours", label: "Hours", icon: "clock", content: <HoursPanel hours={site.hours} /> },
              { id: "address", label: "Address & SEO", icon: "globe", content: <AddressPanel site={site} /> },
            ]}
          />
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-20">
            <LivePreview slug={site.slug} version={site.updated_at} />
          </div>
        </div>
      </div>
    </div>
  );
}
