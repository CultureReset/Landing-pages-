import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { id, now, run } from "@/lib/db";
import { siteByUser } from "@/lib/repo";

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];

/** Stores uploads as blobs in SQLite so the app needs no object storage. */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

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
  const mediaId = id("med").replace(/[^a-z0-9_]/gi, "");
  const site = siteByUser(user.id);

  run(
    "INSERT INTO media (id, site_id, mime, filename, bytes, size, created_at) VALUES (?,?,?,?,?,?,?)",
    mediaId,
    site?.id ?? null,
    file.type,
    file.name.slice(0, 120),
    bytes,
    bytes.length,
    now(),
  );

  return NextResponse.json({ url: `/api/media/${mediaId}`, id: mediaId, size: bytes.length });
}
