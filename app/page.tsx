'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import LandingPreview from '@/components/LandingPreview'
import { FigmaIcon, LinearIcon, SlackIcon, TelegramIcon } from '@/components/icons/BrandIcons'
import { t, getLocale } from '@/lib/i18n'
import { logoSrc } from '@/lib/market'
import { RiShieldCheckLine, RiArrowRightUpLine } from '@remixicon/react'

const PREVIEW_WIDTH = 1100
const PREVIEW_HEIGHT = 680

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const mobilePreviewRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0)

  const heroPreviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mobilePreviewRef.current
    if (!el) return
    const update = () => setPreviewScale(el.clientWidth / PREVIEW_WIDTH)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')

    try {
      const res = await fetch('/api/waitlist/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || t('landing.error'))
      } else {
        setStatus('success')
        setMessage(t('landing.success'))
        setEmail('')
      }
    } catch {
      setStatus('error')
      setMessage(t('landing.error'))
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-cream">
      {/* Brand material — behind everything, spans the full page incl. header/footer.
          Mobile/tablet: stone band along the bottom. Desktop: full-height right composition. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden md:h-[55%] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[74%]">
        <img
          src="/klynt-hero-bg-2.png"
          alt=""
          className="h-full w-full object-cover object-right-bottom [mask-image:linear-gradient(to_bottom,transparent,black_35%)] md:origin-bottom-right md:scale-[1.25] lg:origin-center lg:scale-100 lg:object-right lg:[mask-image:linear-gradient(to_right,transparent,black_20%)]"
        />
      </div>

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/">
          <img
            src={logoSrc()}
            alt="Klynt"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-black/5 hover:text-[var(--accent-link)]"
          >
            {t('landing.login')}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] shadow-sm transition hover:bg-[var(--accent-hover)] hover:shadow"
          >
            {t('landing.signup')}
          </Link>
        </div>
      </header>

      <main className="relative flex-1">

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-10 lg:min-h-[680px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:pt-4">
          {/* Left: copy + capture */}
          <div className="relative z-10 max-w-xl pt-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-ink-muted">{t('landing.eyebrow')}</p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              {t('landing.h1')}
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-secondary">
              {t('landing.sub')}
            </p>

            <form onSubmit={handleSubmit} className="mt-9 w-full max-w-lg">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('landing.emailPlaceholder')}
                  required
                  className="h-16 w-full rounded-full border border-line bg-field pl-7 pr-48 text-lg text-ink outline-none transition placeholder:text-ink-faint focus:border-[var(--accent-link)] focus:bg-white focus:shadow-[inset_0_0_0_1px_var(--accent-link)]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute bottom-2 right-2 top-2 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 text-base font-medium text-[var(--accent-fg)] transition duration-200 hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === 'loading' ? t('landing.submitting') : t('landing.submit')}
                </button>
              </div>
            </form>

            {status === 'success' && (
              <p className="mt-3 text-sm text-green-700">{message}</p>
            )}
            {status === 'error' && (
              <p className="mt-3 text-sm text-red-600">{message}</p>
            )}

            <p className="mt-5 text-sm text-ink-muted">
              {t('landing.ctaHint')} {t('landing.alreadyIn')}{' '}
              <Link href="/login" className="font-medium text-[var(--accent-link)] hover:underline">
                {t('landing.login')}
              </Link>
            </p>

            <p className="mt-4 flex max-w-md items-start gap-2 text-xs leading-snug text-ink-faint">
              <RiShieldCheckLine size={15} className="mt-[1px] shrink-0" />
              <span>
                {t('landing.trustLine')}{' '}
                <Link
                  href="/security"
                  className="inline-flex items-center gap-0.5 font-medium text-[var(--accent-link)] hover:underline"
                >
                  {t('landing.learnMore')}
                  <RiArrowRightUpLine size={12} />
                </Link>
              </span>
            </p>

            <div className="mt-12 flex items-center gap-4">
              {getLocale() === 'ru' ? (
                <TelegramIcon size={17} />
              ) : (
                <>
                  <FigmaIcon size={17} />
                  <LinearIcon size={17} />
                  <SlackIcon size={17} />
                </>
              )}
            </div>
          </div>

          {/* Right: one focused story — agreed fact → new event → decision needed */}
          <div ref={heroPreviewRef} className="relative hidden min-h-[600px] self-stretch lg:block">
            <div className="absolute inset-0 flex items-center justify-end pr-6">
              <div className="w-[360px]">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-ink-faint">Example project</p>

                <div className="rounded-2xl border border-line bg-white px-5 py-4 shadow-sm">
                  <p className="text-[17px] font-semibold leading-snug text-ink">Pricing block</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400 align-middle" />
                    Approved · mobile only
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
                    <SlackIcon size={12} />
                    <span>Slack · Anna · 2d ago</span>
                  </div>
                </div>

                <div className="my-4 flex items-start gap-2.5 rounded-2xl border border-line/70 bg-white/60 px-4 py-3">
                  <SlackIcon size={14} />
                  <p className="text-sm leading-snug text-ink-muted">
                    <span className="font-medium text-ink-secondary">Anna:</span> actually, remove the pricing block
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-white px-5 py-4 shadow-sm">
                  <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                    Needs decision
                  </span>
                  <p className="mt-2 text-sm text-ink-muted">
                    Approved → <span className="font-medium text-ink">Removal requested</span>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-ink-secondary">Keep current</span>
                    <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent-fg)]">Accept change</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scaled-down desktop preview for smaller screens */}
        <div className="px-4 pb-16 lg:hidden">
          <div
            ref={mobilePreviewRef}
            className="relative overflow-hidden"
            style={{ height: previewScale ? `${Math.round(PREVIEW_HEIGHT * previewScale)}px` : 'auto' }}
          >
            <div
              className="origin-top-left"
              style={{
                width: PREVIEW_WIDTH,
                transform: `scale(${previewScale})`,
                visibility: previewScale ? 'visible' : 'hidden',
              }}
            >
              <LandingPreview />
            </div>
          </div>
        </div>

      </main>

      <footer className="relative z-10 bg-white/75 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-ink-muted md:flex-row">
          <p>© 2026 Klynt</p>
          <div className="flex items-center gap-4">
            <a href="mailto:hello@klynt.one" className="hover:text-[var(--accent-link)]">hello@klynt.one</a>
            <Link href="/terms" className="hover:text-[var(--accent-link)]">{t('landing.terms')}</Link>
            <Link href="/privacy" className="hover:text-[var(--accent-link)]">{t('landing.privacy')}</Link>
            <Link href="/security" className="hover:text-[var(--accent-link)]">{t('landing.security')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
