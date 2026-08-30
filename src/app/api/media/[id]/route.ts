import { NextResponse } from "next/server";
import { get } from "@/lib/db";

/**
 * Serves an uploaded image straight out of SQLite, so uploads work anywhere.
 *
 * Tenant-uploaded files are served from our own origin, so they are treated as
 * hostile: an SVG can carry <script>, and without these headers opening one
 * directly would run it with the app's origin — letting one tenant act as any
 * visitor who follows the link. The sandbox CSP neutralises scripts, plugins
 * and same-origin access; nosniff stops a mislabelled file being re-typed into
 * something executable.
 */
const SAFE_HEADERS = {
  "Content-Security-Policy":
    "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-site",
  "Cache-Control": "public, max-age=31536000, immutable",
} as const;

/** Types we are willing to hand back inline. Anything else downloads. */
const INLINE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = get<{ mime: string; bytes: Uint8Array }>(
    "SELECT mime, bytes FROM media WHERE id = ?",
    id,
  );
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const inline = INLINE_TYPES.has(row.mime);

  return new NextResponse(new Uint8Array(row.bytes) as unknown as BodyInit, {
    headers: {
      ...SAFE_HEADERS,
      "Content-Type": inline ? row.mime : "application/octet-stream",
      "Content-Disposition": inline ? "inline" : `attachment; filename="${id}"`,
    },
  });
}
