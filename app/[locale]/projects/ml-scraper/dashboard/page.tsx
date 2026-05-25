import Link from 'next/link'
import { DashboardClient } from '@/components/ml-scraper/DashboardClient'
import { getStats } from '@/lib/db'
import { t, type Locale } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const tr = t(locale)
  let stats = null
  let dbError = false

  try {
    stats = await getStats()
  } catch {
    dbError = true
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <Link
            href={`/${locale}/projects/ml-scraper`}
            className="text-xs text-zinc-500 hover:text-white transition-colors mb-2 inline-block"
          >
            {tr.dashboard.back}
          </Link>
          <h1 className="text-2xl font-bold text-white">{tr.dashboard.title}</h1>
          <p className="text-sm text-zinc-400 mt-1">{tr.dashboard.subtitle}</p>
        </div>
      </div>

      {dbError || !stats ? (
        <div className="border border-orange-800 bg-orange-950/20 rounded-xl p-6 text-sm text-orange-300">
          <p className="font-medium mb-1">{tr.dashboard.dbError.title}</p>
          <p className="text-orange-400 text-xs">{tr.dashboard.dbError.body}</p>
        </div>
      ) : (
        <DashboardClient initialStats={stats} locale={locale} />
      )}
    </div>
  )
}
