import { formatDate, formatNumber } from '@/lib/utils'
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

export function StatsCards({ stats }: { stats: Stats }) {
  const topCountry = stats.by_country[0]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
      <Card label="Total Products" value={formatNumber(stats.total_products)} sub="all snapshots" />
      <Card label="Categories" value={formatNumber(stats.total_categories)} />
      <Card label="Sellers" value={formatNumber(stats.total_sellers)} />
      <Card
        label="Last Sync"
        value={stats.latest_snapshot ? formatDate(stats.latest_snapshot) : '—'}
        sub={topCountry ? `top site: ${topCountry.country}` : undefined}
      />
    </div>
  )
}
