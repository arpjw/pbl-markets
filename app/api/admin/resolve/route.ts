import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const { market_id, outcome } = await request.json()

  if (!market_id || !['yes', 'no'].includes(outcome)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: market, error: mErr } = await supabase
    .from('markets')
    .select('*')
    .eq('id', market_id)
    .single()

  if (mErr || !market) return NextResponse.json({ error: 'Market not found' }, { status: 404 })
  if (market.resolved) return NextResponse.json({ error: 'Already resolved' }, { status: 400 })

  const { data: allPositions } = await supabase
    .from('positions')
    .select('*')
    .eq('market_id', market_id)

  const positions = allPositions ?? []
  const winners = positions.filter(p => p.side === outcome)
  const totalPool = market.yes_pool + market.no_pool
  const winningPool = outcome === 'yes' ? market.yes_pool : market.no_pool

  if (winningPool === 0) {
    await supabase.from('markets').update({ resolved: true, outcome }).eq('id', market_id)
    return NextResponse.json({ success: true, winners: 0, message: 'No winners — pool was empty.' })
  }

  const payoutRatio = totalPool / winningPool

  const payoutUpdates = winners.map(pos => ({
    userId: pos.user_id,
    payout: Math.floor(payoutRatio * pos.amount),
  }))

  const userPayouts: Record<string, number> = {}
  for (const { userId, payout } of payoutUpdates) {
    userPayouts[userId] = (userPayouts[userId] || 0) + payout
  }

  const balancePromises = Object.entries(userPayouts).map(async ([userId, payout]) => {
    const { data: p } = await supabase
      .from('profiles')
      .select('points_balance')
      .eq('id', userId)
      .single()

    if (!p) return

    await supabase
      .from('profiles')
      .update({ points_balance: p.points_balance + payout })
      .eq('id', userId)

    await supabase.from('transactions').insert({
      user_id: userId,
      amount: payout,
      type: 'payout',
      description: `Won ${payout} pts — "${market.title.slice(0, 60)}" resolved ${outcome.toUpperCase()}`,
    })
  })

  await Promise.all(balancePromises)

  await supabase.from('markets').update({ resolved: true, outcome }).eq('id', market_id)

  return NextResponse.json({
    success: true,
    winners: Object.keys(userPayouts).length,
    total_paid_out: Object.values(userPayouts).reduce((a, b) => a + b, 0),
  })
}
