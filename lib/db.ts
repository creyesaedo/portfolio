import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function getStats() {
  const [totals] = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM products) AS total_products,
      (SELECT COUNT(*)::int FROM categories) AS total_categories,
      (SELECT COUNT(*)::int FROM sellers) AS total_sellers,
      (SELECT MAX(snapshot_date) FROM products) AS latest_snapshot
  `

  const byCountry = await sql`
    SELECT country, COUNT(*)::int AS count
    FROM products
    WHERE country IS NOT NULL
    GROUP BY country
    ORDER BY count DESC
  `

  const snapshotDates = await sql`
    SELECT DISTINCT snapshot_date::date::text AS date
    FROM products
    ORDER BY date DESC
    LIMIT 30
  `

  return {
    total_products: totals.total_products as number,
    total_categories: totals.total_categories as number,
    total_sellers: totals.total_sellers as number,
    latest_snapshot: totals.latest_snapshot
      ? new Date(totals.latest_snapshot as string).toISOString().slice(0, 10)
      : null,
    by_country: byCountry as { country: string; count: number }[],
    snapshot_dates: snapshotDates.map((r) => r.date as string),
  }
}

export interface ProductFilters {
  page?: number
  limit?: number
  country?: string
  category_id?: number
  date_from?: string
  date_to?: string
  search?: string
}

export async function getProducts(filters: ProductFilters) {
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const offset = (page - 1) * limit

  const params: unknown[] = []
  const conditions: string[] = []

  if (filters.country) {
    params.push(filters.country)
    conditions.push(`p.country = $${params.length}`)
  }
  if (filters.category_id) {
    params.push(filters.category_id)
    conditions.push(`p.parent_id = $${params.length}`)
  }
  if (filters.date_from) {
    params.push(filters.date_from)
    conditions.push(`p.snapshot_date >= $${params.length}`)
  }
  if (filters.date_to) {
    params.push(filters.date_to)
    conditions.push(`p.snapshot_date <= $${params.length}`)
  }
  if (filters.search) {
    params.push(`%${filters.search}%`)
    conditions.push(`p.name ILIKE $${params.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [{ total }] = await sql.query(
    `SELECT COUNT(*)::int AS total FROM products p ${where}`,
    params,
  )

  params.push(limit)
  const limitIdx = params.length
  params.push(offset)
  const offsetIdx = params.length

  const rows = await sql.query(
    `SELECT
      p.id, p.name, p.price::text, p.original_price::text,
      p.discount_pct, p.country, p.snapshot_date::text,
      p.ranking_position, p.sold_count, p.rating::text,
      p.review_count, p.brand, p.ml_public_id, p.catalog_id,
      p.shipping_type, p.is_cbt,
      c.name AS category_name, c.ml_id AS category_ml_id,
      s.nickname AS seller_nickname, s.is_official_store
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN sellers s ON p.seller_id = s.id
    ${where}
    ORDER BY p.snapshot_date DESC, p.ranking_position ASC NULLS LAST
    LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params,
  )

  const data = rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    price: r.price as string,
    original_price: r.original_price as string | null,
    discount_pct: r.discount_pct as number | null,
    country: r.country as string | null,
    snapshot_date: r.snapshot_date as string,
    ranking_position: r.ranking_position as number | null,
    sold_count: r.sold_count as number | null,
    rating: r.rating as string | null,
    review_count: r.review_count as number | null,
    brand: r.brand as string | null,
    ml_public_id: r.ml_public_id as string | null,
    catalog_id: r.catalog_id as string | null,
    shipping_type: r.shipping_type as string | null,
    is_cbt: r.is_cbt as boolean,
    category: { name: r.category_name as string, ml_id: r.category_ml_id as string },
    seller:
      r.seller_nickname != null
        ? { nickname: r.seller_nickname as string, is_official_store: r.is_official_store as boolean }
        : null,
  }))

  return {
    data,
    meta: { total: total as number, page, limit, total_pages: Math.ceil((total as number) / limit) },
  }
}

export async function getPriceHistory(params: { ml_public_id?: string; catalog_id?: string }) {
  const { ml_public_id, catalog_id } = params

  const rows = catalog_id
    ? await sql`
        SELECT snapshot_date::text, price::text, original_price::text,
               ranking_position, sold_count
        FROM products
        WHERE catalog_id = ${catalog_id}
        ORDER BY snapshot_date ASC
      `
    : await sql`
        SELECT snapshot_date::text, price::text, original_price::text,
               ranking_position, sold_count
        FROM products
        WHERE ml_public_id = ${ml_public_id!}
        ORDER BY snapshot_date ASC
      `

  return rows.map((r) => ({
    snapshot_date: r.snapshot_date as string,
    price: r.price as string,
    original_price: r.original_price as string | null,
    ranking_position: r.ranking_position as number | null,
    sold_count: r.sold_count as number | null,
  }))
}

export async function getCatalogProducts(search: string) {
  const rows = await sql.query(
    `SELECT catalog_id, name, brand, first_seen_at::text, last_seen_at::text
     FROM catalog_products
     WHERE name ILIKE $1 OR brand ILIKE $1
     ORDER BY name
     LIMIT 20`,
    [`%${search}%`],
  )
  return rows.map((r) => ({
    catalog_id: r.catalog_id as string,
    name: r.name as string,
    brand: r.brand as string | null,
    first_seen_at: r.first_seen_at as string,
    last_seen_at: r.last_seen_at as string,
  }))
}

export async function getCategories(country?: string) {
  if (country) {
    return sql`
      SELECT id, name, country, ml_id
      FROM categories
      WHERE parent_id IS NULL AND country = ${country}
      ORDER BY name
    `
  }

  return sql`
    SELECT id, name, country, ml_id
    FROM categories
    WHERE parent_id IS NULL
    ORDER BY name
  `
}
