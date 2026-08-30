import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { SignupForm } from "./form";

export const metadata: Metadata = { title: "Start your free trial" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  if (await currentUser()) redirect("/dashboard");
  const { plan } = await searchParams;
  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Start your 7 days free</h1>
      <p className="mt-1.5 text-[14px] text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink-950 underline underline-offset-4">
          Sign in
        </Link>
      </p>
      <SignupForm defaultPlan={plan === "team" ? "team" : "individual"} />
    </>
  );
}
