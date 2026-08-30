import type { SVGProps } from "react";

/* A single stroke-based icon set so the whole product shares one visual voice. */
const P: Record<string, React.ReactNode> = {
  phone: <path d="M4.5 3.5h3.2l1.4 3.6-2 1.4a12 12 0 0 0 4.4 4.4l1.4-2 3.6 1.4v3.2c0 .9-.8 1.6-1.7 1.5C8.6 16.4 3.6 11.4 3 5.2A1.6 1.6 0 0 1 4.5 3.5Z" />,
  message: <path d="M3.5 5.5A2 2 0 0 1 5.5 3.5h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-4.5 3.5V5.5Z" />,
  mail: <><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><path d="m3 6 7 5 7-5" /></>,
  calendar: <><rect x="3" y="4.5" width="14" height="12.5" rx="2" /><path d="M3 8.5h14M7 2.5v3M13 2.5v3" /></>,
  pin: <><path d="M10 17.5s5.5-5 5.5-9a5.5 5.5 0 1 0-11 0c0 4 5.5 9 5.5 9Z" /><circle cx="10" cy="8.4" r="2.1" /></>,
  link: <><path d="M8.4 11.6a3 3 0 0 0 4.3 0l2.6-2.6a3 3 0 1 0-4.3-4.3l-1 1" /><path d="M11.6 8.4a3 3 0 0 0-4.3 0l-2.6 2.6a3 3 0 1 0 4.3 4.3l1-1" /></>,
  external: <><path d="M8 4.5H5a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 5 16.5h9a1.5 1.5 0 0 0 1.5-1.5v-3" /><path d="M11.5 3.5h5v5M16.5 3.5 9 11" /></>,
  instagram: <><rect x="3.5" y="3.5" width="13" height="13" rx="4" /><circle cx="10" cy="10" r="3.1" /><circle cx="13.9" cy="6.1" r=".9" fill="currentColor" stroke="none" /></>,
  tiktok: <path d="M12.4 3.2v8.6a3.1 3.1 0 1 1-2.6-3.05M12.4 3.2c.3 1.9 1.6 3.1 3.5 3.3" />,
  linkedin: <><rect x="3.5" y="3.5" width="13" height="13" rx="2.5" /><path d="M6.8 8.8v4.6M6.8 6.6v.1M9.9 13.4V8.8m0 1.4c.9-1.8 3.4-1.5 3.4.9v2.3" /></>,
  facebook: <path d="M12.6 4.2h-1.4a2.2 2.2 0 0 0-2.2 2.2V8.5H7.2v2.4h1.8v5.4M8.9 10.9h3" />,
  youtube: <><rect x="2.8" y="5" width="14.4" height="10" rx="3" /><path d="M8.7 8.2v3.6l3.2-1.8z" /></>,
  x: <path d="M4.5 4.5 15.5 15.5M15.5 4.5 4.5 15.5" />,
  whatsapp: <><path d="M3.6 16.4 4.7 13a6.6 6.6 0 1 1 2.5 2.4l-3.6 1Z" /><path d="M7.9 8c.2 1.6 2.4 3.8 4 4l.8-1 1.4.7-.2 1.2c-1.9.5-5.9-2.6-6.9-5.2l1-.6.9 1z" fill="currentColor" stroke="none" /></>,
  star: <path d="m10 3 2.1 4.4 4.7.6-3.4 3.3.85 4.7L10 13.8 5.75 16l.85-4.7L3.2 8l4.7-.6z" />,
  chevron: <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />,
  chevronDown: <path d="m4.5 7.5 5.5 5.5 5.5-5.5" />,
  plus: <path d="M10 4.2v11.6M4.2 10h11.6" />,
  minus: <path d="M4.2 10h11.6" />,
  trash: <><path d="M4 5.8h12M8 5.8V4.2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.6" /><path d="M5.6 5.8 6.3 16a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9l.7-10.2" /></>,
  drag: <><circle cx="7.5" cy="5" r="1.1" fill="currentColor" stroke="none" /><circle cx="12.5" cy="5" r="1.1" fill="currentColor" stroke="none" /><circle cx="7.5" cy="10" r="1.1" fill="currentColor" stroke="none" /><circle cx="12.5" cy="10" r="1.1" fill="currentColor" stroke="none" /><circle cx="7.5" cy="15" r="1.1" fill="currentColor" stroke="none" /><circle cx="12.5" cy="15" r="1.1" fill="currentColor" stroke="none" /></>,
  eye: <><path d="M1.8 10S4.8 4.8 10 4.8 18.2 10 18.2 10 15.2 15.2 10 15.2 1.8 10 1.8 10Z" /><circle cx="10" cy="10" r="2.4" /></>,
  cursor: <path d="M5 3.6 15.2 9 11 10.6 9.4 15z" />,
  inbox: <><path d="M2.8 11.5h4l1.2 2h4l1.2-2h4" /><path d="M4.6 4.4h10.8l1.8 7.1v3.6a1.5 1.5 0 0 1-1.5 1.5H4.3a1.5 1.5 0 0 1-1.5-1.5v-3.6z" /></>,
  chart: <path d="M3.5 16.5v-5M8 16.5V6M12.5 16.5v-7M17 16.5V3.5" />,
  grid: <><rect x="3.2" y="3.2" width="6" height="6" rx="1.5" /><rect x="10.8" y="3.2" width="6" height="6" rx="1.5" /><rect x="3.2" y="10.8" width="6" height="6" rx="1.5" /><rect x="10.8" y="10.8" width="6" height="6" rx="1.5" /></>,
  list: <path d="M6.5 5.5h10M6.5 10h10M6.5 14.5h10M3.4 5.5h.01M3.4 10h.01M3.4 14.5h.01" />,
  image: <><rect x="2.8" y="3.8" width="14.4" height="12.4" rx="2" /><circle cx="7.2" cy="8" r="1.4" /><path d="m3.4 14.4 3.9-3.7 3.1 2.9 2.6-2.3 3.7 3.3" /></>,
  user: <><circle cx="10" cy="6.8" r="3.1" /><path d="M3.9 16.6a6.2 6.2 0 0 1 12.2 0" /></>,
  users: <><circle cx="8" cy="6.8" r="2.8" /><path d="M2.6 16.4a5.5 5.5 0 0 1 10.8 0" /><path d="M13.4 4.4a2.8 2.8 0 0 1 0 5M14.6 11.6a5.5 5.5 0 0 1 2.9 4.8" /></>,
  quote: <path d="M8 5.5c-2.4.7-4 2.7-4 5.4v3.6h4.4V10H6.2c0-1.6.7-2.6 1.8-3zm8 0c-2.4.7-4 2.7-4 5.4v3.6h4.4V10h-2.2c0-1.6.7-2.6 1.8-3z" />,
  clock: <><circle cx="10" cy="10" r="7" /><path d="M10 5.9V10l2.8 1.7" /></>,
  bolt: <path d="M11.2 2.5 4.8 11h4.2l-.6 6.5L15.2 9H11z" />,
  qr: <><rect x="3" y="3" width="5.4" height="5.4" rx="1" /><rect x="11.6" y="3" width="5.4" height="5.4" rx="1" /><rect x="3" y="11.6" width="5.4" height="5.4" rx="1" /><path d="M11.6 11.6h2.2v2.2h-2.2zM14.8 14.8H17V17h-2.2zM11.6 17h.01" /></>,
  nfc: <path d="M5.4 14.6a6.5 6.5 0 0 1 0-9.2M8 12a2.9 2.9 0 0 1 0-4M14.6 5.4a6.5 6.5 0 0 1 0 9.2M12 8a2.9 2.9 0 0 1 0 4" />,
  share: <><circle cx="15" cy="5" r="2.2" /><circle cx="5" cy="10" r="2.2" /><circle cx="15" cy="15" r="2.2" /><path d="m7 8.9 6-2.8M7 11.1l6 2.8" /></>,
  check: <path d="m4 10.5 4 4 8-9" />,
  checkCircle: <><circle cx="10" cy="10" r="7.2" /><path d="m6.6 10.2 2.3 2.3 4.5-4.8" /></>,
  arrowRight: <path d="M3.5 10h13M11.5 5l5 5-5 5" />,
  arrowUpRight: <path d="M6 14 14 6M6.8 6H14v7.2" />,
  arrowUp: <path d="M10 16.5v-13M5 8.5l5-5 5 5" />,
  settings: <><circle cx="10" cy="10" r="2.6" /><path d="M10 2.6v1.8M10 15.6v1.8M17.4 10h-1.8M4.4 10H2.6M15.2 4.8 14 6M6 14l-1.2 1.2M15.2 15.2 14 14M6 6 4.8 4.8" /></>,
  sparkles: <path d="M7 3.2 8.1 6 11 7.1 8.1 8.2 7 11l-1.1-2.8L3 7.1 5.9 6zM14.4 10.6l.7 1.8 1.9.7-1.9.7-.7 1.8-.7-1.8-1.9-.7 1.9-.7z" />,
  download: <path d="M10 3v9m0 0 3.4-3.4M10 12 6.6 8.6M3.6 14.4v1.4a1.5 1.5 0 0 0 1.5 1.5h9.8a1.5 1.5 0 0 0 1.5-1.5v-1.4" />,
  copy: <><rect x="6.8" y="6.8" width="9.4" height="9.4" rx="2" /><path d="M13 4.6a1.8 1.8 0 0 0-1.8-1.8H5.6a2.8 2.8 0 0 0-2.8 2.8v5.6A1.8 1.8 0 0 0 4.6 13" /></>,
  search: <><circle cx="8.8" cy="8.8" r="5.3" /><path d="m12.8 12.8 4 4" /></>,
  filter: <path d="M3 4.8h14L11.6 11v5.2l-3.2-1.8V11z" />,
  menu: <path d="M3 5.5h14M3 10h14M3 14.5h14" />,
  close: <path d="M5 5l10 10M15 5 5 15" />,
  logout: <path d="M12.4 13.6 16 10l-3.6-3.6M16 10H7M9.6 16.6H5a1.6 1.6 0 0 1-1.6-1.6V5A1.6 1.6 0 0 1 5 3.4h4.6" />,
  card: <><rect x="2.6" y="4.6" width="14.8" height="10.8" rx="2" /><path d="M2.6 8.4h14.8M5.6 12.4h3" /></>,
  globe: <><circle cx="10" cy="10" r="7.2" /><path d="M2.9 10h14.2M10 2.8a13 13 0 0 1 0 14.4 13 13 0 0 1 0-14.4Z" /></>,
  shield: <><path d="M10 2.8 4 5.2v4.4c0 3.6 2.5 6.6 6 7.6 3.5-1 6-4 6-7.6V5.2z" /><path d="m7.4 10 2 2 3.4-3.6" /></>,
  home: <path d="M3.4 8.6 10 3.2l6.6 5.4v7.2a1.4 1.4 0 0 1-1.4 1.4H4.8a1.4 1.4 0 0 1-1.4-1.4z" />,
  car: <><path d="M3 12.4h14v2.4a.8.8 0 0 1-.8.8h-1.6a.8.8 0 0 1-.8-.8v-.8H6.2v.8a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8z" /><path d="M4.4 12.4 6 6.6a1.4 1.4 0 0 1 1.35-1h5.3A1.4 1.4 0 0 1 14 6.6l1.6 5.8" /></>,
  scissors: <><circle cx="5.6" cy="5.4" r="2.1" /><circle cx="5.6" cy="14.6" r="2.1" /><path d="M7.4 6.6 16 15M16 5 7.4 13.4" /></>,
  dumbbell: <path d="M3 8v4M5.6 6v8M14.4 6v8M17 8v4M5.6 10h8.8" />,
  briefcase: <><rect x="2.8" y="6" width="14.4" height="10" rx="2" /><path d="M7.2 6V4.8a1.4 1.4 0 0 1 1.4-1.4h2.8a1.4 1.4 0 0 1 1.4 1.4V6" /></>,
  bag: <><path d="M4 6.4h12l-.9 9.4a1.4 1.4 0 0 1-1.4 1.3H6.3a1.4 1.4 0 0 1-1.4-1.3z" /><path d="M7.4 8.4V5.8a2.6 2.6 0 0 1 5.2 0v2.6" /></>,
  camera: <><rect x="2.6" y="5.8" width="14.8" height="10.2" rx="2.4" /><circle cx="10" cy="11" r="3" /><path d="M7 5.8 8 3.8h4l1 2" /></>,
  ticket: <path d="M3 7.4V5.6a.8.8 0 0 1 .8-.8h12.4a.8.8 0 0 1 .8.8v1.8a2.6 2.6 0 0 0 0 5.2v1.8a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8v-1.8a2.6 2.6 0 0 0 0-5.2Z" />,
  wrench: <path d="m12.8 3.4-2.5 2.5 1.8 1.8 2.5-2.5a4 4 0 0 1-5.3 4.9L5 14.4a1.8 1.8 0 1 0 2.5 2.5l4.3-4.3a4 4 0 0 1 1-9.2Z" />,
  layers: <path d="m10 3 7 3.6-7 3.6-7-3.6zM3 10.6 10 14l7-3.4M3 14.2 10 17.6l7-3.4" />,
  palette: <><path d="M10 17.2a7.2 7.2 0 1 1 7.2-7.2c0 1.9-1.6 2.5-2.9 2.5h-1.5a1.7 1.7 0 0 0-1.2 2.9c.4.5.2 1.8-1.6 1.8Z" /><circle cx="6.6" cy="9" r="1" fill="currentColor" stroke="none" /><circle cx="9.8" cy="6.4" r="1" fill="currentColor" stroke="none" /><circle cx="13.3" cy="8" r="1" fill="currentColor" stroke="none" /></>,
  edit: <path d="M12.6 3.9 16 7.3 7.3 16H3.9v-3.4zM11 5.5 14.4 8.9" />,
  save: <><path d="M3.4 5A1.6 1.6 0 0 1 5 3.4h8L16.6 7v8A1.6 1.6 0 0 1 15 16.6H5A1.6 1.6 0 0 1 3.4 15z" /><path d="M6.6 3.4v4.2h6.2V3.9M6.6 16.6v-4.4h6.8v4.4" /></>,
  alert: <><circle cx="10" cy="10" r="7.2" /><path d="M10 6.2v4.4M10 13.6v.01" /></>,
  info: <><circle cx="10" cy="10" r="7.2" /><path d="M10 9.4v4.4M10 6.4v.01" /></>,
  lock: <><rect x="4.4" y="8.6" width="11.2" height="8" rx="2" /><path d="M7 8.6V6.8a3 3 0 0 1 6 0v1.8" /></>,
  sort: <path d="M6 4.5v11M6 15.5 3.4 13M6 15.5 8.6 13M14 15.5v-11M14 4.5 11.4 7M14 4.5l2.6 2.5" />,
  refresh: <path d="M16.4 8.4A6.6 6.6 0 0 0 4.7 5.8M3.6 11.6a6.6 6.6 0 0 0 11.7 2.6M16.6 4.2v4.2h-4.2M3.4 15.8v-4.2h4.2" />,
  building: <><path d="M4 17V4.6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V17" /><path d="M12 8.6h3.2a1 1 0 0 1 1 1V17M2.8 17h14.4M6.6 7h2.8M6.6 10.2h2.8M6.6 13.4h2.8" /></>,
  play: <><circle cx="10" cy="10" r="7.2" /><path d="M8.4 7.2 13 10l-4.6 2.8z" /></>,
  target: <><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="3.4" /><circle cx="10" cy="10" r=".6" fill="currentColor" stroke="none" /></>,
  flame: <path d="M10 2.8s4 3.4 4 7.2a4 4 0 0 1-8 0c0-1.3.5-2.3 1.2-3.2.2 1 .8 1.7 1.6 1.9.4-2.4 1.2-4.4 1.2-5.9Z" />,
  trending: <path d="M3 13.5 7.5 9l3 3L17 5.5M12.5 5.5H17v4.5" />,
};

export type IconName = keyof typeof P | string;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }: IconProps & { strokeWidth?: number }) {
  const path = P[name] ?? P.link;
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}

/** Maps a link kind to the icon that represents it on the public page. */
export const KIND_ICON: Record<string, string> = {
  link: "link",
  call: "phone",
  whatsapp: "whatsapp",
  email: "mail",
  sms: "message",
  maps: "pin",
  booking: "calendar",
  form: "inbox",
  file: "download",
  instagram: "instagram",
  tiktok: "tiktok",
  linkedin: "linkedin",
  facebook: "facebook",
  youtube: "youtube",
  x: "x",
  review: "star",
  payment: "card",
};

export const BUSINESS_ICON: Record<string, string> = {
  real_estate: "home",
  automotive: "car",
  restaurant: "flame",
  beauty: "scissors",
  fitness: "dumbbell",
  professional: "briefcase",
  retail: "bag",
  creative: "camera",
  events: "ticket",
  trades: "wrench",
  other: "layers",
};
