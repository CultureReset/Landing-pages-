import type { Metadata } from "next";
import Link from "next/link";
import { AreaChart, BarList } from "@/components/dashboard/charts";
import { Icon } from "@/components/ui/icon";
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Stat,
  cx,
} from "@/components/ui/primitives";
import { CopyButton } from "@/components/ui/interactive";
import { leadCounts, siteStats } from "@/lib/analytics";
import { compact, relativeTime } from "@/lib/format";
import { requireSite } from "@/lib/guard";
import { itemsForSite, leadsForSite, linksForSite } from "@/lib/repo";
import { vocab } from "@/lib/vocab";
import { pagePath } from "@/config/brand";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const { user, site } = await requireSite();
  const stats = siteStats(site.id, 30);
  const leads = leadsForSite(site.id).slice(0, 6);
  const counts = leadCounts(site.id);
  const items = itemsForSite(site.id);
  const links = linksForSite(site.id);
  const v = vocab(site.business_type);

  const checklist = [
    { done: !!site.business_name && !!site.tagline, label: "Add your name and a one-line pitch", href: "/dashboard/builder" },
    { done: !!site.avatar_url, label: "Upload a profile photo", href: "/dashboard/builder" },
    { done: links.filter((l) => l.is_action === 1).length > 0, label: "Set your quick actions", href: "/dashboard/links" },
    { done: links.filter((l) => l.is_action !== 1).length > 2, label: `Add at least three links`, href: "/dashboard/links" },
    { done: items.length > 0, label: `Add your first ${v.itemSingular.toLowerCase()}`, href: "/dashboard/showcase" },
    { done: site.published === 1, label: "Publish your page", href: "/dashboard/builder" },
  ];
  const remaining = checklist.filter((c) => !c.done);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good to see you, ${user.name.split(" ")[0]}`}
        description={
          site.published === 1
            ? "Here's how your page has performed over the last 30 days."
            : "Your page is still a draft. Finish the checklist below and publish it."
        }
        actions={
          <>
            <ButtonLink href="/dashboard/showcase/new" variant="secondary" size="sm" icon="plus">
              New {v.itemSingular.toLowerCase()}
            </ButtonLink>
            <ButtonLink href="/dashboard/builder" size="sm" icon="palette">
              Edit page
            </ButtonLink>
          </>
        }
      />

      {remaining.length > 0 && (
        <Card className="overflow-hidden border-ink-950 bg-ink-950 text-white">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">
                {remaining.length} step{remaining.length === 1 ? "" : "s"} to a page that converts
              </h2>
              <p className="mt-1 text-[13px] text-white/55">
                {checklist.length - remaining.length} of {checklist.length} done.
              </p>
              <div className="mt-3 h-1.5 w-56 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all"
                  style={{ width: `${((checklist.length - remaining.length) / checklist.length) * 100}%` }}
                />
              </div>
            </div>
            <ul className="grid gap-1.5 sm:min-w-[280px]">
              {remaining.slice(0, 3).map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span className="grid size-4 shrink-0 place-items-center rounded-full border border-white/30" />
                    <span className="flex-1">{c.label}</span>
                    <Icon name="chevron" size={13} className="text-white/40" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Page views" value={compact(stats.views)} delta={stats.viewsDelta} icon="eye" />
        <Stat label="Taps" value={compact(stats.clicks)} delta={stats.clicksDelta} icon="cursor" />
        <Stat label="Enquiries" value={compact(stats.leads)} delta={stats.leadsDelta} icon="inbox" />
        <Stat label="Tap rate" value={`${stats.ctr}%`} icon="target" hint="Taps per page view" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title="Traffic"
            description="Page views over the last 30 days"
            action={<Badge tone="neutral">{compact(stats.views)} total</Badge>}
          />
          <div className="p-4">
            <AreaChart series={stats.series.views} color="#0a0a0b" label="Page views" />
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Your live page"
            action={
              <Link
                href={pagePath(site.slug)}
                target="_blank"
                className="text-[12.5px] font-medium text-ink-500 hover:text-ink-950"
              >
                Open
              </Link>
            }
          />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-5 text-center">
            <div className="rounded-2xl border border-ink-200 bg-white p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr/${site.slug}`} alt="" width={116} height={116} />
            </div>
            <div>
              <p className="text-[13.5px] font-medium text-ink-950">{site.business_name}</p>
              <p className="mt-0.5 font-mono text-[12px] text-ink-500">{pagePath(site.slug)}</p>
            </div>
            <div className="flex gap-2">
              <CopyButton value={pagePath(site.slug)} label="Copy link" />
              <ButtonLink href="/dashboard/share" variant="secondary" size="sm" icon="qr">
                Share kit
              </ButtonLink>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent enquiries"
            description={`${counts.new} new · ${counts.total} all time`}
            action={
              <Link href="/dashboard/leads" className="text-[12.5px] font-medium text-ink-500 hover:text-ink-950">
                All leads
              </Link>
            }
          />
          {leads.length ? (
            <ul className="divide-y divide-ink-100">
              {leads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/dashboard/leads?lead=${lead.id}`}
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-ink-50"
                  >
                    <Avatar name={lead.name} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-medium text-ink-950">{lead.name}</span>
                        {lead.status === "new" && <Badge tone="brand">New</Badge>}
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-ink-500">{lead.message}</span>
                    </span>
                    <span className="shrink-0 text-[11.5px] text-ink-400">{relativeTime(lead.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="inbox"
              title="No enquiries yet"
              description="When someone fills in your form, they land here with their message and contact details."
            />
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Most tapped links" description="Last 30 days" />
            <BarList rows={stats.topLinks} emptyLabel="No taps recorded yet" />
          </Card>
          <Card>
            <CardHeader title={`Most viewed ${v.itemPlural.toLowerCase()}`} description="Last 30 days" />
            <BarList rows={stats.topItems} emptyLabel="No views recorded yet" accent="#1e56d9" />
          </Card>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/dashboard/showcase", icon: "grid", label: v.itemPlural, value: items.length, sub: `${items.filter((i) => i.active).length} live` },
          { href: "/dashboard/links", icon: "link", label: "Links", value: links.length, sub: `${links.filter((l) => l.is_action === 1).length} quick actions` },
          { href: "/dashboard/leads", icon: "inbox", label: "Leads", value: counts.total, sub: `${counts.won} won` },
        ].map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={cx(
              "group flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 transition-all",
              "hover:-translate-y-px hover:border-ink-300 hover:shadow-lift",
            )}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-ink-100 text-ink-600">
              <Icon name={tile.icon} size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] text-ink-500">{tile.label}</span>
              <span className="block text-[19px] font-semibold tracking-[-0.02em] text-ink-950">{tile.value}</span>
            </span>
            <span className="text-right text-[11.5px] text-ink-400">{tile.sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
