'use client'

import { t, type Locale } from '@/lib/i18n'
import type { Category, ProductFilters } from '@/lib/api'

const SITES = ['MLA', 'MLB', 'MLC', 'MLM', 'MCO', 'MPE', 'MLU', 'MLV']

interface Props {
  categories: Category[]
  filters: ProductFilters
  onChange: (f: Partial<ProductFilters>) => void
  onApply: () => void
  loading: boolean
  locale: Locale
}

export function DashboardFilters({ categories, filters, onChange, onApply, loading, locale }: Props) {
  const tr = t(locale).filters
  return (
    <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/40 mb-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-3">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">{tr.site}</label>
          <select
            value={filters.country ?? ''}
            onChange={(e) => onChange({ country: e.target.value || undefined, category_id: undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
          >
            <option value="">{tr.allSites}</option>
            {SITES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-1 block">{tr.category}</label>
          <select
            value={filters.category_id ?? ''}
            onChange={(e) => onChange({ category_id: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            disabled={!filters.country}
          >
            <option value="">{tr.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-1 block">{tr.from}</label>
          <input
            type="date"
            value={filters.date_from ?? ''}
            onChange={(e) => onChange({ date_from: e.target.value || undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-500 mb-1 block">{tr.to}</label>
          <input
            type="date"
            value={filters.date_to ?? ''}
            onChange={(e) => onChange({ date_to: e.target.value || undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label className="text-xs text-zinc-500 mb-1 block">{tr.search}</label>
          <input
            type="text"
            placeholder={tr.searchPlaceholder}
            value={filters.search ?? ''}
            onChange={(e) => onChange({ search: e.target.value || undefined, page: 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={onApply}
            disabled={loading}
            className="w-full bg-white text-zinc-900 font-medium text-sm px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? tr.loading : tr.apply}
          </button>
        </div>
      </div>
    </div>
  )
}
