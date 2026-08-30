export interface NavItem {
  href: string;
  label: string;
  icon: string;
  group: string;
  exact?: boolean;
}

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "home", group: "Workspace", exact: true },
  { href: "/dashboard/builder", label: "Page builder", icon: "palette", group: "Your page" },
  { href: "/dashboard/links", label: "Links & actions", icon: "link", group: "Your page" },
  { href: "/dashboard/showcase", label: "Showcase", icon: "grid", group: "Your page" },
  { href: "/dashboard/testimonials", label: "Testimonials", icon: "quote", group: "Your page" },
  { href: "/dashboard/leads", label: "Leads", icon: "inbox", group: "Grow" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "chart", group: "Grow" },
  { href: "/dashboard/studio", label: "Studio", icon: "sparkles", group: "Grow" },
  { href: "/dashboard/share", label: "Share & QR", icon: "qr", group: "Grow" },
  { href: "/dashboard/team", label: "Team", icon: "users", group: "Account" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings", group: "Account" },
];

export const NAV_GROUPS = ["Workspace", "Your page", "Grow", "Account"];
