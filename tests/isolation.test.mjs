import { BASE_URL, createReport, createTenant, launch, requireServer } from "./lib/harness.mjs";

/**
 * Two unrelated businesses on one deployment must never see, reach or be
 * advertised alongside each other without the operator saying so.
 */
export default async function run() {
  await requireServer();
  const report = createReport("Tenant isolation");
  const browser = await launch();

  try {
    report.section("Two independent tenants");
    const a = await createTenant(browser, "alpha");
    const b = await createTenant(browser, "beta");
    report.check("both signed up", !!a.handle && !!b.handle, `${a.handle} / ${b.handle}`);
    report.check("handles are distinct", a.handle !== b.handle);

    // Each plants a marker only they should ever see.
    for (const t of [a, b]) {
      await t.page.goto(`${BASE_URL}/dashboard/showcase/new`, { waitUntil: "networkidle" });
      await t.page.fill('input[name="title"]', `SECRET-${t.tag}`);
      await t.page.click('button[type="submit"]:has-text("Create")');
      await t.page.waitForTimeout(2000);
    }

    report.section("Dashboards");
    await a.page.goto(`${BASE_URL}/dashboard/showcase`, { waitUntil: "networkidle" });
    const aShowcase = await a.page.locator("body").innerText();
    report.check("tenant A sees its own entry", aShowcase.includes("SECRET-alpha"));
    report.check("tenant A cannot see tenant B's entry", !aShowcase.includes("SECRET-beta"));

    await b.page.goto(`${BASE_URL}/dashboard/leads`, { waitUntil: "networkidle" });
    report.check(
      "tenant B's leads are clean of tenant A",
      !(await b.page.locator("body").innerText()).includes("SECRET-alpha"),
    );

    report.section("Public pages");
    const aPublic = await a.page.goto(`${BASE_URL}/p/${a.handle}`, { waitUntil: "networkidle" });
    const aPublicText = await a.page.locator("body").innerText();
    report.check("tenant A's page serves", aPublic?.status() === 200);
    report.check("tenant A's page shows its own entry", aPublicText.includes("SECRET-alpha"));
    report.check("tenant A's page shows nothing of tenant B", !aPublicText.includes("SECRET-beta"));

    const missing = await a.page.goto(`${BASE_URL}/p/${b.handle}-nope`, { waitUntil: "domcontentloaded" });
    report.check("an unknown handle 404s", missing?.status() === 404, `status ${missing?.status()}`);

    report.section("Handle claiming");
    await a.page.goto(`${BASE_URL}/dashboard/settings`, { waitUntil: "networkidle" });
    await a.page.click('button:has-text("Page address")');
    await a.page.waitForTimeout(500);

    await a.page.fill('input[name="slug"]', "admin");
    await a.page.click('button:has-text("Update address")');
    await a.page.waitForTimeout(2000);
    report.check(
      "a reserved handle is refused",
      (await a.page.locator("body").innerText()).includes("reserved"),
    );

    await a.page.fill('input[name="slug"]', b.handle);
    await a.page.click('button:has-text("Update address")');
    await a.page.waitForTimeout(2000);
    report.check(
      "another tenant's handle is refused",
      (await a.page.locator("body").innerText()).includes("already taken"),
    );

    report.section("Operator console");
    const adminRes = await a.page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
    report.check("an ordinary tenant gets 404 on /admin", adminRes?.status() === 404, `status ${adminRes?.status()}`);

    report.section("Directory privacy");
    const anonCtx = await browser.newContext();
    const anon = await anonCtx.newPage();
    await anon.goto(BASE_URL, { waitUntil: "networkidle" });
    const home = await anon.locator("body").innerText();
    report.check(
      "a new tenant is not advertised on the marketing site",
      !home.includes("Business alpha") && !home.includes("Owner alpha"),
    );
    await anonCtx.close();
  } catch (error) {
    report.fail("isolation checks completed without throwing", error.message.split("\n")[0]);
  } finally {
    await browser.close();
  }

  return report.finish();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { failures } = await run();
  process.exit(failures.length ? 1 : 0);
}
