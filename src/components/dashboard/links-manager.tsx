"use client";

import { useActionState, useState, useTransition } from "react";
import { Icon, KIND_ICON } from "@/components/ui/icon";
import { ConfirmButton, Modal, Spinner, SubmitButton } from "@/components/ui/interactive";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Select,
  Switch,
  cx,
} from "@/components/ui/primitives";
import { ReorderList, type ReorderHandle } from "@/components/ui/interactive";
import {
  deleteLinkAction,
  duplicateLinkAction,
  reorderLinksAction,
  saveLinkAction,
  toggleLinkAction,
} from "@/lib/actions/links";
import { LINK_KIND_OPTIONS, kindPlaceholder } from "@/lib/links";
import type { SiteLink } from "@/lib/types";
import type { ActionState } from "@/lib/actions/site";

const GROUPS = ["General", "Contact", "Social"];

function LinkForm({ link, onDone }: { link?: SiteLink; onDone: () => void }) {
  const [state, action] = useActionState<ActionState, FormData>(async (prev, form) => {
    const result = await saveLinkAction(prev, form);
    if (result.ok) onDone();
    return result;
  }, {});
  const [kind, setKind] = useState(link?.kind ?? "link");

  return (
    <form action={action} className="space-y-4">
      {link && <input type="hidden" name="id" value={link.id} />}

      <Field label="Type">
        <Select name="kind" value={kind} onChange={(e) => setKind(e.target.value as never)}>
          {GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {LINK_KIND_OPTIONS.filter((o) => o.group === g).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      <Field label="Label" required>
        <Input name="label" defaultValue={link?.label} placeholder="Book a private viewing" required autoFocus />
      </Field>

      <Field label="Supporting line" hint="Optional. Sets expectations before the tap.">
        <Input name="sublabel" defaultValue={link?.sublabel} placeholder="Evenings and weekends available" />
      </Field>

      <Field label="Destination" required hint="A URL, phone number, email address or #enquire for your own form.">
        <Input name="value" defaultValue={link?.value} placeholder={kindPlaceholder(kind)} required />
      </Field>

      <div className="space-y-3 rounded-xl border border-ink-200 bg-ink-50 p-4">
        <Switch
          name="active"
          defaultChecked={link ? link.active === 1 : true}
          label="Visible on your page"
          description="Turn off to keep it saved without showing it."
        />
        <Switch
          name="highlight"
          defaultChecked={link?.highlight === 1}
          label="Highlight it"
          description="Fills the button with your accent colour so it's the obvious next step."
        />
        <Switch
          name="is_action"
          defaultChecked={link?.is_action === 1}
          label="Show as a quick action"
          description="Moves it into the icon row under your header. Maximum of five."
        />
      </div>

      {state.error && (
        <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
          <Icon name="alert" size={14} />
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton>{link ? "Save link" : "Add link"}</SubmitButton>
      </div>
    </form>
  );
}

function LinkRow({
  link,
  handle,
  onEdit,
}: {
  link: SiteLink;
  handle: ReorderHandle;
  onEdit: () => void;
}) {
  const [pending, start] = useTransition();

  return (
    <div
      className={cx(
        "mb-2 flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5 transition-all",
        link.active === 1 ? "border-ink-200" : "border-dashed border-ink-200 opacity-60",
      )}
    >
      <span
        {...handle.drag}
        className="cursor-grab text-ink-300 hover:text-ink-600 active:cursor-grabbing"
        aria-hidden
      >
        <Icon name="drag" size={16} />
      </span>

      <span
        className={cx(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          link.highlight === 1 ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-600",
        )}
      >
        <Icon name={KIND_ICON[link.kind] ?? "link"} size={16} />
      </span>

      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className="truncate text-[13.5px] font-medium text-ink-950">{link.label}</span>
          {link.is_action === 1 && <Badge tone="info">Quick action</Badge>}
          {link.highlight === 1 && <Badge tone="brand">Highlighted</Badge>}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[11.5px] text-ink-400">{link.value}</span>
      </button>

      <span className="hidden shrink-0 text-right text-[11.5px] text-ink-400 sm:block">
        {link.clicks > 0 ? `${link.clicks} taps` : ""}
      </span>

      <span className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onEdit}
          className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-950"
          aria-label={`Edit ${link.label}`}
        >
          <Icon name="edit" size={15} />
        </button>
        <button
          type="button"
          onClick={() => start(async () => void (await duplicateLinkAction(link.id)))}
          className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-950"
          aria-label={`Duplicate ${link.label}`}
        >
          {pending ? <Spinner size={14} /> : <Icon name="copy" size={15} />}
        </button>
        <ConfirmButton
          action={() => deleteLinkAction(link.id)}
          message={`Delete “${link.label}”? This can't be undone.`}
          variant="ghost"
          size="sm"
          className="!size-8 !px-0"
          icon="trash"
        >
          <span className="sr-only">Delete</span>
        </ConfirmButton>
        <input
          type="checkbox"
          id={`link-${link.id}`}
          checked={link.active === 1}
          onChange={(e) => {
            const next = e.target.checked;
            start(async () => void (await toggleLinkAction(link.id, next)));
          }}
          className="peer sr-only"
        />
        <label
          htmlFor={`link-${link.id}`}
          className="relative ml-1 block h-5 w-9 cursor-pointer rounded-full bg-ink-200 transition-colors peer-checked:bg-ink-950"
        >
          <span className="sr-only">Show {link.label}</span>
          <span
            className={cx(
              "absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform",
              link.active === 1 && "translate-x-4",
            )}
          />
        </label>
      </span>
    </div>
  );
}

export function LinksManager({ actions, links }: { actions: SiteLink[]; links: SiteLink[] }) {
  const [editing, setEditing] = useState<SiteLink | "new" | null>(null);

  const list = (rows: SiteLink[], empty: string) =>
    rows.length ? (
      <ReorderList ids={rows.map((r) => r.id)} onReorder={reorderLinksAction}>
        {(id, handle) => {
          const link = rows.find((r) => r.id === id);
          return link ? <LinkRow link={link} handle={handle} onEdit={() => setEditing(link)} /> : null;
        }}
      </ReorderList>
    ) : (
      <p className="px-4 py-8 text-center text-[13px] text-ink-400">{empty}</p>
    );

  return (
    <>
      <div className="space-y-5">
        <Card>
          <CardHeader
            title="Quick actions"
            description="The icon row under your header. Up to five — call, message, book, directions."
            action={<Badge tone={actions.length >= 5 ? "caution" : "neutral"}>{actions.length} / 5</Badge>}
          />
          <div className="p-3">{list(actions, "No quick actions yet. Add one and mark it as a quick action.")}</div>
        </Card>

        <Card>
          <CardHeader
            title="Link stack"
            description="The tap-through list. Drag to reorder — the top three get most of the taps."
            action={
              <Button size="sm" icon="plus" onClick={() => setEditing("new")}>
                Add link
              </Button>
            }
          />
          <div className="p-3">
            {links.length ? (
              list(links, "")
            ) : (
              <EmptyState
                icon="link"
                title="No links yet"
                description="Add your booking page, your socials, a price list — anything you'd otherwise paste into a bio."
                action={
                  <Button icon="plus" onClick={() => setEditing("new")}>
                    Add your first link
                  </Button>
                }
              />
            )}
          </div>
        </Card>
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add a link" : "Edit link"}
        description={editing === "new" ? "It appears on your page as soon as you save." : undefined}
      >
        {editing && (
          <LinkForm
            link={editing === "new" ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  );
}
