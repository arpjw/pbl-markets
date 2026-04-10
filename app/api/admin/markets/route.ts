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

  const body = await request.json()
  const { title, description, category, closes_at, yes_pool = 200, no_pool = 200 } = body

  if (!title || !category || !closes_at) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: market, error } = await supabase
    .from('markets')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      category,
      closes_at: new Date(closes_at).toISOString(),
      yes_pool: Math.max(0, parseInt(yes_pool) || 200),
      no_pool: Math.max(0, parseInt(no_pool) || 200),
      created_by: user.id,
      resolved: false,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, market })
}
