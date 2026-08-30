"use client";

import { useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { ConfirmButton, Modal, Spinner } from "@/components/ui/interactive";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  Input,
  Textarea,
  cx,
} from "@/components/ui/primitives";
import { deleteLeadAction, saveLeadNotesAction, setLeadStatusAction } from "@/lib/actions/leads";
import { relativeTime, shortDate, telHref } from "@/lib/format";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUSES: { id: LeadStatus; label: string; tone: string }[] = [
  { id: "new", label: "New", tone: "brand" },
  { id: "contacted", label: "Contacted", tone: "info" },
  { id: "qualified", label: "Qualified", tone: "caution" },
  { id: "won", label: "Won", tone: "positive" },
  { id: "lost", label: "Lost", tone: "neutral" },
];

export function LeadsBoard({
  leads,
  itemTitles,
  initialLead,
}: {
  leads: Lead[];
  itemTitles: Record<string, string>;
  initialLead?: string;
}) {
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(initialLead ?? null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: leads.length };
    for (const s of STATUSES) map[s.id] = leads.filter((l) => l.status === s.id).length;
    return map;
  }, [leads]);

  const visible = leads.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.message.toLowerCase().includes(q)
    );
  });

  const open = leads.find((l) => l.id === openId) ?? null;

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-200 p-3">
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1">
            {[{ id: "all" as const, label: "All", tone: "neutral" }, ...STATUSES].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilter(s.id as never)}
                className={cx(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  filter === s.id ? "bg-white text-ink-950 shadow-sm" : "text-ink-500 hover:text-ink-900",
                )}
              >
                {s.label}
                <span className="ml-1.5 tabular-nums text-ink-400">{counts[s.id] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="relative ml-auto min-w-[180px] flex-1 sm:max-w-xs">
            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or message…"
              className="h-9 pl-9"
            />
          </div>
        </div>

        {visible.length ? (
          <ul className="divide-y divide-ink-100">
            {visible.map((lead) => (
              <li key={lead.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(lead.id)}
                  className="flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-ink-50"
                >
                  <Avatar name={lead.name} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-medium text-ink-950">{lead.name}</span>
                      <StatusPill status={lead.status} />
                      {lead.item_id && itemTitles[lead.item_id] && (
                        <Badge tone="neutral">{itemTitles[lead.item_id]}</Badge>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-[13px] text-ink-600">{lead.message}</span>
                    <span className="mt-1 flex flex-wrap gap-x-4 text-[11.5px] text-ink-400">
                      <span>{lead.email}</span>
                      {lead.phone && <span>{lead.phone}</span>}
                      <span>via {lead.source}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[11.5px] text-ink-400">{relativeTime(lead.created_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="inbox"
            title={leads.length ? "Nothing matches that" : "No enquiries yet"}
            description={
              leads.length
                ? "Try a different status or clear the search."
                : "Every message from your page's form lands here with the sender's details and what they were looking at."
            }
          />
        )}
      </Card>

      <Modal
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name ?? ""}
        description={open ? `${shortDate(open.created_at)} · via ${open.source}` : undefined}
        width="max-w-xl"
      >
        {open && <LeadDetail lead={open} itemTitle={open.item_id ? itemTitles[open.item_id] : undefined} onClose={() => setOpenId(null)} />}
      </Modal>
    </>
  );
}

function StatusPill({ status }: { status: LeadStatus }) {
  const s = STATUSES.find((x) => x.id === status);
  return <Badge tone={s?.tone ?? "neutral"}>{s?.label ?? status}</Badge>;
}

function LeadDetail({
  lead,
  itemTitle,
  onClose,
}: {
  lead: Lead;
  itemTitle?: string;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(lead.notes);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={pending}
            onClick={() => start(async () => void (await setLeadStatusAction(lead.id, s.id)))}
            className={cx(
              "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              lead.status === s.id
                ? "border-ink-950 bg-ink-950 text-white"
                : "border-ink-200 text-ink-600 hover:border-ink-400",
            )}
          >
            {s.label}
          </button>
        ))}
        {pending && <Spinner size={16} className="self-center text-ink-400" />}
      </div>

      <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
        <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-800">{lead.message}</p>
        {itemTitle && (
          <p className="mt-3 border-t border-ink-200 pt-3 text-[12.5px] text-ink-500">
            Enquiring about <b className="text-ink-800">{itemTitle}</b>
          </p>
        )}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <Detail label="Email" value={lead.email} href={`mailto:${lead.email}`} icon="mail" />
        {lead.phone && <Detail label="Phone" value={lead.phone} href={telHref(lead.phone)} icon="phone" />}
        <Detail label="Received" value={shortDate(lead.created_at)} icon="clock" />
        <Detail label="Source" value={lead.source} icon="globe" />
      </dl>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-ink-800">Private notes</label>
        <Textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          rows={3}
          placeholder="Called Tuesday — wants to see it Saturday morning."
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await saveLeadNotesAction(lead.id, notes);
                setSaved(true);
              })
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-[12.5px] font-medium text-ink-700 hover:border-ink-300"
          >
            <Icon name="save" size={14} />
            Save notes
          </button>
          {saved && <span className="text-[12px] text-emerald-700">Saved</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-4">
        <div className="flex gap-2">
          <a
            href={`mailto:${lead.email}?subject=${encodeURIComponent("Re: your enquiry")}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink-950 px-3.5 text-[13px] font-medium text-white"
          >
            <Icon name="mail" size={15} />
            Reply by email
          </a>
          {lead.phone && (
            <a
              href={telHref(lead.phone)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 px-3.5 text-[13px] font-medium text-ink-700"
            >
              <Icon name="phone" size={15} />
              Call
            </a>
          )}
        </div>
        <ConfirmButton
          action={async () => {
            await deleteLeadAction(lead.id);
            onClose();
          }}
          message={`Delete the enquiry from ${lead.name}?`}
          icon="trash"
        >
          Delete
        </ConfirmButton>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href?: string;
  icon: string;
}) {
  const body = (
    <span className="flex items-center gap-2.5 rounded-xl border border-ink-200 px-3.5 py-2.5">
      <Icon name={icon} size={15} className="shrink-0 text-ink-400" />
      <span className="min-w-0">
        <span className="block text-[11px] uppercase tracking-[0.08em] text-ink-400">{label}</span>
        <span className="block truncate text-[13px] text-ink-900">{value}</span>
      </span>
    </span>
  );
  return href ? (
    <a href={href} className="block transition-colors hover:bg-ink-50">
      {body}
    </a>
  ) : (
    <div>{body}</div>
  );
}
