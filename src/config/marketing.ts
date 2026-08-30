import { brand } from "./brand";

/**
 * Copy for the public marketing site. Kept out of the page components so the
 * words can be changed without touching layout code.
 */
export const marketing = {
  hero: {
    eyebrow: "7 days free · no card",
    title: "Turn interest into the first interaction.",
    body:
      "One link that carries everything you sell, every way to reach you, and the proof that you're worth reaching. " +
      "Behind it: a dashboard for your listings, your leads and what people actually tap.",
    primaryCta: "Start your 7 days free",
    secondaryCta: "See a live page",
    stats: [
      { value: "10 min", label: "to a page you'd share" },
      { value: "1 link", label: "for every channel" },
      { value: "0", label: "code required" },
    ],
  },

  how: [
    {
      step: "01",
      title: "Tell us what you do",
      detail:
        "Pick your trade, add your name, a line about what you do and how people reach you. Two minutes, no design decisions.",
      icon: "user",
    },
    {
      step: "02",
      title: "Add what you want people to see",
      detail:
        "Listings, services, menu items, packages — whatever you sell. Photos, prices, details, and the links you already send people.",
      icon: "grid",
    },
    {
      step: "03",
      title: "Share one link everywhere",
      detail:
        "Bio, signature, sign, business card, NFC card. Every tap and enquiry lands back in your dashboard.",
      icon: "share",
    },
  ],

  channels: [
    "Phone", "WhatsApp", "SMS", "Email", "Calendly", "Cal.com", "Instagram", "TikTok", "LinkedIn",
    "Facebook", "YouTube", "X", "Google Maps", "Apple Maps", "Google Reviews", "Trustpilot", "Stripe",
    "PayPal", "Square", "Shopify", "Etsy", "Zillow", "Rightmove", "Airbnb", "OpenTable", "Resy",
    "Booksy", "Squarespace", "Substack", "Spotify", "Patreon", "Eventbrite", "Typeform", "Notion",
    "Dropbox", "Google Drive", "PDF downloads", "Custom links",
  ],

  faq: [
    {
      q: "Do I have to build the page myself?",
      a: "You can, and most people do — it takes about ten minutes. Pick a theme, fill in your details, add what you sell. If you'd rather not, send us what you have and we'll set the first version up for you.",
    },
    {
      q: "Can I change it after it's live?",
      a: "Everything, any time. Listings, prices, links, colours, section order, what's hidden and what's shown. Changes appear on your live page as soon as you save — there's no publish queue and no waiting.",
    },
    {
      q: "Can people contact me straight from a listing?",
      a: "Yes. Every listing has its own page with your quick actions on it — call, WhatsApp, email, book a time — plus an enquiry form that tells you exactly which listing they were looking at.",
    },
    {
      q: "Does it work with the tools I already use?",
      a: `It links out to anything with a URL: your booking system, your CRM, your socials, your payment links, your existing website. ${brand.name} is the front door, not a replacement for what's behind it.`,
    },
    {
      q: "Do I need a website already?",
      a: `No. Plenty of people use ${brand.name} as their only web presence. If you do have a site, this sits in front of it — and you can embed your page inside it too.`,
    },
    {
      q: "What about teams and brokerages?",
      a: "Team plans start at two people. Everyone gets their own page, their own leads and their own dashboard, under one shared brand — and the owner sees the roll-up.",
    },
    {
      q: "How do the studio credits work?",
      a: "Drafting copy costs one credit per go. Branded covers and QR codes are free and unlimited. Credits come with your plan and you can top up any time.",
    },
    {
      q: "Is there a free trial?",
      a: "Seven days, everything unlocked, no card needed. If it isn't for you, do nothing and it ends.",
    },
  ],

  finalCta: {
    title: "Your next customer is one tap away from everything you do.",
    body: "Start free, build the page in an afternoon, and put the link everywhere you already are.",
  },
} as const;
