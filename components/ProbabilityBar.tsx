'use client'
import { Market } from '@/lib/types'

export default function ProbabilityBar({ market, size = 'md' }: {
  market: Pick<Market, 'yes_pool' | 'no_pool'>
  size?: 'sm' | 'md'
}) {
  const total  = market.yes_pool + market.no_pool
  const yesPct = total === 0 ? 50 : Math.round((market.yes_pool / total) * 100)
  const noPct  = 100 - yesPct

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className={`font-bold text-pbl-orange ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>YES {yesPct}%</span>
        <span className={`font-bold text-[#E06060] ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>NO {noPct}%</span>
      </div>
      <div className={`w-full bg-[rgba(121,0,0,0.3)] rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2'}`}>
        <div className="prob-bar h-full bg-pbl-orange rounded-full" style={{ width: `${yesPct}%` }} />
      </div>
    </div>
  )
}
