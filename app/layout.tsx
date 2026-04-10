import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'PBL Markets — De Anza Phi Beta Lambda',
  description: 'Prediction markets for De Anza PBL chapter outcomes',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, points_balance, is_admin, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col bg-pbl-bg">
          {user && <Nav profile={profile} />}
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
