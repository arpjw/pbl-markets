import { createClient } from '@/lib/supabase/server'
import MarketCard from '@/components/MarketCard'
import HeroMarket from '@/components/HeroMarket'
import TrendingSidebar from '@/components/TrendingSidebar'
import { Category, CATEGORY_META, Market } from '@/lib/types'

const FILTERS: { label: string; value: Category | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Competition', value: 'competition' },
  { label: 'Events', value: 'events' },
  { label: 'Growth', value: 'growth' },
  { label: 'Operations', value: 'operations' },
]

function formatHistoryPoint(row: { yes_prob: number; recorded_at: string }) {
  const d = new Date(row.recorded_at)
  return {
    time: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    yes:  Number(row.yes_prob),
  }
}

export default async function MarketsPage({ searchParams }: { searchParams: { cat?: string; show?: string } }) {
  const supabase     = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const category     = searchParams.cat as Category | undefined
  const showResolved = searchParams.show === 'resolved'

  // Fetch all markets + featured market price history in parallel
  const [{ data: allMarkets }, { data: profile }] = await Promise.all([
    supabase.from('markets').select('*').order('yes_pool', { ascending: false }),
    user ? supabase.from('profiles').select('points_balance').eq('id', user.id).single() : { data: null },
  ])

  const markets = allMarkets ?? []
  const open    = markets.filter(m => !m.resolved && new Date(m.closes_at) > new Date())

  // Featured = highest volume open market
  const featured = open[0] ?? null

  // Price history for featured market (last 7 days, sampled every 6h → 28 points max)
  let priceHistory: { time: string; yes: number }[] = []
  if (featured) {
    const { data: hist } = await supabase
      .from('market_price_history')
      .select('yes_prob, recorded_at')
      .eq('market_id', featured.id)
      .order('recorded_at', { ascending: true })
      .limit(40)
    if (hist?.length) {
      // Sample to ~10 points for clean chart
      const step = Math.max(1, Math.floor(hist.length / 10))
      priceHistory = hist
        .filter((_, i) => i % step === 0)
        .map(formatHistoryPoint)
    }
  }

  // Recent prob changes (compare current vs 24h ago point)
  const recentChanges: Record<string, number> = {}
  if (open.length) {
    for (const m of open.slice(0, 10)) {
      const { data: pts } = await supabase
        .from('market_price_history')
        .select('yes_prob')
        .eq('market_id', m.id)
        .order('recorded_at', { ascending: false })
        .limit(5)
      if (pts && pts.length >= 2) {
        const current = Number(pts[0].yes_prob)
        const old     = Number(pts[pts.length - 1].yes_prob)
        recentChanges[m.id] = current - old
      }
    }
  }

  // User positions
  let userPositions: Record<string, { side: 'yes' | 'no'; amount: number }> = {}
  if (user && markets.length) {
    const { data: positions } = await supabase
      .from('positions').select('market_id, side, amount')
      .eq('user_id', user.id)
      .in('market_id', markets.map(m => m.id))
    if (positions) {
      for (const p of positions) {
        if (!userPositions[p.market_id]) userPositions[p.market_id] = { side: p.side, amount: p.amount }
        else userPositions[p.market_id].amount += p.amount
      }
    }
  }

  // Filtered markets for grid
  let gridMarkets = markets
  if (category) gridMarkets = gridMarkets.filter(m => m.category === category)
  if (!showResolved) gridMarkets = gridMarkets.filter(m => !m.resolved && new Date(m.closes_at) > new Date())

  const gridOpen   = gridMarkets.filter(m => !m.resolved && new Date(m.closes_at) > new Date())
  const gridClosed = gridMarkets.filter(m => m.resolved || new Date(m.closes_at) <= new Date())

  // Skip featured from grid
  const gridOpenFiltered = featured ? gridOpen.filter(m => m.id !== featured.id) : gridOpen

  return (
    <div>
      {/* Hero */}
      {featured && (
        <HeroMarket
          market={featured}
          priceHistory={priceHistory}
          userBalance={profile?.points_balance ?? null}
        />
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        {FILTERS.map(f => (
          <a key={f.value}
            href={f.value === 'all' ? '/markets' : `/markets?cat=${f.value}${showResolved ? '&show=resolved' : ''}`}
            className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${
              (f.value === 'all' && !category) || f.value === category
                ? 'bg-pbl-maroon text-pbl-cream border-pbl-maroon'
                : 'bg-transparent border-pbl-border text-pbl-muted hover:border-pbl-border-2 hover:text-pbl-cream'
            }`}>
            {f.label}
          </a>
        ))}
        <a href={showResolved ? '/markets' : '/markets?show=resolved'}
          className="ml-auto text-[11px] text-pbl-faint hover:text-pbl-muted transition-colors">
          {showResolved ? '↑ Hide resolved' : 'Show resolved ↓'}
        </a>
      </div>

      {/* Main grid + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">

        {/* Market grid */}
        <div>
          {gridOpenFiltered.length === 0 && gridClosed.length === 0 && (
            <div className="text-center py-20">
              <span className="font-serif text-5xl text-pbl-border block mb-4 select-none">Φ</span>
              <p className="text-sm text-pbl-faint">No markets here.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gridOpenFiltered.map(market => (
              <MarketCard key={market.id} market={market} userPosition={userPositions[market.id] ?? null} />
            ))}
          </div>

          {showResolved && gridClosed.length > 0 && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-pbl-border" />
                <span className="text-[10px] text-pbl-faint uppercase tracking-widest">Resolved</span>
                <div className="flex-1 h-px bg-pbl-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-50">
                {gridClosed.map(market => (
                  <MarketCard key={market.id} market={market} userPosition={userPositions[market.id] ?? null} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-[68px]">
            <TrendingSidebar markets={markets} userPositions={userPositions} recentChanges={recentChanges} />
          </div>
        </div>

      </div>
    </div>
  )
}
