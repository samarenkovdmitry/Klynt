'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FloatingInput } from '@/components/ui/FloatingInput'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const next = new URLSearchParams(window.location.search).get('next')
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/project'

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(safeNext)}`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
    } else {
      router.push(safeNext)
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
          <h1 className="text-2xl font-semibold text-ink">Sign up</h1>
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
            autoComplete="new-password"
            size="lg"
          />

          <FloatingInput
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label="Confirm password"
            required
            autoComplete="new-password"
            size="lg"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--accent)] px-6 py-4 text-base font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[var(--accent-link)] transition hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
