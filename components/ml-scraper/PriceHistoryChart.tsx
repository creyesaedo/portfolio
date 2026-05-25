'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { t, type Locale } from '@/lib/i18n'
import type { PriceHistoryPoint } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Props {
  history: PriceHistoryPoint[]
  productName: string
  locale: Locale
}

export function PriceHistoryChart({ history, productName, locale }: Props) {
  const tr = t(locale).chart
  const data = history.map((h) => ({
    date: formatDate(h.snapshot_date),
    price: parseFloat(h.price),
    ranking: h.ranking_position,
  }))

  const minPrice = Math.min(...data.map((d) => d.price))
  const maxPrice = Math.max(...data.map((d) => d.price))
  const padding = (maxPrice - minPrice) * 0.1 || maxPrice * 0.05

  return (
    <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/40 mt-4">
      <h3 className="text-sm font-medium text-white mb-1 truncate">{productName}</h3>
      <p className="text-xs text-zinc-500 mb-5">
        {tr.snapshots.replace('snapshots', `${data.length} ${tr.snapshots}`).includes('undefined')
          ? `${data.length} ${tr.snapshots}`
          : `Price history across ${data.length} ${tr.snapshots}`}
      </p>

      {data.length < 2 ? (
        <p className="text-sm text-zinc-500 py-8 text-center">{tr.onlyOne}</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[minPrice - padding, maxPrice + padding]}
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) =>
                new Intl.NumberFormat('es-CL', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
              }
            />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
              labelStyle={{ color: '#a1a1aa', fontSize: 11 }}
              itemStyle={{ color: '#e4e4e7', fontSize: 12 }}
              formatter={(value: number) => new Intl.NumberFormat('es-CL').format(value)}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
            <Line
              type="monotone"
              dataKey="price"
              name={tr.price}
              stroke="#818cf8"
              strokeWidth={2}
              dot={{ fill: '#818cf8', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
