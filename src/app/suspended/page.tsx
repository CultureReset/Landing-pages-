import type { Metadata } from "next";
import { Logo } from "@/components/brand";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/interactive";
import { brand } from "@/config/brand";
import { signOutAction } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Account suspended" };

export default function SuspendedPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-md">
        <Logo className="mx-auto" />
        <span className="mx-auto mt-8 grid size-12 place-items-center rounded-2xl border border-ink-200 bg-ink-50 text-ink-400">
          <Icon name="lock" size={22} />
        </span>
        <h1 className="mt-5 text-[24px] font-semibold tracking-[-0.03em] text-ink-950">
          This account is suspended
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-500">
          Your page is offline and the dashboard is locked. If you think this is a mistake, email{" "}
          <a href={`mailto:${brand.support.general}`} className="font-medium text-ink-800 underline underline-offset-4">
            {brand.support.general}
          </a>{" "}
          and we&apos;ll take a look.
        </p>
        <form action={signOutAction} className="mt-7">
          <SubmitButton variant="secondary" icon="logout">
            Sign out
          </SubmitButton>
        </form>
      </div>
    </main>
  );
}
