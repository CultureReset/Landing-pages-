import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

/**
 * Shared plumbing for the browser tests.
 *
 * These run against a server you start yourself (`npm run dev` or
 * `npm run build && npm start`), so they exercise the real stack — server
 * actions, the database, route handlers — rather than a mocked one.
 */

export const BASE_URL = (process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Playwright resolves its own browser by expected revision, which breaks when
 * the machine has a different one installed (common in CI images and remote
 * sandboxes). Fall back to whatever chromium is actually on disk.
 */
function resolveChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;

  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) return undefined; // let Playwright decide

  const candidates = readdirSync(root)
    .filter((name) => name.startsWith("chromium-"))
    .map((name) => join(root, name, "chrome-linux", "chrome"))
    .filter((path) => existsSync(path));

  return candidates[0];
}

export async function launch() {
  const executablePath = resolveChromium();
  try {
    return await chromium.launch({
      executablePath,
      // Honour a corporate/sandbox proxy when one is configured.
      proxy: process.env.HTTPS_PROXY
        ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" }
        : undefined,
      args: process.env.HTTPS_PROXY ? ["--ignore-certificate-errors"] : [],
    });
  } catch (error) {
    console.error(
      "\nCould not start Chromium. Install it with:\n  npx playwright install chromium\n" +
        "or point PLAYWRIGHT_CHROMIUM_PATH at an existing binary.\n",
    );
    throw error;
  }
}

/** Fails fast with a useful message rather than a wall of timeouts. */
export async function requireServer() {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok && res.status >= 500) throw new Error(`status ${res.status}`);
  } catch (error) {
    console.error(
      `\nNo server responding at ${BASE_URL}.\n` +
        "Start one first:\n  npm run dev\n" +
        "or point TEST_BASE_URL at a running instance.\n",
    );
    process.exit(2);
  }
}

/* ------------------------------------------------------------- assertions */

export function createReport(title) {
  const failures = [];
  let passed = 0;

  return {
    section(name) {
      console.log(`\n${name}`);
    },
    check(name, condition, detail = "") {
      if (condition) {
        passed++;
        console.log(`  ok   ${name}`);
      } else {
        failures.push(`${title} › ${name}${detail ? ` — ${detail}` : ""}`);
        console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
      }
      return condition;
    },
    fail(name, detail = "") {
      failures.push(`${title} › ${name}${detail ? ` — ${detail}` : ""}`);
      console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
    },
    finish() {
      console.log(`\n${title}: ${passed} passed, ${failures.length} failed`);
      return { passed, failures };
    },
  };
}

/* ---------------------------------------------------------------- fixtures */

export const DEMO = {
  email: process.env.TEST_DEMO_EMAIL || "demo@frontdesk.app",
  password: process.env.TEST_DEMO_PASSWORD || "demo1234",
};

/** Signs in an existing account and lands on the dashboard. */
export async function signIn(page, { email = DEMO.email, password = DEMO.password } = {}) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 20_000 });
}

/** Registers a fresh tenant and walks it through onboarding to a live page. */
export async function createTenant(browser, tag, { businessType = "Professional services" } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const handle = `t-${tag}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

  await page.goto(`${BASE_URL}/signup`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="name"]', `Owner ${tag}`);
  await page.fill('input[name="email"]', `${handle}@example.test`);
  await page.fill('input[name="password"]', "password12345");
  await page.click('button[type="submit"]');

  // A refused sign-up stays on the form with a message. Surface that instead
  // of letting the caller time out on a navigation that will never happen.
  const reached = await page
    .waitForURL("**/onboarding**", { timeout: 20_000 })
    .then(() => true)
    .catch(() => false);
  if (!reached) {
    const message = (await page.locator("body").innerText()).match(/Too many.*|.*isn't valid.*|.*closed at the moment.*/)?.[0];
    throw new Error(
      message
        ? `Sign-up refused: ${message.trim()}\n` +
          "  If this is the signup throttle, raise it for the test run:\n" +
          "    RATE_LIMIT_SIGNUP=100 npm run test:browser"
        : "Sign-up did not reach onboarding",
    );
  }

  await page.click(`button:has-text("${businessType}")`);
  await page.fill('input[name="business_name"]', `Business ${tag}`);
  await page.click('button[type="submit"]:has-text("Continue")');
  await page.waitForURL("**step=2**");

  await page.fill('input[name="owner_name"]', `Owner ${tag}`);
  await page.click('button[type="submit"]:has-text("Continue")');
  await page.waitForURL("**step=3**");

  await page.click('button[type="submit"]:has-text("Continue")');
  await page.waitForURL("**step=4**");

  await page.fill('input[name="slug"]', handle);
  await page.click('button[type="submit"]:has-text("Publish")');
  await page.waitForURL("**/dashboard**", { timeout: 20_000 });

  return { ctx, page, handle, tag };
}

/** Collects page errors and console errors for assertions at the end. */
export function watchForErrors(page, sink) {
  page.on("pageerror", (e) => sink.push(`PAGEERROR ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") sink.push(`CONSOLE ${m.text().slice(0, 180)}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 500) sink.push(`HTTP ${r.status()} ${r.url()}`);
  });
}
