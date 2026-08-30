/* Wipes the database and loads the demo businesses. Run with: npm run seed */
import { resetAndSeed } from "../src/lib/seed";

const creds = resetAndSeed();

console.log("\n  Frontdesk demo data loaded.\n");
console.log(`  Sign in:  ${creds.email}`);
console.log(`  Password: ${creds.password}\n`);
console.log("  Public pages:");
for (const slug of [
  "nora-vance",
  "atlas-motorworks",
  "ember-supper-club",
  "studio-lune",
  "northshore-strength",
  "halden-partners",
  "jonah-pike",
]) {
  console.log(`    /p/${slug}`);
}
console.log("");
