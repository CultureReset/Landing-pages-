import { all, get, id, now, run } from "./db";
import { hashPassword } from "./passwords";
import type { Team, User } from "./types";

export function findUserByEmail(email: string): User | undefined {
  return get<User>("SELECT * FROM users WHERE email = ?", email.trim().toLowerCase());
}

export function findUserById(userId: string): User | undefined {
  return get<User>("SELECT * FROM users WHERE id = ?", userId);
}

export function createUser(input: {
  email: string;
  name: string;
  password: string;
  plan?: string;
  teamId?: string | null;
  role?: string;
}): User {
  const uid = id("usr");
  run(
    `INSERT INTO users (id, email, name, password_hash, role, team_id, plan, credits, trial_ends_at, avatar_url, onboarded, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    uid,
    input.email.trim().toLowerCase(),
    input.name.trim(),
    hashPassword(input.password),
    input.role ?? "owner",
    input.teamId ?? null,
    input.plan ?? "trial",
    25,
    new Date(Date.now() + 7 * 864e5).toISOString(),
    null,
    0,
    now(),
  );
  return findUserById(uid)!;
}

export function updateUser(userId: string, patch: Partial<User>): void {
  const keys = ["name", "email", "avatar_url", "plan", "credits", "onboarded", "team_id", "role", "password_hash"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const k of keys) {
    if (k in patch) {
      sets.push(`${k} = ?`);
      params.push((patch as Record<string, unknown>)[k]);
    }
  }
  if (!sets.length) return;
  params.push(userId);
  run(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, ...params);
}

export function deleteUser(userId: string): void {
  run("DELETE FROM users WHERE id = ?", userId);
}

export function teamById(teamId: string): Team | undefined {
  return get<Team>("SELECT * FROM teams WHERE id = ?", teamId);
}

export function createTeam(name: string, ownerId: string): Team {
  const tid = id("team");
  run(
    "INSERT INTO teams (id, name, owner_id, plan, seats, created_at) VALUES (?,?,?,?,?,?)",
    tid,
    name,
    ownerId,
    "team",
    2,
    now(),
  );
  return teamById(tid)!;
}

export function teamMembers(teamId: string): User[] {
  return all<User>("SELECT * FROM users WHERE team_id = ? ORDER BY created_at", teamId);
}

export function updateTeam(teamId: string, patch: Partial<Team>): void {
  const keys = ["name", "plan", "seats"] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const k of keys) {
    if (k in patch) {
      sets.push(`${k} = ?`);
      params.push((patch as Record<string, unknown>)[k]);
    }
  }
  if (!sets.length) return;
  params.push(teamId);
  run(`UPDATE teams SET ${sets.join(", ")} WHERE id = ?`, ...params);
}
