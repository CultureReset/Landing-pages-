import { Icon } from "@/components/ui/icon";
import { mapsHref } from "@/lib/format";
import type { DayHours, Site, Testimonial } from "@/lib/types";

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
      {items.map((t) => (
        <figure
          key={t.id}
          className="w-[86%] shrink-0 snap-start p-4 sm:w-[70%]"
          style={{
            background: "var(--s-surface)",
            border: `1px solid var(--s-border)`,
            borderRadius: "var(--s-card-radius)",
          }}
        >
          <div className="flex gap-0.5" style={{ color: "var(--s-accent)" }}>
            {Array.from({ length: Math.max(1, Math.min(5, t.rating)) }).map((_, i) => (
              <Icon key={i} name="star" size={13} strokeWidth={0} className="fill-current" />
            ))}
          </div>
          <blockquote className="mt-3 text-[14px] leading-relaxed">“{t.quote}”</blockquote>
          <figcaption className="mt-3.5 flex items-center gap-2.5">
            {t.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.avatar_url} alt="" className="size-8 rounded-full object-cover" loading="lazy" />
            ) : (
              <span
                className="grid size-8 place-items-center rounded-full text-[11px] font-semibold"
                style={{ background: "var(--s-accent)", color: "var(--s-accent-text)" }}
              >
                {t.author.slice(0, 1)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium">{t.author}</span>
              {t.role && (
                <span className="block truncate text-[11.5px]" style={{ color: "var(--s-muted)" }}>
                  {t.role}
                </span>
              )}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function About({ site }: { site: Site }) {
  if (!site.bio) return null;
  return (
    <div
      className="p-4.5 px-4 py-4"
      style={{
        background: "var(--s-surface)",
        border: `1px solid var(--s-border)`,
        borderRadius: "var(--s-card-radius)",
      }}
    >
      <p className="whitespace-pre-line text-[14.5px] leading-[1.65]">{site.bio}</p>
      {(site.credential || site.location) && (
        <div
          className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-3.5 text-[12.5px]"
          style={{ borderColor: "var(--s-border)", color: "var(--s-muted)" }}
        >
          {site.location && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="pin" size={13} /> {site.location}
            </span>
          )}
          {site.credential && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="shield" size={13} /> {site.credential}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function minutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fmt(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

export function Hours({ hours }: { hours: DayHours[] }) {
  if (!hours.length) return null;
  const now = new Date();
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const today = hours.find((h) => h.day === todayName);
  const mins = now.getHours() * 60 + now.getMinutes();
  const openNow = !!today && !today.closed && mins >= minutes(today.open) && mins < minutes(today.close);

  return (
    <div
      className="overflow-hidden"
      style={{
        background: "var(--s-surface)",
        border: `1px solid var(--s-border)`,
        borderRadius: "var(--s-card-radius)",
      }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3 text-[13px] font-semibold"
        style={{ borderColor: "var(--s-border)" }}
      >
        <span
          className="size-2 rounded-full"
          style={{ background: openNow ? "#34d399" : "#9ca3af" }}
        />
        {openNow ? `Open now — until ${fmt(today!.close)}` : "Closed right now"}
      </div>
      <dl className="divide-y" style={{ borderColor: "var(--s-border)" }}>
        {hours.map((h) => {
          const isToday = h.day === todayName;
          return (
            <div
              key={h.day}
              className="flex items-center justify-between px-4 py-2.5 text-[13px]"
              style={{ background: isToday ? "rgba(127,127,127,0.07)" : undefined }}
            >
              <dt style={{ color: isToday ? "var(--s-text)" : "var(--s-muted)", fontWeight: isToday ? 600 : 400 }}>
                {h.day}
              </dt>
              <dd className="tabular-nums" style={{ color: h.closed ? "var(--s-muted)" : "var(--s-text)" }}>
                {h.closed ? "Closed" : `${fmt(h.open)} – ${fmt(h.close)}`}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function MapBlock({ site }: { site: Site }) {
  if (!site.address) return null;
  return (
    <a
      href={mapsHref(site.address)}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3.5 px-4 py-4 transition-transform hover:-translate-y-px"
      style={{
        background: "var(--s-surface)",
        border: `1px solid var(--s-border)`,
        borderRadius: "var(--s-card-radius)",
      }}
    >
      <span
        className="grid size-10 shrink-0 place-items-center rounded-full"
        style={{ background: "var(--s-accent)", color: "var(--s-accent-text)" }}
      >
        <Icon name="pin" size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{site.address}</span>
        <span className="mt-0.5 block text-[12px]" style={{ color: "var(--s-muted)" }}>
          Open in maps
        </span>
      </span>
      <Icon name="arrowUpRight" size={16} style={{ color: "var(--s-muted)" }} />
    </a>
  );
}
