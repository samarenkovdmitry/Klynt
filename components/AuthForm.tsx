'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signalRouteStart } from '@/components/RouteProgress'
import { FloatingInput } from '@/components/ui/FloatingInput'
import { RiMailCheckLine } from '@remixicon/react'
import { t } from '@/lib/i18n'

export type AuthMode = 'login' | 'register'

type AuthFormProps = {
  mode: AuthMode
  onSuccess?: () => void
  onSwitchMode?: (mode: AuthMode) => void
}

export function AuthForm({ mode, onSuccess, onSwitchMode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'register' && password !== confirmPassword) {
      setError(t('auth.passwordsMismatch'))
      return
    }

    setLoading(true)

    const next = new URLSearchParams(window.location.search).get('next')
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/project'

    if (mode === 'login') {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setLoading(false)
        setError(signInError.message)
      } else {
        signalRouteStart()
        onSuccess?.()
        router.push(safeNext)
      }
      return
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, next: safeNext }),
    })
    const data = await res.json().catch(() => ({}))

    setLoading(false)

    if (!res.ok) {
      setError(data.error || t('auth.emailSendFailed'))
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <RiMailCheckLine size={40} className="mx-auto text-ink-faint" />
        <p className="mt-4 text-lg font-semibold text-ink">{t('auth.checkEmailTitle')}</p>
        <p className="mt-2 text-sm text-ink-muted">{t('auth.checkEmailText', { email })}</p>
        {onSwitchMode ? (
          <button
            type="button"
            onClick={() => onSwitchMode('login')}
            className="mt-6 inline-block text-sm font-medium text-[var(--accent-link)] hover:underline"
          >
            {t('auth.backToLogin')}
          </button>
        ) : (
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-[var(--accent-link)] hover:underline"
          >
            {t('auth.backToLogin')}
          </Link>
        )}
      </div>
    )
  }

  const switchLabel = mode === 'login' ? t('landing.signup') : t('landing.login')
  const switchTarget = mode === 'login' ? 'register' : 'login'

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <FloatingInput
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label={t('auth.email')}
          required
          autoComplete="email"
        />

        <FloatingInput
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label={t('auth.password')}
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          size="lg"
        />

        {mode === 'register' && (
          <FloatingInput
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            label={t('auth.confirmPassword')}
            required
            autoComplete="new-password"
            size="lg"
          />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--accent)] px-6 py-4 text-base font-medium text-[var(--accent-fg)] transition duration-200 active:scale-[0.98] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? mode === 'login' ? t('auth.loggingIn') : t('auth.creating')
            : mode === 'login' ? t('landing.login') : t('landing.signup')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
        {onSwitchMode ? (
          <button
            type="button"
            onClick={() => onSwitchMode(switchTarget)}
            className="font-medium text-[var(--accent-link)] transition hover:underline"
          >
            {switchLabel}
          </button>
        ) : (
          <Link
            href={switchTarget === 'login' ? '/login' : '/register'}
            className="font-medium text-[var(--accent-link)] transition hover:underline"
          >
            {switchLabel}
          </Link>
        )}
      </p>
    </div>
  )
}
