import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { get, id, now, run } from "./db";
import { findUserById } from "./users";
import type { SessionUser, User } from "./types";

const COOKIE = "fd_session";
const SESSION_DAYS = 30;

export { hashPassword, verifyPassword } from "./passwords";

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  run(
    "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?,?,?,?)",
    token,
    userId,
    now(),
    expires.toISOString(),
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) run("DELETE FROM sessions WHERE token = ?", token);
  jar.delete(COOKIE);
}

export function revokeAllSessions(userId: string): void {
  run("DELETE FROM sessions WHERE user_id = ?", userId);
}

function toSessionUser(u: User): SessionUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    plan: u.plan,
    team_id: u.team_id,
    credits: u.credits,
    onboarded: u.onboarded,
    avatar_url: u.avatar_url,
  };
}

/** Current signed-in user, or null. Memoised for the lifetime of a request. */
export const currentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const row = get<{ user_id: string; expires_at: string }>(
    "SELECT user_id, expires_at FROM sessions WHERE token = ?",
    token,
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    run("DELETE FROM sessions WHERE token = ?", token);
    return null;
  }
  const user = findUserById(row.user_id);
  return user ? toSessionUser(user) : null;
});
