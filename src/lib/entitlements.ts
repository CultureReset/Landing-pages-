import "server-only";
import { limitsFor, isUnlimited, planById, type PlanLimits } from "@/config/plans";
import {
  countItems,
  countLinks,
  countTestimonials,
  storageUsedBytes,
} from "./repo";
import { teamMembers } from "./users";

/**
 * Turns a plan into decisions. Every "can this account do one more of X?"
 * question routes through here, so plan changes in `src/config/plans.ts` are
 * enforced without touching feature code.
 */

export type Quota = keyof Pick<
  PlanLimits,
  "items" | "links" | "quickActions" | "galleryImages" | "testimonials" | "seats"
>;

export interface QuotaState {
  used: number;
  limit: number;
  unlimited: boolean;
  remaining: number;
  allowed: boolean;
  /** Copy shown to the tenant when they hit the ceiling. */
  message: string;
}

const LABELS: Record<Quota, string> = {
  items: "showcase entries",
  links: "links",
  quickActions: "quick actions",
  galleryImages: "gallery images",
  testimonials: "testimonials",
  seats: "team seats",
};

export interface UsageInput {
  planId: string;
  siteId: string;
  galleryCount: number;
  teamId: string | null;
}

function usedFor(quota: Quota, input: UsageInput): number {
  switch (quota) {
    case "items":
      return countItems(input.siteId);
    case "links":
      return countLinks(input.siteId, false);
    case "quickActions":
      return countLinks(input.siteId, true);
    case "galleryImages":
      return input.galleryCount;
    case "testimonials":
      return countTestimonials(input.siteId);
    case "seats":
      return input.teamId ? teamMembers(input.teamId).length : 1;
  }
}

export function quota(quotaKey: Quota, input: UsageInput): QuotaState {
  const limit = limitsFor(input.planId)[quotaKey];
  const used = usedFor(quotaKey, input);
  const unlimited = isUnlimited(limit);
  const allowed = unlimited || used < limit;
  const planName = planById(input.planId).name;

  return {
    used,
    limit,
    unlimited,
    remaining: unlimited ? Number.POSITIVE_INFINITY : Math.max(0, limit - used),
    allowed,
    message: allowed
      ? ""
      : `The ${planName} plan includes ${limit} ${LABELS[quotaKey]}. Upgrade in Settings → Plan to add more.`,
  };
}

export interface StorageState {
  usedBytes: number;
  limitBytes: number;
  allowed: boolean;
  percent: number;
  message: string;
}

export function storage(planId: string, siteId: string, incomingBytes = 0): StorageState {
  const limitBytes = limitsFor(planId).storageMb * 1024 * 1024;
  const usedBytes = storageUsedBytes(siteId);
  const allowed = usedBytes + incomingBytes <= limitBytes;
  return {
    usedBytes,
    limitBytes,
    allowed,
    percent: limitBytes ? Math.min(100, Math.round((usedBytes / limitBytes) * 100)) : 0,
    message: allowed
      ? ""
      : `You've used all ${limitsFor(planId).storageMb} MB of storage on the ${planById(planId).name} plan. Remove some images or upgrade.`,
  };
}

/** How far back this plan may query analytics. */
export function analyticsWindow(planId: string, requestedDays: number): number {
  return Math.min(requestedDays, limitsFor(planId).analyticsDays);
}

/** Per-item image cap, applied when saving a showcase entry. */
export function itemImageCap(planId: string): number {
  return limitsFor(planId).itemImages;
}
