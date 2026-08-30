"use client";

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
  Select,
  Switch,
  Textarea,
  cx,
} from "@/components/ui/primitives";
import { deleteTestimonialAction, saveTestimonialAction } from "@/lib/actions/site";
import type { Testimonial } from "@/lib/types";
import type { ActionState } from "@/lib/actions/site";

function TestimonialForm({ item, onDone }: { item?: Testimonial; onDone: () => void }) {
  const [state, action] = useActionState<ActionState, FormData>(async (prev, form) => {
    const result = await saveTestimonialAction(prev, form);
    if (result.ok) onDone();
    return result;
  }, {});

  return (
    <form action={action} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <Input name="author" defaultValue={item?.author} placeholder="Dan & Priya M." required autoFocus />
        </Field>
        <Field label="Context" hint="What they bought, or where they're from.">
          <Input name="role" defaultValue={item?.role} placeholder="Bought in Beacon" />
        </Field>
      </div>
      <Field label="Quote" required hint="Real words beat polished ones. Keep it under three sentences.">
        <Textarea name="quote" defaultValue={item?.quote} rows={4} required placeholder="What did they actually say?" />
      </Field>
      <Field label="Rating">
        <Select name="rating" defaultValue={String(item?.rating ?? 5)}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n})
            </option>
          ))}
        </Select>
      </Field>
      <Switch name="active" defaultChecked={item ? item.active === 1 : true} label="Show on my page" />

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
        <SubmitButton>{item ? "Save" : "Add testimonial"}</SubmitButton>
      </div>
    </form>
  );
}

export function TestimonialsManager({ items }: { items: Testimonial[] }) {
  const [editing, setEditing] = useState<Testimonial | "new" | null>(null);

  return (
    <>
      <Card>
        <CardHeader
          title="Testimonials"
          description="They scroll horizontally under your showcase. Three or four is plenty."
          action={
            <Button size="sm" icon="plus" onClick={() => setEditing("new")}>
              Add
            </Button>
          }
        />
        {items.length ? (
          <ul className="divide-y divide-ink-100">
            {items.map((t) => (
              <li key={t.id} className={cx("flex gap-4 p-5", t.active !== 1 && "opacity-60")}>
                <Avatar src={t.avatar_url} name={t.author} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-medium text-ink-950">{t.author}</span>
                    {t.role && <span className="text-[12.5px] text-ink-400">· {t.role}</span>}
                    <span className="text-[12px] text-brand-500">{"★".repeat(t.rating)}</span>
                    {t.active !== 1 && <Badge tone="neutral">Hidden</Badge>}
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-600">“{t.quote}”</p>
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(t)}
                    className="grid size-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-950"
                    aria-label={`Edit testimonial from ${t.author}`}
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <ConfirmButton
                    action={() => deleteTestimonialAction(t.id)}
                    message={`Delete the testimonial from ${t.author}?`}
                    variant="ghost"
                    size="sm"
                    className="!size-8 !px-0"
                    icon="trash"
                  >
                    <span className="sr-only">Delete</span>
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="quote"
            title="No testimonials yet"
            description="Paste in something a client actually wrote you — a text message counts."
            action={
              <Button icon="plus" onClick={() => setEditing("new")}>
                Add the first one
              </Button>
            }
          />
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add a testimonial" : "Edit testimonial"}
      >
        {editing && <TestimonialForm item={editing === "new" ? undefined : editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  );
}
