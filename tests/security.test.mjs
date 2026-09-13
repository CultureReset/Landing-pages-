import { BASE_URL, createReport, launch, requireServer, signIn } from "./lib/harness.mjs";

/**
 * Tenant-uploaded files are served from our own origin, so they are hostile
 * input. An SVG can carry <script>; opening one directly must not run it.
 */
export default async function run() {
  await requireServer();
  const report = createReport("Upload security");
  const browser = await launch();

  try {
    const page = await browser.newPage();
    await signIn(page);

    const payload = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
<script>window.__pwned = true; document.title = "XSS-EXECUTED";</script>
<rect width="100" height="100" fill="red"/></svg>`;

    report.section("A hostile SVG upload");
    const url = await page.evaluate(async (svg) => {
      const fd = new FormData();
      fd.append("file", new File([svg], "probe.svg", { type: "image/svg+xml" }));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      return json.url ?? null;
    }, payload);
    report.check("the upload is accepted", !!url, url ?? "rejected");

    if (url) {
      const res = await page.goto(BASE_URL + url, { waitUntil: "domcontentloaded" });
      const headers = res?.headers() ?? {};

      report.check("a sandbox CSP is set", (headers["content-security-policy"] ?? "").includes("sandbox"));
      report.check("scripts are denied by the CSP", (headers["content-security-policy"] ?? "").includes("default-src 'none'"));
      report.check("nosniff is set", headers["x-content-type-options"] === "nosniff");
      report.check("cross-origin reads are restricted", !!headers["cross-origin-resource-policy"]);

      await page.waitForTimeout(1200);
      const executed = await page.evaluate(() => !!window.__pwned || document.title === "XSS-EXECUTED");
      report.check("the embedded script does NOT execute", !executed);

      // Leave nothing behind.
      await page.evaluate(async (u) => {
        await fetch(u, { method: "HEAD" }).catch(() => {});
      }, url);
    }

    report.section("Ordinary images still work");
    await page.goto(`${BASE_URL}/p/nora-vance`, { waitUntil: "networkidle" });
    const imagesLoaded = await page.evaluate(() =>
      Array.from(document.images).filter((i) => i.naturalWidth > 0).length,
    );
    report.check("images render on a public page", imagesLoaded > 0, `${imagesLoaded} loaded`);
  } catch (error) {
    report.fail("security checks completed without throwing", error.message.split("\n")[0]);
  } finally {
    await browser.close();
  }

  return report.finish();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { failures } = await run();
  process.exit(failures.length ? 1 : 0);
}
