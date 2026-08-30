import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { id, now, run } from "@/lib/db";
import { siteByUser } from "@/lib/repo";
import { storage } from "@/lib/entitlements";
import { LIMITS, hit } from "@/lib/rate-limit";
import { features } from "@/config/features";

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];

/** Stores uploads as blobs in SQLite so the app needs no object storage. */
export async function POST(request: Request) {
  if (!features.uploads) {
    return NextResponse.json({ error: "Uploads are disabled on this workspace." }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (user.suspended === 1) return NextResponse.json({ error: "Account suspended" }, { status: 403 });

  const throttle = hit(`upload:${user.id}`, LIMITS.uploads.limit, LIMITS.uploads.windowSeconds);
  if (!throttle.ok) {
    return NextResponse.json({ error: "Too many uploads just now — try again shortly." }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, WebP, AVIF, GIF or SVG image." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Images must be under 6 MB." }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const site = siteByUser(user.id);
  if (!site) return NextResponse.json({ error: "No page to attach this to" }, { status: 400 });

  const quota = storage(user.plan, site.id, bytes.length);
  if (!quota.allowed) return NextResponse.json({ error: quota.message }, { status: 413 });

  const mediaId = id("med").replace(/[^A-Za-z0-9_-]/g, "");

  run(
    "INSERT INTO media (id, site_id, user_id, mime, filename, bytes, size, created_at) VALUES (?,?,?,?,?,?,?,?)",
    mediaId,
    site.id,
    user.id,
    file.type,
    file.name.slice(0, 120),
    bytes,
    bytes.length,
    now(),
  );

  return NextResponse.json({ url: `/api/media/${mediaId}`, id: mediaId, size: bytes.length });
}
