'use client'
import { useState } from 'react'
import PriceChart from './PriceChart'

const RANGES = ['1D', '1W', 'ALL'] as const
type Range = typeof RANGES[number]

interface Point { time: string; yes: number; raw: string }

export default function MarketDetailChart({
  allHistory,
  currentYes,
}: {
  allHistory: Point[]
  currentYes: number
}) {
  const [range, setRange] = useState<Range>('ALL')

  const now = Date.now()
  const filtered = allHistory.filter(p => {
    const t = new Date(p.raw).getTime()
    if (range === '1D') return now - t <= 86400000
    if (range === '1W') return now - t <= 7 * 86400000
    return true
  })

  const chartData = [...filtered, { time: 'Now', yes: currentYes, raw: new Date().toISOString() }]

  return (
    <div>
      <PriceChart data={chartData} height={260} />
      <div className="flex items-center justify-between mt-2">
        <div />
        <div className="flex gap-0.5">
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                range === r
                  ? 'bg-pbl-card-2 text-pbl-cream'
                  : 'text-pbl-faint hover:text-pbl-muted'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
