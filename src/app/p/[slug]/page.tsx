import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SitePage } from "@/components/public/site-page";
import { loadPageData } from "@/lib/page-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = loadPageData(slug);
  if (!data) return { title: "Page not found" };
  const { site } = data;
  const title = site.seo.title || `${site.owner_name || site.business_name} — ${site.business_name}`;
  const description = site.seo.description || site.tagline || site.bio.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `/p/${site.slug}` },
    openGraph: {
      title,
      description,
      type: "profile",
      images: site.cover_url ? [site.cover_url] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = loadPageData(slug);
  if (!data || data.site.published !== 1) notFound();
  return <SitePage data={data} />;
}
