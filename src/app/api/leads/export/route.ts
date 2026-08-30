import { NextResponse } from "next/server";
import { requireSite } from "@/lib/guard";
import { itemById, leadsForSite } from "@/lib/repo";

function cell(value: string): string {
  const v = value ?? "";
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function GET() {
  const { site } = await requireSite();
  const leads = leadsForSite(site.id);

  const header = ["Received", "Name", "Email", "Phone", "Status", "Source", "About", "Message", "Notes"];
  const rows = leads.map((l) => [
    l.created_at,
    l.name,
    l.email,
    l.phone,
    l.status,
    l.source,
    l.item_id ? (itemById(l.item_id)?.title ?? "") : "",
    l.message,
    l.notes,
  ]);

  const csv = [header, ...rows].map((r) => r.map((c) => cell(String(c))).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.slug}-leads.csv"`,
    },
  });
}
