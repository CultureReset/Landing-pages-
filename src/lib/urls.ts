import { pagePath } from "@/config/brand";

export function baseUrl(request?: Request): string {
  // A forwarded host wins so QR codes point at the domain actually served.
  if (process.env.NEXT_PUBLIC_BASE_URL && !request) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  if (request) {
    const url = new URL(request.url);
    const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export function publicUrl(slug: string, request?: Request): string {
  return `${baseUrl(request)}${pagePath(slug)}`;
}
