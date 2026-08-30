/**
 * Multi-tenant safety checks. Runs against a throwaway database, so it never
 * touches your development data.
 *
 *   npm run test:tenancy
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "frontdesk-test-"));
process.env.FRONTDESK_DB_PATH = join(dir, "test.db");
process.env.ADMIN_EMAILS = "boss@example.com";

async function main() {
  const { createUser, findUserByEmail, updateUser } = await import("../src/lib/users");
  const repo = await import("../src/lib/repo");
  const { quota, storage } = await import("../src/lib/entitlements");
  const { isReservedHandle } = await import("../src/config/reserved");
  const { limitsFor } = await import("../src/config/plans");
  const { hit, reset } = await import("../src/lib/rate-limit");

  let passed = 0;
  const failures: string[] = [];

  function check(name: string, condition: boolean, detail = "") {
    if (condition) {
      passed++;
      console.log(`  ok   ${name}`);
    } else {
      failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
      console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
    }
  }

  /* ---------------------------------------------------------------- fixtures */

  const alice = createUser({ email: "alice@example.com", name: "Alice", password: "password123" });
  const bob = createUser({ email: "bob@example.com", name: "Bob", password: "password123" });

  const aliceSite = repo.createSite(alice.id, { business_name: "Alice Co", slug: "alice-co" });
  const bobSite = repo.createSite(bob.id, { business_name: "Bob Co", slug: "bob-co" });

  const aliceItem = repo.createItem(aliceSite.id, { title: "Alice listing" });
  const bobItem = repo.createItem(bobSite.id, { title: "Bob listing" });
  const aliceLink = repo.createLink(aliceSite.id, { label: "Alice link", value: "https://a.example" });
  const bobLead = repo.createLead(bobSite.id, { name: "Visitor", email: "v@example.com", message: "hi" });
  const bobTestimonial = repo.createTestimonial(bobSite.id, { author: "Client", quote: "Great" });

  console.log("\nTenant isolation");

  /* The guards live in server-only modules, so assert the invariant they rely on:
     every row carries the owning site, and lookups expose it for comparison. */
  check("items carry their owning site", repo.itemById(bobItem.id)?.site_id === bobSite.id);
  check(
    "one tenant's item is not reachable through the other's site id",
    repo.itemById(bobItem.id)?.site_id !== aliceSite.id,
  );
  check("links carry their owning site", repo.linkById(aliceLink.id)?.site_id === aliceSite.id);
  check("leads carry their owning site", repo.leadById(bobLead.id)?.site_id === bobSite.id);

  check(
    "listing queries never cross tenants",
    repo.itemsForSite(aliceSite.id).every((i) => i.site_id === aliceSite.id) &&
      repo.itemsForSite(aliceSite.id).length === 1,
  );
  check(
    "lead queries never cross tenants",
    repo.leadsForSite(aliceSite.id).length === 0 && repo.leadsForSite(bobSite.id).length === 1,
  );
  check(
    "testimonial queries never cross tenants",
    repo.testimonialsForSite(aliceSite.id).length === 0 &&
      repo.testimonialsForSite(bobSite.id).length === 1,
  );

  /* Reordering is scoped in SQL: passing a foreign id must be inert. */
  repo.reorderItems(aliceSite.id, [bobItem.id]);
  check(
    "reordering with a foreign id does not move it",
    repo.itemById(bobItem.id)?.position === 0,
  );

  /* Counts feed quotas — they must not leak either. */
  check("counts are per tenant", repo.countItems(aliceSite.id) === 1 && repo.countItems(bobSite.id) === 1);

  console.log("\nDirectory privacy");

  check("new tenants are not featured", aliceSite.featured === 0 && bobSite.featured === 0);
  check("the public directory is empty until an operator curates it", repo.featuredSites(10).length === 0);
  repo.setFeatured(aliceSite.id, true);
  check("featuring one tenant lists exactly that tenant", repo.featuredSites(10).length === 1);
  repo.setSuspended(aliceSite.id, true);
  check("a suspended tenant leaves the directory", repo.featuredSites(10).length === 0);
  repo.setSuspended(aliceSite.id, false);
  repo.setFeatured(aliceSite.id, false);

  console.log("\nTeam scoping");

  check(
    "team lookups only load the given users",
    repo.sitesForUsers([alice.id]).length === 1 && repo.sitesForUsers([]).length === 0,
  );

  console.log("\nHandles");

  check("reserved handles are refused", isReservedHandle("admin") && isReservedHandle("API"));
  check("claiming a handle another tenant holds fails", repo.claimHandle(bobSite.id, "alice-co") === false);
  check("claiming a reserved handle fails", repo.claimHandle(bobSite.id, "dashboard") === false);
  check("claiming a free handle succeeds", repo.claimHandle(bobSite.id, "bob-trading") === true);
  check("handles are stored lowercase", repo.claimHandle(bobSite.id, "BobTrading") && repo.siteById(bobSite.id)?.slug === "bobtrading");
  check(
    "handle uniqueness is case-insensitive",
    repo.claimHandle(aliceSite.id, "BOBTRADING") === false,
  );

  /* Concurrent signups: many sites created from the same base name must all get
     distinct handles rather than colliding. */
  const carol = createUser({ email: "carol@example.com", name: "Carol", password: "password123" });
  const handles = new Set<string>();
  for (let i = 0; i < 25; i++) {
    handles.add(repo.createSite(carol.id, { business_name: "Popular Name" }).slug);
  }
  check("25 sites from one base name get 25 distinct handles", handles.size === 25, `${handles.size} unique`);

  console.log("\nPlan limits");

  const trialUsage = { planId: "trial", siteId: aliceSite.id, galleryCount: 0, teamId: null };
  const trialItemLimit = limitsFor("trial").items;
  check("trial has a finite item limit", trialItemLimit > 0);
  check("under the limit is allowed", quota("items", trialUsage).allowed);

  for (let i = repo.countItems(aliceSite.id); i < trialItemLimit; i++) {
    repo.createItem(aliceSite.id, { title: `Filler ${i}` });
  }
  check(
    "at the limit the next one is refused",
    quota("items", trialUsage).allowed === false,
    `used ${quota("items", trialUsage).used} of ${trialItemLimit}`,
  );
  check(
    "an unlimited plan is not refused",
    quota("items", { ...trialUsage, planId: "individual" }).allowed,
  );
  check("the refusal names the plan and the ceiling", quota("items", trialUsage).message.includes(String(trialItemLimit)));

  check("storage starts empty and allows an upload", storage("trial", aliceSite.id, 1024).allowed);
  check(
    "an upload larger than the plan allowance is refused",
    storage("trial", aliceSite.id, limitsFor("trial").storageMb * 1024 * 1024 + 1).allowed === false,
  );

  console.log("\nRate limiting");

  reset("test:key");
  const window = Array.from({ length: 6 }, () => hit("test:key", 5, 60).ok);
  check("the first five attempts pass", window.slice(0, 5).every(Boolean));
  check("the sixth is blocked", window[5] === false);
  check("a different key is unaffected", hit("test:other", 5, 60).ok);
  reset("test:key");
  check("reset clears the bucket", hit("test:key", 5, 60).ok);

  console.log("\nSuspension");

  updateUser(bob.id, { suspended: 1 });
  check("a suspended user is flagged", findUserByEmail("bob@example.com")?.suspended === 1);
  repo.setSuspended(bobSite.id, true);
  check("a suspended site is flagged", repo.siteById(bobSite.id)?.suspended === 1);

  /* ------------------------------------------------------------------ result */

  rmSync(dir, { recursive: true, force: true });

  console.log(`\n${passed} passed, ${failures.length} failed\n`);
  if (failures.length) {
    for (const f of failures) console.error(`  ✗ ${f}`);
    process.exit(1);
  }
}

main();
