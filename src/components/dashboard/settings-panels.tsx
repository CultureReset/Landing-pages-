"use client";

import { useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { ConfirmButton, Spinner } from "@/components/ui/interactive";
import { Badge, Button, Card, CardHeader, Field, Input, cx } from "@/components/ui/primitives";
import { FormCard } from "@/components/dashboard/form-card";
import { ImagePicker } from "@/components/dashboard/image-picker";
import {
  changePasswordAction,
  changePlanAction,
  deleteAccountAction,
  saveAccountAction,
  signOutEverywhereAction,
  topUpCreditsAction,
} from "@/lib/actions/account";
import { signOutAction } from "@/lib/actions/auth";
import { shortDate } from "@/lib/format";
import type { SessionUser } from "@/lib/types";

export function AccountPanel({ user }: { user: SessionUser }) {
  return (
    <div className="space-y-5">
      <FormCard title="Your account" description="Used for sign-in and lead notifications." action={saveAccountAction}>
        <ImagePicker name="avatar_url" label="Photo" defaultValue={user.avatar_url} hint="Shown in your dashboard sidebar." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <Input name="name" defaultValue={user.name} required />
          </Field>
          <Field label="Email" required>
            <Input name="email" type="email" defaultValue={user.email} required />
          </Field>
        </div>
      </FormCard>

      <FormCard
        title="Password"
        description="Eight characters minimum. Longer beats complicated."
        action={changePasswordAction}
        submitLabel="Change password"
      >
        <Field label="Current password" required>
          <Input name="current" type="password" autoComplete="current-password" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" required>
            <Input name="next" type="password" autoComplete="new-password" minLength={8} required />
          </Field>
          <Field label="Confirm it" required>
            <Input name="confirm" type="password" autoComplete="new-password" minLength={8} required />
          </Field>
        </div>
      </FormCard>

      <Card>
        <CardHeader title="Sessions" description="Signed in on a device you no longer have?" />
        <div className="flex flex-wrap gap-2 p-5">
          <form action={signOutAction}>
            <Button type="submit" variant="secondary" icon="logout">
              Sign out here
            </Button>
          </form>
          <form action={signOutEverywhereAction}>
            <Button type="submit" variant="secondary" icon="shield">
              Sign out everywhere
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

const PLANS = [
  {
    id: "trial",
    name: "Free trial",
    price: "Free for 7 days",
    detail: "Everything unlocked. No card needed.",
    features: ["One page", "Unlimited listings", "Leads and analytics", "QR and vCard"],
  },
  {
    id: "individual",
    name: "Individual",
    price: "$19 / month",
    detail: "Billed annually. Cancel any time.",
    features: ["Everything in the trial", "Custom handle", "Priority support", "50 studio credits a month"],
  },
  {
    id: "team",
    name: "Brokerage & teams",
    price: "$15 / person / month",
    detail: "From two people. Billed annually.",
    features: ["A page per person", "Shared branding", "Roll-up analytics", "200 studio credits a month"],
  },
];

export function PlanPanel({ user, trialEnds }: { user: SessionUser; trialEnds: string | null }) {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Plan"
          description={
            user.plan === "trial" && trialEnds
              ? `Your trial runs until ${shortDate(trialEnds)}.`
              : "Switch any time — changes apply from your next billing date."
          }
        />
        <div className="grid gap-3 p-5 lg:grid-cols-3">
          {PLANS.map((p) => {
            const active = user.plan === p.id;
            return (
              <div
                key={p.id}
                className={cx(
                  "flex flex-col rounded-2xl border p-5 transition-colors",
                  active ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold">{p.name}</h3>
                  {active && <Badge tone="brand">Current</Badge>}
                </div>
                <p className={cx("mt-2 text-[19px] font-semibold tracking-[-0.02em]", active ? "text-white" : "text-ink-950")}>
                  {p.price}
                </p>
                <p className={cx("mt-1 text-[12.5px]", active ? "text-white/55" : "text-ink-500")}>{p.detail}</p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className={cx("flex items-start gap-2 text-[13px]", active ? "text-white/80" : "text-ink-600")}>
                      <Icon name="check" size={14} className="mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={active || pending}
                  onClick={() => start(async () => void (await changePlanAction(p.id)))}
                  className={cx(
                    "mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl text-[13.5px] font-medium transition-colors disabled:opacity-50",
                    active ? "bg-white/10 text-white" : "bg-ink-950 text-white hover:bg-ink-800",
                  )}
                >
                  {pending && !active ? <Spinner size={14} /> : null}
                  {active ? "Your plan" : `Switch to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
        <p className="border-t border-ink-200 px-5 py-3.5 text-[12px] text-ink-400">
          This build has no payment processor wired in — switching plans updates your account immediately so you can
          see how each tier behaves.
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Studio credits"
          description="Spent when you generate draft copy. Cover composing is free."
          action={<Badge tone={user.credits > 5 ? "neutral" : "caution"}>{user.credits} left</Badge>}
        />
        <div className="flex flex-wrap gap-2 p-5">
          {[25, 100, 250].map((amount) => (
            <button
              key={amount}
              type="button"
              disabled={pending}
              onClick={() => start(async () => void (await topUpCreditsAction(amount)))}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 px-4 text-[13.5px] font-medium text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:opacity-50"
            >
              <Icon name="sparkles" size={15} className="text-brand-500" />
              Add {amount}
            </button>
          ))}
        </div>
      </Card>

      <Card className="border-red-200">
        <CardHeader title="Delete account" description="Removes your page, listings, leads and analytics. Immediate and permanent." />
        <div className="p-5">
          <ConfirmButton
            action={deleteAccountAction}
            message="Delete your account and everything on it? This cannot be undone."
            icon="trash"
            size="md"
          >
            Delete my account
          </ConfirmButton>
        </div>
      </Card>
    </div>
  );
}
