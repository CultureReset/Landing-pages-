import { BASE_URL, createReport, launch, requireServer, signIn, watchForErrors } from "./lib/harness.mjs";

/** Every route answers, and nothing logs an error while doing it. */
export default async function run() {
  await requireServer();
  const report = createReport("Routes");
  const browser = await launch();
  const errors = [];

  try {
    const page = await browser.newPage();
    await signIn(page);

    // Find a real showcase id rather than guessing one.
    const itemId = await page.evaluate(async () => {
      const res = await fetch("/dashboard/showcase");
      const text = await res.text();
      return (text.match(/\/dashboard\/showcase\/(itm_[A-Za-z0-9_-]+)/) || [])[1] ?? "";
    });

    const expect200 = [
      "/",
      "/legal/privacy",
      "/legal/terms",
      "/legal/refunds",
      "/login",
      "/signup",
      "/dashboard",
      "/dashboard/builder",
      "/dashboard/links",
      "/dashboard/showcase",
      "/dashboard/showcase/new",
      "/dashboard/testimonials",
      "/dashboard/leads",
      "/dashboard/analytics",
      "/dashboard/analytics?range=7",
      "/dashboard/analytics?range=90",
      "/dashboard/studio",
      "/dashboard/share",
      "/dashboard/team",
      "/dashboard/settings",
      "/p/nora-vance",
      "/p/atlas-motorworks",
      "/p/ember-supper-club",
      "/p/studio-lune",
      "/p/northshore-strength",
      "/p/halden-partners",
      "/p/jonah-pike",
      ...(itemId ? [`/dashboard/showcase/${itemId}`, `/p/nora-vance/i/${itemId}`] : []),
    ];

    const expect404 = ["/p/definitely-not-a-tenant", "/not-a-real-page"];

    report.section(`${expect200.length} routes expected to serve`);
    watchForErrors(page, errors);
    let bad = [];
    for (const path of expect200) {
      const res = await page.goto(BASE_URL + path, { waitUntil: "networkidle", timeout: 40_000 }).catch(() => null);
      if (res?.status() !== 200) bad.push(`${path} → ${res?.status() ?? "ERR"}`);
    }
    report.check("all serve 200", bad.length === 0, bad.join(", "));

    report.section("Routes expected to 404");
    bad = [];
    for (const path of expect404) {
      const res = await page.goto(BASE_URL + path, { waitUntil: "domcontentloaded" }).catch(() => null);
      if (res?.status() !== 404) bad.push(`${path} → ${res?.status() ?? "ERR"}`);
    }
    report.check("all 404 correctly", bad.length === 0, bad.join(", "));

    report.section("Console health");
    // A 404 page legitimately logs a failed-resource error; ignore those.
    const real = [...new Set(errors)].filter((e) => !e.includes("Failed to load resource"));
    report.check("no page or console errors across the app", real.length === 0, real.slice(0, 3).join(" | "));
  } catch (error) {
    report.fail("route sweep completed without throwing", error.message.split("\n")[0]);
  } finally {
    await browser.close();
  }

  return report.finish();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { failures } = await run();
  process.exit(failures.length ? 1 : 0);
}
