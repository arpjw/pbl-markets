import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'

export const metadata = { title: 'Profile — PBL Markets' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: positions }, { data: allProfiles }, { data: txns }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('positions').select('id, side, amount, markets(resolved)').eq('user_id', user.id),
    supabase.from('profiles').select('id').order('points_balance', { ascending: false }),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
  ])

  if (!profile) redirect('/auth/login')

  const rank        = (allProfiles ?? []).findIndex(p => p.id === user.id) + 1
  const openPos     = (positions ?? []).filter(p => !(p.markets as any)?.resolved).length
  const totalWagered = (positions ?? []).reduce((s, p) => s + p.amount, 0)
  const initials    = profile.full_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[18px] font-semibold text-pbl-cream">Profile</h1>
        <p className="text-[12px] text-pbl-faint mt-0.5">Manage your display name and view your stats</p>
      </div>

      {/* Avatar + identity */}
      <div className="card p-6 mb-4 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-pbl-maroon flex items-center justify-center text-xl font-bold text-pbl-cream shrink-0 font-serif">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-bold text-pbl-cream">{profile.full_name}</p>
          {profile.role && <p className="text-[12px] text-pbl-orange mt-0.5">{profile.role}</p>}
          <p className="text-[12px] text-pbl-faint mt-0.5">{profile.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ['Balance',   `${profile.points_balance.toLocaleString()} pts`],
          ['Rank',      `#${rank}`],
          ['Open bets', `${openPos}`],
          ['Wagered',   `${totalWagered.toLocaleString()} pts`],
        ].map(([label, value]) => (
          <div key={label} className="card p-3 text-center">
            <p className="text-[10px] text-pbl-faint mb-1 uppercase tracking-wide">{label}</p>
            <p className="text-[14px] font-bold text-pbl-cream">{value}</p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div className="card p-5 mb-4">
        <p className="text-[11px] font-semibold text-pbl-faint uppercase tracking-widest mb-4">Edit profile</p>
        <ProfileForm currentName={profile.full_name} />
      </div>

      {/* Recent transactions */}
      {(txns?.length ?? 0) > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-pbl-border">
            <p className="text-[11px] font-semibold text-pbl-faint uppercase tracking-widest">Recent activity</p>
          </div>
          <div className="divide-y divide-pbl-border">
            {txns!.map(t => (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-pbl-muted">{t.description ?? t.type}</p>
                  <p className="text-[10px] text-pbl-faint mt-0.5">
                    {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`text-[13px] font-bold ${t.amount >= 0 ? 'text-pbl-orange' : 'text-[#C04040]'}`}>
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
