import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CATEGORY_META, calcProb } from '@/lib/types'

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: rawPositions }, { data: txns }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('positions').select('*, markets(id, title, category, yes_pool, no_pool, resolved, outcome, closes_at)').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('transactions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(20),
  ])

  const positions      = rawPositions ?? []
  const openPositions  = positions.filter(p => !(p.markets as any)?.resolved)
  const closedPositions = positions.filter(p => (p.markets as any)?.resolved)

  const estPositionsValue = openPositions.reduce((sum, pos) => {
    const m = pos.markets as any
    if (!m) return sum
    const sidePool = pos.side === 'yes' ? m.yes_pool : m.no_pool
    if (sidePool === 0) return sum
    return sum + Math.floor(((m.yes_pool + m.no_pool) / sidePool) * pos.amount)
  }, 0)

  const totalValue = (profile?.points_balance ?? 0) + estPositionsValue

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-pbl-cream">Portfolio</h1>
        <p className="text-sm text-pbl-faint mt-0.5">{profile?.full_name}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[['Balance', profile?.points_balance ?? 0], ['Positions', estPositionsValue], ['Total', totalValue]].map(([l, v]) => (
          <div key={l as string} className="card p-4">
            <p className="text-xs text-pbl-faint mb-1">{l}</p>
            <p className="text-lg font-bold text-pbl-cream">{(v as number).toLocaleString()}<span className="text-xs font-normal text-pbl-faint ml-1">pts</span></p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-pbl-muted mb-3 uppercase tracking-wide">Open positions ({openPositions.length})</h2>
        {openPositions.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-pbl-faint mb-3">No open positions</p>
            <Link href="/markets" className="btn-primary inline-block text-sm px-4 py-2">Browse markets →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {openPositions.map(pos => {
              const m = pos.markets as any
              if (!m) return null
              const pool    = m.yes_pool + m.no_pool
              const sidePool = pos.side === 'yes' ? m.yes_pool : m.no_pool
              const estPayout = sidePool > 0 ? Math.floor((pool / sidePool) * pos.amount) : 0
              const pnl      = estPayout - pos.amount
              const curProb  = Math.round(calcProb(m, pos.side as 'yes' | 'no') * 100)
              const meta     = CATEGORY_META[m.category]
              const sideColor = pos.side === 'yes' ? 'text-pbl-orange' : 'text-[#E06060]'
              return (
                <Link key={pos.id} href={`/markets/${m.id}`} className="block">
                  <div className="card card-hover p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-sm font-semibold text-pbl-cream leading-snug">{m.title}</p>
                      <span className={`badge ${pos.side === 'yes' ? 'bg-[rgba(250,78,29,0.1)] text-pbl-orange' : 'bg-[rgba(121,0,0,0.15)] text-[#E06060]'} shrink-0`}>{pos.side.toUpperCase()}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[['Staked', `${pos.amount} pts`], ['Prob', `${curProb}%`], ['Est. payout', `${estPayout} pts`], ['P&L', `${pnl >= 0 ? '+' : ''}${pnl} pts`]].map(([label, val]) => (
                        <div key={label} className="bg-pbl-bg rounded-lg p-2 text-center">
                          <p className="text-[10px] text-pbl-faint mb-0.5">{label}</p>
                          <p className={`text-xs font-bold ${label === 'P&L' ? (pnl >= 0 ? 'text-pbl-orange' : 'text-[#E06060]') : 'text-pbl-cream'}`}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {closedPositions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-pbl-muted mb-3 uppercase tracking-wide">Settled ({closedPositions.length})</h2>
          <div className="space-y-2">
            {closedPositions.map(pos => {
              const m    = pos.markets as any
              if (!m) return null
              const won  = m.outcome === pos.side
              const pool = m.yes_pool + m.no_pool
              const sp   = pos.side === 'yes' ? m.yes_pool : m.no_pool
              const payout = won && sp > 0 ? Math.floor((pool / sp) * pos.amount) : 0
              return (
                <div key={pos.id} className="card p-4 opacity-70 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pbl-muted truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-pbl-faint">
                      <span className={pos.side === 'yes' ? 'text-pbl-orange' : 'text-[#E06060]'}>{pos.side.toUpperCase()}</span>
                      <span>·</span><span>{pos.amount} pts staked</span>
                      <span>·</span><span>Resolved <strong className={m.outcome === 'yes' ? 'text-pbl-orange' : 'text-[#E06060]'}>{m.outcome?.toUpperCase()}</strong></span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${won ? 'text-pbl-orange' : 'text-[#E06060]'}`}>{won ? `+${payout}` : `-${pos.amount}`} pts</p>
                    <p className="text-xs text-pbl-faint">{won ? 'Won' : 'Lost'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {(txns?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-pbl-muted mb-3 uppercase tracking-wide">Recent transactions</h2>
          <div className="card divide-y divide-pbl-border">
            {txns!.map(t => (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-pbl-muted">{t.description ?? t.type}</p>
                  <p className="text-xs text-pbl-faint">{new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`text-sm font-bold ${t.amount >= 0 ? 'text-pbl-orange' : 'text-[#E06060]'}`}>
                  {t.amount >= 0 ? '+' : ''}{t.amount} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
