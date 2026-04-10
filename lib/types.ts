export type Category = 'competition' | 'events' | 'growth' | 'operations'
export type Side = 'yes' | 'no'
export type Outcome = 'yes' | 'no'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: string | null
  points_balance: number
  is_admin: boolean
  created_at: string
}

export interface Market {
  id: string
  title: string
  description: string | null
  category: Category
  yes_pool: number
  no_pool: number
  closes_at: string
  resolved: boolean
  outcome: Outcome | null
  created_by: string | null
  created_at: string
}

export interface Position {
  id: string
  user_id: string
  market_id: string
  side: Side
  amount: number
  created_at: string
  profiles?: Pick<Profile, 'full_name' | 'role'>
  markets?: Pick<Market, 'title' | 'category' | 'yes_pool' | 'no_pool' | 'resolved' | 'outcome'>
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'bet' | 'payout' | 'adjustment'
  description: string | null
  created_at: string
}

export function calcProb(market: Pick<Market, 'yes_pool' | 'no_pool'>, side: Side): number {
  const total = market.yes_pool + market.no_pool
  if (total === 0) return 0.5
  return side === 'yes' ? market.yes_pool / total : market.no_pool / total
}

export function calcPayout(market: Pick<Market, 'yes_pool' | 'no_pool'>, side: Side, amount: number): number {
  const winPool = side === 'yes' ? market.yes_pool + amount : market.no_pool + amount
  const totalPool = market.yes_pool + market.no_pool + amount
  return Math.floor((totalPool / winPool) * amount)
}

export const CATEGORY_META: Record<Category, { label: string; color: string; bg: string }> = {
  competition: { label: 'Competition', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  events:      { label: 'Events',      color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  growth:      { label: 'Growth',      color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  operations:  { label: 'Operations',  color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
}
