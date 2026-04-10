'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setSent(true); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-pbl-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-serif text-6xl text-pbl-maroon mb-4 select-none">Φ</div>
          <h1 className="font-serif text-2xl font-bold text-pbl-cream">PBL Markets</h1>
          <p className="text-pbl-faint mt-1 text-sm">De Anza Phi Beta Lambda · Spring 2026</p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 bg-[rgba(250,78,29,0.12)] border border-[rgba(250,78,29,0.3)] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-pbl-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-semibold text-pbl-cream mb-1">Check your email</h2>
              <p className="text-sm text-pbl-muted">Magic link sent to <strong className="text-pbl-cream">{email}</strong></p>
              <button onClick={() => { setSent(false); setEmail('') }} className="mt-4 text-sm text-pbl-faint hover:text-pbl-muted transition-colors">
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-semibold text-pbl-cream mb-1">Sign in</h2>
              <p className="text-sm text-pbl-muted mb-5">Enter your email to receive a magic link.</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="email" className="input" placeholder="you@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                {error && <p className="text-xs text-[#E06060] bg-[rgba(121,0,0,0.15)] border border-[rgba(121,0,0,0.3)] rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" className="btn-primary w-full py-2.5" disabled={loading || !email}>
                  {loading ? 'Sending...' : 'Send magic link'}
                </button>
              </form>
              <p className="text-xs text-pbl-faint text-center mt-4">
                PBL members only · Contact an officer if you need access
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
