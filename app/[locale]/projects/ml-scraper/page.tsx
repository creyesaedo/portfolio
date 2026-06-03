import Link from 'next/link'
import { t, type Locale } from '@/lib/i18n'

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
      <p className="text-sm text-zinc-400">{reason}</p>
      <p className="text-xs text-zinc-600 mt-1 font-mono">{name}</p>
    </div>
  )
}

export default async function MlScraperCaseStudy({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const tr = t(locale)
  const cs = tr.caseStudy

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href={`/${locale}`}
        className="text-sm text-zinc-500 hover:text-white transition-colors mb-10 inline-block"
      >
        {cs.back}
      </Link>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            production
          </span>
          <span className="text-xs text-zinc-500">{cs.type}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">ML Market Scraper</h1>
        <p className="text-zinc-400 leading-relaxed">{cs.intro}</p>
        <div className="flex gap-3 mt-6">
          <Link
            href={`/${locale}/projects/ml-scraper/dashboard`}
            className="text-sm px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
          >
            {cs.liveDashboard}
          </Link>
          <a
            href="https://github.com/creyesaedo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            {cs.github}
          </a>
        </div>
      </div>

      <Section title={cs.sections.stack}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cs.stack.map(({ label, role }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="text-sm font-medium text-white font-mono">{label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{role}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={cs.sections.architecture}>
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{cs.sections.architectureIntro}</p>
        <CodeBlock>{`GitHub Actions (cron: mon 03:00 UTC)  ·  CLI  ·  POST /sync/run/:siteId
    │
    ▼
SyncRunnerService.run(siteId)
    │
    ├─ 1. Category sync (only if DB has 0 categories for the site)
    │      ML Official API (OAuth2) → upsert root + leaf categories
    │
    └─ 2. Product collection (p-limit 3 categories in parallel)
           │
           ├─ Decodo (premium + headless, geo per site)
           │     → /mas-vendidos page → 0–20 product URLs
           │     → each product page (p-limit 8)
           ├─ ML API → catalog metadata (date_created)
           ├─ FX rate (USD) resolved once per run → usd_price
           └─ INSERT immutable snapshot rows → products table`}</CodeBlock>
      </Section>

      <Section title={cs.sections.database}>
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
          {cs.sections.databaseIntro1}{' '}
          <span className="text-white">{cs.sections.databaseHighlight1}</span>{' '}
          {cs.sections.databaseMiddle}{' '}
          <span className="text-white">{cs.sections.databaseHighlight2}</span>
          {cs.sections.databaseIntro2}
          <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs mx-1">
            WHERE catalog_id = X ORDER BY snapshot_date
          </code>
          {cs.sections.databaseIntro3}
        </p>
        <CodeBlock>{`-- categories: two-level tree (root → leaf)
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
  name             VARCHAR(500) NOT NULL,
  price            DECIMAL(14,2) NOT NULL,
  original_price   DECIMAL(14,2),          -- pre-discount price
  discount_pct     INT,
  currency         VARCHAR(3),             -- ISO 4217, e.g. "CLP"
  usd_price        DECIMAL(14,2),          -- price / exchange_rate
  ranking_position INT,                    -- 1..20 on /mas-vendidos
  sold_count       INT,                    -- "+X mil vendidos" (floor)
  rating           DECIMAL(3,2),
  review_count     INT,
  shipping_type    VARCHAR(20),            -- full | cross_border | free
  is_cbt           BOOLEAN DEFAULT false,  -- cross-border listing
  catalog_id       VARCHAR(50),            -- product concept (buy-box)
  ml_public_id     VARCHAR(50),            -- winning listing
  country          VARCHAR(10),
  snapshot_date    TIMESTAMP NOT NULL,     -- time axis for history
  category_id      INT REFERENCES categories(id),
  seller_id        INT REFERENCES sellers(id)
  -- + brand, date_created, installments_*, available_quantity, ...
);`}</CodeBlock>
        <p className="text-zinc-500 text-xs mt-3 leading-relaxed">{cs.sections.databaseNote}</p>
      </Section>

      <Section title={cs.sections.scraping}>
        <p className="text-zinc-400 text-sm mb-5 leading-relaxed">{cs.sections.scrapingIntro}</p>
        <div className="space-y-3 text-sm text-zinc-400">
          <div className="flex gap-3">
            <span className="text-violet-400 shrink-0">🛡️</span>
            <span>
              <span className="text-white">{cs.scraping.powChallenge.title}</span>{' '}—{' '}
              {cs.scraping.powChallenge.body}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-amber-400 shrink-0">⏳</span>
            <span>
              <span className="text-white">{cs.scraping.streamingRace.title}</span>{' '}—{' '}
              {cs.scraping.streamingRace.body}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-400 shrink-0">💲</span>
            <span>
              <span className="text-white">{cs.scraping.billing.title}</span>{' '}—{' '}
              {cs.scraping.billing.body}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-400 shrink-0">🌎</span>
            <span>
              <span className="text-white">{cs.scraping.bilingual.title}</span>{' '}—{' '}
              {cs.scraping.bilingual.body}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-400 shrink-0">🚗</span>
            <span>
              <span className="text-white">{cs.scraping.emptyCategories.title}</span>{' '}—{' '}
              {cs.scraping.emptyCategories.body}
            </span>
          </div>
        </div>
      </Section>

      <Section title={cs.sections.indexing}>
        <p className="text-zinc-400 text-sm mb-5 leading-relaxed">{cs.sections.indexingIntro}</p>
        <div className="space-y-3">
          {cs.indexes.map((idx) => (
            <IndexRow key={idx.name} name={idx.name} columns={idx.columns} reason={idx.reason} />
          ))}
        </div>
        <p className="text-zinc-500 text-xs mt-4 leading-relaxed">
          {cs.sections.indexingNote1}{' '}
          <span className="text-zinc-400">{cs.sections.indexingNote2}</span>{' '}
          {cs.sections.indexingNote3}{' '}
          <code className="bg-zinc-800 px-1 rounded">(country, category_id, snapshot_date)</code>{' '}
          {cs.sections.indexingNote4}{' '}
          <code className="bg-zinc-800 px-1 rounded">(snapshot_date, country)</code>{' '}
          {cs.sections.indexingNote5}
        </p>
      </Section>

      <Section title={cs.sections.pagination}>
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
          {cs.sections.paginationIntro1}{' '}
          <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs">GET /products</code>{' '}
          {cs.sections.paginationIntro2}{' '}
          <span className="text-white">{cs.sections.paginationHighlight}</span>
          {cs.sections.paginationIntro3}{' '}
          <code className="bg-zinc-800 text-zinc-300 px-1 rounded text-xs">meta</code>{' '}
          {cs.sections.paginationIntro4}
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
        <p className="text-zinc-500 text-xs mt-3 leading-relaxed">{cs.sections.paginationNote}</p>
      </Section>

      <Section title={cs.sections.resilience}>
        <div className="space-y-3 text-sm text-zinc-400">
          <div className="flex gap-3">
            <span className="text-emerald-400 shrink-0">↻</span>
            <span>
              <span className="text-white">{cs.resilience.resumable.title}</span>{' '}—{' '}
              {cs.resilience.resumable.body}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-orange-400 shrink-0">⚡</span>
            <span>
              <span className="text-white">{cs.resilience.circuitBreaker.title}</span>{' '}—{' '}
              {cs.resilience.circuitBreaker.body}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-400 shrink-0">🔒</span>
            <span>
              <span className="text-white">{cs.resilience.concurrency.title}</span>{' '}—{' '}
              {cs.resilience.concurrency.body}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-red-400 shrink-0">🛑</span>
            <span>
              <span className="text-white">{cs.resilience.abortReasons.title}</span>{' '}—{' '}
              {cs.resilience.abortReasons.body}
            </span>
          </div>
        </div>
      </Section>

      <div className="mt-16 pt-8 border-t border-zinc-800 flex justify-between items-center">
        <Link href={`/${locale}`} className="text-sm text-zinc-500 hover:text-white transition-colors">
          {cs.footer.allProjects}
        </Link>
        <Link
          href={`/${locale}/projects/ml-scraper/dashboard`}
          className="text-sm px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
        >
          {cs.footer.explore}
        </Link>
      </div>
    </div>
  )
}
