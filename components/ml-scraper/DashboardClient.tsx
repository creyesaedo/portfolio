'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardFilters } from './DashboardFilters'
import { ProductsTable } from './ProductsTable'
import { PriceHistoryChart } from './PriceHistoryChart'
import { StatsCards } from './StatsCards'
import {
  fetchProducts,
  fetchCategories,
  fetchPriceHistory,
  type PaginatedResponse,
  type Product,
  type Category,
  type Stats,
  type ProductFilters,
} from '@/lib/api'

interface Props {
  initialStats: Stats
}

const DEFAULT_FILTERS: ProductFilters = { page: 1, limit: 20 }

export function DashboardClient({ initialStats }: Props) {
  const [stats] = useState<Stats>(initialStats)
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [pendingFilters, setPendingFilters] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [categories, setCategories] = useState<Category[]>([])
  const [result, setResult] = useState<PaginatedResponse<Product> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selected product for price history
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [history, setHistory] = useState<Awaited<ReturnType<typeof fetchPriceHistory>> | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  const loadProducts = useCallback(async (f: ProductFilters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts(f)
      setResult(data)
    } catch {
      setError('Could not load products. Make sure the API is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load categories when country changes
  useEffect(() => {
    if (!pendingFilters.country) {
      setCategories([])
      return
    }
    fetchCategories(pendingFilters.country)
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [pendingFilters.country])

  // Initial load
  useEffect(() => {
    loadProducts(DEFAULT_FILTERS)
  }, [loadProducts])

  const handleApply = () => {
    const next = { ...pendingFilters, page: 1 }
    setFilters(next)
    loadProducts(next)
    setSelectedProduct(null)
    setHistory(null)
  }

  const handlePageChange = (page: number) => {
    const next = { ...filters, page }
    setFilters(next)
    setPendingFilters(next)
    loadProducts(next)
    setSelectedProduct(null)
    setHistory(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectProduct = async (product: Product) => {
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null)
      setHistory(null)
      return
    }
    setSelectedProduct(product)
    setHistory(null)
    if (!product.ml_public_id) return
    setHistoryLoading(true)
    try {
      const h = await fetchPriceHistory(product.ml_public_id)
      setHistory(h)
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div>
      <StatsCards stats={stats} />

      <DashboardFilters
        categories={categories}
        filters={pendingFilters}
        onChange={(partial) => setPendingFilters((prev) => ({ ...prev, ...partial }))}
        onApply={handleApply}
        loading={loading}
      />

      {error && (
        <div className="border border-red-800 bg-red-950/30 rounded-xl px-4 py-3 mb-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && !result && (
        <div className="border border-zinc-800 rounded-xl p-12 text-center text-zinc-500 text-sm">
          Loading products…
        </div>
      )}

      {result && (
        <div className={loading ? 'opacity-60 pointer-events-none' : ''}>
          <ProductsTable
            result={result}
            selectedId={selectedProduct?.id ?? null}
            onSelect={handleSelectProduct}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Price history panel */}
      {selectedProduct && (
        <div className="mt-2">
          {historyLoading ? (
            <div className="border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm mt-4">
              Loading price history…
            </div>
          ) : history ? (
            <PriceHistoryChart history={history} productName={selectedProduct.name} />
          ) : null}
        </div>
      )}

      {/* DB knowledge callout */}
      {result && (
        <div className="mt-8 border border-zinc-800/50 rounded-xl p-4 bg-zinc-900/20">
          <p className="text-xs text-zinc-500 font-mono">
            <span className="text-violet-400">SQL</span> · This table uses offset pagination:{' '}
            <span className="text-zinc-300">
              LIMIT {filters.limit} OFFSET {((filters.page ?? 1) - 1) * (filters.limit ?? 20)}
            </span>
            {filters.country && (
              <> · filtered by <span className="text-zinc-300">country = {`'${filters.country}'`}</span></>
            )}
            {filters.category_id && (
              <> AND <span className="text-zinc-300">category_id = {filters.category_id}</span></>
            )}
            {' '}· covered by{' '}
            <span className="text-emerald-400">idx_products_country_category_snapshot</span>
          </p>
        </div>
      )}
    </div>
  )
}
