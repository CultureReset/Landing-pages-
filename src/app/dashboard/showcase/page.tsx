import type { Metadata } from "next";
import { ShowcaseTable } from "@/components/dashboard/showcase-table";
import { ButtonLink, PageHeader, Stat } from "@/components/ui/primitives";
import { requireSite } from "@/lib/guard";
import { itemCategories, itemsForSite } from "@/lib/repo";
import { money } from "@/lib/format";
import { vocab } from "@/lib/vocab";

export const metadata: Metadata = { title: "Showcase" };
export const dynamic = "force-dynamic";

export default async function ShowcasePage() {
  const { site } = await requireSite();
  const items = itemsForSite(site.id);
  const v = vocab(site.business_type);
  const priced = items.filter((i) => i.price != null);
  const avg = priced.length ? priced.reduce((sum, i) => sum + (i.price ?? 0), 0) / priced.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={v.itemPlural}
        description={`Everything you want people to browse. Drag to set the order they appear in on your page.`}
        actions={
          <ButtonLink href="/dashboard/showcase/new" icon="plus">
            Add {v.itemSingular.toLowerCase()}
          </ButtonLink>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total" value={items.length} icon="grid" />
        <Stat label="Live" value={items.filter((i) => i.active === 1).length} icon="eye" />
        <Stat label="Featured" value={items.filter((i) => i.featured === 1).length} icon="star" />
        <Stat label={`Average ${v.priceLabel.toLowerCase()}`} value={avg ? money(Math.round(avg)) : "—"} icon="card" />
      </div>

      <ShowcaseTable items={items} vocab={v} categories={itemCategories(site.id)} slug={site.slug} />
    </div>
  );
}
