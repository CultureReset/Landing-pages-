import Link from "next/link";
import { cx } from "./ui/primitives";
import { brand } from "@/config/brand";

export function Logo({
  className,
  size = 20,
  invert,
}: {
  className?: string;
  size?: number;
  invert?: boolean;
}) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect width="24" height="24" rx="7" fill={invert ? "#ffffff" : "#0a0a0b"} />
        <path
          d="M7 7.6h10M7 12h6.4M7 16.4h3.6"
          stroke={invert ? "#0a0a0b" : "#ffffff"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="17.2" cy="16.2" r="2.2" fill="#f8481a" />
      </svg>
      <span
        className={cx("text-[15px] font-semibold tracking-[-0.02em]", invert ? "text-white" : "text-ink-950")}
      >
        {brand.name}
      </span>
    </span>
  );
}

export function LogoLink({ href = "/", ...rest }: { href?: string; className?: string; invert?: boolean; size?: number }) {
  return (
    <Link href={href} aria-label={`${brand.name} home`}>
      <Logo {...rest} />
    </Link>
  );
}
