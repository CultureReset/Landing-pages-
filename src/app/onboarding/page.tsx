import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { OnboardingStep } from "@/components/onboarding";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/components/ui/primitives";
import { requireSite } from "@/lib/guard";
import { skipOnboarding } from "@/lib/actions/onboarding";

export const metadata: Metadata = { title: "Set up your page" };
export const dynamic = "force-dynamic";

const STEPS = [
  { n: 1, label: "Your business" },
  { n: 2, label: "Your details" },
  { n: 3, label: "Your look" },
  { n: 4, label: "Your link" },
];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { site } = await requireSite();
  const { step: raw } = await searchParams;
  const step = Math.min(4, Math.max(1, Number(raw ?? 1) || 1));

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 sm:px-6">
          <Logo />
          <form action={skipOnboarding}>
            <button type="submit" className="text-[13px] font-medium text-ink-400 hover:text-ink-700">
              Skip for now
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
        <ol className="mb-9 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.n} className="flex flex-1 items-center gap-2">
              <span
                className={cx(
                  "grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold transition-colors",
                  s.n < step
                    ? "bg-ink-950 text-white"
                    : s.n === step
                      ? "bg-brand-500 text-white"
                      : "border border-ink-200 bg-white text-ink-400",
                )}
              >
                {s.n < step ? <Icon name="check" size={13} strokeWidth={2.6} /> : s.n}
              </span>
              <span
                className={cx(
                  "hidden text-[12.5px] font-medium sm:block",
                  s.n === step ? "text-ink-950" : "text-ink-400",
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-ink-200" />}
            </li>
          ))}
        </ol>

        <OnboardingStep step={step} site={site} />

        {step > 1 && (
          <p className="mt-6 text-center text-[13px] text-ink-400">
            <Link href={`/onboarding?step=${step - 1}`} className="hover:text-ink-700">
              ← Back a step
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
