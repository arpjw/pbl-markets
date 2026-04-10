import Link from 'next/link'
import { Market } from '@/lib/types'

interface Props {
  markets: Market[]
  userPositions: Record<string, { side: 'yes' | 'no'; amount: number }>
  recentChanges: Record<string, number>
}

function timeLabel(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return 'Closed'
  const days = Math.floor(diff / 86400000)
  if (days > 1) return `${days}d`
  const hrs = Math.floor(diff / 3600000)
  return hrs > 0 ? `${hrs}h` : '<1h'
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-[11px] font-semibold text-pbl-faint uppercase tracking-widest mb-2 px-1">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function MarketRow({ market, rank, change, userSide }: {
  market: Market
  rank?: number
  change?: number
  userSide?: 'yes' | 'no'
}) {
  const total  = market.yes_pool + market.no_pool
  const yesPct = total === 0 ? 50 : Math.round((market.yes_pool / total) * 100)

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-pbl-card-2 transition-colors group">
        {rank !== undefined && (
          <span className="text-[11px] font-semibold text-pbl-faint w-4 shrink-0 tabular-nums">{rank}</span>
        )}
        <p className="text-[12px] text-pbl-muted group-hover:text-pbl-cream leading-tight flex-1 line-clamp-2 transition-colors">
          {market.title}
        </p>
        <div className="flex flex-col items-end shrink-0 gap-0.5">
          <span className="text-[11px] font-semibold text-pbl-orange tabular-nums">{yesPct}%</span>
          {change !== undefined && change !== 0 && (
            <span className={`text-[10px] font-medium tabular-nums ${change > 0 ? 'text-[#5BC98A]' : 'text-[#C04040]'}`}>
              {change > 0 ? '▲' : '▼'} {Math.abs(change)}
            </span>
          )}
          {userSide && (
            <span className={`text-[9px] font-bold ${userSide === 'yes' ? 'text-pbl-orange' : 'text-[#C04040]'}`}>
              {userSide.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function ClosingSoonRow({ market }: { market: Market }) {
  return (
    <Link href={`/markets/${market.id}`}>
      <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-pbl-card-2 transition-colors group">
        <p className="text-[12px] text-pbl-muted group-hover:text-pbl-cream leading-tight flex-1 line-clamp-1 transition-colors">
          {market.title}
        </p>
        <span className="text-[10px] font-semibold text-pbl-warm shrink-0">{timeLabel(market.closes_at)}</span>
      </div>
    </Link>
  )
}

export default function TrendingSidebar({ markets, userPositions, recentChanges }: Props) {
  const open = markets.filter(m => !m.resolved && new Date(m.closes_at) > new Date())

  const trending = [...open]
    .sort((a, b) => (b.yes_pool + b.no_pool) - (a.yes_pool + a.no_pool))
    .slice(0, 5)

  const closingSoon = [...open]
    .filter(m => {
      const diff = new Date(m.closes_at).getTime() - Date.now()
      return diff > 0 && diff < 7 * 86400000
    })
    .sort((a, b) => new Date(a.closes_at).getTime() - new Date(b.closes_at).getTime())
    .slice(0, 4)

  const yourMarkets = open.filter(m => userPositions[m.id]).slice(0, 4)

  return (
    <div className="space-y-1">
      <SidebarSection title="Trending">
        {trending.length === 0 ? (
          <p className="text-[11px] text-pbl-faint px-2">No open markets yet</p>
        ) : (
          trending.map((m, i) => (
            <MarketRow key={m.id} market={m} rank={i + 1} change={recentChanges[m.id] ?? 0} />
          ))
        )}
      </SidebarSection>

      {closingSoon.length > 0 && (
        <SidebarSection title="Closing Soon">
          {closingSoon.map(m => <ClosingSoonRow key={m.id} market={m} />)}
        </SidebarSection>
      )}

      {yourMarkets.length > 0 && (
        <SidebarSection title="Your positions">
          {yourMarkets.map(m => (
            <MarketRow key={m.id} market={m} userSide={userPositions[m.id]?.side} />
          ))}
        </SidebarSection>
      )}

      <div className="px-2 pt-4 border-t border-pbl-border">
        <p className="text-[10px] text-pbl-faint leading-relaxed">
          PBL Markets uses parimutuel pricing. Probabilities reflect collective member predictions.
        </p>
      </div>
    </div>
  )
}
