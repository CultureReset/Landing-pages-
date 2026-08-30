import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { SignupForm } from "./form";
import { features } from "@/config/features";
import { TRIAL_DAYS, publicPlans } from "@/config/plans";

export const metadata: Metadata = { title: "Start your free trial" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  if (await currentUser()) redirect("/dashboard");
  const { plan } = await searchParams;

  if (!features.signupsOpen) {
    return (
      <>
        <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Sign-ups are closed</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-500">
          New accounts aren&apos;t open at the moment. If you already have one,{" "}
          <Link href="/login" className="font-medium text-ink-950 underline underline-offset-4">
            sign in here
          </Link>
          .
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Start your {TRIAL_DAYS} days free</h1>
      <p className="mt-1.5 text-[14px] text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink-950 underline underline-offset-4">
          Sign in
        </Link>
      </p>
      <SignupForm
        defaultPlan={publicPlans().some((p) => p.id === plan) ? plan! : "individual"}
        inviteOnly={features.inviteOnly}
      />
    </>
  );
}
