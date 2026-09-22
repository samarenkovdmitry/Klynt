'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type InviteState =
  | { status: 'loading' }
  | { status: 'ready'; projectName: string; email: string; loggedIn: boolean }
  | { status: 'error'; message: string }

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = String(params.token)
  const [state, setState] = useState<InviteState>({ status: 'loading' })
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [inviteRes, supabase] = [await fetch(`/api/invites/${token}`), createClient()]
      const json = await inviteRes.json().catch(() => ({}))
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!inviteRes.ok) {
        setState({ status: 'error', message: json.error || 'Invite not found' })
      } else {
        setState({ status: 'ready', projectName: json.projectName, email: json.email, loggedIn: !!user })
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  const accept = async () => {
    setAccepting(true)
    const res = await fetch(`/api/invites/${token}`, { method: 'POST' })
    const json = await res.json().catch(() => ({}))
    if (res.ok && json.slug) {
      router.push(`/project/${json.slug}`)
    } else {
      setState({ status: 'error', message: json.error || 'Failed to accept invite' })
    }
    setAccepting(false)
  }

  const next = `/invite/${token}`

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="absolute inset-x-0 top-0">
        <div className="mx-auto w-full max-w-7xl px-6 py-4">
          <Link href="/">
            <img src="/Klynt_logo.svg" alt="Klynt" className="h-8 w-auto" />
          </Link>
        </div>
      </div>
      <div className="w-full max-w-sm text-center">
        {state.status === 'loading' && (
          <p className="text-sm text-ink-secondary">Loading invite…</p>
        )}

        {state.status === 'error' && (
          <>
            <h1 className="mb-3 text-2xl font-semibold text-ink">Invite unavailable</h1>
            <p className="mb-6 text-sm text-ink-secondary">{state.message}</p>
            <Link href="/project" className="text-sm font-medium text-[var(--accent-link)] hover:underline">
              Go to projects
            </Link>
          </>
        )}

        {state.status === 'ready' && (
          <>
            <h1 className="mb-3 text-2xl font-semibold text-ink">
              Join {state.projectName}
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-ink-secondary">
              You've been invited to follow the truth of this project on Klynt —
              what changed, what's approved, what needs attention.
            </p>
            {state.loggedIn ? (
              <button
                onClick={accept}
                disabled={accepting}
                className="w-full rounded-full bg-[var(--accent)] px-6 py-4 text-base font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {accepting ? 'Joining…' : 'Accept invite'}
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/register?next=${encodeURIComponent(next)}`}
                  className="block w-full rounded-full bg-[var(--accent)] px-6 py-4 text-base font-medium text-[var(--accent-fg)] transition duration-200 hover:bg-[var(--accent-hover)]"
                >
                  Sign up to join
                </Link>
                <Link
                  href={`/login?next=${encodeURIComponent(next)}`}
                  className="block text-sm font-medium text-[var(--accent-link)] transition hover:underline"
                >
                  Already have an account? Log in
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
