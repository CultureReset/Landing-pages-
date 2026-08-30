import type { Metadata } from "next";
import Link from "next/link";
import { AreaChart, BarList, DonutStat } from "@/components/dashboard/charts";
import { Icon } from "@/components/ui/icon";
import { Card, CardHeader, PageHeader, Stat, cx } from "@/components/ui/primitives";
import { siteStats } from "@/lib/analytics";
import { compact } from "@/lib/format";
import { requireSite } from "@/lib/guard";
import { vocab } from "@/lib/vocab";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { site } = await requireSite();
  const { range } = await searchParams;
  const days = RANGES.some((r) => String(r.days) === range) ? Number(range) : 30;
  const stats = siteStats(site.id, days);
  const v = vocab(site.business_type);

  const funnel = [
    { label: "Page views", value: stats.views, icon: "eye" },
    { label: "Taps on something", value: stats.clicks, icon: "cursor" },
    { label: "Contacts saved", value: stats.saves, icon: "download" },
    { label: "Enquiries sent", value: stats.leads, icon: "inbox" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="What people do when they land on your page — and which links actually earn the tap."
        actions={
          <div className="flex rounded-xl border border-ink-200 bg-white p-0.5">
            {RANGES.map((r) => (
              <Link
                key={r.days}
                href={`/dashboard/analytics?range=${r.days}`}
                className={cx(
                  "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  days === r.days ? "bg-ink-950 text-white" : "text-ink-500 hover:text-ink-900",
                )}
              >
                {r.label}
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Page views" value={compact(stats.views)} delta={stats.viewsDelta} icon="eye" />
        <Stat label="Taps" value={compact(stats.clicks)} delta={stats.clicksDelta} icon="cursor" />
        <Stat label="Enquiries" value={compact(stats.leads)} delta={stats.leadsDelta} icon="inbox" />
        <Stat label="Contacts saved" value={compact(stats.saves)} icon="download" />
      </div>

      <Card>
        <CardHeader title="Traffic" description={`Page views, taps and enquiries over ${days} days`} />
        <div className="grid gap-6 p-5 lg:grid-cols-3">
          {[
            { label: "Views", series: stats.series.views, color: "#0a0a0b" },
            { label: "Taps", series: stats.series.clicks, color: "#f8481a" },
            { label: "Enquiries", series: stats.series.leads, color: "#1e56d9" },
          ].map((s) => (
            <div key={s.label}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-500">{s.label}</span>
                <span className="text-[15px] font-semibold tabular-nums text-ink-950">
                  {compact(s.series.reduce((sum, p) => sum + p.value, 0))}
                </span>
              </div>
              <AreaChart series={s.series} color={s.color} height={132} label={s.label} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="From view to enquiry" description="Where people drop off" />
          <div className="space-y-3 p-5">
            {funnel.map((step, i) => {
              const pct = stats.views ? (step.value / stats.views) * 100 : 0;
              return (
                <div key={step.label}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-ink-700">
                      <Icon name={step.icon} size={14} className="text-ink-400" />
                      {step.label}
                    </span>
                    <span className="tabular-nums text-ink-950">
                      <b className="font-semibold">{compact(step.value)}</b>
                      <span className="ml-1.5 text-[12px] text-ink-400">{Math.round(pct)}%</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(1.5, pct)}%`,
                        background: ["#0a0a0b", "#3d3d39", "#8d8d86", "#f8481a"][i],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-ink-200 p-5">
            <DonutStat value={stats.leads} total={Math.max(1, stats.views)} label="of visitors send an enquiry" />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Where they came from" />
            <BarList rows={stats.referrers} emptyLabel="No referrers recorded" accent="#1e56d9" />
          </Card>
          <Card>
            <CardHeader title="Devices" />
            <BarList rows={stats.devices} emptyLabel="No devices recorded" accent="#12876f" />
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Most tapped links" description="Move the winners to the top of your stack" />
          <BarList rows={stats.topLinks} emptyLabel="No taps recorded yet" />
        </Card>
        <Card>
          <CardHeader title={`Most viewed ${v.itemPlural.toLowerCase()}`} description="What people open" />
          <BarList rows={stats.topItems} emptyLabel="No views recorded yet" accent="#1e56d9" />
        </Card>
      </div>
    </div>
  );
}
