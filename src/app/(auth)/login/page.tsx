import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { LoginForm } from "./form";
import { features } from "@/config/features";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await currentUser()) redirect("/dashboard");
  return (
    <>
      <h1 className="text-[26px] font-semibold tracking-[-0.03em]">Welcome back</h1>
      <p className="mt-1.5 text-[14px] text-ink-500">
        New here?{" "}
        <Link href="/signup" className="font-medium text-ink-950 underline underline-offset-4">
          Start your 7-day trial
        </Link>
      </p>
      <LoginForm demoEnabled={features.demoAccount} />
    </>
  );
}
