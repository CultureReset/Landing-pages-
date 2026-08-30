"use server";

import { revalidatePath } from "next/cache";
import { requireSite } from "@/lib/guard";
import { deleteLead, leadById, updateLead } from "@/lib/repo";
import type { LeadStatus } from "@/lib/types";

function refresh() {
  revalidatePath("/dashboard", "layout");
}

async function ownedLead(leadId: string) {
  const { site } = await requireSite();
  const lead = leadById(leadId);
  return lead && lead.site_id === site.id ? lead : null;
}

export async function setLeadStatusAction(leadId: string, status: LeadStatus): Promise<void> {
  if (!(await ownedLead(leadId))) return;
  updateLead(leadId, { status });
  refresh();
}

export async function saveLeadNotesAction(leadId: string, notes: string): Promise<void> {
  if (!(await ownedLead(leadId))) return;
  updateLead(leadId, { notes: notes.slice(0, 4000) });
  refresh();
}

export async function deleteLeadAction(leadId: string): Promise<void> {
  if (!(await ownedLead(leadId))) return;
  deleteLead(leadId);
  refresh();
}
