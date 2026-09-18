'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import LandingPreview from '@/components/LandingPreview'
import { FigmaIcon, SlackIcon } from '@/components/icons/BrandIcons'
import { siNotion, siGmail, siGoogledrive, siZoom, siLinear } from 'simple-icons'

function SiIcon({ icon, size = 16 }: { icon: { path: string; hex: string; title: string }; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={`#${icon.hex}`} role="img" aria-label={icon.title}>
      <path d={icon.path} />
    </svg>
  )
}

const PREVIEW_WIDTH = 1100
const PREVIEW_HEIGHT = 680

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const mobilePreviewRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0)

  const heroPreviewRef = useRef<HTMLDivElement>(null)
  const [heroScale, setHeroScale] = useState(0.6)

  useEffect(() => {
    const el = mobilePreviewRef.current
    if (!el) return
    const update = () => setPreviewScale(el.clientWidth / PREVIEW_WIDTH)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = heroPreviewRef.current
    if (!el) return
    const update = () => setHeroScale(el.clientWidth / PREVIEW_WIDTH)
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
        setMessage(data.error || 'Something went wrong. Please try again.')
      } else {
        setStatus('success')
        setMessage('Thanks! We will be in touch.')
        setEmail('')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream">
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/">
          <img
            src="/klynt-logo-dark.svg"
            alt="Klynt"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-black/5 hover:text-[var(--accent-link)]"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] shadow-sm transition hover:bg-[var(--accent-hover)] hover:shadow"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="relative flex-1">

        {/* Brand material — behind the product UI, alpha-faded into the cream canvas.
            Mobile/tablet: stone band along the bottom. Desktop: full-height right composition. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[74%]">
          <img
            src="/klynt-hero-bg.jpg"
            alt=""
            className="h-full w-full object-cover object-right-bottom [mask-image:linear-gradient(to_bottom,transparent,black_30%)] lg:object-right lg:[mask-image:linear-gradient(to_right,transparent,black_20%)]"
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-10 lg:min-h-[680px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:pt-4">
          {/* Left: copy + capture */}
          <div className="relative z-10 max-w-xl pt-6">
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Know what&apos;s actually true about your project.
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-secondary">
              Klynt connects your tools, gathers what matters, and keeps
              everyone aligned on the current state of your project.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 w-full max-w-lg">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-16 w-full rounded-full border border-line bg-field pl-7 pr-48 text-lg text-ink outline-none transition placeholder:text-ink-faint focus:border-[var(--accent-link)] focus:bg-white focus:shadow-[inset_0_0_0_1px_var(--accent-link)]"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute bottom-2 right-2 top-2 inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 text-base font-medium text-[var(--accent-fg)] transition duration-200 hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === 'loading' ? 'Joining...' : 'Get early access'}
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
              Closed beta. Already in?{' '}
              <Link href="/login" className="font-medium text-[var(--accent-link)] hover:underline">
                Log in
              </Link>
            </p>

            <div className="mt-12 flex items-center gap-4">
              <FigmaIcon size={17} />
              <SlackIcon size={17} />
              <span className="flex items-center gap-4 opacity-30 grayscale">
                <SiIcon icon={siNotion} />
                <SiIcon icon={siGmail} />
                <SiIcon icon={siGoogledrive} />
                <SiIcon icon={siZoom} />
                <SiIcon icon={siLinear} />
              </span>
              <span className="text-xs text-ink-faint">coming soon</span>
            </div>
          </div>

          {/* Right: tilted product preview + floating signals */}
          <div ref={heroPreviewRef} className="relative hidden min-h-[600px] self-stretch lg:block">
            <div className="absolute inset-0">
              <div
                className="absolute right-0 top-1/2 w-[1100px]"
                style={{
                  transform: `translateY(-50%) scale(${heroScale})`,
                  transformOrigin: 'right center',
                }}
              >
                <LandingPreview />
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

      <footer className="relative border-t border-ink/10 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-ink-muted md:flex-row">
          <p>© 2026 Klynt</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[var(--accent-link)]">Terms</Link>
            <Link href="/privacy" className="hover:text-[var(--accent-link)]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
