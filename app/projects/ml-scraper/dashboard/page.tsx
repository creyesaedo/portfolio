import Link from 'next/link'
import { DashboardClient } from '@/components/ml-scraper/DashboardClient'
import { fetchStats } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let stats = null
  let apiError = false

  try {
    stats = await fetchStats()
  } catch {
    apiError = true
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <Link href="/projects/ml-scraper" className="text-xs text-zinc-500 hover:text-white transition-colors mb-2 inline-block">
            ← Case Study
          </Link>
          <h1 className="text-2xl font-bold text-white">ML Market Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Top-selling products across MercadoLibre markets · click any row for price history
          </p>
        </div>
      </div>

      {apiError || !stats ? (
        <div className="border border-orange-800 bg-orange-950/20 rounded-xl p-6 text-sm text-orange-300">
          <p className="font-medium mb-1">API not reachable</p>
          <p className="text-orange-400 text-xs">
            Start the NestJS API (<code className="bg-orange-950 px-1 rounded">npm run start:dev</code> in the ml-scraper
            directory) and set <code className="bg-orange-950 px-1 rounded">NEXT_PUBLIC_API_URL</code> in{' '}
            <code className="bg-orange-950 px-1 rounded">.env.local</code>.
          </p>
        </div>
      ) : (
        <DashboardClient initialStats={stats} />
      )}
    </div>
  )
}
