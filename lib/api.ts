const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; total_pages: number }
}

export interface Product {
  id: number
  name: string
  price: string
  original_price: string | null
  discount_pct: number | null
  country: string | null
  snapshot_date: string
  ranking_position: number | null
  sold_count: number | null
  rating: string | null
  review_count: number | null
  brand: string | null
  ml_public_id: string | null
  catalog_id: string | null
  shipping_type: string | null
  is_cbt: boolean
  category: { name: string; ml_id: string }
  seller: { nickname: string; is_official_store: boolean } | null
}

export interface PriceHistoryPoint {
  snapshot_date: string
  price: string
  original_price: string | null
  ranking_position: number | null
  sold_count: number | null
}

export interface Category {
  id: number
  name: string
  country: string
  ml_id: string
}

export interface Stats {
  total_products: number
  total_categories: number
  total_sellers: number
  latest_snapshot: string | null
  by_country: { country: string; count: number }[]
  snapshot_dates: string[]
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

export async function fetchProducts(params: ProductFilters): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.country) query.set('country', params.country)
  if (params.category_id) query.set('category_id', String(params.category_id))
  if (params.date_from) query.set('date_from', params.date_from)
  if (params.date_to) query.set('date_to', params.date_to)
  if (params.search) query.set('search', params.search)
  const res = await fetch(`${API_URL}/products?${query}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchPriceHistory(mlPublicId: string): Promise<PriceHistoryPoint[]> {
  const res = await fetch(`${API_URL}/products/history?ml_public_id=${mlPublicId}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchCategories(country?: string): Promise<Category[]> {
  const q = new URLSearchParams({ parent_only: 'true' })
  if (country) q.set('country', country)
  const res = await fetch(`${API_URL}/categories?${q}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API_URL}/stats`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
