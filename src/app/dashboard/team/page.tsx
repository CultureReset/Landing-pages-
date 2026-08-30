import type { Metadata } from "next";
import Link from "next/link";
import { TeamManager } from "@/components/dashboard/team-manager";
import { PageHeader } from "@/components/ui/primitives";
import { requireUser } from "@/lib/guard";
import { sitesForUsers } from "@/lib/repo";
import { teamById, teamMembers } from "@/lib/users";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await requireUser();
  const team = user.team_id ? teamById(user.team_id) : undefined;
  const members = user.team_id ? teamMembers(user.team_id) : [];
  // Scoped to this team — never load every tenant in the system.
  const sites = sitesForUsers(members.map((m) => m.id));

  const rows = members.map((m) => {
    const site = sites.find((s) => s.user_id === m.id);
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      avatar_url: m.avatar_url,
      slug: site?.slug ?? null,
      published: site?.published === 1,
      isYou: m.id === user.id,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description={
          team
            ? "Everyone on your plan gets their own page and their own dashboard. You see the roll-up."
            : "Add a second person and everyone gets their own page under one brand."
        }
      />
      <TeamManager
        team={team ? { name: team.name, seats: team.seats } : null}
        members={rows}
        isOwner={user.role === "owner"}
      />
      <p className="text-center text-[12.5px] text-ink-400">
        Need something different?{" "}
        <Link href="/dashboard/settings" className="font-medium text-ink-700 underline underline-offset-4">
          Change your plan
        </Link>
      </p>
    </div>
  );
}
