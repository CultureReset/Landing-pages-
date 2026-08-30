"use client";

import { useActionState } from "react";
import { demoSignInAction, signInAction, type FormState } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/interactive";
import { Icon } from "@/components/ui/icon";

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(signInAction, {});

  return (
    <>
      <form action={action} className="mt-7 space-y-3.5">
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" placeholder="you@business.com" required />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
        </Field>

        {state.error && (
          <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
            <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
            {state.error}
          </p>
        )}

        <SubmitButton className="w-full" size="lg" pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <div className="my-6 flex items-center gap-3 text-[12px] uppercase tracking-[0.1em] text-ink-400">
        <span className="h-px flex-1 bg-ink-200" />
        or
        <span className="h-px flex-1 bg-ink-200" />
      </div>

      <form action={demoSignInAction}>
        <SubmitButton variant="secondary" size="lg" className="w-full" icon="play" pendingLabel="Loading demo…">
          Explore the demo account
        </SubmitButton>
      </form>
      <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-400">
        Loads a fully populated agency with listings, leads and 60 days of analytics.
      </p>
    </>
  );
}
