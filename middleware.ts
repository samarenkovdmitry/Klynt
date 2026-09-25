import { type NextRequest, NextResponse } from 'next/server'
import { updateSession, sanitizeInternalHeaders } from '@/lib/supabase/middleware'

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
  if (pathname.startsWith('/invite/')) return true
  if (pathname.startsWith('/api/waitlist/')) return true
  // Invite info lookup is public; accept does its own session check
  if (pathname.startsWith('/api/invites/')) return true
  if (pathname.startsWith('/api/webhooks/')) return true
  if (pathname.startsWith('/api/integrations/')) return true
  // Job endpoints do their own auth (CRON_SECRET bearer or session)
  if (pathname.startsWith('/api/jobs/')) return true
  return false
}

export async function middleware(request: NextRequest) {
  // Internal session headers are only ever set by updateSession —
  // always strip client-supplied values first, even on public routes.
  const requestHeaders = sanitizeInternalHeaders(request)

  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const { user, response } = await updateSession(request, requestHeaders)

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return response
}
