'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Market, CATEGORY_META, calcPayout } from '@/lib/types'
import PriceChart from './PriceChart'
import Link from 'next/link'

const CAT_COLOR: Record<string, string> = {
  competition: 'text-pbl-warm',
  events:      'text-pbl-orange',
  growth:      'text-[#5BC98A]',
  operations:  'text-pbl-muted',
}

const PRESETS = [10, 25, 50, 100]

export default function HeroMarket({
  market: initial,
  priceHistory,
  userBalance,
}: {
  market: Market
  priceHistory: { time: string; yes: number }[]
  userBalance: number | null
}) {
  const router     = useRouter()
  const [market, setMarket]   = useState(initial)
  const [balance, setBalance] = useState(userBalance ?? 0)
  const [side, setSide]       = useState<'yes' | 'no' | null>(null)
  const [amount, setAmount]   = useState(25)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  useEffect(() => {
    const supabase = createClient()
    const ch = supabase.channel(`hero:${market.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'markets', filter: `id=eq.${market.id}` },
        payload => setMarket(prev => ({ ...prev, ...payload.new })))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [market.id])

  const meta    = CATEGORY_META[market.category]
  const catClr  = CAT_COLOR[market.category] ?? 'text-pbl-muted'
  const total   = market.yes_pool + market.no_pool
  const yesPct  = total === 0 ? 50 : Math.round((market.yes_pool / total) * 100)
  const noPct   = 100 - yesPct
  const yesMult = total === 0 || market.yes_pool === 0 ? '—' : (total / market.yes_pool).toFixed(2)
  const noMult  = total === 0 || market.no_pool  === 0 ? '—' : (total / market.no_pool).toFixed(2)
  const payout  = side ? calcPayout(market, side, amount) : 0
  const canBet  = !!(side && amount >= 1 && amount <= balance && !market.resolved)

  const chartData = [
    ...priceHistory,
    { time: 'Now', yes: yesPct },
  ]

  async function placeBet() {
    if (!canBet) return
    setLoading(true)
    const res  = await fetch('/api/bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ market_id: market.id, side, amount }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setMsg(data.error || 'Error') }
    else {
      setMsg(`Placed ${amount} pts on ${side!.toUpperCase()}`)
      setBalance(data.new_balance)
      setMarket(data.market)
      setSide(null); setAmount(25)
      router.refresh()
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[10px] font-semibold tracking-widest uppercase ${catClr}`}>
          {meta.label}
        </span>
        <Link href={`/markets/${market.id}`} className="text-[11px] text-pbl-faint hover:text-pbl-muted transition-colors">
          View market →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

        {/* ── Left: market info + bet ── */}
        <div>
          <Link href={`/markets/${market.id}`}>
            <h2 className="text-[17px] font-bold text-pbl-cream leading-snug mb-5 hover:text-white transition-colors">
              {market.title}
            </h2>
          </Link>

          <div className="grid grid-cols-[1fr_56px_76px] text-[10px] text-pbl-faint uppercase tracking-widest mb-2 px-1 gap-2">
            <span>Market</span>
            <span className="text-center">Pays out</span>
            <span className="text-center">Odds</span>
          </div>

          {/* YES */}
          <button onClick={() => setSide(s => s === 'yes' ? null : 'yes')}
            className={`w-full flex items-center gap-2 py-3 px-1 border-b transition-colors ${side === 'yes' ? 'border-pbl-border bg-[rgba(250,78,29,0.05)] rounded-lg' : 'border-pbl-border hover:bg-pbl-card-2'}`}>
            <div className="flex-1 flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-pbl-orange shrink-0" />
              <span className="text-sm font-medium text-pbl-cream">Yes</span>
            </div>
            <span className="text-sm text-pbl-muted w-[56px] text-center tabular-nums">{yesMult}x</span>
            <div className={`w-[76px] rounded-lg py-1.5 text-center border transition-colors ${
              side === 'yes'
                ? 'bg-pbl-orange border-pbl-orange text-white'
                : 'bg-[rgba(250,78,29,0.12)] border-[rgba(250,78,29,0.25)] text-pbl-orange'
            }`}>
              <span className="text-sm font-bold">{yesPct}%</span>
            </div>
          </button>

          {/* NO */}
          <button onClick={() => setSide(s => s === 'no' ? null : 'no')}
            className={`w-full flex items-center gap-2 py-3 px-1 border-b transition-colors ${side === 'no' ? 'border-pbl-border bg-[rgba(192,64,64,0.05)] rounded-lg' : 'border-pbl-border hover:bg-pbl-card-2'}`}>
            <div className="flex-1 flex items-center gap-2 text-left">
              <span className="w-2 h-2 rounded-full bg-[#C04040] shrink-0" />
              <span className="text-sm font-medium text-pbl-cream">No</span>
            </div>
            <span className="text-sm text-pbl-muted w-[56px] text-center tabular-nums">{noMult}x</span>
            <div className={`w-[76px] rounded-lg py-1.5 text-center border transition-colors ${
              side === 'no'
                ? 'bg-[#C04040] border-[#C04040] text-white'
                : 'bg-[rgba(192,64,64,0.12)] border-[rgba(192,64,64,0.25)] text-[#C04040]'
            }`}>
              <span className="text-sm font-bold">{noPct}%</span>
            </div>
          </button>

          <div className="flex gap-4 mt-3 text-[11px] text-pbl-faint">
            <span>{total.toLocaleString()} pts volume</span>
          </div>

          {/* Inline bet panel - shows when side selected */}
          {side && userBalance !== null && (
            <div className="mt-4 pt-4 border-t border-pbl-border space-y-3">
              <div className="flex gap-1.5 flex-wrap items-center">
                {PRESETS.map(p => (
                  <button key={p} onClick={() => setAmount(p)}
                    className={`px-3 py-1 rounded-lg text-xs border font-medium transition-colors ${
                      amount === p ? 'bg-pbl-cream text-pbl-bg border-pbl-cream' : 'border-pbl-border text-pbl-muted hover:text-pbl-cream hover:border-pbl-border-2'
                    }`}>{p}</button>
                ))}
                <input type="number" min={1} max={balance} value={amount}
                  onChange={e => setAmount(Math.max(1, Math.min(parseInt(e.target.value) || 1, balance)))}
                  className="w-16 bg-pbl-bg border border-pbl-border rounded-lg px-2 py-1 text-xs text-pbl-cream focus:outline-none focus:ring-1 focus:ring-pbl-maroon" />
                <span className="text-[11px] text-pbl-faint ml-auto">→ <strong className="text-pbl-cream">{payout} pts</strong> if correct</span>
              </div>
              {msg && <p className="text-[11px] text-pbl-orange">{msg}</p>}
              <button onClick={placeBet} disabled={!canBet || loading}
                className="w-full bg-pbl-maroon hover:bg-pbl-maroon-2 text-pbl-cream text-sm font-medium rounded-lg py-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                {loading ? 'Placing...' : `Place ${amount} pts on ${side.toUpperCase()}`}
              </button>
            </div>
          )}

          {!side && market.description && (
            <div className="mt-4 pt-4 border-t border-pbl-border">
              <p className="text-xs text-pbl-muted leading-relaxed">
                <strong className="text-pbl-faint">Context</strong> · {market.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Right: chart ── */}
        <div>
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-[11px] text-pbl-orange">
              <span className="w-2 h-2 rounded-full bg-pbl-orange" />
              Yes {yesPct}%
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#C04040]">
              <span className="w-2 h-2 rounded-full bg-[#C04040]" />
              No {noPct}%
            </span>
          </div>
          <PriceChart data={chartData} height={200} />
        </div>
      </div>
    </div>
  )
}
