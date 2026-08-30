"use client";

import { useEffect } from "react";

function device(): string {
  const ua = navigator.userAgent;
  if (/iPad/.test(ua)) return "iPad";
  if (/iPhone/.test(ua)) return "iPhone";
  if (/Android/.test(ua)) return "Android";
  return "Desktop";
}

function referrer(): string {
  const params = new URLSearchParams(window.location.search);
  const src = params.get("src") || params.get("utm_source");
  if (src) return src.replace(/^\w/, (c) => c.toUpperCase());
  const ref = document.referrer;
  if (!ref) return "Direct";
  try {
    const host = new URL(ref).host.replace(/^www\./, "");
    if (host === window.location.host) return "Direct";
    const known: Record<string, string> = {
      "instagram.com": "Instagram",
      "l.instagram.com": "Instagram",
      "google.com": "Google",
      "www.google.com": "Google",
      "linkedin.com": "LinkedIn",
      "t.co": "X",
      "facebook.com": "Facebook",
      "tiktok.com": "TikTok",
    };
    return known[host] ?? host;
  } catch {
    return "Direct";
  }
}

export function track(siteId: string, kind: string, targetId?: string | null, label?: string) {
  const body = JSON.stringify({
    siteId,
    kind,
    targetId: targetId ?? null,
    label: label ?? "",
    device: device(),
    referrer: referrer(),
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    /* falls through to fetch */
  }
  void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
}

/** Fires a single page-view event per mount. */
export function TrackView({ siteId, kind = "view", targetId, label }: { siteId: string; kind?: string; targetId?: string; label?: string }) {
  useEffect(() => {
    const key = `fd:${kind}:${targetId ?? siteId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    track(siteId, kind, targetId, label);
  }, [siteId, kind, targetId, label]);
  return null;
}
