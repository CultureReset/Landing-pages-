import { NextResponse } from "next/server";
import { hexAlpha, isLight } from "@/lib/themes";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Composes a branded share card as SVG: the item photo, a scrim, your accent
 * bar and the copy. Renders server-side with no dependencies.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const title = (q.get("title") ?? "Untitled").slice(0, 70);
  const subtitle = (q.get("subtitle") ?? "").slice(0, 90);
  const price = (q.get("price") ?? "").slice(0, 24);
  const badge = (q.get("badge") ?? "").slice(0, 20);
  const brand = (q.get("brand") ?? "").slice(0, 40);
  const accent = q.get("accent") ?? "#f8481a";
  const image = q.get("image") ?? "";
  const ratio = q.get("ratio") ?? "square";

  const w = 1080;
  const h = ratio === "story" ? 1920 : ratio === "landscape" ? 608 : 1080;
  const accentText = isLight(accent) ? "#0a0a0b" : "#ffffff";
  const pad = 64;
  const baseline = h - pad;

  // A photo is embedded by reference; same-origin placeholders always resolve.
  const photo = image
    ? `<image href="${esc(image)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect width="${w}" height="${h}" fill="#141416"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="35%" stop-color="#000" stop-opacity="0"/>
      <stop offset="72%" stop-color="#000" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  ${photo}
  <rect width="${w}" height="${h}" fill="url(#scrim)"/>
  <rect x="0" y="0" width="${w}" height="10" fill="${esc(accent)}"/>
  ${
    badge
      ? `<g transform="translate(${pad}, ${pad})">
      <rect rx="26" width="${Math.max(120, badge.length * 20 + 44)}" height="52" fill="${esc(accent)}"/>
      <text x="${(Math.max(120, badge.length * 20 + 44)) / 2}" y="34" text-anchor="middle" fill="${accentText}"
        font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="21" font-weight="700"
        letter-spacing="1.6">${esc(badge.toUpperCase())}</text>
    </g>`
      : ""
  }
  ${
    brand
      ? `<text x="${pad}" y="${baseline - (price ? 196 : 138)}" fill="${hexAlpha("#ffffff", 0.62)}"
      font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="24" font-weight="600"
      letter-spacing="3">${esc(brand.toUpperCase())}</text>`
      : ""
  }
  <text x="${pad}" y="${baseline - (price ? 128 : 70)}" fill="#ffffff"
    font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="${title.length > 34 ? 56 : 70}"
    font-weight="700" letter-spacing="-1.8">${esc(title)}</text>
  ${
    subtitle
      ? `<text x="${pad}" y="${baseline - (price ? 76 : 22)}" fill="${hexAlpha("#ffffff", 0.76)}"
      font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="30">${esc(subtitle)}</text>`
      : ""
  }
  ${
    price
      ? `<text x="${pad}" y="${baseline}" fill="${esc(accent)}"
      font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="52" font-weight="700"
      letter-spacing="-1">${esc(price)}</text>`
      : ""
  }
</svg>`;

  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=600" },
  });
}
