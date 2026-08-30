import type { CSSProperties } from "react";
import type { ThemeConfig, SectionConfig, DayHours } from "./types";

export interface ThemePreset extends ThemeConfig {
  id: string;
  name: string;
  swatch: [string, string, string];
}

const shared = {
  font: "sans",
  buttonStyle: "solid",
  radius: "rounded",
  backdrop: "gradient",
  header: "cover",
  showcase: "grid",
} as const;

export const THEME_PRESETS: ThemePreset[] = [
  {
    ...shared,
    id: "midnight",
    name: "Midnight",
    preset: "midnight",
    bg: "#0a0a0b",
    surface: "#151517",
    text: "#f7f7f5",
    muted: "#a1a1a0",
    accent: "#ff6a38",
    accentText: "#0a0a0b",
    border: "#26262a",
    swatch: ["#0a0a0b", "#ff6a38", "#f7f7f5"],
  },
  {
    ...shared,
    id: "bone",
    name: "Bone",
    preset: "bone",
    bg: "#f6f5f1",
    surface: "#ffffff",
    text: "#17161a",
    muted: "#6d6b66",
    accent: "#17161a",
    accentText: "#ffffff",
    border: "#e3e1da",
    font: "serif",
    backdrop: "plain",
    swatch: ["#f6f5f1", "#17161a", "#c9c5b8"],
  },
  {
    ...shared,
    id: "cobalt",
    name: "Cobalt",
    preset: "cobalt",
    bg: "#070b1a",
    surface: "#101733",
    text: "#eef2ff",
    muted: "#9aa6d0",
    accent: "#4d7cff",
    accentText: "#050815",
    border: "#1e2a52",
    backdrop: "mesh",
    swatch: ["#070b1a", "#4d7cff", "#eef2ff"],
  },
  {
    ...shared,
    id: "sand",
    name: "Sand",
    preset: "sand",
    bg: "#f7efe4",
    surface: "#fffaf3",
    text: "#2c2318",
    muted: "#7c6b57",
    accent: "#c2703a",
    accentText: "#fffaf3",
    border: "#e6d8c4",
    radius: "pill",
    backdrop: "gradient",
    swatch: ["#f7efe4", "#c2703a", "#2c2318"],
  },
  {
    ...shared,
    id: "forest",
    name: "Forest",
    preset: "forest",
    bg: "#0b1512",
    surface: "#122019",
    text: "#eaf5ee",
    muted: "#8fae9c",
    accent: "#4ade9b",
    accentText: "#062018",
    border: "#1d3229",
    swatch: ["#0b1512", "#4ade9b", "#eaf5ee"],
  },
  {
    ...shared,
    id: "blush",
    name: "Blush",
    preset: "blush",
    bg: "#fdf2f4",
    surface: "#ffffff",
    text: "#2a1620",
    muted: "#8b6472",
    accent: "#d8467a",
    accentText: "#ffffff",
    border: "#f4dbe2",
    radius: "pill",
    font: "serif",
    swatch: ["#fdf2f4", "#d8467a", "#2a1620"],
  },
  {
    ...shared,
    id: "mono",
    name: "Mono",
    preset: "mono",
    bg: "#ffffff",
    surface: "#fafafa",
    text: "#0a0a0b",
    muted: "#71716e",
    accent: "#0a0a0b",
    accentText: "#ffffff",
    border: "#e6e6e3",
    buttonStyle: "outline",
    radius: "sharp",
    backdrop: "plain",
    font: "display",
    swatch: ["#ffffff", "#0a0a0b", "#e6e6e3"],
  },
  {
    ...shared,
    id: "aurora",
    name: "Aurora",
    preset: "aurora",
    bg: "#100a1d",
    surface: "#1a1130",
    text: "#f3ecff",
    muted: "#a898cf",
    accent: "#a06bff",
    accentText: "#0d0718",
    border: "#2c1f4d",
    backdrop: "mesh",
    font: "display",
    swatch: ["#100a1d", "#a06bff", "#f3ecff"],
  },
];

export const DEFAULT_THEME: ThemeConfig = { ...THEME_PRESETS[0] };

export function themeById(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0];
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "actions", title: "Quick actions", enabled: true },
  { id: "stats", title: "At a glance", enabled: true },
  { id: "showcase", title: "Featured", enabled: true },
  { id: "links", title: "Links", enabled: true },
  { id: "gallery", title: "Gallery", enabled: true },
  { id: "about", title: "About", enabled: true },
  { id: "testimonials", title: "What clients say", enabled: true },
  { id: "hours", title: "Hours", enabled: true },
  { id: "lead_form", title: "Send a message", enabled: true },
  { id: "map", title: "Find us", enabled: true },
];

export const SECTION_META: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  actions: { name: "Quick actions", description: "Call, message, book and save-contact buttons", icon: "bolt" },
  stats: { name: "At a glance", description: "Three headline numbers or facts", icon: "chart" },
  showcase: { name: "Showcase", description: "Your listings, products, services or menu", icon: "grid" },
  links: { name: "Link stack", description: "The classic tap-through link list", icon: "link" },
  gallery: { name: "Gallery", description: "A scrolling strip of images", icon: "image" },
  about: { name: "About", description: "Long-form bio and credentials", icon: "user" },
  testimonials: { name: "Testimonials", description: "Social proof from real clients", icon: "quote" },
  hours: { name: "Opening hours", description: "Weekly schedule with today highlighted", icon: "clock" },
  lead_form: { name: "Enquiry form", description: "Capture name, contact and message", icon: "inbox" },
  map: { name: "Location", description: "Address with a link to maps", icon: "pin" },
};

export const DEFAULT_HOURS: DayHours[] = [
  { day: "Monday", open: "09:00", close: "17:00", closed: false },
  { day: "Tuesday", open: "09:00", close: "17:00", closed: false },
  { day: "Wednesday", open: "09:00", close: "17:00", closed: false },
  { day: "Thursday", open: "09:00", close: "17:00", closed: false },
  { day: "Friday", open: "09:00", close: "17:00", closed: false },
  { day: "Saturday", open: "10:00", close: "14:00", closed: false },
  { day: "Sunday", open: "00:00", close: "00:00", closed: true },
];

/** Inline CSS custom properties consumed by the public page components. */
export function themeVars(theme: ThemeConfig): CSSProperties {
  const fontVar =
    theme.font === "serif"
      ? "var(--font-serif)"
      : theme.font === "display"
        ? "var(--font-display)"
        : "var(--font-sans)";
  return {
    ["--s-bg" as string]: theme.bg,
    ["--s-surface" as string]: theme.surface,
    ["--s-text" as string]: theme.text,
    ["--s-muted" as string]: theme.muted,
    ["--s-accent" as string]: theme.accent,
    ["--s-accent-text" as string]: theme.accentText,
    ["--s-border" as string]: theme.border,
    ["--s-font" as string]: fontVar,
    ["--s-radius" as string]:
      theme.radius === "sharp" ? "4px" : theme.radius === "pill" ? "999px" : "14px",
    ["--s-card-radius" as string]:
      theme.radius === "sharp" ? "4px" : theme.radius === "pill" ? "24px" : "16px",
  } as CSSProperties;
}

export function backdropStyle(theme: ThemeConfig, coverUrl?: string | null): CSSProperties {
  switch (theme.backdrop) {
    case "gradient":
      return {
        backgroundImage: `radial-gradient(120% 100% at 50% 0%, ${hexAlpha(theme.accent, 0.2)} 0%, transparent 65%)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 760px",
      };
    case "mesh":
      return {
        backgroundImage: [
          `radial-gradient(60% 60% at 15% 0%, ${hexAlpha(theme.accent, 0.3)} 0%, transparent 62%)`,
          `radial-gradient(55% 55% at 88% 8%, ${hexAlpha(theme.text, 0.12)} 0%, transparent 66%)`,
        ].join(","),
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 820px",
      };
    case "cover":
      return coverUrl
        ? {
            backgroundImage: `linear-gradient(to bottom, ${hexAlpha(theme.bg, 0.55)}, ${theme.bg} 72%), url(${JSON.stringify(coverUrl).slice(1, -1)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : {};
    default:
      return {};
  }
}

export function hexAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return hex;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Rough relative luminance, used to pick readable text over the accent. */
export function isLight(hex: string): boolean {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.45;
}
