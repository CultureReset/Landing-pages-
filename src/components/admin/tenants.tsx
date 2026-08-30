"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { ConfirmButton, Spinner } from "@/components/ui/interactive";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Input,
  Select,
  cx,
} from "@/components/ui/primitives";
import {
  featureSiteAction,
  grantCreditsAction,
  setTenantPlanAction,
  suspendSiteAction,
} from "@/lib/actions/admin";
import { pagePath } from "@/config/brand";
import { shortDate } from "@/lib/format";
import type { TenantSummary } from "@/lib/repo";

export function AdminTenants({
  rows,
  total,
  page,
  pageSize,
  query,
  plans,
  adminUserId,
}: {
  rows: TenantSummary[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  plans: { id: string; name: string }[];
  adminUserId: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(query);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  function go(next: Record<string, string>) {
    const merged = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) merged.set(k, v);
      else merged.delete(k);
    }
    router.push(`/admin?${merged.toString()}`);
  }

  return (
    <Card>
      <CardHeader
        title="Tenants"
        description={`${total} account${total === 1 ? "" : "s"}`}
        action={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go({ q: search, page: "" });
            }}
            className="relative"
          >
            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, handle or email…"
              className="h-9 w-56 pl-9"
            />
          </form>
        }
      />

      {rows.length ? (
        <ul className="divide-y divide-ink-100">
          {rows.map((row) => (
            <TenantRow key={row.site_id} row={row} plans={plans} isSelf={row.user_id === adminUserId} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="users"
          title={query ? "Nothing matches that" : "No tenants yet"}
          description={query ? "Try a different search." : "Accounts appear here as people sign up."}
        />
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-ink-200 px-5 py-3 text-[12.5px]">
          <span className="text-ink-500">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => go({ page: String(page - 1) })}
              className="rounded-lg border border-ink-200 px-3 py-1.5 font-medium text-ink-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => go({ page: String(page + 1) })}
              className="rounded-lg border border-ink-200 px-3 py-1.5 font-medium text-ink-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function TenantRow({
  row,
  plans,
  isSelf,
}: {
  row: TenantSummary;
  plans: { id: string; name: string }[];
  isSelf: boolean;
}) {
  const [pending, start] = useTransition();
  const suspended = row.suspended === 1;

  return (
    <li className={cx("px-5 py-4", suspended && "bg-red-50/40")}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13.5px] font-medium text-ink-950">{row.business_name || "Untitled"}</span>
            {row.featured === 1 && <Badge tone="brand">Featured</Badge>}
            {suspended && <Badge tone="negative">Suspended</Badge>}
            {row.published !== 1 && !suspended && <Badge tone="caution">Draft</Badge>}
            {isSelf && <Badge tone="dark">You</Badge>}
          </div>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            {row.user_name} · {row.user_email} · joined {shortDate(row.created_at)}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4 text-[11.5px] text-ink-400">
            <span>{row.items} entries</span>
            <span>{row.leads} leads</span>
            <span>{row.views} views</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={pagePath(row.slug)}
            target="_blank"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 font-mono text-[11.5px] text-ink-600 hover:border-ink-300"
          >
            /{row.slug}
            <Icon name="arrowUpRight" size={12} />
          </Link>

          <Select
            value={row.plan}
            disabled={pending}
            onChange={(e) => {
              const plan = e.target.value;
              start(async () => void (await setTenantPlanAction(row.user_id, plan)));
            }}
            className="h-8 w-auto min-w-[140px] text-[12.5px]"
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => void (await featureSiteAction(row.site_id, row.featured !== 1)))}
            className={cx(
              "grid size-8 place-items-center rounded-lg border transition-colors",
              row.featured === 1
                ? "border-brand-200 bg-brand-50 text-brand-600"
                : "border-ink-200 text-ink-400 hover:text-ink-800",
            )}
            title={row.featured === 1 ? "Remove from the public directory" : "Feature in the public directory"}
          >
            {pending ? <Spinner size={13} /> : <Icon name="star" size={14} className={row.featured === 1 ? "fill-current" : ""} />}
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() => start(async () => void (await grantCreditsAction(row.user_id, 50)))}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 text-[12px] font-medium text-ink-600 hover:border-ink-300"
            title="Grant 50 studio credits"
          >
            <Icon name="sparkles" size={13} />
            +50
          </button>

          {!isSelf && (
            <ConfirmButton
              action={() => suspendSiteAction(row.site_id, !suspended)}
              message={
                suspended
                  ? `Restore ${row.business_name}? Their page goes live again.`
                  : `Suspend ${row.business_name}? Their page goes offline and they cannot sign in.`
              }
              variant={suspended ? "secondary" : "danger"}
              size="sm"
              icon={suspended ? "refresh" : "lock"}
            >
              {suspended ? "Restore" : "Suspend"}
            </ConfirmButton>
          )}
        </div>
      </div>
    </li>
  );
}
