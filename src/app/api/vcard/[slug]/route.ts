import { NextResponse } from "next/server";
import { linksForSite, recordEvent, siteBySlug } from "@/lib/repo";
import { publicUrl } from "@/lib/urls";

/** RFC 6350 text escaping: backslash, semicolon, comma and newline. */
function escapeVcf(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const site = siteBySlug(slug);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const name = site.owner_name || site.business_name;
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");
  const socials = linksForSite(site.id, true).filter((l) =>
    ["instagram", "linkedin", "tiktok", "facebook", "youtube", "x"].includes(l.kind),
  );

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcf(last)};${escapeVcf(first)};;;`,
    `FN:${escapeVcf(name)}`,
    site.business_name && `ORG:${escapeVcf(site.business_name)}`,
    site.headline && `TITLE:${escapeVcf(site.headline)}`,
    site.phone && `TEL;TYPE=CELL,VOICE:${site.phone}`,
    site.email && `EMAIL;TYPE=INTERNET,WORK:${site.email}`,
    site.address && `ADR;TYPE=WORK:;;${escapeVcf(site.address)};;;;`,
    `URL:${publicUrl(site.slug, request)}`,
    site.website && `URL;TYPE=WORK:${site.website}`,
    ...socials.map((s) => `X-SOCIALPROFILE;TYPE=${s.kind}:${s.value}`),
    site.tagline && `NOTE:${escapeVcf(site.tagline)}`,
    `REV:${new Date().toISOString()}`,
    "END:VCARD",
  ].filter(Boolean);

  recordEvent(site.id, { kind: "save_contact", target_label: "Save contact" });

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.slug}.vcf"`,
    },
  });
}
