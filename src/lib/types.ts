/* Core domain types shared by the dashboard, the API and the public pages. */

export type Plan = "trial" | "individual" | "team";
export type UserRole = "owner" | "member";

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  team_id: string | null;
  plan: Plan;
  credits: number;
  trial_ends_at: string | null;
  avatar_url: string | null;
  onboarded: number;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  plan: Plan;
  seats: number;
  created_at: string;
}

export type BusinessType =
  | "real_estate"
  | "automotive"
  | "restaurant"
  | "beauty"
  | "fitness"
  | "professional"
  | "retail"
  | "creative"
  | "events"
  | "trades"
  | "other";

/** Per-business-type vocabulary. Keeps one engine usable for any vertical. */
export interface Vocabulary {
  label: string;
  itemSingular: string;
  itemPlural: string;
  priceLabel: string;
  categoryLabel: string;
  statusLabels: Record<ItemStatus, string>;
  specHints: string[];
  sample: { title: string; subtitle: string; price: string };
}

export type ItemStatus = "available" | "pending" | "featured_deal" | "sold" | "coming_soon";

export interface ThemeConfig {
  preset: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  border: string;
  font: "sans" | "serif" | "display";
  buttonStyle: "solid" | "outline" | "soft" | "glass";
  radius: "sharp" | "rounded" | "pill";
  backdrop: "plain" | "gradient" | "mesh" | "cover";
  header: "cover" | "centered" | "split";
  showcase: "grid" | "list" | "carousel";
}

export type SectionId =
  | "actions"
  | "stats"
  | "links"
  | "showcase"
  | "gallery"
  | "about"
  | "testimonials"
  | "hours"
  | "lead_form"
  | "map";

export interface SectionConfig {
  id: SectionId;
  title: string;
  enabled: boolean;
}

export interface DayHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface SiteStat {
  value: string;
  label: string;
}

export interface SiteSeo {
  title: string;
  description: string;
}

export interface Site {
  id: string;
  user_id: string;
  slug: string;
  business_name: string;
  owner_name: string;
  headline: string;
  tagline: string;
  bio: string;
  business_type: BusinessType;
  avatar_url: string | null;
  cover_url: string | null;
  logo_url: string | null;
  location: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  credential: string;
  verified: number;
  published: number;
  theme: ThemeConfig;
  layout: SectionConfig[];
  hours: DayHours[];
  gallery: string[];
  stats: SiteStat[];
  seo: SiteSeo;
  created_at: string;
  updated_at: string;
}

export type LinkKind =
  | "link"
  | "call"
  | "whatsapp"
  | "email"
  | "sms"
  | "maps"
  | "booking"
  | "form"
  | "file"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "facebook"
  | "youtube"
  | "x"
  | "review"
  | "payment";

export interface SiteLink {
  id: string;
  site_id: string;
  kind: LinkKind;
  label: string;
  sublabel: string;
  value: string;
  position: number;
  active: number;
  highlight: number;
  /** When set, the link renders in the quick-action row instead of the stack. */
  is_action: number;
  clicks: number;
  created_at: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Item {
  id: string;
  site_id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number | null;
  price_note: string;
  currency: string;
  status: ItemStatus;
  category: string;
  location: string;
  images: string[];
  specs: Spec[];
  features: string[];
  cta_label: string;
  cta_url: string;
  position: number;
  featured: number;
  active: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export interface Lead {
  id: string;
  site_id: string;
  item_id: string | null;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
}

export type EventKind =
  | "view"
  | "link_click"
  | "item_view"
  | "action_click"
  | "lead"
  | "save_contact"
  | "share"
  | "qr_scan";

export interface SiteEvent {
  id: string;
  site_id: string;
  kind: EventKind;
  target_id: string | null;
  target_label: string;
  referrer: string;
  device: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  site_id: string;
  author: string;
  role: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  position: number;
  active: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: Plan;
  team_id: string | null;
  credits: number;
  onboarded: number;
  avatar_url: string | null;
}
