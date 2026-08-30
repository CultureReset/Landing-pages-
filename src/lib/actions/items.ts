"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSite } from "@/lib/guard";
import { createItem, deleteItem, itemById, itemsForSite, reorderItems, updateItem } from "@/lib/repo";
import type { ItemStatus, Spec } from "@/lib/types";
import type { ActionState } from "./site";

function refresh() {
  revalidatePath("/dashboard", "layout");
}

async function ownedItem(itemId: string) {
  const { site } = await requireSite();
  const item = itemById(itemId);
  if (!item || item.site_id !== site.id) return null;
  return { site, item };
}

function parseSpecs(form: FormData): Spec[] {
  const specs: Spec[] = [];
  for (let i = 0; i < 8; i++) {
    const label = String(form.get(`spec_label_${i}`) ?? "").trim();
    const value = String(form.get(`spec_value_${i}`) ?? "").trim();
    if (label && value) specs.push({ label: label.slice(0, 30), value: value.slice(0, 40) });
  }
  return specs;
}

export async function saveItemAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const itemId = String(form.get("id") ?? "");

  const title = String(form.get("title") ?? "").trim();
  if (!title) return { error: "Give it a title." };

  const rawPrice = String(form.get("price") ?? "").replace(/[^0-9.]/g, "");
  const images = String(form.get("images") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);

  const payload = {
    title: title.slice(0, 120),
    subtitle: String(form.get("subtitle") ?? "").trim().slice(0, 160),
    description: String(form.get("description") ?? "").trim().slice(0, 6000),
    price: rawPrice ? Number(rawPrice) : null,
    price_note: String(form.get("price_note") ?? "").trim().slice(0, 40),
    currency: String(form.get("currency") ?? "USD").slice(0, 4),
    status: String(form.get("status") ?? "available") as ItemStatus,
    category: String(form.get("category") ?? "").trim().slice(0, 40),
    location: String(form.get("location") ?? "").trim().slice(0, 80),
    images,
    specs: parseSpecs(form),
    features: String(form.get("features") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20),
    cta_label: String(form.get("cta_label") ?? "").trim().slice(0, 40),
    cta_url: String(form.get("cta_url") ?? "").trim().slice(0, 500),
    featured: form.get("featured") === "on" ? 1 : 0,
    active: form.get("active") === "on" ? 1 : 0,
  };

  if (itemId) {
    const owned = await ownedItem(itemId);
    if (!owned) return { error: "That entry no longer exists." };
    updateItem(itemId, payload);
    refresh();
    return { ok: true, message: "Saved." };
  }

  const created = createItem(site.id, payload);
  refresh();
  redirect(`/dashboard/showcase/${created.id}?created=1`);
}

export async function deleteItemAction(itemId: string): Promise<void> {
  const owned = await ownedItem(itemId);
  if (!owned) return;
  deleteItem(itemId);
  refresh();
  redirect("/dashboard/showcase");
}

export async function toggleItemAction(itemId: string, active: boolean): Promise<void> {
  const owned = await ownedItem(itemId);
  if (!owned) return;
  updateItem(itemId, { active: active ? 1 : 0 });
  refresh();
}

export async function toggleFeaturedAction(itemId: string, featured: boolean): Promise<void> {
  const owned = await ownedItem(itemId);
  if (!owned) return;
  updateItem(itemId, { featured: featured ? 1 : 0 });
  refresh();
}

export async function setItemStatusAction(itemId: string, status: string): Promise<void> {
  const owned = await ownedItem(itemId);
  if (!owned) return;
  updateItem(itemId, { status: status as ItemStatus });
  refresh();
}

export async function reorderItemsAction(orderedIds: string[]): Promise<void> {
  const { site } = await requireSite();
  reorderItems(site.id, orderedIds);
  refresh();
}

export async function duplicateItemAction(itemId: string): Promise<void> {
  const owned = await ownedItem(itemId);
  if (!owned) return;
  const { site, item } = owned;
  const copy = createItem(site.id, {
    ...item,
    title: `${item.title} (copy)`,
    active: 0,
    featured: 0,
  });
  refresh();
  redirect(`/dashboard/showcase/${copy.id}`);
}

export async function createBlankItemAction(): Promise<void> {
  const { site } = await requireSite();
  const count = itemsForSite(site.id).length;
  const item = createItem(site.id, { title: `Untitled ${count + 1}`, active: 0 });
  refresh();
  redirect(`/dashboard/showcase/${item.id}`);
}
