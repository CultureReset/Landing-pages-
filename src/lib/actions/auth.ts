"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { createSite, siteByUser, uniqueSlug } from "@/lib/repo";
import { createTeam, createUser, findUserByEmail, updateUser } from "@/lib/users";
import { DEFAULT_HOURS, DEFAULT_SECTIONS, DEFAULT_THEME } from "@/lib/themes";
import { LIMITS, hit, reset } from "@/lib/rate-limit";
import { features, inviteCodeValid } from "@/config/features";
import { planById } from "@/config/plans";

export interface FormState {
  error?: string;
  ok?: boolean;
}

/** Client address from the proxy headers, for rate limiting. */
async function callerIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip")?.trim() || "local";
}

/** Same wording whether the account exists or the password was wrong. */
const BAD_CREDENTIALS = "That email and password don't match an account.";

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const ip = await callerIp();
  const byIp = hit(`login:ip:${ip}`, LIMITS.loginByIp.limit, LIMITS.loginByIp.windowSeconds);
  const byAccount = hit(
    `login:acct:${email}`,
    LIMITS.loginByAccount.limit,
    LIMITS.loginByAccount.windowSeconds,
  );
  if (!byIp.ok || !byAccount.ok) {
    const wait = Math.max(byIp.retryAfterSeconds, byAccount.retryAfterSeconds);
    return { error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} minute(s).` };
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) return { error: BAD_CREDENTIALS };
  if (user.suspended === 1) {
    return { error: "This account is suspended. Contact support if you think that's wrong." };
  }

  reset(`login:acct:${email}`);
  await createSession(user.id);
  redirect(user.onboarded ? "/dashboard" : "/onboarding");
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!features.signupsOpen) {
    return { error: "New accounts are closed at the moment." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const requestedPlan = String(formData.get("plan") ?? "individual");
  const inviteCode = String(formData.get("invite_code") ?? "");

  if (!name) return { error: "Tell us your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email address doesn't look right." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (!inviteCodeValid(inviteCode)) return { error: "That invite code isn't valid." };

  const ip = await callerIp();
  const throttle = hit(`signup:${ip}`, LIMITS.signup.limit, LIMITS.signup.windowSeconds);
  if (!throttle.ok) {
    return { error: "Too many accounts created from here. Try again later." };
  }

  if (findUserByEmail(email)) return { error: "An account already uses that email. Try signing in." };

  const user = createUser({ name, email, password, plan: "trial" });

  // The chosen plan is remembered as intent; the account still starts on trial.
  if (planById(requestedPlan).id === "team") {
    const team = createTeam(`${name}'s team`, user.id);
    updateUser(user.id, { team_id: team.id });
  }

  createSite(user.id, {
    slug: uniqueSlug(name),
    business_name: name,
    owner_name: name,
    email,
    theme: DEFAULT_THEME,
    layout: DEFAULT_SECTIONS,
    hours: DEFAULT_HOURS,
    published: 0,
  });

  await createSession(user.id);
  redirect("/onboarding");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

/**
 * One-click access to the seeded demo tenant. Disabled unless the deployment
 * opts in — it signs the visitor in as a real account.
 */
export async function demoSignInAction(): Promise<void> {
  if (!features.demoAccount) redirect("/login");
  const user = findUserByEmail(features.demoEmail);
  if (!user) redirect("/login?error=nodemo");
  await createSession(user.id);
  if (!siteByUser(user.id)) redirect("/onboarding");
  redirect("/dashboard");
}
