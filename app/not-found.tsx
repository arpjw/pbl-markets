import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pbl-bg flex items-center justify-center px-4">
      <div className="text-center">
        <span className="font-serif text-8xl text-pbl-border block mb-6 select-none">Φ</span>
        <h1 className="text-2xl font-bold text-pbl-cream mb-2">Page not found</h1>
        <p className="text-pbl-muted text-sm mb-8 max-w-sm mx-auto">
          This page doesn't exist or the market may have been removed.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/markets"
            className="bg-pbl-maroon hover:bg-pbl-maroon-2 text-pbl-cream text-sm font-medium rounded-lg px-5 py-2.5 transition-colors">
            Browse markets
          </Link>
          <Link href="/"
            className="border border-pbl-border hover:border-pbl-border-2 text-pbl-muted hover:text-pbl-cream text-sm font-medium rounded-lg px-5 py-2.5 transition-colors">
            Go home
          </Link>
        </div>
        <p className="text-[11px] text-pbl-faint mt-8">
          De Anza Phi Beta Lambda · PBL Markets
        </p>
      </div>
    </div>
  )
}
