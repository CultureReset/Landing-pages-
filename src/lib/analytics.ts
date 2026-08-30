import "server-only";
import { all, get } from "./db";
import type { EventKind } from "./types";

export interface SeriesPoint {
  date: string;
  label: string;
  value: number;
}

export interface TopRow {
  id: string | null;
  label: string;
  count: number;
}

export interface SiteStats {
  views: number;
  clicks: number;
  leads: number;
  saves: number;
  ctr: number;
  viewsDelta: number;
  clicksDelta: number;
  leadsDelta: number;
  series: { views: SeriesPoint[]; clicks: SeriesPoint[]; leads: SeriesPoint[] };
  topLinks: TopRow[];
  topItems: TopRow[];
  devices: TopRow[];
  referrers: TopRow[];
}

/**
 * Midnight local time, (days - 1) days ago — the same window the daily series
 * buckets cover, so totals and charts always agree.
 */
function since(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d.toISOString();
}

function countKind(siteId: string, kinds: EventKind[], from: string, to?: string): number {
  const marks = kinds.map(() => "?").join(",");
  const row = get<{ c: number }>(
    `SELECT COUNT(*) AS c FROM events WHERE site_id = ? AND kind IN (${marks}) AND created_at >= ?${to ? " AND created_at < ?" : ""}`,
    siteId,
    ...kinds,
    from,
    ...(to ? [to] : []),
  );
  return row?.c ?? 0;
}

function series(siteId: string, kinds: EventKind[], days: number): SeriesPoint[] {
  const marks = kinds.map(() => "?").join(",");
  const rows = all<{ d: string; c: number }>(
    `SELECT substr(created_at, 1, 10) AS d, COUNT(*) AS c
     FROM events WHERE site_id = ? AND kind IN (${marks}) AND created_at >= ?
     GROUP BY d`,
    siteId,
    ...kinds,
    since(days),
  );
  const map = new Map(rows.map((r) => [r.d, r.c]));
  const out: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 864e5);
    const key = day.toISOString().slice(0, 10);
    out.push({
      date: key,
      label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: map.get(key) ?? 0,
    });
  }
  return out;
}

function top(siteId: string, kind: EventKind, days: number, limit = 6): TopRow[] {
  return all<{ target_id: string | null; target_label: string; c: number }>(
    `SELECT target_id, target_label, COUNT(*) AS c FROM events
     WHERE site_id = ? AND kind = ? AND created_at >= ? AND target_label <> ''
     GROUP BY target_label ORDER BY c DESC LIMIT ?`,
    siteId,
    kind,
    since(days),
    limit,
  ).map((r) => ({ id: r.target_id, label: r.target_label, count: r.c }));
}

/** Splits page views only, so the parts add up to the headline view count. */
function breakdown(siteId: string, column: "device" | "referrer", days: number, limit = 6): TopRow[] {
  return all<{ v: string; c: number }>(
    `SELECT COALESCE(NULLIF(${column}, ''), 'Direct') AS v, COUNT(*) AS c FROM events
     WHERE site_id = ? AND kind = 'view' AND created_at >= ? GROUP BY v ORDER BY c DESC LIMIT ?`,
    siteId,
    since(days),
    limit,
  ).map((r) => ({ id: null, label: r.v, count: r.c }));
}

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function siteStats(siteId: string, days = 30): SiteStats {
  const from = since(days);
  const prevFrom = since(days * 2);
  // `from` doubles as the exclusive upper bound of the previous window.
  const views = countKind(siteId, ["view"], from);
  const clicks = countKind(siteId, ["link_click", "action_click"], from);
  const leads = countKind(siteId, ["lead"], from);
  const saves = countKind(siteId, ["save_contact"], from);

  return {
    views,
    clicks,
    leads,
    saves,
    ctr: views ? Math.round((clicks / views) * 1000) / 10 : 0,
    viewsDelta: pctDelta(views, countKind(siteId, ["view"], prevFrom, from)),
    clicksDelta: pctDelta(clicks, countKind(siteId, ["link_click", "action_click"], prevFrom, from)),
    leadsDelta: pctDelta(leads, countKind(siteId, ["lead"], prevFrom, from)),
    series: {
      views: series(siteId, ["view"], days),
      clicks: series(siteId, ["link_click", "action_click"], days),
      leads: series(siteId, ["lead"], days),
    },
    topLinks: top(siteId, "link_click", days),
    topItems: top(siteId, "item_view", days),
    devices: breakdown(siteId, "device", days),
    referrers: breakdown(siteId, "referrer", days),
  };
}

export function leadCounts(siteId: string): Record<string, number> {
  const rows = all<{ status: string; c: number }>(
    "SELECT status, COUNT(*) AS c FROM leads WHERE site_id = ? GROUP BY status",
    siteId,
  );
  const out: Record<string, number> = { new: 0, contacted: 0, qualified: 0, won: 0, lost: 0, total: 0 };
  for (const r of rows) {
    out[r.status] = r.c;
    out.total += r.c;
  }
  return out;
}
