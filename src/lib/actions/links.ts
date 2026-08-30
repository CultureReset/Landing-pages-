"use server";

import { revalidatePath } from "next/cache";
import { quota } from "@/lib/entitlements";
import { NOT_YOURS, ownedLink, tenant } from "@/lib/tenant";
import { createLink, deleteLink, reorderLinks, updateLink } from "@/lib/repo";
import { LINK_KIND_OPTIONS } from "@/lib/links";
import type { LinkKind } from "@/lib/types";
import type { ActionState } from "./site";

function refresh() {
  revalidatePath("/dashboard", "layout");
}

const KINDS = new Set(LINK_KIND_OPTIONS.map((o) => o.value));

export async function saveLinkAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const ctx = await tenant();
  const linkId = String(form.get("id") ?? "");

  const kind = String(form.get("kind") ?? "link");
  if (!KINDS.has(kind)) return { error: "Pick a link type from the list." };

  const payload = {
    kind: kind as LinkKind,
    label: String(form.get("label") ?? "").trim().slice(0, 80),
    sublabel: String(form.get("sublabel") ?? "").trim().slice(0, 100),
    value: String(form.get("value") ?? "").trim().slice(0, 500),
    highlight: form.get("highlight") === "on" ? 1 : 0,
    is_action: form.get("is_action") === "on" ? 1 : 0,
    active: form.get("active") === "on" ? 1 : 0,
  };

  if (!payload.label) return { error: "Give the link a label." };
  if (!payload.value) return { error: "Add a destination — a URL, phone number or email." };

  const usage = {
    planId: ctx.user.plan,
    siteId: ctx.site.id,
    galleryCount: ctx.site.gallery.length,
    teamId: ctx.user.team_id,
  };

  if (linkId) {
    const owned = await ownedLink(linkId);
    if (!owned) return { error: NOT_YOURS };

    // Promoting an existing link into the action row consumes a slot.
    if (payload.is_action === 1 && owned.row.is_action !== 1) {
      const actions = quota("quickActions", usage);
      if (!actions.allowed) return { error: actions.message };
    }
    updateLink(linkId, payload);
    refresh();
    return { ok: true, message: "Link updated." };
  }

  const capacity = quota(payload.is_action === 1 ? "quickActions" : "links", usage);
  if (!capacity.allowed) return { error: capacity.message };

  createLink(ctx.site.id, payload);
  refresh();
  return { ok: true, message: "Link added." };
}

export async function deleteLinkAction(linkId: string): Promise<void> {
  const owned = await ownedLink(linkId);
  if (!owned) return;
  deleteLink(linkId);
  refresh();
}

export async function toggleLinkAction(linkId: string, active: boolean): Promise<void> {
  const owned = await ownedLink(linkId);
  if (!owned) return;
  updateLink(linkId, { active: active ? 1 : 0 });
  refresh();
}

export async function reorderLinksAction(orderedIds: string[]): Promise<void> {
  const ctx = await tenant();
  // Scoped by site_id in the query, so ids from another tenant are no-ops.
  reorderLinks(ctx.site.id, orderedIds);
  refresh();
}

export async function duplicateLinkAction(linkId: string): Promise<void> {
  const owned = await ownedLink(linkId);
  if (!owned) return;

  const capacity = quota("links", {
    planId: owned.user.plan,
    siteId: owned.site.id,
    galleryCount: owned.site.gallery.length,
    teamId: owned.user.team_id,
  });
  if (!capacity.allowed) return;

  createLink(owned.site.id, {
    kind: owned.row.kind,
    label: `${owned.row.label} copy`,
    sublabel: owned.row.sublabel,
    value: owned.row.value,
    highlight: owned.row.highlight,
    is_action: 0,
    active: 0,
  });
  refresh();
}
