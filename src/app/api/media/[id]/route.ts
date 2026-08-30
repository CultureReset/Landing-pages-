import { NextResponse } from "next/server";
import { get } from "@/lib/db";

/** Serves an uploaded image straight out of SQLite, so uploads work anywhere. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = get<{ mime: string; bytes: Uint8Array }>("SELECT mime, bytes FROM media WHERE id = ?", id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(new Uint8Array(row.bytes) as unknown as BodyInit, {
    headers: {
      "Content-Type": row.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
