import { BASE_URL, createReport, launch, requireServer, signIn } from "./lib/harness.mjs";

/**
 * Plan ceilings are only real if the product refuses the next one and says so.
 * Uses quick actions because the cap is small enough to reach quickly.
 */
export default async function run() {
  await requireServer();
  const report = createReport("Plan limits");
  const browser = await launch();

  try {
    const page = await browser.newPage();
    await signIn(page);

    async function addQuickAction(n) {
      await page.goto(`${BASE_URL}/dashboard/links`, { waitUntil: "networkidle" });
      await page.click('button:has-text("Add link")');
      await page.waitForSelector('input[name="label"]');
      await page.fill('input[name="label"]', `Limit probe ${n}`);
      await page.fill('input[name="value"]', `https://example.test/${n}`);
      await page.locator('input[name="is_action"]').check({ force: true });
      await page.click('button[type="submit"]:has-text("Add link")');
      await page.waitForTimeout(1800);
      const dialog = page.locator('[role="dialog"]');
      const refused = await dialog.isVisible().catch(() => false);
      const message = refused
        ? (await dialog.innerText()).match(/The .*? plan includes.*/)?.[0] ?? ""
        : "";
      return { refused, message };
    }

    report.section("Reaching the ceiling");
    // The demo tenant ships with four quick actions; the fifth fits.
    const fifth = await addQuickAction("five");
    report.check("the last slot under the cap is accepted", !fifth.refused, fifth.message);

    const sixth = await addQuickAction("six");
    report.check("the one past the cap is refused", sixth.refused && !!sixth.message);
    report.check(
      "the refusal names the plan and the number",
      /plan includes \d+/.test(sixth.message),
      sixth.message || "(no message)",
    );

    report.section("Usage is visible to the tenant");
    await page.goto(`${BASE_URL}/dashboard/settings`, { waitUntil: "networkidle" });
    await page.click('button:has-text("Plan & billing")');
    await page.waitForTimeout(900);
    const usage = (await page.locator("body").innerText()).replace(/\n/g, " ");
    report.check("the usage panel shows quick actions at the cap", /Quick actions\s*5\s*\/\s*5/.test(usage));
    report.check("the usage panel reports storage", /Image storage/.test(usage));

    report.section("Cleanup");
    // Remove the probes so repeated runs start from the same place.
    await page.goto(`${BASE_URL}/dashboard/links`, { waitUntil: "networkidle" });
    let removed = 0;
    for (let i = 0; i < 4; i++) {
      const row = page.locator('div:has-text("Limit probe")').last();
      const del = row.locator('button:has-text("Delete")').first();
      if (!(await del.isVisible().catch(() => false))) break;
      page.once("dialog", (d) => d.accept());
      await del.click();
      await page.waitForTimeout(1200);
      removed++;
    }
    await page.goto(`${BASE_URL}/dashboard/links`, { waitUntil: "networkidle" });
    report.check(
      "probe links are gone, so the run is repeatable",
      !(await page.locator("body").innerText()).includes("Limit probe"),
      `${removed} removed`,
    );
  } catch (error) {
    report.fail("limit checks completed without throwing", error.message.split("\n")[0]);
  } finally {
    await browser.close();
  }

  return report.finish();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { failures } = await run();
  process.exit(failures.length ? 1 : 0);
}
