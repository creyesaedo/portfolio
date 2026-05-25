'use client'

import type { Category, ProductFilters } from '@/lib/api'

const SITES = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MPE', 'MLU', 'MLV']

interface Props {
  categories: Category[]
  filters: ProductFilters
  onChange: (f: Partial<ProductFilters>) => void
  onApply: () => void
  loading: boolean
}

export function DashboardFilters({ categories, filters, onChange, onApply, loading }: Props) {
  return (
    <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/40 mb-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-3">
        {/* Country */}
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Site</label>
          <select
            value={filters.country ?? ''}
            onChange={(e) => onChange({ country: e.target.value || undefined, category_id: undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
          >
            <option value="">All sites</option>
            {SITES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Category</label>
          <select
            value={filters.category_id ?? ''}
            onChange={(e) => onChange({ category_id: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            disabled={!filters.country}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">From</label>
          <input
            type="date"
            value={filters.date_from ?? ''}
            onChange={(e) => onChange({ date_from: e.target.value || undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Date to */}
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">To</label>
          <input
            type="date"
            value={filters.date_to ?? ''}
            onChange={(e) => onChange({ date_to: e.target.value || undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-xs text-zinc-500 mb-1 block">Search</label>
          <input
            type="text"
            placeholder="Product name..."
            value={filters.search ?? ''}
            onChange={(e) => onChange({ search: e.target.value || undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Apply */}
        <div className="flex items-end">
          <button
            onClick={onApply}
            disabled={loading}
            className="w-full bg-white text-zinc-900 font-medium text-sm px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}
