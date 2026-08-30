import { NextResponse } from "next/server";
import { recordEvent, siteById } from "@/lib/repo";
import type { EventKind } from "@/lib/types";

const ALLOWED: EventKind[] = [
  "view",
  "link_click",
  "item_view",
  "action_click",
  "lead",
  "save_contact",
  "share",
  "qr_scan",
];

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const siteId = String(body.siteId ?? "");
  const kind = String(body.kind ?? "view") as EventKind;
  if (!siteId || !ALLOWED.includes(kind)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }
  if (!siteById(siteId)) {
    return NextResponse.json({ error: "Unknown site" }, { status: 404 });
  }

  recordEvent(siteId, {
    kind,
    target_id: body.targetId ? String(body.targetId) : null,
    target_label: String(body.label ?? "").slice(0, 120),
    device: String(body.device ?? "").slice(0, 40),
    referrer: String(body.referrer ?? "").slice(0, 80),
  });

  return new NextResponse(null, { status: 204 });
}
