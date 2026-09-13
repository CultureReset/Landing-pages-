import { BASE_URL, createReport, launch, requireServer, signIn } from "./lib/harness.mjs";

/**
 * Nothing may scroll sideways on a phone. This is the check that caught grids
 * declaring columns only at a breakpoint, which default to a max-content
 * column and blow past the viewport.
 */
const PAGES = [
  "/",
  "/login",
  "/signup",
  "/legal/privacy",
  "/dashboard",
  "/dashboard/builder",
  "/dashboard/links",
  "/dashboard/showcase",
  "/dashboard/showcase/new",
  "/dashboard/leads",
  "/dashboard/analytics",
  "/dashboard/studio",
  "/dashboard/share",
  "/dashboard/team",
  "/dashboard/settings",
  "/dashboard/testimonials",
  "/p/nora-vance",
  "/p/atlas-motorworks",
  "/onboarding",
];

export default async function run() {
  await requireServer();
  const report = createReport("Responsive");
  const browser = await launch();

  try {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await signIn(page);

    report.section(`${PAGES.length} pages at 390px`);
    const overflowing = [];
    for (const path of PAGES) {
      await page.goto(BASE_URL + path, { waitUntil: "networkidle", timeout: 40_000 }).catch(() => {});
      await page.waitForTimeout(700);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (scrollWidth > clientWidth + 1) overflowing.push(`${path} (${scrollWidth} > ${clientWidth})`);
    }
    report.check("no page scrolls horizontally", overflowing.length === 0, overflowing.join(", "));

    report.section("Tap targets");
    await page.goto(`${BASE_URL}/p/nora-vance`, { waitUntil: "networkidle" });
    const tooSmall = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll("a, button").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 28) {
          bad.push(`${el.tagName.toLowerCase()}:${(el.textContent || "").trim().slice(0, 20)}`);
        }
      });
      return bad.slice(0, 5);
    });
    report.check("controls on a public page are tappable", tooSmall.length === 0, tooSmall.join(", "));
  } catch (error) {
    report.fail("responsive checks completed without throwing", error.message.split("\n")[0]);
  } finally {
    await browser.close();
  }

  return report.finish();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { failures } = await run();
  process.exit(failures.length ? 1 : 0);
}
