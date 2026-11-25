'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AuthModal from '@/components/AuthModal'
import type { AuthMode } from '@/components/AuthForm'
import LandingPreview from '@/components/LandingPreview'
import { FigmaIcon, LinearIcon, SlackIcon, TelegramIcon } from '@/components/icons/BrandIcons'
import { t } from '@/lib/i18n'
import { logoSrc } from '@/lib/market'
import { RiArrowRightUpLine } from '@remixicon/react'

const PREVIEW_WIDTH = 1100
const PREVIEW_HEIGHT = 680

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function PreviewSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-white">
      <div className="flex h-[8%] items-center gap-2 border-b border-line bg-white px-4">
        <div className="h-2.5 w-14 rounded bg-fill" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-2.5 w-10 rounded bg-fill" />
          <div className="h-2.5 w-10 rounded bg-fill" />
          <div className="h-3 w-3 rounded-full bg-fill" />
        </div>
      </div>
      <div className="flex flex-1 gap-4 bg-app-bg p-4">
        <div className="flex-[1.7] space-y-3">
          <div className="h-3 w-28 rounded bg-line/70" />
          <div className="h-2 w-40 rounded bg-line/50" />
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg border border-line bg-white" />
            ))}
          </div>
          <div className="h-2.5 w-32 rounded bg-line/50 pt-1" />
          <div className="space-y-2 pt-1">
            <div className="h-8 rounded-lg bg-white" />
            <div className="h-8 rounded-lg bg-white" />
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          <div className="h-2.5 w-24 rounded bg-line/50" />
          <div className="h-24 rounded-lg border border-line bg-white" />
          <div className="h-24 rounded-lg border border-line bg-white" />
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  const heroPreviewRef = useRef<HTMLDivElement>(null)
  const [heroScale, setHeroScale] = useState(0)
  const mobilePreviewRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0)

  // Measure before paint so the preview renders at its final scale — no visible
  // grow-from-small jump on load.
  useIsomorphicLayoutEffect(() => {
    const el = heroPreviewRef.current
    if (!el) return
    const update = () => setHeroScale(el.clientWidth / PREVIEW_WIDTH)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useIsomorphicLayoutEffect(() => {
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
      {/* Pixel fields and decision paths frame the content without crossing it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[760px] bg-[url('/klynt-decision-lines.svg')] bg-[length:100%_100%] bg-no-repeat lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[340px] bg-[url('/klynt-footer-lines.svg')] bg-[length:100%_100%] bg-no-repeat lg:block"
      />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/">
          <img
            src={logoSrc()}
            alt="Klynt"
            className="h-7 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-black/5 hover:text-[var(--accent-link)]"
          >
            {t('landing.login')}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] shadow-sm transition hover:bg-[var(--accent-hover)] hover:shadow"
          >
            {t('landing.signup')}
          </button>
        </div>
      </header>

      <main className="relative flex-1">

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-10 lg:pt-4">
          {/* Centered: copy + capture, dashboard preview below */}
          <div className="relative z-10 mx-auto max-w-2xl pt-6 text-center">
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              {t('landing.h1')}
              <br />
              {t('landing.h1.line2')}
            </h1>

            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-ink-secondary">
              {t('landing.sub')}
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-9 w-full max-w-lg text-left">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('landing.emailPlaceholder')}
                  required
                  className="h-16 w-full rounded-2xl border-2 border-[var(--accent-link)] bg-white pl-6 pr-48 text-lg text-ink outline-none transition placeholder:text-ink-faint hover:border-[var(--accent-hover)] focus:border-[var(--accent-hover)]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute bottom-2 right-2 top-2 inline-flex items-center justify-center rounded-lg bg-[var(--accent)] px-6 text-base font-medium text-[var(--accent-fg)] transition duration-200 hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
              {t('landing.ctaHint')}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2.5 text-xs leading-snug text-ink-faint">
              <span className="flex shrink-0 items-center gap-2">
                <>
                  <FigmaIcon size={15} />
                  <SlackIcon size={15} />
                  <TelegramIcon size={15} />
                  <LinearIcon size={15} />
                </>
              </span>
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
            </div>
          </div>

          {/* Dashboard preview centered below the copy */}
          <div ref={heroPreviewRef} className="relative mx-auto mt-14 hidden max-w-5xl lg:block">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 left-1/2 top-0 w-screen -translate-x-1/2 bg-[url('/klynt-preview-lines.svg')] bg-[length:100%_100%] bg-no-repeat"
            />
            <div
              className="relative overflow-hidden rounded-xl drop-shadow-[0_20px_40px_rgba(27,26,23,0.10)]"
              style={
                heroScale
                  ? { height: `${Math.round(PREVIEW_HEIGHT * heroScale)}px` }
                  : { aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}` }
              }
            >
              {heroScale > 0 ? (
                <div
                  className="absolute left-1/2 top-0 w-[1100px]"
                  style={{
                    transform: `translateX(-50%) scale(${heroScale})`,
                    transformOrigin: 'top center',
                  }}
                >
                  <LandingPreview />
                </div>
              ) : (
                <PreviewSkeleton />
              )}
            </div>
          </div>
        </div>

        {/* Mobile: same story — scaled dashboard, pixel fields framing it */}
        <div className="relative px-4 pb-16 lg:hidden">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 right-0 h-48 w-32"
            viewBox="0 0 128 192"
            fill="none"
          >
            <defs>
              <pattern id="m-dense" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M0 0H4V4H0ZM4 4H8V8H4Z" fill="#39765F" />
              </pattern>
              <pattern id="m-sparse" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M4 4H6V6H4ZM16 16H18V18H16Z" fill="#39765F" />
              </pattern>
            </defs>
            <path d="M128 8V56Q128 72 112 72H88Q72 72 72 88V104Q72 120 88 120H128" stroke="#C9C5BA" strokeOpacity=".6" />
            <path d="M128 24H88V56H56V88H24V120H48V152H80V120H112V88H128Z" fill="url(#m-dense)" opacity=".22" />
            <path d="M128 64H96V88H64V112H40V136H64V160H88V136H128Z" fill="url(#m-sparse)" opacity=".35" />
            <path d="M24 88H48V112H24Z" fill="url(#m-sparse)" opacity=".3" />
            <rect x="96" y="36" width="16" height="16" fill="#39765F" opacity=".5" />
            <rect x="112" y="36" width="8" height="16" fill="#CDD780" opacity=".65" />
            <rect x="80" y="52" width="8" height="8" fill="#39765F" opacity=".35" />
            <path d="M72 69L75 72L72 75L69 72Z" fill="#39765F" opacity=".55" />
          </svg>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-0 h-44 w-28"
            viewBox="0 0 112 176"
            fill="none"
          >
            <defs>
              <pattern id="m2-dense" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M0 0H4V4H0ZM4 4H8V8H4Z" fill="#39765F" />
              </pattern>
            </defs>
            <path d="M0 168V120Q0 104 16 104H40Q56 104 56 88V64" stroke="#C9C5BA" strokeOpacity=".55" />
            <path d="M0 48H32V80H64V112H32V144H0Z" fill="url(#m2-dense)" opacity=".2" />
            <path d="M0 96H24V128H56V160H0Z" fill="url(#m2-dense)" opacity=".09" />
            <rect x="12" y="56" width="14" height="14" fill="#39765F" opacity=".45" />
            <rect x="26" y="56" width="6" height="14" fill="#CDD780" opacity=".55" />
            <circle cx="56" cy="88" r="3" fill="#F7F5F0" stroke="#B8BAAE" strokeOpacity=".8" />
          </svg>
          <div
            ref={mobilePreviewRef}
            className="relative overflow-hidden rounded-xl drop-shadow-[0_20px_40px_rgba(27,26,23,0.10)]"
            style={
              previewScale
                ? { height: `${Math.round(PREVIEW_HEIGHT * previewScale)}px` }
                : { aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}` }
            }
          >
            {previewScale > 0 ? (
              <div
                className="origin-top-left"
                style={{
                  width: PREVIEW_WIDTH,
                  transform: `scale(${previewScale})`,
                }}
              >
                <LandingPreview />
              </div>
            ) : (
              <PreviewSkeleton />
            )}
          </div>

        </div>

      </main>

      <footer className="relative z-10 px-6 py-4">
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

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
        />
      )}
    </div>
  )
}
