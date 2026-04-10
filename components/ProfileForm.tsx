'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileForm({ currentName }: { currentName: string }) {
  const router = useRouter()
  const [name, setName]       = useState(currentName)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess(false)
    const res  = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name.trim() }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Failed to update') }
    else {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const unchanged = name.trim() === currentName

  return (
    <form onSubmit={save} className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold text-pbl-faint uppercase tracking-widest mb-1.5">
          Display name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input"
          required
          minLength={2}
          maxLength={50}
          placeholder="Your full name"
        />
        <p className="text-[11px] text-pbl-faint mt-1.5">
          This is how you appear on the leaderboard and in trade history.
        </p>
      </div>
      {error   && <p className="text-xs text-[#C04040] bg-[rgba(192,64,64,0.1)] border border-[rgba(192,64,64,0.25)] rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-xs text-pbl-orange bg-[rgba(250,78,29,0.1)] border border-[rgba(250,78,29,0.25)] rounded-lg px-3 py-2">Name updated successfully</p>}
      <button
        type="submit"
        disabled={loading || !name.trim() || unchanged}
        className="btn-primary w-full py-2.5"
      >
        {loading ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}
