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
