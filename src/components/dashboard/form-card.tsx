"use client";

import { useActionState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/interactive";
import { Card, CardHeader } from "@/components/ui/primitives";
import type { ActionState } from "@/lib/actions/site";

/** A card-wrapped form bound to a server action, with inline success/error. */
export function FormCard({
  title,
  description,
  action,
  children,
  submitLabel = "Save changes",
  footer,
}: {
  title: string;
  description?: string;
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  footer?: ReactNode;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <Card>
      <CardHeader title={title} description={description} />
      <form action={formAction}>
        <div className="space-y-4 p-5">{children}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 bg-ink-50 px-5 py-3.5">
          <div className="min-w-0 text-[12.5px]">
            {state.error && (
              <span className="flex items-center gap-1.5 text-[var(--color-negative)]">
                <Icon name="alert" size={14} />
                {state.error}
              </span>
            )}
            {state.ok && state.message && (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Icon name="checkCircle" size={14} />
                {state.message}
              </span>
            )}
            {!state.error && !state.ok && footer}
          </div>
          <SubmitButton size="sm">{submitLabel}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
