import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemEditor } from "@/components/dashboard/item-editor";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/primitives";
import { requireSite } from "@/lib/guard";
import { itemById, itemCategories } from "@/lib/repo";
import { vocab } from "@/lib/vocab";

export const metadata: Metadata = { title: "Edit entry" };
export const dynamic = "force-dynamic";

export default async function ItemEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site } = await requireSite();
  const v = vocab(site.business_type);
  const isNew = id === "new";
  const item = isNew ? undefined : itemById(id) ?? undefined;

  if (!isNew && (!item || item.site_id !== site.id)) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <Link href="/dashboard/showcase" className="inline-flex items-center gap-1 hover:text-ink-900">
            <Icon name="chevron" size={12} className="rotate-180" />
            {v.itemPlural}
          </Link>
        }
        title={isNew ? `New ${v.itemSingular.toLowerCase()}` : item!.title}
        description={
          isNew
            ? "Only a title is required — you can fill in the rest later."
            : "Changes go live on your page as soon as you save."
        }
      />
      <ItemEditor
        item={item}
        vocab={v}
        slug={site.slug}
        categories={itemCategories(site.id)}
        defaultLocation={site.location}
      />
    </div>
  );
}
