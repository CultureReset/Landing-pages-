import { NextResponse } from "next/server";
import { avatarSvg, placeholderSvg } from "@/lib/placeholder";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export async function GET(request: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  const q = new URL(request.url).searchParams;
  const w = clamp(Number(q.get("w") ?? 1200) || 1200, 32, 2400);
  const h = clamp(Number(q.get("h") ?? 800) || 800, 32, 2400);

  const svg =
    q.get("kind") === "avatar"
      ? avatarSvg(seed, (q.get("t") ?? "?").slice(0, 2).toUpperCase(), Math.max(w, h))
      : placeholderSvg(seed, w, h);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
