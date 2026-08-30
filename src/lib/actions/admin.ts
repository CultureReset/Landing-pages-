"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/guard";
import { setFeatured, setSuspended, siteById } from "@/lib/repo";
import { findUserById, updateUser } from "@/lib/users";
import { PLANS } from "@/config/plans";
import type { Plan } from "@/lib/types";

/**
 * Operator-only actions. Every one re-checks `requireAdmin()` rather than
 * trusting that the caller reached them through the admin UI — a server action
 * is a public endpoint.
 */

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function featureSiteAction(siteId: string, featured: boolean): Promise<void> {
  await requireAdmin();
  if (!siteById(siteId)) return;
  setFeatured(siteId, featured);
  refresh();
}

export async function suspendSiteAction(siteId: string, suspended: boolean): Promise<void> {
  const admin = await requireAdmin();
  const site = siteById(siteId);
  if (!site) return;

  const owner = findUserById(site.user_id);
  // Guard against an operator locking themselves out.
  if (owner && owner.id === admin.id) return;

  setSuspended(siteId, suspended);
  if (owner) updateUser(owner.id, { suspended: suspended ? 1 : 0 });
  refresh();
}

export async function setTenantPlanAction(userId: string, planId: string): Promise<void> {
  await requireAdmin();
  if (!PLANS.some((p) => p.id === planId)) return;
  if (!findUserById(userId)) return;
  updateUser(userId, { plan: planId as Plan });
  refresh();
}

export async function grantCreditsAction(userId: string, amount: number): Promise<void> {
  await requireAdmin();
  const user = findUserById(userId);
  if (!user) return;
  const safe = Math.max(-1000, Math.min(1000, Math.trunc(amount)));
  updateUser(user.id, { credits: Math.max(0, user.credits + safe) });
  refresh();
}
