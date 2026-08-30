import "server-only";
import { redirect } from "next/navigation";
import { currentUser } from "./auth";
import { createSite, siteByUser } from "./repo";
import { DEFAULT_HOURS, DEFAULT_SECTIONS, DEFAULT_THEME } from "./themes";
import type { SessionUser, Site } from "./types";

export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

/** Every account owns exactly one page; create it lazily on first dashboard hit. */
export async function requireSite(): Promise<{ user: SessionUser; site: Site }> {
  const user = await requireUser();
  let site = siteByUser(user.id);
  if (!site) {
    site = createSite(user.id, {
      business_name: user.name,
      owner_name: user.name,
      email: user.email,
      slug: user.name || user.email.split("@")[0],
      theme: DEFAULT_THEME,
      layout: DEFAULT_SECTIONS,
      hours: DEFAULT_HOURS,
      published: 0,
    });
  }
  return { user, site };
}
