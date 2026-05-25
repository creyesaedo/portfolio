'use client'

import type { PaginatedResponse, Product } from '@/lib/api'
import { formatPrice, formatNumber, formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  result: PaginatedResponse<Product>
  selectedId: number | null
  onSelect: (product: Product) => void
  onPageChange: (page: number) => void
}

export function ProductsTable({ result, selectedId, onSelect, onPageChange }: Props) {
  const { data, meta } = result

  return (
    <div>
      {/* Table */}
      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 w-8">#</th>
                <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3">Product</th>
                <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-right text-xs text-zinc-500 font-medium px-4 py-3">Price</th>
                <th className="text-right text-xs text-zinc-500 font-medium px-4 py-3 hidden sm:table-cell">Sold</th>
                <th className="text-right text-xs text-zinc-500 font-medium px-4 py-3 hidden lg:table-cell">Rating</th>
                <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 hidden lg:table-cell">Site</th>
                <th className="text-left text-xs text-zinc-500 font-medium px-4 py-3 hidden xl:table-cell">Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-zinc-500 py-12 text-sm">
                    No products found. Try adjusting the filters.
                  </td>
                </tr>
              )}
              {data.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-zinc-800/40',
                    selectedId === product.id && 'bg-indigo-950/30 hover:bg-indigo-950/40',
                  )}
                >
                  <td className="px-4 py-3 text-zinc-600 tabular-nums">
                    {product.ranking_position ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="text-zinc-200 font-medium truncate">{product.name}</p>
                      {product.brand && (
                        <p className="text-xs text-zinc-500 mt-0.5">{product.brand}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-zinc-400">{product.category.name}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="text-white font-medium">
                      {formatPrice(product.price, product.country)}
                    </span>
                    {product.discount_pct && product.discount_pct > 0 && (
                      <span className="ml-2 text-xs text-emerald-400">-{product.discount_pct}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400 tabular-nums hidden sm:table-cell">
                    {formatNumber(product.sold_count)}
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    {product.rating ? (
                      <span className="flex items-center justify-end gap-1 text-zinc-400">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {parseFloat(product.rating).toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs font-mono text-zinc-500">{product.country}</span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs text-zinc-500">{formatDate(product.snapshot_date)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-zinc-500">
          Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of{' '}
          <span className="text-zinc-300 font-medium tabular-nums">{formatNumber(meta.total)}</span> results
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(meta.page - 1)}
            disabled={meta.page <= 1}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers — show a window around current page */}
          {Array.from({ length: Math.min(5, meta.total_pages) }, (_, i) => {
            const start = Math.max(1, Math.min(meta.page - 2, meta.total_pages - 4))
            const page = start + i
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  'min-w-[32px] h-8 text-xs rounded-lg border transition-colors',
                  page === meta.page
                    ? 'bg-white text-zinc-900 border-white font-medium'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white',
                )}
              >
                {page}
              </button>
            )
          })}

          <button
            onClick={() => onPageChange(meta.page + 1)}
            disabled={meta.page >= meta.total_pages}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
