'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FloatingInput } from '@/components/ui/FloatingInput'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
    } else {
      const next = new URLSearchParams(window.location.search).get('next')
      router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/project')
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="absolute inset-x-0 top-0">
        <div className="mx-auto w-full max-w-7xl px-6 py-4">
          <Link href="/">
            <img
              src="/Klynt_logo.svg"
              alt="Klynt"
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">Log in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FloatingInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            required
            autoComplete="email"
          />

          <FloatingInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            required
            autoComplete="current-password"
            size="lg"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--accent)] px-6 py-4 text-base font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-[var(--accent-link)] transition hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
