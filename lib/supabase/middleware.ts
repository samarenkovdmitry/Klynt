import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const SESSION_USER_ID_HEADER = 'x-klynt-user-id'
export const SESSION_USER_EMAIL_HEADER = 'x-klynt-user-email'

// Strips spoofable internal headers; updateSession re-adds them only
// after a verified getUser(). Downstream handlers may trust them.
export function sanitizeInternalHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers)
  headers.delete(SESSION_USER_ID_HEADER)
  headers.delete(SESSION_USER_EMAIL_HEADER)
  return headers
}

export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  const pendingCookies: { name: string; value: string; options?: any }[] = []
  const pendingHeaders = new Map<string, string>()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach((c) => pendingCookies.push(c))
          Object.entries(headers).forEach(([key, value]) => {
            pendingHeaders.set(key, value)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    requestHeaders.set(SESSION_USER_ID_HEADER, user.id)
    if (user.email) requestHeaders.set(SESSION_USER_EMAIL_HEADER, user.email)
  }

  const supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  pendingCookies.forEach(({ name, value, options }) => {
    supabaseResponse.cookies.set(name, value, options)
  })
  pendingHeaders.forEach((value, key) => {
    supabaseResponse.headers.set(key, value)
  })

  return { user, response: supabaseResponse }
}
