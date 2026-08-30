import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { buttonClass, cx } from "@/components/ui/primitives";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-500">
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cx(align === "center" && "mx-auto max-w-2xl text-center", "max-w-2xl", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink-950 text-balance-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">{description}</p>
      )}
    </div>
  );
}

export function Section({
  id,
  children,
  className,
  tone = "light",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "light" | "muted" | "dark";
}) {
  return (
    <section
      id={id}
      className={cx(
        "scroll-mt-20 px-5 py-20 sm:px-6 sm:py-24",
        tone === "muted" && "bg-ink-50",
        tone === "dark" && "bg-ink-950 text-white",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function FeatureRow({
  eyebrow,
  title,
  description,
  bullets,
  visual,
  reverse,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets: { title: string; detail: string; icon: string }[];
  visual: ReactNode;
  reverse?: boolean;
  cta?: { href: string; label: string };
}) {
  return (
    <div className={cx("grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16")}>
      <div className={cx(reverse && "lg:order-2")}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="mt-4 text-[clamp(1.6rem,3.4vw,2.2rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-balance-tight">
          {title}
        </h3>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-500">{description}</p>

        <ul className="mt-7 space-y-5">
          {bullets.map((b) => (
            <li key={b.title} className="flex gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-ink-200 bg-white text-ink-700">
                <Icon name={b.icon} size={17} />
              </span>
              <span>
                <span className="block text-[14.5px] font-semibold text-ink-950">{b.title}</span>
                <span className="mt-0.5 block text-[13.5px] leading-relaxed text-ink-500">{b.detail}</span>
              </span>
            </li>
          ))}
        </ul>

        {cta && (
          <Link href={cta.href} className={cx(buttonClass("secondary", "md"), "mt-8")}>
            {cta.label}
            <Icon name="arrowRight" size={16} />
          </Link>
        )}
      </div>

      <div className={cx("min-w-0", reverse && "lg:order-1")}>{visual}</div>
    </div>
  );
}

/** A phone-shaped frame that renders a real page in an iframe. */
export function PhoneFrame({
  src,
  className,
  height = 640,
  label,
}: {
  src: string;
  className?: string;
  height?: number;
  label: string;
}) {
  return (
    <div
      className={cx(
        "relative mx-auto w-full max-w-[318px] rounded-[2.4rem] border border-ink-800 bg-ink-950 p-2.5 shadow-pop",
        className,
      )}
    >
      <span className="absolute left-1/2 top-4 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-ink-950" />
      <iframe
        src={src}
        title={label}
        loading="lazy"
        className="block w-full rounded-[1.9rem] border-0 bg-white"
        style={{ height }}
      />
    </div>
  );
}
