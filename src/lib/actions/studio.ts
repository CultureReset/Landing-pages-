"use server";

import { revalidatePath } from "next/cache";
import { requireSite } from "@/lib/guard";
import { itemById, updateItem } from "@/lib/repo";
import { findUserById, updateUser } from "@/lib/users";
import { draftCaption, draftDescription, fromItem } from "@/lib/writer";

export interface DraftResult {
  error?: string;
  description?: string;
  caption?: string;
  credits?: number;
  itemId?: string;
}

const COST = 1;

export async function draftForItemAction(_prev: DraftResult, form: FormData): Promise<DraftResult> {
  const { user, site } = await requireSite();
  const itemId = String(form.get("itemId") ?? "");
  const item = itemById(itemId);
  if (!item || item.site_id !== site.id) return { error: "Pick something from your showcase first." };

  const account = findUserById(user.id);
  if (!account || account.credits < COST) {
    return { error: "You're out of credits. Top up from Settings → Plan." };
  }
  updateUser(user.id, { credits: account.credits - COST });

  const input = fromItem(item, site.business_type, site.business_name);
  revalidatePath("/dashboard", "layout");

  return {
    itemId,
    description: draftDescription(input),
    caption: draftCaption(input),
    credits: account.credits - COST,
  };
}

export async function applyDescriptionAction(itemId: string, description: string): Promise<void> {
  const { site } = await requireSite();
  const item = itemById(itemId);
  if (!item || item.site_id !== site.id) return;
  updateItem(itemId, { description: description.slice(0, 6000) });
  revalidatePath("/dashboard", "layout");
}
