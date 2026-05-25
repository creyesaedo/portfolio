import { formatDate, formatNumber } from '@/lib/utils'
import { t, type Locale } from '@/lib/i18n'
import type { Stats } from '@/lib/api'

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/40">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  )
}

export function StatsCards({ stats, locale }: { stats: Stats; locale: Locale }) {
  const tr = t(locale).stats
  const topCountry = stats.by_country[0]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
      <Card
        label={tr.totalProducts}
        value={formatNumber(stats.total_products)}
        sub={tr.allSnapshots}
      />
      <Card label={tr.categories} value={formatNumber(stats.total_categories)} />
      <Card label={tr.sellers} value={formatNumber(stats.total_sellers)} />
      <Card
        label={tr.lastSync}
        value={stats.latest_snapshot ? formatDate(stats.latest_snapshot) : '—'}
        sub={topCountry ? `${tr.topSite}: ${topCountry.country}` : undefined}
      />
    </div>
  )
}
