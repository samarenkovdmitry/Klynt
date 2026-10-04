import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/project'

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = createClient()

  // Magic links are single-use — if this browser is already signed in
  // (e.g. the link was clicked once before), just continue to `next`.
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return NextResponse.redirect(new URL(next, request.url))
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any,
  })

  if (error) {
    console.error('[auth/confirm]', error)
    return NextResponse.redirect(new URL('/login?error=confirm', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
