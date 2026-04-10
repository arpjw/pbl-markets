import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { market_id, side, amount } = body

  if (!market_id || !side || !amount) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (!['yes', 'no'].includes(side)) return NextResponse.json({ error: 'Invalid side' }, { status: 400 })
  if (typeof amount !== 'number' || amount < 1 || !Number.isInteger(amount)) {
    return NextResponse.json({ error: 'Amount must be a positive integer' }, { status: 400 })
  }

  const { data: market, error: mErr } = await supabase.from('markets').select('*').eq('id', market_id).single()
  if (mErr || !market) return NextResponse.json({ error: 'Market not found' }, { status: 404 })
  if (market.resolved) return NextResponse.json({ error: 'Market already resolved' }, { status: 400 })
  if (new Date(market.closes_at) < new Date()) return NextResponse.json({ error: 'Market is closed' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('points_balance').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.points_balance < amount) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })

  const newBalance  = profile.points_balance - amount
  const newYesPool  = market.yes_pool + (side === 'yes' ? amount : 0)
  const newNoPool   = market.no_pool  + (side === 'no'  ? amount : 0)
  const newTotal    = newYesPool + newNoPool
  const newYesProb  = newTotal === 0 ? 50 : Math.round((newYesPool / newTotal) * 100)

  await Promise.all([
    supabase.from('profiles').update({ points_balance: newBalance }).eq('id', user.id),
    supabase.from('markets').update({ yes_pool: newYesPool, no_pool: newNoPool }).eq('id', market_id),
    supabase.from('positions').insert({ user_id: user.id, market_id, side, amount }),
    supabase.from('transactions').insert({
      user_id: user.id, amount: -amount, type: 'bet',
      description: `Bet ${amount} pts on ${side.toUpperCase()} — "${market.title.slice(0, 60)}"`,
    }),
    supabase.from('market_price_history').insert({ market_id, yes_prob: newYesProb }),
  ])

  return NextResponse.json({
    success: true,
    new_balance: newBalance,
    market: { ...market, yes_pool: newYesPool, no_pool: newNoPool },
  })
}
