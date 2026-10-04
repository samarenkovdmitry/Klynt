import {
  RiPlugLine,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiAddLine,
  RiFolderLine,
  RiCheckLine,
  RiEditLine,
} from '@remixicon/react';

import { FigmaIcon, SlackIcon, TelegramIcon } from '@/components/icons/BrandIcons';
import Avatar from '@/components/Avatar';
import { t, tp, getLocale } from '@/lib/i18n';
import { logoSrc } from '@/lib/market';

type SourceIcon = 'figma' | 'slack' | 'telegram';

function SourceGlyph({ source, size }: { source: SourceIcon; size: number }) {
  if (source === 'figma') return <FigmaIcon size={size} />;
  if (source === 'telegram') return <TelegramIcon size={size} />;
  return <SlackIcon size={size} />;
}

function MockSectionHeader({ title, right, caps = true }: { title: string; right?: React.ReactNode; caps?: boolean }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className={caps
          ? 'text-xs font-semibold uppercase tracking-wider text-ink-faint'
          : 'text-[13px] font-semibold text-ink-secondary'
        }>{title}</h2>
        {right}
      </div>
    </div>
  );
}

function FactCard({
  subject,
  label,
  pillStyle,
  context,
  changes,
  ago,
  approved,
  actor,
  source,
  accent,
  dimmed,
}: {
  subject: string;
  label: string;
  pillStyle: string;
  context?: string;
  changes?: number;
  ago?: string;
  approved?: boolean;
  actor?: string;
  source?: SourceIcon;
  accent?: string;
  dimmed?: boolean;
}) {
  return (
    <div className={`flex flex-col rounded-xl border border-line bg-white px-4 py-3 ${accent ? `border-l-[3px] ${accent}` : ''} ${dimmed ? 'opacity-75' : ''}`}>
      <p className="text-[15px] font-semibold leading-snug text-ink">{subject}</p>
      <span className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyle}`}>
        {approved && <RiCheckLine size={11} />}
        {label}
      </span>
      {context && (
        <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-muted line-clamp-2">{context}</p>
      )}
      {changes && (
        <div className="mt-auto flex items-center gap-1.5 pt-3 text-[11px] text-ink-faint">
          <span>{changes} {tp(changes, 'plural.change')}{ago ? ` · ${ago}` : ''}</span>
          {(actor || source) && (
            <span className="ml-auto flex flex-shrink-0 items-center gap-1.5">
              {actor && (
                <>
                  <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                    <Avatar name={actor} email={`${actor.toLowerCase()}@lunar.app`} className="text-[8px]" />
                  </span>
                  <span className="max-w-[80px] truncate">{actor}</span>
                </>
              )}
              {source && <SourceGlyph source={source} size={12} />}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function LatestEvent({
  icon,
  title,
  meta,
  author,
  source,
  ago,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  author: string;
  source: SourceIcon;
  ago: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex-shrink-0 text-ink-faint">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 truncate text-xs text-ink-muted">{meta}</p>
      </div>
      <span className="flex flex-shrink-0 items-center gap-2 text-xs text-ink-faint">
        <span className="flex items-center gap-1">
          <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
            <Avatar name={author} email={`${author.toLowerCase()}@lunar.app`} className="text-[8px]" />
          </span>
          {author}
        </span>
        <SourceGlyph source={source} size={14} />
        {ago}
      </span>
    </div>
  );
}

const NEUTRAL_PILL = 'bg-fill text-ink-secondary';
const AMBER_PILL = 'bg-amber-50 text-amber-700';
const VIOLET_PILL = 'bg-violet-50 text-violet-700';
const BLUE_PILL = 'bg-blue-50 text-blue-700';

// Mirrors the real dashboard's state-bar palette (done → work left).
const STATE_BAR_COLORS: Record<string, string> = {
  approved: 'bg-emerald-300',
  review: 'bg-amber-400',
  added: 'bg-blue-400',
  pending: 'bg-violet-400',
};

export default function LandingPreview() {
  const msgSource: SourceIcon = getLocale() === 'ru' ? 'telegram' : 'slack';
  return (
    <div className="pointer-events-none select-none overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(27,26,23,0.04),0_12px_32px_-8px_rgba(27,26,23,0.12)]">
      <div className="flex h-[640px] bg-app-bg">
        <aside className="flex h-full w-[200px] flex-shrink-0 flex-col self-start overflow-y-auto bg-white px-4 py-8 shadow-[1px_0_0_0_rgba(0,0,0,0.03),2px_0_8px_-4px_rgba(0,0,0,0.03)]">
          <div className="mb-8 px-2">
            <img
              src={logoSrc()}
              alt="Klynt"
              className="h-8 w-auto"
            />
          </div>

          <nav className="flex-1 space-y-1">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{t('sidebar.projects')}</p>
            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiFolderLine size={15} className="flex-shrink-0 text-ink-faint" />
              <span className="truncate">{t('preview.p1')}</span>
            </div>
            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiFolderLine size={15} className="flex-shrink-0 text-ink-faint" />
              <span className="truncate">{t('preview.p2')}</span>
            </div>
            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiFolderLine size={15} className="flex-shrink-0 text-ink-faint" />
              <span className="truncate">{t('preview.p3')}</span>
              <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
            </div>
            <div className="relative flex w-full items-center gap-2 rounded-lg bg-[var(--accent-tint)] px-3 py-2 text-left text-sm font-medium text-[var(--accent-link)]">
              <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent)]" />
              <RiFolderLine size={15} className="flex-shrink-0 text-[var(--accent-link)]" />
              <span className="truncate">{t('preview.p4')}</span>
            </div>
            <div className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-xs font-medium text-ink-muted">
              <RiAddLine size={14} />
              {t('sidebar.newProject')}
            </div>

            <div className="my-4 h-px bg-fill"></div>

            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiPlugLine size={16} className="text-ink-faint" />
              {t('sidebar.integrations')}
            </div>
            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiSettings3Line size={16} className="text-ink-faint" />
              {t('sidebar.settings')}
            </div>
          </nav>

          <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-fill-soft px-3 py-2.5">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
              <Avatar name="demo@klynt.one" email="demo@klynt.one" className="text-[10px]" />
            </span>
            <p className="min-w-0 flex-1 truncate text-xs text-ink-secondary">demo@klynt.one</p>
            <RiLogoutBoxRLine size={16} className="flex-shrink-0 text-ink-faint" />
          </div>
        </aside>

        <main className="relative w-full flex-1 overflow-hidden px-5 py-5">
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-ink">{t('preview.p4')}</h1>
              {getLocale() === 'ru' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
                  <TelegramIcon size={11} /> Telegram
                </span>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
                    <FigmaIcon size={11} /> Figma
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
                    <SlackIcon size={11} /> Slack
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-[15px] text-ink-secondary">{t('preview.subtitle')}</p>
            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[15px] font-medium text-ink">
                  {t('dashboard.verdict', { a: 4, n: 8 })}
                  <span className="text-amber-700"> · {t('dashboard.toResolve', { c: 2 })}</span>
                </p>
                <p className="text-xs text-ink-faint">{t('preview.updated')}</p>
              </div>
              <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-fill">
                {([['approved', 4], ['review', 2], ['added', 1], ['pending', 1]] as const).map(([k, n]) => (
                  <div key={k} className={STATE_BAR_COLORS[k]} style={{ width: `${(n / 8) * 100}%` }} />
                ))}
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-ink-muted">
                <span>8 {tp(8, 'plural.area')}</span>
                {([['approved', 4, t('dashboard.approved')], ['review', 2, t('dashboard.needReview')], ['added', 1, t('dashboard.new')], ['pending', 1, t('dashboard.pending')]] as const).map(([k, n, label]) => (
                  <span key={k} className="inline-flex items-center gap-1">
                    <span className="text-ink-faint">·</span>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATE_BAR_COLORS[k]}`} />
                    {n} {label}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="order-1 col-span-8 flex flex-col gap-8">
              <section>
                <div className="grid grid-cols-3 gap-2">
                  <FactCard
                    subject={t('preview.card1.subject')}
                    label={t('preview.card1.label')}
                    pillStyle={AMBER_PILL}
                    context={t('preview.card1.context')}
                    changes={4}
                    ago={t('preview.card1.ago')}
                    actor={t('preview.actor1')}
                    source="figma"
                    accent="border-l-amber-300"
                  />
                  <FactCard
                    subject={t('preview.card2.subject')}
                    label={t('preview.card2.label')}
                    pillStyle={VIOLET_PILL}
                    context={t('preview.card2.context')}
                    changes={2}
                    ago={t('preview.card2.ago')}
                    actor={t('preview.actor3')}
                    source={msgSource}
                    accent="border-l-violet-300"
                  />
                  <FactCard
                    subject={t('preview.card3.subject')}
                    label={t('preview.card3.label')}
                    pillStyle={AMBER_PILL}
                    changes={2}
                    ago={t('preview.card3.ago')}
                    actor={t('preview.actor1')}
                    source="figma"
                    accent="border-l-amber-300"
                  />
                  <FactCard
                    subject={t('preview.card4.subject')}
                    label={t('preview.card4.label')}
                    pillStyle={NEUTRAL_PILL}
                    context={t('preview.card4.context')}
                    changes={3}
                    approved
                    actor={t('preview.actor2')}
                    source={msgSource}
                    dimmed
                  />
                  <FactCard
                    subject={t('preview.card5.subject')}
                    label={t('preview.card5.label')}
                    pillStyle={NEUTRAL_PILL}
                    context={t('preview.card5.context')}
                    changes={3}
                    approved
                    actor={t('preview.actor2')}
                    source={msgSource}
                    dimmed
                  />
                  <FactCard
                    subject={t('preview.card6.subject')}
                    label={t('preview.card6.label')}
                    pillStyle={BLUE_PILL}
                    changes={2}
                    ago={t('preview.card6.ago')}
                    actor={t('preview.actor1')}
                    source="figma"
                    accent="border-l-blue-300"
                  />
                </div>
              </section>

              <section>
                <MockSectionHeader title={t('dashboard.latest')} />
                <div className="divide-y divide-line-soft">
                  <LatestEvent
                    icon={<RiEditLine size={14} />}
                    title={t('preview.event1.title')}
                    meta={t('preview.event1.meta')}
                    author={t('preview.actor1')}
                    source="figma"
                    ago={t('preview.ago1d')}
                  />
                  <LatestEvent
                    icon={<RiEditLine size={14} />}
                    title={t('preview.event2.title')}
                    meta={t('preview.event2.meta')}
                    author={t('preview.actor2')}
                    source={msgSource}
                    ago={t('preview.ago1d')}
                  />
                </div>
              </section>

              <section>
                <MockSectionHeader
                  title={t('dashboard.activity')}
                  right={
                    <div className="flex flex-shrink-0 gap-1 rounded-lg bg-fill/60 p-1">
                      {['24h', '7d', '30d', t('dashboard.periodAll')].map((p, i) => (
                        <span
                          key={p}
                          className={`rounded-md px-3 py-1 text-xs font-medium ${
                            i === 1 ? 'bg-white text-ink' : 'text-ink-muted'
                          }`}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  }
                />
                <div className="mb-6">
                  <p className="mb-1 text-xs font-medium text-ink-faint">{t('preview.yesterday')}</p>
                  <div className="divide-y divide-line-soft">
                    <div className="flex items-center gap-3 py-1.5">
                      <span className="w-10 flex-shrink-0 text-xs tabular-nums text-ink-faint">11:00</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-ink">{t('preview.event1.title')}</span>
                      </div>
                      <span className="flex flex-shrink-0 items-center gap-2.5 text-xs text-ink-faint">
                        <span>{t('preview.actor1')}</span>
                        <FigmaIcon size={14} />
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-1.5">
                      <span className="w-10 flex-shrink-0 text-xs tabular-nums text-ink-faint">09:00</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-ink">{t('preview.event2.title')}</span>
                      </div>
                      <span className="flex flex-shrink-0 items-center gap-2.5 text-xs text-ink-faint">
                        <span>{t('preview.actor2')}</span>
                        <SourceGlyph source={msgSource} size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="order-2 col-span-4">
              <section>
                <MockSectionHeader title={t('preview.needYou')} caps={false} />
                <div className="space-y-3">
                  <div className="rounded-xl border border-line bg-white p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tabular-nums text-line-strong">01</span>
                      <p className="text-sm font-semibold text-ink">{t('preview.card1.subject')}</p>
                      <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        {t('conflict.contradiction')}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
                      {t('preview.conflict1.text')}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)]">
                        {t('dashboard.accept')}
                      </span>
                      <span className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-secondary">
                        {t('dashboard.keepAsIs')}
                      </span>
                      <span className="px-2 py-1.5 text-xs font-medium text-ink-faint">
                        {t('dashboard.notSure')}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-white p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tabular-nums text-line-strong">02</span>
                      <p className="text-sm font-semibold text-ink">{t('preview.card2.subject')}</p>
                      <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        {t('conflict.scope_change')}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
                      {t('preview.conflict2.text')}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-secondary">
                        {t('dashboard.keepAsIs')}
                      </span>
                      <span className="px-2 py-1.5 text-xs font-medium text-ink-faint">
                        {t('dashboard.notSure')}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
