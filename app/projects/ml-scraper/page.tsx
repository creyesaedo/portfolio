import Link from 'next/link'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-zinc-800">{title}</h2>
      {children}
    </section>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-xs text-zinc-300 font-mono leading-relaxed">
      {children}
    </pre>
  )
}

function IndexRow({ name, columns, reason }: { name: string; columns: string; reason: string }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/40">
      <div className="flex items-start gap-3 mb-2">
        <span className="font-mono text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded shrink-0">
          INDEX
        </span>
        <span className="font-mono text-sm text-white">{columns}</span>
      </div>
      <p className="text-sm text-zinc-400 ml-0">{reason}</p>
      <p className="text-xs text-zinc-600 mt-1 font-mono">{name}</p>
    </div>
  )
}

export default function MlScraperCaseStudy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Back */}
      <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors mb-10 inline-block">
        ← Back to projects
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            production
          </span>
          <span className="text-xs text-zinc-500">Data Pipeline</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">ML Market Scraper</h1>
        <p className="text-zinc-400 leading-relaxed">
          A weekly automated pipeline that collects top-selling product data from 8 MercadoLibre
          markets (Argentina, Brazil, Chile, Mexico, Colombia, Peru, Uruguay, Venezuela). Data is
          stored as immutable snapshots in PostgreSQL, enabling price trend and ranking analysis
          over time.
        </p>
        <div className="flex gap-3 mt-6">
          <Link
            href="/projects/ml-scraper/dashboard"
            className="text-sm px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
          >
            Live Dashboard →
          </Link>
          <a
            href="https://github.com/creyesaedo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Stack */}
      <Section title="Tech Stack">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: 'NestJS', role: 'API & orchestration' },
            { label: 'TypeScript', role: 'Language' },
            { label: 'PostgreSQL', role: 'Database (Neon)' },
            { label: 'Prisma 7', role: 'ORM + migrations' },
            { label: 'GitHub Actions', role: 'Weekly cron trigger' },
            { label: 'Decodo', role: 'Web scraping API' },
          ].map(({ label, role }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="text-sm font-medium text-white font-mono">{label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{role}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Architecture */}
      <Section title="System Architecture">
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
          The pipeline runs in three phases triggered by a GitHub Actions weekly cron (Monday 03:00
          UTC). Each phase is independently recoverable — a failure in one category does not abort
          the rest.
        </p>
        <CodeBlock>{`GitHub Actions (cron: mon 03:00 UTC)
    │
    ▼
SyncRunnerService.run(siteId)
    │
    ├─ 1. Category sync (if DB is empty)
    │      ML Official API → upsert root + child categories
    │
    └─ 2. Product collection (p-limit 3 categories in parallel)
           │
           ├─ Decodo scraper → category page → 20 product URLs
           ├─ Decodo scraper → 20 product pages (p-limit 8)
           ├─ ML API → catalog enrichment (date_created, brand)
           └─ INSERT immutable snapshot rows → products table`}</CodeBlock>
      </Section>

      {/* Database Design */}
      <Section title="Database Design">
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
          The schema is built around two core decisions: a{' '}
          <span className="text-white">two-level category tree</span> (root → leaf) and{' '}
          <span className="text-white">immutable product snapshots</span>. Products are never
          updated — every sync inserts new rows. This makes price and ranking history a simple
          <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs mx-1">
            WHERE ml_public_id = X ORDER BY snapshot_date
          </code>
          query.
        </p>
        <CodeBlock>{`-- categories: two-level tree
CREATE TABLE categories (
  id        SERIAL PRIMARY KEY,
  ml_id     VARCHAR(50) UNIQUE NOT NULL,  -- e.g. "MLC1648"
  name      VARCHAR(255) NOT NULL,
  country   VARCHAR(10) NOT NULL,          -- "MLC", "MLA", ...
  parent_id INT REFERENCES categories(id)  -- NULL = root category
);

-- products: immutable snapshots (never UPDATE, always INSERT)
CREATE TABLE products (
  id               SERIAL PRIMARY KEY,
  ml_public_id     VARCHAR(50),            -- stable across snapshots
  name             VARCHAR(500) NOT NULL,
  price            DECIMAL(14,2) NOT NULL,
  original_price   DECIMAL(14,2),
  discount_pct     INT,
  sold_count       INT,
  ranking_position INT,
  rating           DECIMAL(3,2),
  review_count     INT,
  country          VARCHAR(10),
  snapshot_date    TIMESTAMP NOT NULL,     -- when this row was collected
  category_id      INT REFERENCES categories(id),
  seller_id        INT REFERENCES sellers(id)
  -- ...more enrichment fields
);`}</CodeBlock>
      </Section>

      {/* Indexing */}
      <Section title="Index Strategy">
        <p className="text-zinc-400 text-sm mb-5 leading-relaxed">
          The products table grows by ~20 rows per category per sync. With 251 parent categories
          across 8 sites running weekly, a full year produces ~680,000 rows. Proper composite
          indexes are what keep dashboard queries under 50 ms at that scale.
        </p>
        <div className="space-y-3">
          <IndexRow
            name="products_country_category_id_snapshot_date_idx"
            columns="(country, category_id, snapshot_date)"
            reason="Main dashboard query: filter by site + category within a date range. The composite covers all three predicates without a table scan. Without it, PostgreSQL falls back to the single-column snapshot_date index and re-filters in memory."
          />
          <IndexRow
            name="products_catalog_id_snapshot_date_idx"
            columns="(catalog_id, snapshot_date)"
            reason="Price history chart query: fetch all snapshots for a given product ordered by date. The leading column eliminates all other products; snapshot_date gives the ordering for free."
          />
          <IndexRow
            name="products_country_snapshot_date_idx"
            columns="(country, snapshot_date)"
            reason="Stats aggregation: COUNT(*) or GROUP BY per site for a recent date range. Covers the WHERE clause without touching enrichment columns."
          />
          <IndexRow
            name="categories_ml_id_idx"
            columns="(ml_id)"
            reason="Category upsert during sync: ON CONFLICT (ml_id) requires a unique index. Also covers category resolution lookups when inserting leaf categories."
          />
        </div>
        <p className="text-zinc-500 text-xs mt-4 leading-relaxed">
          Rule of thumb applied: index columns in{' '}
          <span className="text-zinc-400">equality-first, range-last</span> order within each
          composite. A query on <code className="bg-zinc-800 px-1 rounded">(country, category_id, snapshot_date)</code>{' '}
          cannot use an index ordered as <code className="bg-zinc-800 px-1 rounded">(snapshot_date, country)</code>{' '}
          for the equality predicates.
        </p>
      </Section>

      {/* Pagination */}
      <Section title="Pagination Strategy">
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
          The{' '}
          <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs">GET /products</code>{' '}
          endpoint uses <span className="text-white">offset pagination</span>. Each response
          includes a <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs">meta</code>{' '}
          envelope so the client can render pagination controls without a second request.
        </p>
        <CodeBlock>{`// Request
GET /products?page=3&limit=20&country=MLC&category_id=42

// Response
{
  "data": [ ...20 products... ],
  "meta": {
    "total":       984,   // total rows matching filters
    "page":          3,   // current page (1-based)
    "limit":        20,   // rows per page
    "total_pages":  50    // ceil(total / limit)
  }
}

// Prisma query (simplified)
const skip = (page - 1) * limit;        // skip = 40
prisma.product.findMany({ where, skip, take: limit, orderBy });
prisma.product.count({ where });         // runs in parallel via Promise.all`}</CodeBlock>
        <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
          Offset pagination is used here because the dataset is read-only (snapshots never change
          order after insert) and the UI needs random page access. Cursor pagination would be
          preferable for infinite scroll or real-time feeds where rows are inserted between pages.
        </p>
      </Section>

      {/* Resilience */}
      <Section title="Resilience & Observability">
        <div className="space-y-3 text-sm text-zinc-400">
          <div className="flex gap-3">
            <span className="text-emerald-400 shrink-0">↻</span>
            <span>
              <span className="text-white">Resumable syncs</span> — a{' '}
              <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs">sync_progress</code>{' '}
              table tracks per-category state (pending → in_progress → done | failed). A circuit
              breaker abort can be resumed mid-run via{' '}
              <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs">
                POST /sync/resume/:siteId
              </code>
              .
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-orange-400 shrink-0">⚡</span>
            <span>
              <span className="text-white">Circuit breaker</span> — after 10 consecutive scraper
              hard failures, the breaker trips, dumps diagnostics to disk, and surfaces a structured
              <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs mx-1">aborted</code>
              payload (completed categories, pending categories, diagnostics path).
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-400 shrink-0">🔒</span>
            <span>
              <span className="text-white">Global concurrency cap</span> — a process-wide
              <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs mx-1">p-limit</code>
              semaphore caps parallel Decodo requests at{' '}
              <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs">
                SCRAPER_MAX_CONCURRENT
              </code>{' '}
              (default 10), preventing accidental plan overruns.
            </span>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <div className="mt-16 pt-8 border-t border-zinc-800 flex justify-between items-center">
        <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
          ← All projects
        </Link>
        <Link
          href="/projects/ml-scraper/dashboard"
          className="text-sm px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
        >
          Explore the dashboard →
        </Link>
      </div>
    </div>
  )
}
