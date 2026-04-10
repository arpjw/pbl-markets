import { createClient } from '@/lib/supabase/server'

export const revalidate = 30

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profiles }  = await supabase
    .from('profiles').select('id, full_name, role, points_balance')
    .order('points_balance', { ascending: false })

  const ranked  = profiles ?? []
  const userRank = ranked.findIndex(p => p.id === user?.id) + 1

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-pbl-cream">Leaderboard</h1>
          <p className="text-sm text-pbl-faint mt-0.5">{ranked.length} members · Spring 2026</p>
        </div>
        {userRank > 0 && (
          <div className="text-right">
            <p className="text-xs text-pbl-faint">Your rank</p>
            <p className="text-2xl font-bold text-pbl-orange">#{userRank}</p>
          </div>
        )}
      </div>

      {ranked.length > 2 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[ranked[1], ranked[0], ranked[2]].map((p, i) => {
            if (!p) return <div key={i} />
            const r = i === 0 ? 2 : i === 1 ? 1 : 3
            const podiumPad = r === 1 ? 'pt-2' : 'pt-6'
            const borderCls = r === 1
              ? 'border-pbl-orange bg-[rgba(250,78,29,0.06)]'
              : r === 2
              ? 'border-pbl-border'
              : 'border-pbl-border'
            const rankColor = r === 1 ? 'text-pbl-orange' : r === 2 ? 'text-pbl-muted' : 'text-pbl-warm'
            return (
              <div key={p.id} className={`card border ${borderCls} p-4 text-center flex flex-col items-center ${podiumPad}`}>
                <div className={`text-xl font-black mb-2 font-serif ${rankColor}`}>{r === 1 ? '1st' : r === 2 ? '2nd' : '3rd'}</div>
                <div className="w-9 h-9 rounded-full bg-pbl-card-2 border border-pbl-border flex items-center justify-center text-xs font-bold text-pbl-muted mb-2">
                  {p.full_name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-pbl-cream leading-tight">{p.full_name.split(' ')[0]}</p>
                {p.role && <p className="text-[10px] text-pbl-faint mt-0.5 truncate w-full">{p.role}</p>}
                <p className="text-sm font-bold text-pbl-cream mt-2">{p.points_balance.toLocaleString()}</p>
                <p className="text-[10px] text-pbl-faint">pts</p>
              </div>
            )
          })}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-pbl-border grid grid-cols-12 text-[11px] font-medium text-pbl-faint uppercase tracking-wide">
          <span className="col-span-1">#</span>
          <span className="col-span-7">Member</span>
          <span className="col-span-4 text-right">Balance</span>
        </div>
        <div className="divide-y divide-pbl-border">
          {ranked.map((profile, i) => {
            const isYou = profile.id === user?.id
            const rank  = i + 1
            const init  = profile.full_name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()
            return (
              <div key={profile.id} className={`px-4 py-3 grid grid-cols-12 items-center gap-2 ${isYou ? 'bg-[rgba(121,0,0,0.12)]' : 'hover:bg-pbl-card-2'} transition-colors`}>
                <span className={`col-span-1 text-sm font-bold ${rank === 1 ? 'text-pbl-orange' : rank <= 3 ? 'text-pbl-warm' : 'text-pbl-faint'}`}>{rank}</span>
                <div className="col-span-7 flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${isYou ? 'bg-pbl-maroon text-pbl-cream' : 'bg-pbl-card-2 text-pbl-muted'}`}>{init}</div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${isYou ? 'text-pbl-orange' : 'text-pbl-cream'}`}>
                      {profile.full_name}{isYou ? ' (you)' : ''}
                    </p>
                    {profile.role && <p className="text-[11px] text-pbl-faint truncate">{profile.role}</p>}
                  </div>
                </div>
                <div className="col-span-4 text-right">
                  <span className={`text-sm font-bold ${isYou ? 'text-pbl-orange' : 'text-pbl-cream'}`}>
                    {profile.points_balance.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-pbl-faint ml-1">pts</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
