import type { BusinessType, Item } from "./types";
import { money } from "./format";
import { vocab } from "./vocab";

/**
 * A local draft writer. It assembles copy from the facts already in your
 * dashboard — no external service, no network call, nothing invented. Output
 * is a starting point you edit, not finished copy.
 *
 * To swap in a hosted language model, replace `draftDescription` and
 * `draftCaption` with an API call; the call sites take the same shape.
 */

function pick<T>(options: T[], seed: number): T {
  return options[Math.abs(seed) % options.length];
}

function seedFrom(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return h;
}

const OPENERS: Record<string, string[]> = {
  real_estate: [
    "The kind of place that goes quickly, so here is the honest version.",
    "Worth a look in person — photographs undersell this one.",
    "A straightforward house with good bones and a good address.",
  ],
  automotive: [
    "Inspected, serviced and priced against what it actually sells for.",
    "The paperwork is in order and the report is yours before you visit.",
    "A clean example, with the history to back it up.",
  ],
  restaurant: [
    "On the menu now, while the ingredients are at their best.",
    "One of the dishes people come back for.",
    "Simple on paper, and harder to get right than it looks.",
  ],
  beauty: [
    "Booked in stages so the result lasts past the first wash.",
    "A service built around how your hair actually behaves.",
    "Time in the chair, used properly.",
  ],
  fitness: [
    "Built for people with a job, not a training camp.",
    "Structured, adjustable, and reviewed every week.",
    "A plan you can hold to for the full block.",
  ],
  professional: [
    "Scoped tightly so you know exactly what lands and when.",
    "Practical work with a defined output, not an open-ended retainer.",
    "The engagement most clients start with.",
  ],
  retail: [
    "Made to be used rather than admired.",
    "Small run, honest materials.",
    "Built to last longer than the season.",
  ],
  creative: [
    "A defined package, so nobody is guessing at the invoice.",
    "Everything you need from a shoot this size.",
    "Scoped so the deliverables are clear before we start.",
  ],
  events: [
    "One night, a fixed number of seats.",
    "Tickets are limited and they go fast.",
    "An evening built around one idea.",
  ],
  trades: [
    "Fixed properly the first time, with the warranty in writing.",
    "Clear pricing before any work starts.",
    "The job most people call us about.",
  ],
  other: ["Here are the details.", "Worth a closer look.", "The essentials, up front."],
};

const CLOSERS = [
  "Message me and I'll come straight back to you.",
  "Tap the button below and we'll sort a time.",
  "Any questions, ask — I'd rather answer them now than later.",
  "Happy to talk it through before you commit.",
];

export interface DraftInput {
  title: string;
  subtitle?: string;
  category?: string;
  location?: string;
  price?: number | null;
  priceNote?: string;
  currency?: string;
  specs?: { label: string; value: string }[];
  features?: string[];
  businessType: BusinessType;
  businessName?: string;
}

export function fromItem(item: Item, businessType: BusinessType, businessName?: string): DraftInput {
  return {
    title: item.title,
    subtitle: item.subtitle,
    category: item.category,
    location: item.location,
    price: item.price,
    priceNote: item.price_note,
    currency: item.currency,
    specs: item.specs,
    features: item.features,
    businessType,
    businessName,
  };
}

function sentenceList(values: string[]): string {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

/** A three-paragraph description built strictly from the supplied facts. */
export function draftDescription(input: DraftInput): string {
  const seed = seedFrom(input.title + input.subtitle);
  const v = vocab(input.businessType);
  const opener = pick(OPENERS[input.businessType] ?? OPENERS.other, seed);

  const specText = (input.specs ?? [])
    .filter((s) => s.label && s.value)
    .slice(0, 4)
    .map((s) => `${s.value} ${s.label.toLowerCase()}`);

  const paragraphs: string[] = [];

  paragraphs.push(
    [opener, input.subtitle ? `${input.title} — ${input.subtitle.toLowerCase()}.` : `${input.title}.`]
      .filter(Boolean)
      .join(" "),
  );

  const facts: string[] = [];
  if (specText.length) facts.push(`It comes in at ${sentenceList(specText)}.`);
  if (input.location) facts.push(`You'll find it in ${input.location}.`);
  if (input.price != null) {
    facts.push(
      `${v.priceLabel === "Price" ? "Priced at" : `${v.priceLabel}`} ${money(input.price, input.currency ?? "USD")}${
        input.priceNote ? ` ${input.priceNote}` : ""
      }.`,
    );
  } else if (input.priceNote) {
    facts.push(`${input.priceNote}.`);
  }
  if (facts.length) paragraphs.push(facts.join(" "));

  if (input.features?.length) {
    paragraphs.push(
      `Worth calling out: ${sentenceList(input.features.slice(0, 4).map((f) => f.toLowerCase()))}. ${pick(CLOSERS, seed >> 3)}`,
    );
  } else {
    paragraphs.push(pick(CLOSERS, seed >> 3));
  }

  return paragraphs.join("\n\n");
}

/** A short social caption with hashtags derived from the real fields. */
export function draftCaption(input: DraftInput): string {
  const seed = seedFrom(input.title);
  const v = vocab(input.businessType);
  const price = input.price != null ? money(input.price, input.currency ?? "USD") : input.priceNote;

  const hooks = [
    `Just listed: ${input.title}`,
    `New in — ${input.title}`,
    `${input.title}. Available now.`,
    `Say hello to ${input.title}`,
  ];

  const tags = [
    input.location?.split(",")[0]?.replace(/\s+/g, ""),
    input.category?.replace(/\s+/g, ""),
    v.itemPlural.replace(/\s+/g, ""),
    input.businessName?.replace(/[^a-zA-Z0-9]/g, ""),
  ]
    .filter(Boolean)
    .map((t) => `#${t}`)
    .slice(0, 4);

  return [
    pick(hooks, seed),
    input.subtitle,
    price ? `${price}${input.priceNote && input.price != null ? ` ${input.priceNote}` : ""}` : "",
    "",
    "Full details and everything else on the link in bio 👆",
    "",
    tags.join(" "),
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Three one-line taglines for the top of a page. */
export function draftTaglines(businessName: string, businessType: BusinessType, what: string): string[] {
  const v = vocab(businessType);
  const subject = what || v.itemPlural.toLowerCase();
  return [
    `${subject.charAt(0).toUpperCase()}${subject.slice(1)}, done properly.`,
    `Everything ${businessName || "we"} do, in one place.`,
    `The short version: ${subject.toLowerCase()}, no runaround.`,
  ];
}

/** A short about-me paragraph from a few structured answers. */
export function draftBio(input: {
  ownerName: string;
  businessName: string;
  years: string;
  speciality: string;
  differentiator: string;
  businessType: BusinessType;
}): string {
  const v = vocab(input.businessType);
  const lines: string[] = [];

  if (input.years) {
    lines.push(
      `${input.years} years ${input.speciality ? `working in ${input.speciality.toLowerCase()}` : `in ${v.label.toLowerCase()}`}.`,
    );
  } else if (input.speciality) {
    lines.push(`${input.speciality}.`);
  }

  if (input.differentiator) lines.push(input.differentiator.replace(/\.?$/, "."));

  lines.push(
    `If you're weighing something up, message me — I'd rather answer the awkward question now than after you've committed.`,
  );

  return lines.join(" ");
}
