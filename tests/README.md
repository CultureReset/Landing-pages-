# Tests

Two layers, both runnable from a clean checkout.

## Unit — no server needed

```bash
npm run test:tenancy
```

Runs against a throwaway SQLite database in a temp directory, so it never
touches your development data. Covers cross-tenant reads, directory privacy,
handle collisions (including 25 concurrent claims on one base name), plan
ceilings, storage quotas, rate limiting and suspension.

## Browser — needs the app running

```bash
npm run dev          # in one terminal
npm run test:browser # in another
```

| Suite | What it proves |
| --- | --- |
| `routes` | Every route serves (or 404s) and nothing logs a console error |
| `flow` | Sign up → onboard → add content → publish → visitor enquiry → work the lead |
| `isolation` | Two tenants cannot see, reach or be advertised alongside each other |
| `limits` | A plan ceiling refuses the next item and tells the tenant why |
| `security` | An SVG carrying `<script>` cannot execute when served from our origin |
| `responsive` | Nothing scrolls sideways at 390px; controls stay tappable |

Run one suite by name:

```bash
npm run test:browser -- isolation
```

### Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `TEST_BASE_URL` | `http://localhost:3000` | Point the suites at any running instance |
| `TEST_DEMO_EMAIL` / `TEST_DEMO_PASSWORD` | the seeded demo account | Sign-in used by suites that need an existing tenant |
| `PLAYWRIGHT_CHROMIUM_PATH` | auto-detected | Override if Playwright cannot find a browser |

The suites that need an existing account expect the seeded demo data
(`npm run seed`). `flow` and `isolation` create their own tenants and leave
them behind — that is deliberate, so you can inspect the result; re-seed to
clear them.

First run on a new machine needs a browser:

```bash
npx playwright install chromium
```
