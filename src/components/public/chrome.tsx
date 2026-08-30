import type { ReactNode } from "react";

/** Shared shell bits for public page sections. */
export function Section({
  title,
  children,
  action,
  id,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mt-9 first:mt-0">
      {title && (
        <div className="mb-3.5 flex items-baseline justify-between gap-4 px-1">
          <h2
            className="text-[13px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--s-muted)" }}
          >
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Surface({
  children,
  className = "",
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
  style?: React.CSSProperties;
}) {
  return (
    <Tag
      className={`border ${className}`}
      style={{
        background: "var(--s-surface)",
        borderColor: "var(--s-border)",
        borderRadius: "var(--s-card-radius)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
