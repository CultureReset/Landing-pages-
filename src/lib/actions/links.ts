"use server";

import { revalidatePath } from "next/cache";
import { requireSite } from "@/lib/guard";
import { createLink, deleteLink, linkById, linksForSite, reorderLinks, updateLink } from "@/lib/repo";
import type { ActionState } from "./site";

function refresh() {
  revalidatePath("/dashboard", "layout");
}

/** Confirms a link belongs to the signed-in user's site before touching it. */
async function ownedLink(linkId: string) {
  const { site } = await requireSite();
  const link = linkById(linkId);
  if (!link || link.site_id !== site.id) return null;
  return { site, link };
}

export async function saveLinkAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { site } = await requireSite();
  const linkId = String(form.get("id") ?? "");

  const payload = {
    kind: String(form.get("kind") ?? "link") as never,
    label: String(form.get("label") ?? "").trim().slice(0, 80),
    sublabel: String(form.get("sublabel") ?? "").trim().slice(0, 100),
    value: String(form.get("value") ?? "").trim().slice(0, 500),
    highlight: form.get("highlight") === "on" ? 1 : 0,
    is_action: form.get("is_action") === "on" ? 1 : 0,
    active: form.get("active") === "on" ? 1 : 0,
  };

  if (!payload.label) return { error: "Give the link a label." };
  if (!payload.value) return { error: "Add a destination — a URL, phone number or email." };

  if (linkId) {
    const owned = await ownedLink(linkId);
    if (!owned) return { error: "That link no longer exists." };
    updateLink(linkId, payload);
  } else {
    if (payload.is_action && linksForSite(site.id).filter((l) => l.is_action === 1).length >= 5) {
      return { error: "Quick actions are capped at five — turn one off first." };
    }
    createLink(site.id, payload);
  }

  refresh();
  return { ok: true, message: linkId ? "Link updated." : "Link added." };
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
  const { site } = await requireSite();
  reorderLinks(site.id, orderedIds);
  refresh();
}

export async function duplicateLinkAction(linkId: string): Promise<void> {
  const owned = await ownedLink(linkId);
  if (!owned) return;
  const { site, link } = owned;
  createLink(site.id, {
    kind: link.kind,
    label: `${link.label} copy`,
    sublabel: link.sublabel,
    value: link.value,
    highlight: link.highlight,
    is_action: 0,
    active: 0,
  });
  refresh();
}
