import type { Metadata } from 'next';
import { RiCheckLine, RiEditLine, RiArrowRightSLine } from '@remixicon/react';

import { FigmaIcon, SlackIcon } from '@/components/icons/BrandIcons';
import Avatar from '@/components/Avatar';
import LandingPreview from '@/components/LandingPreview';

export const metadata: Metadata = {
  title: 'Font comparison — Klynt',
  robots: { index: false },
};

// Fonts are loaded via <link> below — next/font fetches at build time and a
// stalled download blocks dev-server compilation of the whole app.
const FONTS = [
  {
    id: 'general-sans',
    name: 'General Sans',
    note: 'Fontshare · neutral grotesque, similar to Inter/SF',
    fontFamily: "'General Sans', var(--font-instrument), sans-serif",
  },
  {
    id: 'instrument-sans',
    name: 'Instrument Sans (current)',
    note: 'Google Fonts · current brand font',
    fontFamily: 'var(--font-instrument)',
  },
  {
    id: 'sora',
    name: 'Sora',
    note: 'Google Fonts · geometric, tech-forward',
    fontFamily: "'Sora', var(--font-instrument), sans-serif",
  },
  {
    id: 'familjen',
    name: 'Familjen Grotesk',
    note: 'Google Fonts · previous brand font',
    fontFamily: "'Familjen Grotesk', var(--font-instrument), sans-serif",
  },
];

function FactCard({ label, pillStyle, subject, context, changes, ago, approved }: {
  label: string; pillStyle: string; subject: string; context?: string; changes?: number; ago?: string; approved?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-white px-4 py-3">
      <p className="text-[15px] font-semibold leading-snug text-ink">{subject}</p>
      <span className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyle}`}>
        {approved && <RiCheckLine size={11} />}
        {label}
      </span>
      {context && <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-muted line-clamp-2">{context}</p>}
      {changes && <p className="mt-auto pt-3 text-[11px] text-ink-faint">{changes} changes{ago ? ` · ${ago}` : ''}</p>}
    </div>
  );
}

function Specimen() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* Landing hero chunk */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Landing hero</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-[44px] sm:leading-[1.05]">
          Know what your project actually decided.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-secondary">
          Klynt watches Figma, Slack and docs, then tells you what changed, what's approved and what still needs a decision.
        </p>
        <div className="mt-6 flex max-w-md items-center gap-2">
          <div className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-faint">
            you@studio.com
          </div>
          <div className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[var(--accent-fg)]">
            Join waitlist
          </div>
        </div>
      </div>

      {/* Dashboard chunk */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Dashboard</p>
        <div className="rounded-2xl border border-line bg-fill-soft p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Lunar mobile</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
              <FigmaIcon size={11} /> Figma
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
              <SlackIcon size={11} /> Slack
            </span>
          </div>
          <p className="mt-1 text-[15px] text-ink-secondary">iOS & Android app redesign</p>
          <div className="mt-2.5 flex items-baseline justify-between gap-4">
            <p className="text-[13px] text-ink-muted">8 areas · 3 approved · 3 need review · 1 pending</p>
            <p className="text-xs text-ink-faint">Updated 8 min ago</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <FactCard
              subject="Avatar upload"
              label="Decision pending"
              pillStyle="bg-violet-50 text-violet-700"
              context="Designer added avatar upload, but PM marked it as out of scope."
              changes={11}
              ago="3d ago"
            />
            <FactCard
              subject="Checkout flow"
              label="Approved"
              pillStyle="bg-fill text-ink-secondary"
              context="Approved by Sarah · 2d ago"
              approved
            />
          </div>

          <div className="mt-4 rounded-xl border border-line bg-white p-3.5">
            <p className="mb-2 text-[13px] font-semibold text-ink-secondary">1 decision needs you</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tabular-nums text-line-strong">01</span>
              <p className="text-sm font-semibold text-ink">Dark mode</p>
              <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                Scope question
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
              Designer proposed dark mode screens. No decision in scope doc.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-auto flex items-center gap-0.5 text-xs font-medium leading-none text-ink-muted">
                View context
                <RiArrowRightSLine size={14} className="translate-y-px" />
              </span>
              <span className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)]">Accept</span>
              <span className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-secondary">Keep as is</span>
              <span className="px-2 py-1.5 text-xs font-medium text-ink-faint">Not sure</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Latest</p>
            <div className="flex items-center gap-3 border-t border-line-soft py-2.5">
              <span className="flex-shrink-0 text-ink-faint"><RiEditLine size={14} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">Reverted to blue app icon for now</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">App icon · modified</p>
              </div>
              <span className="flex flex-shrink-0 items-center gap-2 text-xs text-ink-faint">
                <span className="flex items-center gap-1">
                  <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                    <Avatar name="Anna" email="anna@acme.co" className="text-[8px]" />
                  </span>
                  Anna
                </span>
                <FigmaIcon size={14} />
                5d ago
              </span>
            </div>
            <div className="flex items-center gap-3 border-t border-line-soft py-2.5">
              <span className="flex-shrink-0 text-ink-faint"><RiCheckLine size={14} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">Typography approved</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">Typography · approved</p>
              </div>
              <span className="flex flex-shrink-0 items-center gap-2 text-xs text-ink-faint">
                <span className="flex items-center gap-1">
                  <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                    <Avatar name="Sarah" email="sarah@acme.co" className="text-[8px]" />
                  </span>
                  Sarah
                </span>
                <SlackIcon size={14} />
                2h ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FontsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
      />
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Familjen+Grotesk:wght@400;500;600;700&display=swap"
      />

      <header className="mx-auto max-w-7xl px-6 pb-10 pt-14">
        <img src="/klynt-logo-dark.svg" alt="Klynt" className="h-8 w-auto" />
        <h1 className="mt-10 text-3xl font-bold tracking-tight text-ink">Font comparison</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-ink-secondary">
          Same UI chunks rendered in each candidate typeface. Current font: Instrument Sans.
        </p>
        <nav className="mt-6 flex flex-wrap gap-2">
          <a
            href="#full-dashboard"
            className="rounded-full border border-[var(--accent)] bg-[var(--accent-tint)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--accent-link)]"
          >
            Full dashboard · General Sans
          </a>
          <a
            href="#full-dashboard-instrument"
            className="rounded-full border border-[var(--accent)] bg-[var(--accent-tint)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--accent-link)]"
          >
            Full dashboard · Instrument Sans
          </a>
          {FONTS.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
            >
              {f.name}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24">
        <section id="full-dashboard" className="mb-20">
          <div className="mb-8 flex items-baseline gap-4">
            <span className="text-[11px] font-semibold tabular-nums text-line-strong">00</span>
            <h2 className="text-xl font-semibold text-ink">Full dashboard · General Sans</h2>
            <p className="text-[13px] text-ink-faint">Complete screen, not fragments</p>
          </div>
          <div style={{ fontFamily: "'General Sans', var(--font-instrument), sans-serif" }}>
            <LandingPreview />
          </div>
        </section>

        <section id="full-dashboard-instrument" className="mb-20 border-t border-line-soft pt-14">
          <div className="mb-8 flex items-baseline gap-4">
            <span className="text-[11px] font-semibold tabular-nums text-line-strong">00</span>
            <h2 className="text-xl font-semibold text-ink">Full dashboard · Instrument Sans</h2>
            <p className="text-[13px] text-ink-faint">Complete screen, not fragments</p>
          </div>
          <div style={{ fontFamily: 'var(--font-instrument)' }}>
            <LandingPreview />
          </div>
        </section>

        {FONTS.map((f, i) => (
          <section key={f.id} id={f.id} className={i > 0 ? 'mt-20 border-t border-line-soft pt-14' : ''}>
            <div style={{ fontFamily: f.fontFamily }}>
              <div className="mb-8 flex items-baseline gap-4">
                <span className="text-[11px] font-semibold tabular-nums text-line-strong">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="text-xl font-semibold text-ink">{f.name}</h2>
                <p className="text-[13px] text-ink-faint">{f.note}</p>
              </div>
              <Specimen />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
