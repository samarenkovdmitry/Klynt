import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/auth/confirm',
  '/terms',
  '/privacy',
  '/robots.txt',
  '/favicon.ico',
  '/klynt-logo-dark.svg',
  '/manifest.webmanifest',
  '/fonts',
])

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  if (pathname.startsWith('/_next/')) return true
  // Static assets served from /public
  if (/\.(png|jpe?g|svg|gif|webp|avif|ico|webmanifest|txt|xml|woff2?|mp4|webm)$/i.test(pathname)) return true
  if (pathname.startsWith('/api/waitlist/')) return true
  if (pathname.startsWith('/api/webhooks/')) return true
  if (pathname.startsWith('/api/integrations/')) return true
  return false
}

export async function middleware(request: NextRequest) {
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const { user, response } = await updateSession(request)

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}
