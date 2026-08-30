"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, revokeAllSessions, verifyPassword } from "@/lib/auth";
import { requireSite, requireUser } from "@/lib/guard";
import { updateSite } from "@/lib/repo";
import {
  createTeam,
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  teamById,
  teamMembers,
  updateTeam,
  updateUser,
} from "@/lib/users";
import { createSite, uniqueSlug } from "@/lib/repo";
import { DEFAULT_HOURS, DEFAULT_SECTIONS, DEFAULT_THEME } from "@/lib/themes";
import { quota } from "@/lib/entitlements";
import { CREDIT_BUNDLES, isCreditBundle } from "@/lib/billing";
import { PLANS, TRIAL_DAYS, planById } from "@/config/plans";
import type { Plan } from "@/lib/types";
import type { ActionState } from "./site";

function refresh() {
  revalidatePath("/dashboard", "layout");
}

/* --------------------------------------------------------------- account */

export async function saveAccountAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const avatar = String(form.get("avatar_url") ?? "").trim();

  if (!name) return { error: "Your name can't be empty." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email address doesn't look right." };

  const existing = findUserByEmail(email);
  if (existing && existing.id !== user.id) return { error: "Another account already uses that email." };

  updateUser(user.id, { name, email, avatar_url: avatar || null });
  refresh();
  return { ok: true, message: "Account updated." };
}

export async function changePasswordAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const session = await requireUser();
  const user = findUserById(session.id);
  if (!user) return { error: "Account not found." };

  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (!verifyPassword(current, user.password_hash)) return { error: "That isn't your current password." };
  if (next.length < 8) return { error: "Use at least 8 characters." };
  if (next !== confirm) return { error: "The two new passwords don't match." };

  updateUser(user.id, { password_hash: hashPassword(next) });
  return { ok: true, message: "Password changed. Other devices stay signed in — sign them out below if you'd like." };
}

export async function signOutEverywhereAction(): Promise<void> {
  const user = await requireUser();
  revokeAllSessions(user.id);
  redirect("/login");
}

export async function changePlanAction(planInput: string): Promise<void> {
  const user = await requireUser();
  if (!PLANS.some((p) => p.id === planInput)) return;
  const plan = planInput as Plan;

  if (plan === "team" && !user.team_id) {
    const team = createTeam(`${user.name}'s team`, user.id);
    updateUser(user.id, { plan, team_id: team.id });
  } else {
    updateUser(user.id, { plan });
  }
  refresh();
}

export async function topUpCreditsAction(amount: number): Promise<void> {
  const session = await requireUser();
  const user = findUserById(session.id);
  if (!user) return;
  const safe = isCreditBundle(amount) ? amount : CREDIT_BUNDLES[0];
  updateUser(user.id, { credits: user.credits + safe });
  refresh();
}

export async function deleteAccountAction(): Promise<void> {
  const user = await requireUser();
  deleteUser(user.id);
  redirect("/");
}

/* ------------------------------------------------------------------ team */

export async function inviteMemberAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const owner = await requireUser();
  if (owner.role !== "owner") return { error: "Only the team owner can invite people." };

  let teamId = owner.team_id;
  if (!teamId) {
    const team = createTeam(`${owner.name}'s team`, owner.id);
    teamId = team.id;
    updateUser(owner.id, { team_id: teamId, plan: "team" });
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!name) return { error: "Give them a name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email address doesn't look right." };
  if (findUserByEmail(email)) return { error: "Someone already has an account with that email." };

  const seats = quota("seats", {
    planId: owner.plan,
    siteId: "",
    galleryCount: 0,
    teamId,
  });
  if (!seats.allowed) {
    return {
      error: `The ${planById(owner.plan).name} plan covers ${seats.limit} seats. Upgrade in Settings → Plan to add more people.`,
    };
  }

  const team = teamById(teamId);
  if (team && teamMembers(teamId).length >= team.seats) {
    updateTeam(teamId, { seats: Math.min(seats.limit, team.seats + 1) });
  }

  // A starter password they change on first sign-in.
  const tempPassword = `welcome-${Math.random().toString(36).slice(2, 8)}`;
  const member = createUser({
    name,
    email,
    password: tempPassword,
    plan: "team",
    teamId,
    role: "member",
  });

  createSite(member.id, {
    slug: uniqueSlug(name),
    business_name: team?.name ?? name,
    owner_name: name,
    email,
    theme: DEFAULT_THEME,
    layout: DEFAULT_SECTIONS,
    hours: DEFAULT_HOURS,
    published: 0,
  });

  refresh();
  return {
    ok: true,
    message: `${name} is on the team. Their temporary password is ${tempPassword} — send it over and they can change it in Settings.`,
  };
}

export async function removeMemberAction(memberId: string): Promise<void> {
  const owner = await requireUser();
  if (owner.role !== "owner" || !owner.team_id) return;
  const member = findUserById(memberId);
  if (!member || member.team_id !== owner.team_id || member.id === owner.id) return;
  deleteUser(memberId);
  refresh();
}

export async function renameTeamAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const owner = await requireUser();
  if (!owner.team_id) return { error: "You're not on a team yet." };
  const name = String(form.get("team_name") ?? "").trim();
  if (!name) return { error: "Give the team a name." };
  updateTeam(owner.team_id, { name });
  refresh();
  return { ok: true, message: "Team renamed." };
}

/** Keeps the signed-in user's own site name aligned with the team name. */
export async function syncBrandAction(): Promise<void> {
  const { user, site } = await requireSite();
  if (!user.team_id) return;
  const team = teamById(user.team_id);
  if (team) updateSite(site.id, { business_name: team.name });
  refresh();
}
