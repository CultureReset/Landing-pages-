/**
 * The commercial model, in one place. These entries drive the pricing page,
 * the billing screen *and* the limits enforced in the product — so a plan
 * change here is a real change everywhere, with nothing to keep in sync.
 */

export const UNLIMITED = -1;

export function isUnlimited(value: number): boolean {
  return value === UNLIMITED;
}

/** A limit of UNLIMITED always passes. */
export function withinLimit(used: number, limit: number): boolean {
  return isUnlimited(limit) || used < limit;
}

export interface PlanLimits {
  /** Showcase entries (listings, services, menu items…). */
  items: number;
  /** Links in the stack, excluding quick actions. */
  links: number;
  /** Quick-action buttons under the header. */
  quickActions: number;
  /** Images in the page gallery. */
  galleryImages: number;
  /** Images per showcase entry. */
  itemImages: number;
  testimonials: number;
  /** People on the account, including the owner. */
  seats: number;
  /** Total upload allowance, in megabytes. */
  storageMb: number;
  /** How far back analytics can be queried. */
  analyticsDays: number;
  /** Studio credits granted per billing period. */
  credits: number;
  customHandle: boolean;
}

export interface PlanPrice {
  amount: number;
  currency: string;
  /** e.g. "per month, billed annually" */
  cadence: string;
  /** Shown on the pricing card above the cadence. */
  unit?: string;
}

export interface Plan {
  id: string;
  name: string;
  blurb: string;
  price: PlanPrice;
  /** Bullet list on the pricing and billing cards. */
  features: string[];
  limits: PlanLimits;
  /** Renders as the emphasised card on the pricing page. */
  highlight?: boolean;
  /** Hidden from the public pricing page (e.g. the trial). */
  internal?: boolean;
  /** Minimum people required to choose it. */
  minSeats?: number;
}

const trialLimits: PlanLimits = {
  items: 25,
  links: 20,
  quickActions: 5,
  galleryImages: 24,
  itemImages: 12,
  testimonials: 12,
  seats: 1,
  storageMb: 100,
  analyticsDays: 30,
  credits: 25,
  customHandle: true,
};

export const PLANS: Plan[] = [
  {
    id: "trial",
    name: "Free trial",
    blurb: "Everything unlocked for seven days. No card needed.",
    price: { amount: 0, currency: "USD", cadence: "for 7 days" },
    internal: true,
    features: [
      "Your own page and handle",
      "Up to 25 showcase entries",
      "Leads, analytics, QR and vCard",
      "25 studio credits",
    ],
    limits: trialLimits,
  },
  {
    id: "individual",
    name: "Individual",
    blurb: "For one person with something to sell.",
    price: { amount: 19, currency: "USD", cadence: "per month, billed annually" },
    features: [
      "Your own page and handle",
      "Unlimited showcase entries and links",
      "Leads inbox with CSV export",
      "Analytics, QR codes and NFC",
      "Save Contact card",
      "50 studio credits a month",
    ],
    limits: {
      ...trialLimits,
      items: UNLIMITED,
      links: UNLIMITED,
      testimonials: UNLIMITED,
      storageMb: 2000,
      analyticsDays: 365,
      credits: 50,
    },
  },
  {
    id: "team",
    name: "Brokerage & teams",
    blurb: "From two people, each with their own page.",
    price: { amount: 15, currency: "USD", cadence: "per person per month, billed annually", unit: "per person" },
    highlight: true,
    minSeats: 2,
    features: [
      "Everything in Individual",
      "A page per team member",
      "Shared brand across the team",
      "Roll-up view for the owner",
      "Per-person leads and analytics",
      "200 studio credits a month",
    ],
    limits: {
      ...trialLimits,
      items: UNLIMITED,
      links: UNLIMITED,
      testimonials: UNLIMITED,
      seats: 25,
      storageMb: 10000,
      analyticsDays: 365,
      credits: 200,
    },
  },
];

export const TRIAL_DAYS = 7;

export function planById(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function limitsFor(planId: string | null | undefined): PlanLimits {
  return planById(planId).limits;
}

/** Plans shown on the public pricing page. */
export function publicPlans(): Plan[] {
  return PLANS.filter((p) => !p.internal);
}

export function formatPlanPrice(plan: Plan): string {
  if (plan.price.amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.price.currency,
    maximumFractionDigits: 0,
  }).format(plan.price.amount);
}
