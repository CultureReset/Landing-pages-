import { NextResponse } from "next/server";
import { createLead, itemById, recordEvent, siteById } from "@/lib/repo";

/** Naive in-memory throttle — one submission per site per IP every 20 seconds. */
const recent = new Map<string, number>();

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Honeypot: only bots fill this field in.
  if (String(body.company ?? "").trim()) {
    return new NextResponse(null, { status: 204 });
  }

  const siteId = String(body.siteId ?? "");
  const site = siteById(siteId);
  if (!site) return NextResponse.json({ error: "Unknown page" }, { status: 404 });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${siteId}:${ip}`;
  const last = recent.get(key) ?? 0;
  if (Date.now() - last < 20_000) {
    return NextResponse.json({ error: "You just sent a message — give it a moment." }, { status: 429 });
  }
  recent.set(key, Date.now());

  const itemId = body.itemId ? String(body.itemId) : null;
  const item = itemId ? itemById(itemId) : null;

  const lead = createLead(site.id, {
    item_id: item && item.site_id === site.id ? item.id : null,
    name: name.slice(0, 120),
    email: email.slice(0, 160),
    phone: String(body.phone ?? "").trim().slice(0, 40),
    message: message.slice(0, 4000),
    source: item ? `${item.title}` : "Page form",
    status: "new",
  });

  recordEvent(site.id, { kind: "lead", target_id: lead.id, target_label: "Enquiry" });

  return NextResponse.json({ ok: true }, { status: 201 });
}
