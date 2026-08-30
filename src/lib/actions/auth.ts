"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { createSite, siteByUser, uniqueSlug } from "@/lib/repo";
import { createTeam, createUser, findUserByEmail, updateUser } from "@/lib/users";
import { DEFAULT_HOURS, DEFAULT_SECTIONS, DEFAULT_THEME } from "@/lib/themes";

export interface FormState {
  error?: string;
  ok?: boolean;
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "That email and password don't match an account." };
  }
  await createSession(user.id);
  redirect(user.onboarded ? "/dashboard" : "/onboarding");
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const plan = String(formData.get("plan") ?? "individual");

  if (!name) return { error: "Tell us your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email address doesn't look right." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (findUserByEmail(email)) return { error: "An account already uses that email. Try signing in." };

  const user = createUser({ name, email, password, plan: "trial" });

  if (plan === "team") {
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

/** One-click access to the seeded demo account. */
export async function demoSignInAction(): Promise<void> {
  const user = findUserByEmail("demo@frontdesk.app");
  if (!user) redirect("/login?error=nodemo");
  await createSession(user.id);
  if (!siteByUser(user.id)) redirect("/onboarding");
  redirect("/dashboard");
}
