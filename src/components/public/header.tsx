import { Icon } from "@/components/ui/icon";
import { hexAlpha } from "@/lib/themes";
import type { Site } from "@/lib/types";

function Avatar({ site, size }: { site: Site; size: number }) {
  const letters = (site.owner_name || site.business_name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return site.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={site.avatar_url}
      alt={site.owner_name || site.business_name}
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{
        width: size,
        height: size,
        border: `3px solid var(--s-bg)`,
        boxShadow: `0 8px 24px ${hexAlpha("#000000", 0.28)}`,
      }}
    />
  ) : (
    <span
      className="grid place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        background: "var(--s-accent)",
        color: "var(--s-accent-text)",
        fontSize: size * 0.34,
        border: `3px solid var(--s-bg)`,
      }}
    >
      {letters}
    </span>
  );
}

function VerifiedMark() {
  return (
    <span
      className="inline-grid size-[18px] shrink-0 place-items-center rounded-full align-[-3px]"
      style={{ background: "var(--s-accent)", color: "var(--s-accent-text)" }}
      title="Verified business"
    >
      <Icon name="check" size={11} strokeWidth={2.6} />
    </span>
  );
}

export function PublicHeader({ site }: { site: Site }) {
  const variant = site.theme.header;
  const name = site.owner_name || site.business_name;
  const secondary = site.owner_name ? site.business_name : "";

  if (variant === "centered") {
    return (
      <header className="flex flex-col items-center pt-12 text-center">
        <Avatar site={site} size={104} />
        <h1 className="mt-4 flex items-center gap-2 text-[26px] font-semibold tracking-[-0.03em]">
          {name}
          {site.verified === 1 && <VerifiedMark />}
        </h1>
        {secondary && (
          <p className="mt-0.5 text-[15px] font-medium" style={{ color: "var(--s-muted)" }}>
            {secondary}
          </p>
        )}
        {site.headline && (
          <p className="mt-2 text-[14px]" style={{ color: "var(--s-muted)" }}>
            {site.headline}
          </p>
        )}
        {site.tagline && <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed">{site.tagline}</p>}
        <Meta site={site} className="mt-4 justify-center" />
      </header>
    );
  }

  if (variant === "split") {
    return (
      <header className="flex items-start gap-4 pt-10">
        <Avatar site={site} size={88} />
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="flex items-center gap-2 text-[22px] font-semibold leading-tight tracking-[-0.03em]">
            {name}
            {site.verified === 1 && <VerifiedMark />}
          </h1>
          {secondary && (
            <p className="mt-0.5 text-[14px] font-medium" style={{ color: "var(--s-muted)" }}>
              {secondary}
            </p>
          )}
          {site.headline && (
            <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--s-muted)" }}>
              {site.headline}
            </p>
          )}
          {site.tagline && <p className="mt-2.5 text-[14.5px] leading-relaxed">{site.tagline}</p>}
          <Meta site={site} className="mt-3" />
        </div>
      </header>
    );
  }

  // "cover" — full-bleed image with the avatar breaking the bottom edge
  return (
    <header>
      <div
        className="relative -mx-5 h-44 overflow-hidden sm:mx-0 sm:h-52"
        style={{ borderRadius: 0 }}
      >
        {site.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={site.cover_url} alt="" className="size-full object-cover" />
        ) : (
          <div
            className="size-full"
            style={{
              backgroundImage: `linear-gradient(135deg, ${hexAlpha(site.theme.accent, 0.9)}, ${hexAlpha(site.theme.accent, 0.25)})`,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `linear-gradient(to bottom, transparent 30%, var(--s-bg))` }}
        />
      </div>
      <div className="relative z-10 -mt-11 flex items-end gap-3.5">
        <Avatar site={site} size={92} />
        <div className="pb-1.5">
          {site.location && (
            <p
              className="flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.1em]"
              style={{ color: "var(--s-muted)" }}
            >
              <Icon name="pin" size={12} />
              {site.location}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3.5">
        <h1 className="flex items-center gap-2 text-[25px] font-semibold leading-tight tracking-[-0.03em]">
          {name}
          {site.verified === 1 && <VerifiedMark />}
        </h1>
        {secondary && (
          <p className="mt-0.5 text-[15px] font-medium" style={{ color: "var(--s-muted)" }}>
            {secondary}
          </p>
        )}
        {site.headline && (
          <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--s-muted)" }}>
            {site.headline}
          </p>
        )}
        {site.tagline && <p className="mt-3 text-[15px] leading-relaxed">{site.tagline}</p>}
        <Meta site={site} className="mt-4" />
      </div>
    </header>
  );
}

function Meta({ site, className = "" }: { site: Site; className?: string }) {
  const bits: { icon: string; text: string }[] = [];
  if (site.credential) bits.push({ icon: "shield", text: site.credential });
  if (site.website) bits.push({ icon: "globe", text: site.website.replace(/^https?:\/\/(www\.)?/, "") });
  if (!bits.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] ${className}`} style={{ color: "var(--s-muted)" }}>
      {bits.map((b) => (
        <span key={b.text} className="inline-flex items-center gap-1.5">
          <Icon name={b.icon} size={13} />
          {b.text}
        </span>
      ))}
    </div>
  );
}
