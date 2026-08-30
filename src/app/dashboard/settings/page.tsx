import type { Metadata } from "next";
import { AccountPanel, PlanPanel } from "@/components/dashboard/settings-panels";
import { AddressPanel } from "@/components/dashboard/builder/panels";
import { Tabs } from "@/components/ui/interactive";
import { PageHeader } from "@/components/ui/primitives";
import { requireSite } from "@/lib/guard";
import { quota, storage } from "@/lib/entitlements";
import { findUserById } from "@/lib/users";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, site } = await requireSite();
  const record = findUserById(user.id);

  const input = {
    planId: user.plan,
    siteId: site.id,
    galleryCount: site.gallery.length,
    teamId: user.team_id,
  };
  const usage = (
    [
      ["items", "Showcase entries"],
      ["links", "Links"],
      ["quickActions", "Quick actions"],
      ["galleryImages", "Gallery images"],
      ["testimonials", "Testimonials"],
      ["seats", "Team seats"],
    ] as const
  ).map(([key, label]) => {
    const q = quota(key, input);
    return { label, used: q.used, limit: q.limit, unlimited: q.unlimited };
  });
  const storageState = storage(user.plan, site.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your account, your page address and your plan." />
      <div className="max-w-3xl">
        <Tabs
          tabs={[
            { id: "account", label: "Account", icon: "user", content: <AccountPanel user={user} /> },
            { id: "page", label: "Page address", icon: "globe", content: <AddressPanel site={site} /> },
            {
              id: "plan",
              label: "Plan & billing",
              icon: "card",
              content: (
                <PlanPanel
                  user={user}
                  trialEnds={record?.trial_ends_at ?? null}
                  usage={usage}
                  storage={storageState}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
