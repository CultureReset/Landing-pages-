import {
  BASE_URL,
  createReport,
  createTenant,
  launch,
  requireServer,
  watchForErrors,
} from "./lib/harness.mjs";

/**
 * The whole product, once through: sign up, onboard, add content, publish,
 * take an enquiry as a visitor, and work that lead in the dashboard.
 */
export default async function run() {
  await requireServer();
  const report = createReport("Product flow");
  const browser = await launch();
  const errors = [];

  try {
    report.section("Sign-up and onboarding");
    const tenant = await createTenant(browser, "flow", { businessType: "Creative & media" });
    watchForErrors(tenant.page, errors);
    const { page, handle } = tenant;
    report.check("a new account reaches the dashboard", page.url().includes("/dashboard"));

    report.section("Building the page");
    await page.goto(`${BASE_URL}/dashboard/links`, { waitUntil: "networkidle" });
    await page.click('button:has-text("Add link")');
    await page.waitForSelector('input[name="label"]');
    await page.selectOption('select[name="kind"]', "booking");
    await page.fill('input[name="label"]', "Book a discovery call");
    await page.fill('input[name="sublabel"]', "20 minutes, no pitch");
    await page.fill('input[name="value"]', "https://cal.com/example/discovery");
    await page.locator('input[name="highlight"]').check({ force: true });
    await page.click('button[type="submit"]:has-text("Add link")');
    await page.waitForTimeout(2000);
    report.check(
      "a link is added and listed",
      await page.locator("text=Book a discovery call").first().isVisible().catch(() => false),
    );

    await page.goto(`${BASE_URL}/dashboard/showcase/new`, { waitUntil: "networkidle" });
    await page.fill('input[name="title"]', "Brand Film — Half Day");
    await page.fill('input[name="subtitle"]', "Two finished cuts plus social edits");
    await page.fill('input[name="category"]', "Film");
    await page.fill('input[name="price"]', "2400");
    await page.fill('textarea[name="description"]', "A half-day shoot with a two-person crew.");
    await page.fill('input[name="spec_label_0"]', "Deliverables");
    await page.fill('input[name="spec_value_0"]', "2 cuts");
    await page.fill('textarea[name="features"]', "Colour grade included\nSocial edits");
    await page.click('button[type="submit"]:has-text("Create")');
    await page.waitForURL(/\/dashboard\/showcase\/itm_/, { timeout: 20_000 });
    report.check("a showcase entry is created and opens its editor", /itm_/.test(page.url()));

    report.section("The public page");
    await page.goto(`${BASE_URL}/p/${handle}`, { waitUntil: "networkidle" });
    const publicText = await page.locator("body").innerText();
    report.check("the published page shows the new entry", publicText.includes("Brand Film"));
    report.check("the published page shows the new link", publicText.includes("Book a discovery call"));

    report.section("A visitor sends an enquiry");
    const visitorCtx = await browser.newContext({ viewport: { width: 430, height: 932 } });
    const visitor = await visitorCtx.newPage();
    await visitor.goto(`${BASE_URL}/p/${handle}`, { waitUntil: "networkidle" });
    await visitor.locator('form#enquire input[name="name"]').fill("Bruno Salgado");
    await visitor.locator('form#enquire input[name="email"]').fill("bruno@example.test");
    await visitor.locator('form#enquire textarea[name="message"]').fill("Do you shoot outside Lisbon?");
    await visitor.locator('form#enquire button[type="submit"]').click();
    const sent = await visitor
      .waitForSelector("text=Message sent", { timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    report.check("the enquiry form confirms submission", sent);
    await visitorCtx.close();

    report.section("Working the lead");
    await page.goto(`${BASE_URL}/dashboard/leads`, { waitUntil: "networkidle" });
    report.check(
      "the enquiry arrives in the dashboard",
      await page.locator("text=Bruno Salgado").first().isVisible().catch(() => false),
    );
    await page.click("text=Bruno Salgado");
    await page.waitForTimeout(900);
    await page.click('[role="dialog"] button:has-text("Qualified")');
    await page.waitForTimeout(1500);
    await page.keyboard.press("Escape");
    await page.goto(`${BASE_URL}/dashboard/leads`, { waitUntil: "networkidle" });
    report.check(
      "the lead status change sticks",
      (await page.locator("body").innerText()).includes("Qualified"),
    );

    report.section("Studio and theming");
    await page.goto(`${BASE_URL}/dashboard/studio`, { waitUntil: "networkidle" });
    await page.click('button:has-text("Write a draft")');
    await page.waitForTimeout(2500);
    const draft = await page.locator("textarea").first().inputValue().catch(() => "");
    report.check("the draft writer produces copy", draft.length > 100, `${draft.length} chars`);

    await page.goto(`${BASE_URL}/dashboard/builder`, { waitUntil: "networkidle" });
    await page.click('button:has-text("Theme")');
    await page.waitForTimeout(600);
    await page.click('button:has-text("Sand")');
    await page.waitForTimeout(2500);
    await page.goto(`${BASE_URL}/p/${handle}`, { waitUntil: "networkidle" });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    report.check("a theme change reaches the public page", bg !== "rgb(255, 255, 255)", bg);

    report.section("Share endpoints");
    for (const path of [`/api/vcard/${handle}`, `/api/qr/${handle}`, "/api/leads/export"]) {
      const res = await page.request.get(BASE_URL + path);
      report.check(`${path} responds 200`, res.status() === 200, `status ${res.status()}`);
    }

    report.section("Console health");
    const unique = [...new Set(errors)];
    report.check("no page or console errors during the flow", unique.length === 0, unique.slice(0, 3).join(" | "));
  } catch (error) {
    report.fail("flow completed without throwing", error.message.split("\n")[0]);
  } finally {
    await browser.close();
  }

  return report.finish();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { failures } = await run();
  process.exit(failures.length ? 1 : 0);
}
