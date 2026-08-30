import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { siteBySlug } from "@/lib/repo";
import { baseUrl } from "@/lib/urls";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const site = siteBySlug(slug);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  const dark = url.searchParams.get("dark") || "#0a0a0b";
  const light = url.searchParams.get("light") || "#ffffff";
  const margin = Number(url.searchParams.get("margin") ?? 1);

  const target = `${baseUrl(request)}/p/${site.slug}?src=QR%20code`;

  const svg = await QRCode.toString(target, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: Number.isFinite(margin) ? margin : 1,
    color: { dark: dark.startsWith("#") ? dark : `#${dark}`, light: light.startsWith("#") ? light : `#${light}` },
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
