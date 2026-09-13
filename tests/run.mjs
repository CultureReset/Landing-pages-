/**
 * Runs every browser suite in one go and exits non-zero if anything failed,
 * so it works as a pre-deploy gate.
 *
 *   npm run test:browser            all suites
 *   npm run test:browser -- flow    just the ones whose name matches
 */
const SUITES = [
  ["routes", () => import("./routes.test.mjs")],
  ["flow", () => import("./flow.test.mjs")],
  ["isolation", () => import("./isolation.test.mjs")],
  ["limits", () => import("./limits.test.mjs")],
  ["security", () => import("./security.test.mjs")],
  ["responsive", () => import("./responsive.test.mjs")],
];

const filters = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const selected = filters.length
  ? SUITES.filter(([name]) => filters.some((f) => name.includes(f)))
  : SUITES;

if (!selected.length) {
  console.error(`No suite matches "${filters.join(", ")}". Available: ${SUITES.map(([n]) => n).join(", ")}`);
  process.exit(2);
}

const started = Date.now();
let total = 0;
const allFailures = [];

for (const [name, load] of selected) {
  console.log(`\n${"─".repeat(58)}\n▸ ${name}\n${"─".repeat(58)}`);
  const module = await load();
  const { passed, failures } = await module.default();
  total += passed;
  allFailures.push(...failures);
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`\n${"═".repeat(58)}`);
console.log(`${total} passed, ${allFailures.length} failed  (${selected.length} suites, ${seconds}s)`);
if (allFailures.length) {
  console.log("");
  for (const failure of allFailures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
