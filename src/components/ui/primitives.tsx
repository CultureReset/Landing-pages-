import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Icon } from "./icon";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------- Button */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink-950 text-white hover:bg-ink-800 border border-ink-950",
  secondary: "bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 hover:border-ink-300",
  ghost: "text-ink-600 hover:text-ink-950 hover:bg-ink-100 border border-transparent",
  danger: "bg-white text-[var(--color-negative)] border border-ink-200 hover:bg-red-50 hover:border-red-200",
  outline: "bg-transparent text-ink-950 border border-ink-950 hover:bg-ink-950 hover:text-white",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-xl",
};

const BASE =
  "inline-flex items-center justify-center font-medium transition-all duration-150 select-none " +
  "disabled:opacity-45 disabled:pointer-events-none active:scale-[0.985] whitespace-nowrap";

export function buttonClass(variant: Variant = "primary", size: Size = "md", className = "") {
  return cx(BASE, VARIANTS[variant], SIZES[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  icon,
  iconEnd,
  children,
  ...rest
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; icon?: string; iconEnd?: string }) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={size === "sm" ? 15 : 17} />}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  icon,
  iconEnd,
  children,
  href,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; icon?: string; iconEnd?: string }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={size === "sm" ? 15 : 17} />}
    </Link>
  );
}

/* ------------------------------------------------------------------ Card */

export function Card({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cx("rounded-2xl border border-ink-200 bg-white", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-4 px-5 py-4 border-b border-ink-200", className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-950">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] leading-relaxed text-ink-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------- Badge */

const TONES: Record<string, string> = {
  neutral: "bg-ink-100 text-ink-700 border-ink-200",
  positive: "bg-emerald-50 text-emerald-700 border-emerald-200",
  caution: "bg-amber-50 text-amber-700 border-amber-200",
  negative: "bg-red-50 text-red-700 border-red-200",
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  dark: "bg-ink-950 text-white border-ink-950",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: keyof typeof TONES | string;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- Fields */

export const inputClass =
  "w-full h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-950 " +
  "placeholder:text-ink-400 transition-colors hover:border-ink-300 focus:border-ink-950 focus:outline-none " +
  "focus:ring-2 focus:ring-ink-950/10 disabled:bg-ink-50 disabled:text-ink-400";

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-[13px] font-medium text-ink-800">
          {label}
          {required && <span className="text-brand-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1.5 block text-[12px] leading-relaxed text-ink-500">{hint}</span>}
      {error && <span className="mt-1.5 block text-[12px] text-[var(--color-negative)]">{error}</span>}
    </label>
  );
}

export function Input({ className, ...rest }: ComponentProps<"input">) {
  return <input className={cx(inputClass, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cx(inputClass, "h-auto min-h-24 resize-y py-2.5 leading-relaxed", className)}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cx(inputClass, "appearance-none pr-9 cursor-pointer", className)}
        {...rest}
      >
        {children}
      </select>
      <Icon
        name="chevronDown"
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
      />
    </div>
  );
}

/** Checkbox styled as a switch — works inside plain forms with no JS. */
export function Switch({
  name,
  defaultChecked,
  label,
  description,
  ...rest
}: ComponentProps<"input"> & { label?: ReactNode; description?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
          {...rest}
        />
        <span className="block h-5 w-9 rounded-full bg-ink-200 transition-colors peer-checked:bg-ink-950 peer-focus-visible:ring-2 peer-focus-visible:ring-ink-950/20 peer-focus-visible:ring-offset-2" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-[13px] font-medium text-ink-900">{label}</span>}
          {description && <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-500">{description}</span>}
        </span>
      )}
    </label>
  );
}

/* ------------------------------------------------------------ Empty state */

export function EmptyState({
  icon = "layers",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-4 grid size-12 place-items-center rounded-2xl border border-ink-200 bg-ink-50 text-ink-400">
        <Icon name={icon} size={22} />
      </span>
      <h4 className="text-[15px] font-semibold text-ink-950">{title}</h4>
      {description && <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- Avatar */

export function Avatar({
  src,
  name,
  size = 40,
  className,
  rounded = "full",
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  rounded?: "full" | "xl";
}) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const radius = rounded === "full" ? "rounded-full" : "rounded-2xl";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cx(radius, "object-cover bg-ink-100 shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cx(
        radius,
        "grid shrink-0 place-items-center bg-ink-900 font-semibold text-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
    >
      {letters || "?"}
    </span>
  );
}

/* ------------------------------------------------------------- Stat tile */

export function Stat({
  label,
  value,
  delta,
  icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  delta?: number;
  icon?: string;
  hint?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium uppercase tracking-[0.07em] text-ink-500">{label}</span>
        {icon && <Icon name={icon} size={16} className="text-ink-300" />}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-[26px] font-semibold tracking-[-0.03em] text-ink-950 tabular-nums">{value}</span>
        {delta !== undefined && (
          <span
            className={cx(
              "text-[12px] font-medium tabular-nums",
              positive ? "text-emerald-600" : "text-red-600",
            )}
          >
            {positive ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-[12px] text-ink-400">{hint}</p>}
    </div>
  );
}

/* ---------------------------------------------------------- Section head */

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumb && <div className="mb-2 text-[12px] text-ink-500">{breadcrumb}</div>}
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink-950">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
