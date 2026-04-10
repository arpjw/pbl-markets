'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Market, Side, calcPayout } from '@/lib/types'

const PRESETS = [10, 25, 50, 100]

export default function BetPanel({ market: initialMarket, userBalance: initialBalance, existingPositions }: {
  market: Market
  userBalance: number
  existingPositions: { side: Side; amount: number }[]
}) {
  const router = useRouter()
  const [market, setMarket]   = useState(initialMarket)
  const [balance, setBalance] = useState(initialBalance)
  const [side, setSide]       = useState<Side | null>(null)
  const [amount, setAmount]   = useState(25)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const isClosed = market.resolved || new Date(market.closes_at) < new Date()
  const total    = market.yes_pool + market.no_pool
  const yesPct   = total === 0 ? 50 : Math.round((market.yes_pool / total) * 100)
  const noPct    = 100 - yesPct
  const payout   = side ? calcPayout(market, side, amount) : 0
  const canBet   = !!(side && amount >= 1 && amount <= balance && !isClosed)

  async function placeBet() {
    if (!canBet) return
    setLoading(true); setError(''); setSuccess('')
    const res  = await fetch('/api/bet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ market_id: market.id, side, amount }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Something went wrong') }
    else {
      setSuccess(`Placed ${amount} pts on ${side!.toUpperCase()}`)
      setBalance(data.new_balance)
      setMarket(data.market)
      setSide(null); setAmount(25)
      router.refresh()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  if (isClosed) return (
    <div className="card p-5 text-center">
      <p className="text-sm font-medium text-pbl-muted">{market.resolved ? `Resolved: ${market.outcome?.toUpperCase()}` : 'Market closed'}</p>
    </div>
  )

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-pbl-cream">Place a trade</h3>
        <span className="text-xs text-pbl-faint">Balance: <span className="font-bold text-pbl-cream">{balance.toLocaleString()} pts</span></span>
      </div>

      {existingPositions.length > 0 && (
        <div className="text-xs bg-pbl-bg border border-pbl-border rounded-lg px-3 py-2 text-pbl-muted">
          Your positions: {existingPositions.map(p => `${p.side.toUpperCase()} ${p.amount}pts`).join(' · ')}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setSide('yes')}
          className={`pill-yes text-center ${side === 'yes' ? 'active' : ''}`}
          style={{ background: side === 'yes' ? '#FA4E1D' : 'rgba(250,78,29,0.10)', borderColor: side === 'yes' ? '#FA4E1D' : 'rgba(250,78,29,0.25)', color: side === 'yes' ? 'white' : '#FA4E1D' }}>
          <div className="text-[10px] mb-0.5 opacity-70">YES</div>
          <div className="text-xl font-bold">{yesPct}%</div>
        </button>
        <button onClick={() => setSide('no')}
          className={`pill-no text-center ${side === 'no' ? 'active' : ''}`}
          style={{ background: side === 'no' ? '#C04040' : 'rgba(192,64,64,0.10)', borderColor: side === 'no' ? '#C04040' : 'rgba(192,64,64,0.25)', color: side === 'no' ? 'white' : '#C04040' }}>
          <div className="text-[10px] mb-0.5 opacity-70">NO</div>
          <div className="text-xl font-bold">{noPct}%</div>
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-pbl-muted mb-2">Amount (pts)</p>
        <div className="flex gap-2 flex-wrap mb-2 items-center">
          {PRESETS.map(p => (
            <button key={p} onClick={() => setAmount(p)}
              className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${amount === p ? 'bg-pbl-cream text-pbl-bg border-pbl-cream' : 'border-pbl-border text-pbl-muted hover:text-pbl-cream hover:border-pbl-border-2'}`}>
              {p}
            </button>
          ))}
          <input type="number" min={1} max={balance} value={amount}
            onChange={e => setAmount(Math.max(1, Math.min(parseInt(e.target.value) || 1, balance)))}
            className="w-20 bg-pbl-bg border border-pbl-border rounded-lg px-2.5 py-1.5 text-sm text-pbl-cream focus:outline-none focus:ring-1 focus:ring-pbl-maroon" />
        </div>
      </div>

      {side && (
        <div className="bg-pbl-bg border border-pbl-border rounded-lg px-3 py-2.5 flex justify-between text-sm">
          <span className="text-pbl-muted">If {side.toUpperCase()} resolves</span>
          <span className="font-bold text-pbl-cream">+{payout} pts</span>
        </div>
      )}

      {error   && <p className="text-xs text-[#C04040] bg-[rgba(192,64,64,0.1)] border border-[rgba(192,64,64,0.25)] rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-xs text-pbl-orange bg-[rgba(250,78,29,0.1)] border border-[rgba(250,78,29,0.25)] rounded-lg px-3 py-2">{success}</p>}

      <button onClick={placeBet} disabled={!canBet || loading}
        className="btn-primary w-full py-2.5 text-sm">
        {loading ? 'Placing...' : !side ? 'Select YES or NO' : amount > balance ? 'Insufficient balance' : `Place ${amount} pts on ${side.toUpperCase()}`}
      </button>
    </div>
  )
}
