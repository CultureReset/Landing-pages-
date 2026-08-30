"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "./icon";
import { buttonClass, cx } from "./primitives";

/* -------------------------------------------------------- Submit button */

export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  className,
  pendingLabel = "Saving…",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: string;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant, size, className)}>
      {pending ? (
        <Spinner size={size === "sm" ? 13 : 15} />
      ) : (
        icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={cx("animate-spin", className)} aria-hidden>
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M10 2.5a7.5 7.5 0 0 1 7.5 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ----------------------------------------------------------- Copy button */

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  variant = "secondary",
  size = "sm",
  className,
  iconOnly,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={buttonClass(variant, size, className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = value;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      aria-label={iconOnly ? label : undefined}
    >
      <Icon name={copied ? "check" : "copy"} size={size === "sm" ? 14 : 16} />
      {!iconOnly && (copied ? copiedLabel : label)}
    </button>
  );
}

/* ----------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          "relative z-10 w-full animate-fade-up overflow-hidden rounded-t-3xl border border-ink-200 bg-white shadow-pop sm:rounded-2xl",
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-950">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-950"
            aria-label="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto thin-scroll px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-200 bg-ink-50 px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/** Button that opens a modal containing arbitrary children. */
export function ModalButton({
  trigger,
  title,
  description,
  children,
  width,
}: {
  trigger: (open: () => void) => ReactNode;
  title: string;
  description?: string;
  children: (close: () => void) => ReactNode;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {trigger(() => setOpen(true))}
      <Modal open={open} onClose={() => setOpen(false)} title={title} description={description} width={width}>
        {children(() => setOpen(false))}
      </Modal>
    </>
  );
}

/* -------------------------------------------------------- Confirm button */

export function ConfirmButton({
  action,
  message,
  children,
  variant = "danger",
  size = "sm",
  icon,
  className,
}: {
  action: () => Promise<void> | void;
  message: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={buttonClass(variant, size, className)}
      onClick={() => {
        if (!window.confirm(message)) return;
        start(async () => {
          await action();
        });
      }}
    >
      {pending ? <Spinner size={14} /> : icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ Tabs */

export function Tabs({
  tabs,
  initial,
}: {
  tabs: { id: string; label: string; icon?: string; content: ReactNode }[];
  initial?: string;
}) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  return (
    <div>
      <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto rounded-xl border border-ink-200 bg-ink-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={cx(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
              active === t.id ? "bg-white text-ink-950 shadow-sm" : "text-ink-500 hover:text-ink-900",
            )}
          >
            {t.icon && <Icon name={t.icon} size={15} />}
            {t.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === active)?.content}
    </div>
  );
}

/* ------------------------------------------------------- Reorderable list */

export function ReorderList({
  ids,
  onReorder,
  children,
}: {
  ids: string[];
  onReorder: (ids: string[]) => Promise<void> | void;
  children: (id: string, handleProps: Record<string, unknown>, index: number) => ReactNode;
}) {
  const [order, setOrder] = useState(ids);
  const dragging = useRef<string | null>(null);
  const [, start] = useTransition();

  useEffect(() => setOrder(ids), [ids.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
    start(async () => {
      await onReorder(next);
    });
  }

  return (
    <div>
      {order.map((itemId, index) => (
        <div
          key={itemId}
          onDragOver={(e) => {
            e.preventDefault();
            const from = order.indexOf(dragging.current ?? "");
            if (from === -1 || from === index) return;
            const next = [...order];
            const [moved] = next.splice(from, 1);
            next.splice(index, 0, moved);
            setOrder(next);
          }}
          onDrop={(e) => {
            e.preventDefault();
            dragging.current = null;
            start(async () => {
              await onReorder(order);
            });
          }}
        >
          {children(
            itemId,
            {
              draggable: true,
              onDragStart: () => {
                dragging.current = itemId;
              },
              onDragEnd: () => {
                dragging.current = null;
              },
              "data-move-up": () => move(index, index - 1),
              "data-move-down": () => move(index, index + 1),
              moveUp: () => move(index, index - 1),
              moveDown: () => move(index, index + 1),
            },
            index,
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- Auto-save form */

/** Submits the closest form whenever an input inside it changes. */
export function AutoSubmit({ delay = 600 }: { delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => form.requestSubmit(), delay);
    };
    form.addEventListener("input", handler);
    form.addEventListener("change", handler);
    return () => {
      clearTimeout(timer);
      form.removeEventListener("input", handler);
      form.removeEventListener("change", handler);
    };
  }, [delay]);
  return <span ref={ref} hidden />;
}

/* ------------------------------------------------------------ Disclosure */

export function Disclosure({
  title,
  children,
  defaultOpen,
  meta,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  meta?: ReactNode;
}) {
  return (
    <details className="group border-b border-ink-200 last:border-b-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-medium tracking-[-0.01em] text-ink-950">{title}</span>
        <span className="flex items-center gap-3">
          {meta}
          <Icon
            name="plus"
            size={17}
            className="shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-45"
          />
        </span>
      </summary>
      <div className="pb-5 pr-8 text-[14px] leading-relaxed text-ink-600">{children}</div>
    </details>
  );
}
