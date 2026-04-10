import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import BetPanel from '@/components/BetPanel'
import MarketDetailChart from '@/components/MarketDetailChart'
import { CATEGORY_META } from '@/lib/types'

const CAT_COLOR: Record<string, string> = {
  competition: 'text-pbl-warm',
  events:      'text-pbl-orange',
  growth:      'text-[#5BC98A]',
  operations:  'text-pbl-muted',
}

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: market }, { data: profile }, { data: rawHistory }, { data: positions }] = await Promise.all([
    supabase.from('markets').select('*').eq('id', id).single(),
    user ? supabase.from('profiles').select('points_balance').eq('id', user.id).single() : { data: null },
    supabase.from('market_price_history').select('yes_prob, recorded_at').eq('market_id', id).order('recorded_at', { ascending: true }).limit(200),
    supabase.from('positions').select('id, user_id, side, amount, created_at, profiles(full_name, role)').eq('market_id', id).order('created_at', { ascending: false }),
  ])

  if (!market) notFound()

  const userPositions = positions?.filter(p => p.user_id === user?.id) ?? []
  const allPositions  = positions ?? []
  const meta          = CATEGORY_META[market.category]
  const catClr        = CAT_COLOR[market.category] ?? 'text-pbl-muted'
  const total         = market.yes_pool + market.no_pool
  const yesPct        = total === 0 ? 50 : Math.round((market.yes_pool / total) * 100)
  const noPct         = 100 - yesPct
  const yesMult       = total === 0 || market.yes_pool === 0 ? '—' : (total / market.yes_pool).toFixed(2)
  const noMult        = total === 0 || market.no_pool  === 0 ? '—' : (total / market.no_pool).toFixed(2)
  const isClosed      = market.resolved || new Date(market.closes_at) < new Date()
  const closesDate    = new Date(market.closes_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const daysLeft      = Math.max(0, Math.ceil((new Date(market.closes_at).getTime() - Date.now()) / 86400000))

  const hist = rawHistory ?? []
  const step = Math.max(1, Math.floor(hist.length / 15))
  const allHistory = hist.filter((_, i) => i % step === 0).map(p => ({
    time: new Date(p.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    yes:  Number(p.yes_prob),
    raw:  p.recorded_at,
  }))

  return (
    <div>
      <div className="flex items-center gap-2 text-[12px] text-pbl-faint mb-5">
        <Link href="/markets" className="hover:text-pbl-muted transition-colors">Markets</Link>
        <span>·</span>
        <span className={catClr}>{meta.label}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <div className="mb-5">
            <h1 className="text-[22px] font-bold text-pbl-cream leading-snug mb-2">{market.title}</h1>
            <div className="flex items-center gap-3 text-[12px] text-pbl-faint flex-wrap">
              {isClosed ? (
                <span className={market.resolved ? (market.outcome === 'yes' ? 'text-pbl-orange font-semibold' : 'text-[#C04040] font-semibold') : ''}>
                  {market.resolved ? `Resolved ${market.outcome?.toUpperCase()}` : 'Closed'}
                </span>
              ) : (
                <><span>Closes {closesDate}</span><span>·</span><span>{daysLeft}d remaining</span></>
              )}
              <span>·</span><span>{total.toLocaleString()} pts vol</span>
              <span>·</span><span>{allPositions.length} trades</span>
            </div>
          </div>

          <div className="card p-4 mb-4">
            <div className="flex items-center gap-5 mb-4">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-pbl-orange">
                <span className="w-2 h-2 rounded-full bg-pbl-orange" />Yes {yesPct}%
              </span>
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#C04040]">
                <span className="w-2 h-2 rounded-full bg-[#C04040]" />No {noPct}%
              </span>
            </div>
            {allHistory.length > 0 ? (
              <MarketDetailChart allHistory={allHistory} currentYes={yesPct} />
            ) : (
              <div className="flex items-center justify-center h-[260px] text-pbl-faint text-xs">
                Chart will populate after first trade
              </div>
            )}
          </div>

          <div className="card overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-pbl-border">
              <div className="grid grid-cols-[1fr_60px_64px_64px] items-center gap-3 text-[10px] font-semibold text-pbl-faint uppercase tracking-widest">
                <span>Outcome</span><span className="text-center">Chance</span><span className="text-center">Pays out</span><span className="text-center">Odds</span>
              </div>
            </div>
            {[{ side: 'yes', pct: yesPct, mult: yesMult, color: 'pbl-orange', bg: 'rgba(250,78,29', border: 'rgba(250,78,29' },
              { side: 'no',  pct: noPct,  mult: noMult,  color: 'C04040',     bg: 'rgba(192,64,64', border: 'rgba(192,64,64' }
            ].map(({ side, pct, mult, color, bg, border }) => (
              <div key={side} className="px-4 py-3.5 border-b border-pbl-border last:border-0 hover:bg-pbl-card-2 transition-colors">
                <div className="grid grid-cols-[1fr_60px_64px_64px] items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full shrink-0`} style={{ background: side === 'yes' ? '#FA4E1D' : '#C04040' }} />
                    <div>
                      <p className="text-[13px] font-medium text-pbl-cream capitalize">{side}</p>
                      <div className="mt-1.5 w-full max-w-[200px] h-[3px] bg-pbl-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full prob-bar" style={{ width: `${pct}%`, background: side === 'yes' ? '#FA4E1D' : '#C04040' }} />
                      </div>
                    </div>
                  </div>
                  <span className={`text-[13px] font-bold text-center`} style={{ color: side === 'yes' ? '#FA4E1D' : '#C04040' }}>{pct}%</span>
                  <span className="text-[12px] text-pbl-muted text-center">{mult}x</span>
                  <div className="rounded-lg py-1.5 text-center border" style={{ background: `${bg},0.12)`, borderColor: `${border},0.25)`, color: side === 'yes' ? '#FA4E1D' : '#C04040' }}>
                    <span className="text-[11px] font-bold">{pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {market.description && (
            <div className="card p-4 mb-4">
              <p className="text-[11px] font-semibold text-pbl-faint uppercase tracking-widest mb-2">Context</p>
              <p className="text-[13px] text-pbl-muted leading-relaxed">{market.description}</p>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-pbl-border">
              <p className="text-[11px] font-semibold text-pbl-faint uppercase tracking-widest">Trade history · {allPositions.length}</p>
            </div>
            {allPositions.length === 0 ? (
              <p className="text-[12px] text-pbl-faint text-center py-10">No trades yet. Be first.</p>
            ) : (
              <div className="divide-y divide-pbl-border">
                {allPositions.map(pos => (
                  <div key={pos.id} className="px-4 py-3 flex items-center justify-between hover:bg-pbl-card-2 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-pbl-card-2 border border-pbl-border flex items-center justify-center text-[10px] font-bold text-pbl-muted">
                        {(pos.profiles as any)?.full_name?.slice(0, 2).toUpperCase() ?? '??'}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-pbl-cream">{(pos.profiles as any)?.full_name ?? 'Member'}</p>
                        {(pos.profiles as any)?.role && <p className="text-[11px] text-pbl-faint">{(pos.profiles as any).role}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pos.side === 'yes' ? 'bg-[rgba(250,78,29,0.1)] border-[rgba(250,78,29,0.25)] text-pbl-orange' : 'bg-[rgba(192,64,64,0.1)] border-[rgba(192,64,64,0.25)] text-[#C04040]'}`}>
                        {pos.side.toUpperCase()}
                      </span>
                      <span className="text-[13px] font-bold text-pbl-cream">{pos.amount} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-[68px] space-y-3">
            <div className="card p-4">
              <p className="text-[11px] font-semibold text-pbl-faint uppercase tracking-widest mb-1">{meta.label}</p>
              <p className="text-[13px] font-semibold text-pbl-cream leading-snug line-clamp-2">{market.title}</p>
            </div>
            {user && profile ? (
              <BetPanel market={market} userBalance={profile.points_balance}
                existingPositions={userPositions.map(p => ({ side: p.side as 'yes' | 'no', amount: p.amount }))} />
            ) : (
              <div className="card p-5 text-center">
                <p className="text-[12px] text-pbl-muted mb-3">Sign in to trade</p>
                <Link href="/auth/login" className="btn-primary inline-block px-4 py-2">Sign in</Link>
              </div>
            )}
            <div className="card p-4">
              <p className="text-[10px] font-semibold text-pbl-faint uppercase tracking-widest mb-2">How it works</p>
              <p className="text-[11px] text-pbl-faint leading-relaxed">Parimutuel market. Payout = (total pool / winning pool) × your bet. Early correct traders earn better odds.</p>
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          {user && profile && (
            <BetPanel market={market} userBalance={profile.points_balance}
              existingPositions={userPositions.map(p => ({ side: p.side as 'yes' | 'no', amount: p.amount }))} />
          )}
        </div>
      </div>
    </div>
  )
}
