'use client'

import Link from 'next/link'
import { AuthForm } from '@/components/AuthForm'
import { t } from '@/lib/i18n'
import { logoSrc } from '@/lib/market'

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="absolute inset-x-0 top-0">
        <div className="mx-auto w-full max-w-7xl px-6 py-4">
          <Link href="/">
            <img
              src={logoSrc()}
              alt="Klynt"
              className="h-7 w-auto"
            />
          </Link>
        </div>
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">{t('landing.signup')}</h1>
        </div>

        <AuthForm mode="register" />
      </div>
    </div>
  )
}
