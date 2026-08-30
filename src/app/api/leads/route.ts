import { NextResponse } from "next/server";
import { createLead, itemById, recordEvent, siteById } from "@/lib/repo";
import { LIMITS, clientIp, hit } from "@/lib/rate-limit";

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
  if (!site || site.suspended === 1) {
    return NextResponse.json({ error: "Unknown page" }, { status: 404 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right" }, { status: 400 });
  }

  const throttle = hit(
    `lead:${siteId}:${clientIp(request)}`,
    LIMITS.leads.limit,
    LIMITS.leads.windowSeconds,
  );
  if (!throttle.ok) {
    return NextResponse.json(
      { error: "You've sent a few messages already — give it a few minutes." },
      { status: 429, headers: { "Retry-After": String(throttle.retryAfterSeconds) } },
    );
  }

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
