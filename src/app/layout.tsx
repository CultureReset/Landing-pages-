import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { brand } from "@/config/brand";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — ${brand.tagline.replace(/\.$/, "").toLowerCase()}`,
    template: `%s · ${brand.name}`,
  },
  description:
    `${brand.name} gives every business one link: a live page with your listings, services, links and contact ` +
    "options, plus a dashboard for leads and analytics.",
  metadataBase: new URL(brand.url),
  openGraph: {
    type: "website",
    siteName: brand.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
