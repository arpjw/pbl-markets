'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavProps {
  profile: { full_name: string; points_balance: number; is_admin: boolean; role: string | null } | null
}

const LINKS = [
  { href: '/markets',     label: 'Markets' },
  { href: '/portfolio',   label: 'Portfolio' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

export default function Nav({ profile }: NavProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="bg-pbl-card/80 backdrop-blur border-b border-pbl-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-[52px] flex items-center justify-between gap-6">

        <div className="flex items-center gap-5">
          <Link href="/markets" className="flex items-center gap-2 shrink-0 select-none">
            <span className="font-serif text-[22px] text-pbl-maroon leading-none">Φ</span>
            <div className="hidden sm:flex items-baseline gap-1.5">
              <span className="font-serif text-[13px] font-bold text-pbl-cream tracking-wide">PBL</span>
              <span className="text-pbl-faint text-[10px] font-medium tracking-[0.15em] uppercase">Markets</span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center">
            {LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`px-3 py-1 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname.startsWith(href) ? 'text-pbl-cream' : 'text-pbl-muted hover:text-pbl-cream'
                }`}>
                {label}
              </Link>
            ))}
            {profile?.is_admin && (
              <Link href="/admin"
                className={`px-3 py-1 rounded-lg text-[13px] font-medium transition-colors ${
                  pathname.startsWith('/admin') ? 'text-pbl-orange' : 'text-pbl-faint hover:text-pbl-orange'
                }`}>
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden sm:flex items-baseline gap-1 bg-pbl-bg border border-pbl-border rounded-lg px-3 py-1.5">
              <span className="text-[13px] font-semibold text-pbl-cream tabular-nums">{profile.points_balance.toLocaleString()}</span>
              <span className="text-[10px] text-pbl-faint font-medium">pts</span>
            </div>
          )}
          {profile && (
            <Link href="/profile"
              className={`text-[13px] hidden sm:block truncate max-w-[120px] transition-colors ${
                pathname.startsWith('/profile') ? 'text-pbl-orange' : 'text-pbl-muted hover:text-pbl-cream'
              }`}>
              {profile.full_name.split(' ')[0]}
            </Link>
          )}
          <button onClick={signOut}
            className="text-[11px] text-pbl-faint hover:text-pbl-muted border border-pbl-border hover:border-pbl-border-2 rounded-lg px-2.5 py-1.5 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      <nav className="sm:hidden flex border-t border-pbl-border">
        {[...LINKS, { href: '/profile', label: 'Profile' }].map(({ href, label }) => (
          <Link key={href} href={href}
            className={`flex-1 text-center py-2 text-[11px] font-medium transition-colors ${
              pathname.startsWith(href) ? 'text-pbl-orange border-b border-pbl-orange' : 'text-pbl-faint'
            }`}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
