import Link from 'next/link'
import { Market, CATEGORY_META } from '@/lib/types'

interface MarketCardProps {
  market: Market
  userPosition?: { side: 'yes' | 'no'; amount: number } | null
}

function timeLabel(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return 'Closed'
  const days = Math.floor(diff / 86400000)
  if (days > 30)  return `${Math.floor(days / 30)}mo left`
  if (days > 1)   return `${days}d left`
  const hrs = Math.floor(diff / 3600000)
  return hrs > 0  ? `${hrs}h left` : 'Closing soon'
}

const CAT_COLOR: Record<string, string> = {
  competition: 'text-pbl-warm',
  events:      'text-pbl-orange',
  growth:      'text-[#5BC98A]',
  operations:  'text-pbl-muted',
}

export default function MarketCard({ market, userPosition }: MarketCardProps) {
  const meta   = CATEGORY_META[market.category]
  const catClr = CAT_COLOR[market.category] ?? 'text-pbl-muted'
  const total  = market.yes_pool + market.no_pool
  const yesPct = total === 0 ? 50 : Math.round((market.yes_pool / total) * 100)
  const noPct  = 100 - yesPct

  return (
    <Link href={`/markets/${market.id}`} className="block h-full">
      <div className="group card card-hover p-4 h-full flex flex-col gap-3.5 cursor-pointer">

        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-semibold tracking-widest uppercase ${catClr}`}>
            {meta.label}
          </span>
          <span className="text-[10px] text-pbl-faint tabular-nums">{timeLabel(market.closes_at)}</span>
        </div>

        <p className="text-[13px] font-medium text-pbl-cream leading-[1.45] flex-1 group-hover:text-white transition-colors">
          {market.title}
        </p>

        {market.resolved ? (
          <div className={`text-center py-1.5 rounded-lg text-[11px] font-bold tracking-wide ${
            market.outcome === 'yes'
              ? 'text-pbl-orange bg-[rgba(250,78,29,0.08)]'
              : 'text-[#C04040] bg-[rgba(192,64,64,0.08)]'
          }`}>
            Resolved {market.outcome?.toUpperCase()}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold text-pbl-orange w-5 shrink-0 tabular-nums">Yes</span>
              <div className="flex-1 h-[3px] bg-pbl-border rounded-full overflow-hidden">
                <div className="prob-bar h-full bg-pbl-orange rounded-full" style={{ width: `${yesPct}%` }} />
              </div>
              <span className="text-[11px] font-semibold text-pbl-cream/80 bg-white/[0.06] rounded-full px-2 py-0.5 min-w-[36px] text-center tabular-nums">
                {yesPct}%
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold text-[#C04040] w-5 shrink-0 tabular-nums">No</span>
              <div className="flex-1 h-[3px] bg-pbl-border rounded-full overflow-hidden">
                <div className="prob-bar h-full bg-[#C04040] rounded-full" style={{ width: `${noPct}%` }} />
              </div>
              <span className="text-[11px] font-semibold text-pbl-cream/80 bg-white/[0.06] rounded-full px-2 py-0.5 min-w-[36px] text-center tabular-nums">
                {noPct}%
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-0.5 border-t border-pbl-border">
          <span className="text-[10px] text-pbl-faint">{(market.yes_pool + market.no_pool).toLocaleString()} pts vol</span>
          {userPosition && (
            <span className={`text-[10px] font-semibold ${userPosition.side === 'yes' ? 'text-pbl-orange' : 'text-[#C04040]'}`}>
              You: {userPosition.side.toUpperCase()} {userPosition.amount} pts
            </span>
          )}
        </div>

      </div>
    </Link>
  )
}
