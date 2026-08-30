"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ConfirmButton, Modal, SubmitButton } from "@/components/ui/interactive";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Stat,
} from "@/components/ui/primitives";
import { inviteMemberAction, removeMemberAction, renameTeamAction } from "@/lib/actions/account";
import { pagePath } from "@/config/brand";
import type { ActionState } from "@/lib/actions/site";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  slug: string | null;
  published: boolean;
  isYou: boolean;
}

export function TeamManager({
  team,
  members,
  isOwner,
}: {
  team: { name: string; seats: number } | null;
  members: Member[];
  isOwner: boolean;
}) {
  const [inviting, setInviting] = useState(false);
  const [renameState, renameAction] = useActionState<ActionState, FormData>(renameTeamAction, {});

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Members" value={members.length} icon="users" />
        <Stat label="Seats" value={team?.seats ?? 1} icon="card" />
        <Stat label="Live pages" value={members.filter((m) => m.published).length} icon="globe" />
      </div>

      {team && isOwner && (
        <Card>
          <CardHeader title="Team name" description="Shown as the business name on new members' pages." />
          <form action={renameAction} className="flex flex-wrap items-end gap-3 p-5">
            <Field label="Name" className="min-w-[220px] flex-1">
              <Input name="team_name" defaultValue={team.name} required />
            </Field>
            <SubmitButton size="md">Save</SubmitButton>
            {renameState.ok && (
              <span className="text-[12.5px] text-emerald-700">{renameState.message}</span>
            )}
            {renameState.error && (
              <span className="text-[12.5px] text-[var(--color-negative)]">{renameState.error}</span>
            )}
          </form>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Members"
          description="Each person signs in separately and manages their own listings and leads."
          action={
            isOwner ? (
              <Button size="sm" icon="plus" onClick={() => setInviting(true)}>
                Add member
              </Button>
            ) : undefined
          }
        />
        {members.length ? (
          <ul className="divide-y divide-ink-100">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <Avatar src={m.avatar_url} name={m.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-medium text-ink-950">{m.name}</span>
                    {m.isYou && <Badge tone="dark">You</Badge>}
                    {m.role === "owner" && <Badge tone="brand">Owner</Badge>}
                    <Badge tone={m.published ? "positive" : "caution"}>{m.published ? "Live" : "Draft"}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-ink-500">{m.email}</p>
                </div>
                {m.slug && (
                  <Link
                    href={pagePath(m.slug)}
                    target="_blank"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-3 font-mono text-[12px] text-ink-600 hover:border-ink-300"
                  >
                    {pagePath(m.slug)}
                    <Icon name="arrowUpRight" size={13} />
                  </Link>
                )}
                {isOwner && !m.isYou && (
                  <ConfirmButton
                    action={() => removeMemberAction(m.id)}
                    message={`Remove ${m.name}? Their page and leads are deleted too.`}
                    icon="trash"
                  >
                    Remove
                  </ConfirmButton>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="users"
            title="Just you so far"
            description="Add a colleague and they get their own page under your brand, with their own leads and analytics."
            action={
              isOwner ? (
                <Button icon="plus" onClick={() => setInviting(true)}>
                  Add the first member
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>

      <Modal
        open={inviting}
        onClose={() => setInviting(false)}
        title="Add a team member"
        description="They get a page of their own, plus a temporary password you pass on."
      >
        <InviteForm onDone={() => setInviting(false)} />
      </Modal>
    </>
  );
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const [state, action] = useActionState<ActionState, FormData>(inviteMemberAction, {});

  return (
    <form action={action} className="space-y-4">
      <Field label="Name" required>
        <Input name="name" placeholder="Jonah Pike" required autoFocus />
      </Field>
      <Field label="Email" required>
        <Input name="email" type="email" placeholder="jonah@yourbusiness.com" required />
      </Field>

      {state.error && (
        <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
          <Icon name="alert" size={14} />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[13px] leading-relaxed text-emerald-800">
          {state.message}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onDone}>
          {state.ok ? "Done" : "Cancel"}
        </Button>
        {!state.ok && <SubmitButton>Add member</SubmitButton>}
      </div>
    </form>
  );
}
