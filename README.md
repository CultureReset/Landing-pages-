# Frontdesk

A link-in-bio landing page platform for businesses. Every account gets a public
page — listings, links, gallery, hours, testimonials and an enquiry form — plus
a dashboard for editing it, reading the leads it produces, and seeing what
people actually tapped.

It is a complete, working product: sign-up, onboarding, page builder, content
management, lead pipeline, analytics, QR/NFC/vCard sharing, team seats and
billing screens, with the public pages that all of it feeds.

```bash
npm install
npm run seed     # loads seven demo businesses with 60 days of traffic
npm run dev      # http://localhost:3000
```

Sign in with **demo@frontdesk.app** / **demo1234**, or click *Explore the demo
account* on the login screen.

---

## What's in it

### The public page — `/p/[slug]`

The deliverable each business is buying. Mobile-first, themed per site, and
composed from ten sections the owner can rename, reorder or switch off:

| Section | What it does |
| --- | --- |
| Quick actions | Call, WhatsApp, book, email, Save Contact — an icon row under the header |
| Highlights | Three headline numbers ("14 years", "$186M sold") |
| Showcase | Listings, vehicles, menu, services or packages, with filter tabs |
| Link stack | The classic tap-through list, with one highlighted call-to-action |
| Gallery | A scrolling image strip with a full-screen lightbox |
| About | Long-form bio, location and credentials |
| Testimonials | Swipeable client quotes with ratings |
| Hours | Weekly schedule with today highlighted and a live open/closed badge |
| Enquiry form | Name, email, phone, message — straight into the owner's leads |
| Location | Address that opens in maps |

Each showcase entry also gets its own page at `/p/[slug]/i/[id]` with an image
carousel, a specification grid, highlights, the owner's contact actions and a
context-aware enquiry form.

### The dashboard — `/dashboard`

- **Overview** — setup checklist, 30-day stats with period-on-period deltas, a
  traffic chart, your QR code, recent enquiries and top links/listings.
- **Page builder** — seven panels (profile, theme, sections, highlights,
  gallery, hours, address & SEO) beside a live preview that renders the real
  public page in an iframe at phone and desktop widths.
- **Links & actions** — quick actions and the link stack, drag-ordered, with
  highlight and visibility toggles and per-link tap counts.
- **Showcase** — searchable, filterable table with inline feature/visibility
  toggles, plus a full editor: multi-image upload, price and currency, status,
  specifications, highlights and a card preview.
- **Testimonials** — add, edit, hide and reorder social proof.
- **Leads** — a pipeline (new → contacted → qualified → won/lost) with the
  message, the listing they were looking at, private notes, reply shortcuts and
  CSV export.
- **Analytics** — 7/30/90-day ranges, view/tap/enquiry series, a view-to-enquiry
  funnel, referrer and device splits, and your top links and listings.
- **Studio** — a local draft writer for descriptions and social captions, and a
  branded cover composer that renders share images as SVG.
- **Share & QR** — colour-customisable QR codes, NFC card instructions, an
  embed snippet and a printed business-card preview.
- **Team** — seats, members, each with their own page and leads under one brand.
- **Settings** — account, password, sessions, page address, plan and credits.

### Onboarding — `/onboarding`

Four steps from sign-up to a published page: business type and name, your
details (which seed your quick-action buttons), a theme, and your handle.

---

## Architecture

```
src/
  app/
    page.tsx                 marketing landing page
    (auth)/login | signup    split-screen auth
    onboarding/              four-step setup wizard
    dashboard/               the authenticated product
    p/[slug]/                public pages + item detail
    legal/[doc]/             privacy, terms, refunds
    api/                     track, leads, upload, media, qr, vcard, cover, img
  components/
    ui/                      buttons, fields, cards, modal, icons, reorder list
    dashboard/               shell, charts, editors, managers
    public/                  the page sections visitors see
    marketing/               landing page chrome and sections
  lib/
    db.ts                    SQLite connection + schema
    repo.ts                  typed queries for every table
    auth.ts / users.ts       sessions and accounts
    actions/                 server actions, grouped by domain
    themes.ts                presets and CSS-variable plumbing
    vocab.ts                 per-vertical vocabulary
    analytics.ts             aggregation for the dashboard
    writer.ts                the local draft writer
```

**Stack:** Next.js 16 (App Router, server components, server actions),
React 19, TypeScript, Tailwind CSS v4.

**Storage:** SQLite through Node's built-in `node:sqlite` — no native module to
compile, no database server to run. The file lives at `data/frontdesk.db`
(override with `FRONTDESK_DB_PATH`).

**Uploads** are stored as blobs in SQLite and served from `/api/media/[id]`, so
the app needs no object storage to run anywhere.

**Auth** is session cookies backed by a `sessions` table, with scrypt password
hashing. Set `FRONTDESK_SESSION_SECRET` in production.

**Images** in the demo data are generated on the fly by `/api/img/[seed]` —
deterministic abstract artwork with no third-party image host, so the demo
renders instantly and works offline. Real users upload their own.

### Multi-vertical by design

One engine serves every business type. `src/lib/vocab.ts` maps a business type
to its vocabulary — a real-estate account sees "Listings" and "Under offer", a
restaurant sees "Menu" and "Sold out", a salon sees "Services" and "Fully
booked" — while the schema, editors and public page stay identical. Adding a
vertical is one entry in that file.

### Themes

Eight presets in `src/lib/themes.ts`, each a full palette plus typeface, corner
style, button style, backdrop and header layout. They resolve to CSS custom
properties (`--s-bg`, `--s-accent`, …) that the public components consume, so a
theme change is a data change — no per-theme CSS.

---

## Configuration

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `FRONTDESK_SESSION_SECRET` | Signs session cookies. Generate with `openssl rand -hex 32`. |
| `FRONTDESK_DB_PATH` | Where the SQLite file lives. Defaults to `data/frontdesk.db`. |
| `NEXT_PUBLIC_BASE_URL` | Used for QR codes, share links and canonical tags. |

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run seed` | Wipe and reload the demo businesses |

## Demo accounts

`npm run seed` creates seven businesses across six verticals. All of them use
the password **demo1234**.

| Page | Business | Vertical |
| --- | --- | --- |
| `/p/nora-vance` | Vance & Co. Realty | Real estate (demo@frontdesk.app) |
| `/p/atlas-motorworks` | Atlas Motorworks | Automotive |
| `/p/ember-supper-club` | Ember Supper Club | Restaurant |
| `/p/studio-lune` | Studio Lune | Beauty |
| `/p/northshore-strength` | Northshore Strength | Fitness |
| `/p/halden-partners` | Halden Partners | Professional services |
| `/p/jonah-pike` | Vance & Co. Realty | Second seat on the demo team |

## Notes for taking this further

- **Payments** — the plan screens change the account immediately; there is no
  processor wired in. `changePlanAction` in `src/lib/actions/account.ts` is
  where a Stripe checkout session would go.
- **Email** — leads are stored and shown in the dashboard; nothing is sent.
  `src/app/api/leads/route.ts` is the hook point for a notification.
- **The draft writer** is deliberately local and template-driven: it assembles
  copy from facts already in your dashboard and invents nothing. To swap in a
  hosted model, replace `draftDescription` and `draftCaption` in
  `src/lib/writer.ts` — the call sites take the same shape.
- **Scaling past SQLite** — every query lives in `src/lib/repo.ts` and
  `src/lib/users.ts`. Swapping in Postgres means rewriting those two files and
  nothing else.
