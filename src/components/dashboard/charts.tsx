import { compact } from "@/lib/format";
import type { SeriesPoint, TopRow } from "@/lib/analytics";
import { cx } from "@/components/ui/primitives";

/** Smooth area chart drawn as inline SVG — no chart library, no client JS. */
export function AreaChart({
  series,
  height = 168,
  color = "#0a0a0b",
  label,
}: {
  series: SeriesPoint[];
  height?: number;
  color?: string;
  label?: string;
}) {
  const w = 720;
  const h = height;
  const pad = { top: 12, right: 4, bottom: 22, left: 4 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const max = Math.max(1, ...series.map((p) => p.value));

  const x = (i: number) => pad.left + (series.length <= 1 ? 0 : (i / (series.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;

  // Catmull-Rom → cubic bezier for a smooth but honest line.
  let d = "";
  series.forEach((p, i) => {
    const px = x(i);
    const py = y(p.value);
    if (i === 0) {
      d = `M ${px} ${py}`;
      return;
    }
    const prev = series[i - 1];
    const cx1 = x(i - 1) + (px - x(i - 1)) / 2;
    d += ` C ${cx1} ${y(prev.value)}, ${cx1} ${py}, ${px} ${py}`;
  });
  const area = `${d} L ${x(series.length - 1)} ${pad.top + innerH} L ${x(0)} ${pad.top + innerH} Z`;

  const ticks = series.filter((_, i) => i % Math.max(1, Math.ceil(series.length / 6)) === 0);
  const gid = `grad-${label?.replace(/\W/g, "") ?? "a"}`;

  return (
    <figure className="w-full">
      {label && <figcaption className="sr-only">{label}</figcaption>}
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={label ?? "Trend"} preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={pad.left}
            x2={w - pad.right}
            y1={pad.top + innerH * (1 - f)}
            y2={pad.top + innerH * (1 - f)}
            stroke="currentColor"
            className="text-ink-200"
            strokeWidth="1"
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {series.map((p, i) =>
          p.value === max ? (
            <circle key={p.date} cx={x(i)} cy={y(p.value)} r="3.5" fill={color} vectorEffect="non-scaling-stroke" />
          ) : null,
        )}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10.5px] text-ink-400">
        {ticks.map((t) => (
          <span key={t.date}>{t.label}</span>
        ))}
      </div>
    </figure>
  );
}

/** Compact bar list for "top links", "top items", device and referrer splits. */
export function BarList({
  rows,
  emptyLabel = "No data yet",
  accent = "#f8481a",
  max: maxOverride,
}: {
  rows: TopRow[];
  emptyLabel?: string;
  accent?: string;
  max?: number;
}) {
  if (!rows.length) {
    return <p className="px-5 py-8 text-center text-[13px] text-ink-400">{emptyLabel}</p>;
  }
  const max = maxOverride ?? Math.max(...rows.map((r) => r.count));
  return (
    <ul className="divide-y divide-ink-100">
      {rows.map((r, i) => (
        <li key={`${r.label}-${i}`} className="relative flex items-center justify-between gap-4 px-5 py-2.5">
          <span
            className="absolute inset-y-1 left-2 rounded-md opacity-[0.09]"
            style={{ width: `calc(${(r.count / max) * 100}% - 8px)`, background: accent }}
            aria-hidden
          />
          <span className="relative min-w-0 truncate text-[13px] text-ink-800">{r.label}</span>
          <span className="relative shrink-0 text-[13px] font-semibold tabular-nums text-ink-950">
            {compact(r.count)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Tiny inline sparkline for stat tiles. */
export function Sparkline({ series, color = "#0a0a0b" }: { series: SeriesPoint[]; color?: string }) {
  const max = Math.max(1, ...series.map((p) => p.value));
  const pts = series
    .map((p, i) => `${(i / Math.max(1, series.length - 1)) * 100},${28 - (p.value / max) * 26}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" className="h-7 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

export function DonutStat({
  value,
  total,
  label,
  color = "#f8481a",
}: {
  value: number;
  total: number;
  label: string;
  color?: string;
}) {
  const pct = total ? value / total : 0;
  const circumference = 2 * Math.PI * 34;
  return (
    <div className="flex items-center gap-4">
      <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden>
        <circle cx="42" cy="42" r="34" fill="none" stroke="currentColor" className="text-ink-100" strokeWidth="10" />
        <circle
          cx="42"
          cy="42"
          r="34"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circumference * pct} ${circumference}`}
          transform="rotate(-90 42 42)"
        />
      </svg>
      <div>
        <div className="text-[24px] font-semibold tracking-[-0.03em] tabular-nums text-ink-950">
          {Math.round(pct * 1000) / 10}%
        </div>
        <div className={cx("mt-0.5 text-[12.5px] text-ink-500")}>{label}</div>
      </div>
    </div>
  );
}
