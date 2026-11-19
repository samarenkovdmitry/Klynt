'use client'

import { useEffect } from 'react'
import { RiCloseLine } from '@remixicon/react'
import { AuthForm, type AuthMode } from '@/components/AuthForm'
import { t } from '@/lib/i18n'

type AuthModalProps = {
  mode: AuthMode
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
}

export default function AuthModal({ mode, onClose, onModeChange }: AuthModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    const prevDocOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      document.documentElement.style.overflow = prevDocOverflow
    }
  }, [onClose])

  return (
    <div
      className="share-backdrop-enter fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-cream/75 p-4 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? t('landing.login') : t('landing.signup')}
        className="share-dialog-enter relative w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('auth.close')}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-fill hover:text-ink-secondary"
        >
          <RiCloseLine size={20} />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="flex rounded-lg bg-fill p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onModeChange(m)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  mode === m
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {m === 'login' ? t('landing.login') : t('landing.signup')}
              </button>
            ))}
          </div>
        </div>

        <AuthForm mode={mode} onSuccess={onClose} onSwitchMode={onModeChange} />
      </div>
    </div>
  )
}
