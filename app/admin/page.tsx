'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Market, CATEGORY_META, Category } from '@/lib/types'
import { useRouter } from 'next/navigation'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'competition', label: 'Competition' },
  { value: 'events', label: 'Events' },
  { value: 'growth', label: 'Growth' },
  { value: 'operations', label: 'Operations' },
]

export default function AdminPage() {
  const router = useRouter()
  const [markets, setMarkets] = useState<Market[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'markets' | 'members' | 'create'>('markets')
  const [resolving, setResolving] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', description: '', category: 'competition' as Category,
    closes_at: '', yes_pool: 200, no_pool: 200,
  })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const supabase = createClient()
    const [{ data: mkts }, { data: mems }] = await Promise.all([
      supabase.from('markets').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('points_balance', { ascending: false }),
    ])
    setMarkets(mkts ?? [])
    setMembers(mems ?? [])
    setLoading(false)
  }

  async function resolve(marketId: string, outcome: 'yes' | 'no') {
    if (!confirm(`Resolve market as ${outcome.toUpperCase()}? This will distribute payouts and cannot be undone.`)) return
    setResolving(marketId)
    const res = await fetch('/api/admin/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ market_id: marketId, outcome }),
    })
    const data = await res.json()
    setResolving(null)
    if (res.ok) {
      setMsg(`Market resolved. ${data.winners} winners paid out.`)
      load()
    } else {
      setMsg(`Error: ${data.error}`)
    }
    setTimeout(() => setMsg(''), 5000)
  }

  async function createMarket(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/markets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setCreating(false)
    if (res.ok) {
      setMsg('Market created.')
      setForm({ title: '', description: '', category: 'competition', closes_at: '', yes_pool: 200, no_pool: 200 })
      setTab('markets')
      load()
    } else {
      setMsg(`Error: ${data.error}`)
    }
    setTimeout(() => setMsg(''), 4000)
  }

  async function toggleAdmin(memberId: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', memberId)
    load()
  }

  async function adjustBalance(memberId: string, currentBalance: number) {
    const input = prompt(`Current balance: ${currentBalance} pts\nNew balance:`)
    if (!input) return
    const newBalance = parseInt(input)
    if (isNaN(newBalance) || newBalance < 0) return
    const supabase = createClient()
    await supabase.from('profiles').update({ points_balance: newBalance }).eq('id', memberId)
    await supabase.from('transactions').insert({
      user_id: memberId, amount: newBalance - currentBalance,
      type: 'adjustment', description: 'Admin balance adjustment',
    })
    load()
  }

  if (loading) return <div className="text-sm text-slate-400 py-8 text-center">Loading...</div>

  const openMarkets = markets.filter(m => !m.resolved)
  const resolvedMarkets = markets.filter(m => m.resolved)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">{members.length} members · {openMarkets.length} open markets</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="bg-slate-100 px-2 py-1 rounded">{openMarkets.length} open</span>
          <span className="bg-slate-100 px-2 py-1 rounded">{resolvedMarkets.length} resolved</span>
        </div>
      </div>

      {msg && (
        <div className="mb-4 bg-brand-50 border border-brand-200 text-brand-700 text-sm rounded-lg px-4 py-2.5">{msg}</div>
      )}

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {(['markets', 'create', 'members'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t === 'create' ? 'Create market' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'markets' && (
        <div className="space-y-3">
          {markets.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No markets yet. Create one.</p>}
          {markets.map(m => {
            const meta = CATEGORY_META[m.category]
            const total = m.yes_pool + m.no_pool
            const yesPct = total === 0 ? 50 : Math.round((m.yes_pool / total) * 100)
            return (
              <div key={m.id} className={`card p-4 ${m.resolved ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${meta.bg} ${meta.color}`}>{meta.label}</span>
                      {m.resolved && (
                        <span className={`badge ${m.outcome === 'yes' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                          Resolved {m.outcome?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {total.toLocaleString()} pts volume · YES {yesPct}% · Closes {new Date(m.closes_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!m.resolved && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => resolve(m.id, 'yes')}
                        disabled={resolving === m.id}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Resolve YES
                      </button>
                      <button
                        onClick={() => resolve(m.id, 'no')}
                        disabled={resolving === m.id}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Resolve NO
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'create' && (
        <form onSubmit={createMarket} className="card p-6 space-y-4 max-w-lg">
          <h2 className="text-sm font-semibold text-slate-700">New market</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input className="input" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Will PBL place Top 3 at NLC?" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional additional context..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select className="input" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Closes at *</label>
              <input className="input" type="datetime-local" required value={form.closes_at}
                onChange={e => setForm(f => ({ ...f, closes_at: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Seed YES pool (pts)</label>
              <input className="input" type="number" min={0} value={form.yes_pool}
                onChange={e => setForm(f => ({ ...f, yes_pool: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Seed NO pool (pts)</label>
              <input className="input" type="number" min={0} value={form.no_pool}
                onChange={e => setForm(f => ({ ...f, no_pool: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Seed pools set the opening probability. YES 200 / NO 200 = 50/50. YES 600 / NO 400 = 60% yes.
          </p>
          <button type="submit" className="btn-primary w-full" disabled={creating}>
            {creating ? 'Creating...' : 'Create market'}
          </button>
        </form>
      )}

      {tab === 'members' && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 grid grid-cols-12 text-xs font-medium text-slate-400">
            <span className="col-span-4">Name</span>
            <span className="col-span-3">Role</span>
            <span className="col-span-2">Balance</span>
            <span className="col-span-3">Actions</span>
          </div>
          <div className="divide-y divide-slate-50">
            {members.map(m => (
              <div key={m.id} className="px-4 py-3 grid grid-cols-12 items-center gap-2">
                <div className="col-span-4">
                  <p className="text-sm font-medium text-slate-800 truncate">{m.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{m.email}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-xs text-slate-600 truncate">{m.role || '—'}</p>
                  {m.is_admin && <span className="text-xs font-medium text-brand-600">Admin</span>}
                </div>
                <div className="col-span-2">
                  <button onClick={() => adjustBalance(m.id, m.points_balance)}
                    className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">
                    {m.points_balance.toLocaleString()}
                  </button>
                </div>
                <div className="col-span-3 flex gap-1.5">
                  <button onClick={() => toggleAdmin(m.id, m.is_admin)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${m.is_admin ? 'bg-brand-50 border-brand-200 text-brand-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600' : 'border-slate-200 text-slate-500 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600'}`}>
                    {m.is_admin ? 'Remove admin' : 'Make admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
