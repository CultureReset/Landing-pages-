"use server";

import { revalidatePath } from "next/cache";
import { NOT_YOURS, ownedLead } from "@/lib/tenant";
import { deleteLead, updateLead } from "@/lib/repo";
import type { LeadStatus } from "@/lib/types";

function refresh() {
  revalidatePath("/dashboard", "layout");
}

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];

export async function setLeadStatusAction(leadId: string, status: LeadStatus): Promise<void> {
  if (!STATUSES.includes(status)) return;
  const owned = await ownedLead(leadId);
  if (!owned) return;
  updateLead(leadId, { status });
  refresh();
}

export async function saveLeadNotesAction(leadId: string, notes: string): Promise<void> {
  const owned = await ownedLead(leadId);
  if (!owned) return;
  updateLead(leadId, { notes: notes.slice(0, 4000) });
  refresh();
}

export async function deleteLeadAction(leadId: string): Promise<{ error?: string } | void> {
  const owned = await ownedLead(leadId);
  if (!owned) return { error: NOT_YOURS };
  deleteLead(leadId);
  refresh();
}
