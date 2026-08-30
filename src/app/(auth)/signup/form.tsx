"use client";

import { useActionState, useState } from "react";
import { signUpAction, type FormState } from "@/lib/actions/auth";
import { Field, Input, cx } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/interactive";
import { Icon } from "@/components/ui/icon";

const PLANS = [
  { id: "individual", name: "Just me", detail: "One page, one dashboard" },
  { id: "team", name: "A team", detail: "A page each, one roll-up view" },
];

export function SignupForm({ defaultPlan }: { defaultPlan: string }) {
  const [state, action] = useActionState<FormState, FormData>(signUpAction, {});
  const [plan, setPlan] = useState(defaultPlan);

  return (
    <form action={action} className="mt-7 space-y-3.5">
      <input type="hidden" name="plan" value={plan} />

      <div>
        <span className="mb-1.5 block text-[13px] font-medium text-ink-800">Who is this for?</span>
        <div className="grid grid-cols-2 gap-2">
          {PLANS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlan(p.id)}
              className={cx(
                "rounded-xl border px-3 py-2.5 text-left transition-colors",
                plan === p.id ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 hover:border-ink-300",
              )}
            >
              <span className="block text-[13.5px] font-medium">{p.name}</span>
              <span className={cx("mt-0.5 block text-[11.5px]", plan === p.id ? "text-white/60" : "text-ink-500")}>
                {p.detail}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Field label="Your name">
        <Input name="name" autoComplete="name" placeholder="Nora Vance" required />
      </Field>
      <Field label="Work email">
        <Input name="email" type="email" autoComplete="email" placeholder="you@business.com" required />
      </Field>
      <Field label="Password" hint="At least 8 characters.">
        <Input name="password" type="password" autoComplete="new-password" placeholder="••••••••" required minLength={8} />
      </Field>

      {state.error && (
        <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
          <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
          {state.error}
        </p>
      )}

      <SubmitButton className="w-full" size="lg" pendingLabel="Creating your page…">
        Create my page
      </SubmitButton>

      <p className="text-center text-[12px] leading-relaxed text-ink-400">
        No card required for the trial. Cancel any time from your dashboard.
      </p>
    </form>
  );
}
