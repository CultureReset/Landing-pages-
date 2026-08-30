import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";

/**
 * Resolved lazily and scoped under the working directory so the bundler does
 * not trace the whole project as a filesystem dependency.
 */
function dbPath(): string {
  const configured = process.env.FRONTDESK_DB_PATH || "data/frontdesk.db";
  // The database lives outside the bundle; do not trace it as a build input.
  return isAbsolute(configured) ? configured : join(/* turbopackIgnore: true */ process.cwd(), configured);
}

const PRAGMAS = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
`;

const SCHEMA = `

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'team',
  seats INTEGER NOT NULL DEFAULT 2,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  team_id TEXT,
  plan TEXT NOT NULL DEFAULT 'trial',
  credits INTEGER NOT NULL DEFAULT 25,
  trial_ends_at TEXT,
  avatar_url TEXT,
  onboarded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL DEFAULT '',
  owner_name TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  business_type TEXT NOT NULL DEFAULT 'other',
  avatar_url TEXT,
  cover_url TEXT,
  logo_url TEXT,
  location TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  credential TEXT NOT NULL DEFAULT '',
  verified INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  theme TEXT NOT NULL DEFAULT '{}',
  layout TEXT NOT NULL DEFAULT '[]',
  hours TEXT NOT NULL DEFAULT '[]',
  gallery TEXT NOT NULL DEFAULT '[]',
  stats TEXT NOT NULL DEFAULT '[]',
  seo TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'link',
  label TEXT NOT NULL DEFAULT '',
  sublabel TEXT NOT NULL DEFAULT '',
  value TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  highlight INTEGER NOT NULL DEFAULT 0,
  is_action INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price REAL,
  price_note TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'available',
  category TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  images TEXT NOT NULL DEFAULT '[]',
  specs TEXT NOT NULL DEFAULT '[]',
  features TEXT NOT NULL DEFAULT '[]',
  cta_label TEXT NOT NULL DEFAULT '',
  cta_url TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  item_id TEXT,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'page',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  target_id TEXT,
  target_label TEXT NOT NULL DEFAULT '',
  referrer TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  avatar_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  site_id TEXT,
  mime TEXT NOT NULL,
  filename TEXT NOT NULL DEFAULT '',
  bytes BLOB NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
`;

/* ------------------------------------------------------------- migrations */

/**
 * Ordered, run-once migrations. The base SCHEMA above only ever creates
 * missing tables, so anything that changes an *existing* table has to live
 * here — otherwise a deployed database silently keeps the old shape.
 *
 * Never edit or reorder an entry that has shipped; append a new one.
 */
interface Migration {
  id: string;
  up: (db: DatabaseSync) => void;
}

function hasColumn(db: DatabaseSync, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return rows.some((r) => r.name === column);
}

function addColumn(db: DatabaseSync, table: string, column: string, ddl: string) {
  if (!hasColumn(db, table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}

const MIGRATIONS: Migration[] = [
  {
    // Indexes live here rather than in SCHEMA so they are always created after
    // any column they reference, whatever order a database was built in.
    id: "000_base_indexes",
    up: (db) => {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_links_site ON links(site_id, position);
        CREATE INDEX IF NOT EXISTS idx_items_site ON items(site_id, position);
        CREATE INDEX IF NOT EXISTS idx_leads_site ON leads(site_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_events_site ON events(site_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_events_kind ON events(site_id, kind);
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      `);
    },
  },
  {
    id: "001_tenant_flags",
    up: (db) => {
      // Directory opt-in: a page is only advertised on the marketing site when
      // the operator features it. Never automatic.
      addColumn(db, "sites", "featured", "INTEGER NOT NULL DEFAULT 0");
      addColumn(db, "sites", "suspended", "INTEGER NOT NULL DEFAULT 0");
      addColumn(db, "users", "suspended", "INTEGER NOT NULL DEFAULT 0");
      addColumn(db, "users", "last_seen_at", "TEXT");
    },
  },
  {
    id: "002_tenant_indexes",
    up: (db) => {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_sites_user ON sites(user_id);
        CREATE INDEX IF NOT EXISTS idx_sites_featured ON sites(featured, published);
        CREATE INDEX IF NOT EXISTS idx_media_site ON media(site_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_id);
        CREATE INDEX IF NOT EXISTS idx_items_site_active ON items(site_id, active);
        CREATE INDEX IF NOT EXISTS idx_leads_site_status ON leads(site_id, status);
      `);
    },
  },
  {
    id: "003_slug_case_insensitive",
    up: (db) => {
      // Handles are compared case-insensitively, so uniqueness must be too —
      // otherwise "NoraVance" and "noravance" are two tenants at one URL.
      db.exec("UPDATE sites SET slug = lower(slug) WHERE slug <> lower(slug)");
      db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_slug_ci ON sites(lower(slug))");
    },
  },
  {
    id: "004_media_owner",
    up: (db) => {
      // Uploads are billed against a tenant's storage quota, so they need an
      // owning user even when the site record is later replaced.
      addColumn(db, "media", "user_id", "TEXT");
    },
  },
];

function migrate(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`);
  const applied = new Set(
    (db.prepare("SELECT id FROM schema_migrations").all() as { id: string }[]).map((r) => r.id),
  );
  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) continue;
    migration.up(db);
    db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run(
      migration.id,
      new Date().toISOString(),
    );
  }
}

type Global = typeof globalThis & { __frontdeskDb?: DatabaseSync };
const g = globalThis as Global;

function open(): DatabaseSync {
  const path = dbPath();
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(PRAGMAS);
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

export function getDb(): DatabaseSync {
  if (!g.__frontdeskDb) {
    g.__frontdeskDb = open();
  }
  return g.__frontdeskDb;
}

/* ---------------------------------------------------------------- helpers */

type Row = Record<string, unknown>;

/**
 * node:sqlite hands back null-prototype objects, which React Server Components
 * refuse to serialise. Re-materialise every row as a plain object.
 */
function plain<T>(row: unknown): T {
  return { ...(row as object) } as T;
}

export function all<T = Row>(sql: string, ...params: unknown[]): T[] {
  return (getDb().prepare(sql).all(...(params as never[])) as unknown[]).map((r) => plain<T>(r));
}

export function get<T = Row>(sql: string, ...params: unknown[]): T | undefined {
  const row = getDb().prepare(sql).get(...(params as never[]));
  return row == null ? undefined : plain<T>(row);
}

export function run(sql: string, ...params: unknown[]) {
  return getDb().prepare(sql).run(...(params as never[]));
}

/**
 * Sortable-ish, unguessable identifier. The random half is 96 bits from the
 * CSPRNG so ids cannot be enumerated across tenants.
 */
export function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${randomBytes(12).toString("base64url")}`;
}

export function now(): string {
  return new Date().toISOString();
}

export function json<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback;
  if (typeof raw !== "string") return raw as T;
  try {
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}
