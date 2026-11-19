import {
  RiSettings3Line,
  RiArrowDownSLine,
  RiArrowRightLine,
  RiCheckLine,
  RiEditLine,
  RiInformationLine,
} from '@remixicon/react';

import { FigmaIcon, SlackIcon, TelegramIcon } from '@/components/icons/BrandIcons';
import Avatar from '@/components/Avatar';
import { t, getLocale } from '@/lib/i18n';
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

const SOURCE_NAME: Record<SourceIcon, string> = { figma: 'Figma', slack: 'Slack', telegram: 'Telegram' };

function FactCard({
  subject,
  status,
  statusKey,
  event,
  ago,
  approved,
  actor,
  source,
  disputed,
}: {
  subject: string;
  status: React.ReactNode;
  statusKey?: string;
  event?: string;
  ago: string;
  approved?: boolean;
  actor?: string;
  source?: SourceIcon;
  disputed?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-white px-4 py-3">
      <p className="text-[15px] font-semibold leading-snug text-ink">{subject}</p>
      {disputed && (
        <span className="mt-1.5 inline-flex w-fit whitespace-nowrap rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-800">
          {t('status.disputed')}
        </span>
      )}
      {disputed ? (
        <p className="mt-1 overflow-hidden whitespace-nowrap text-[13px] leading-snug text-ink-secondary">{status}</p>
      ) : (
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusKey ? STATUS_COLORS[statusKey].pill : 'bg-fill text-ink-secondary'}`}>
            {approved && <RiCheckLine size={11} className="mr-0.5 -mt-px text-emerald-600" />}
            {status}
          </span>
          {event && <span className="text-[11px] text-ink-faint">{event}</span>}
        </p>
      )}
      <div className="mt-auto flex items-center gap-1.5 pt-2.5 text-[11px] text-ink-faint">
        <span className="flex min-w-0 items-center gap-1">
          {source && <SourceGlyph source={source} size={12} />}
          <span className="truncate">
            {source && SOURCE_NAME[source]}
            {source && actor && <span className="mx-1.5" aria-hidden="true">·</span>}
            {actor}
          </span>
        </span>
        <span className="ml-auto flex-shrink-0">{ago}</span>
      </div>
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
        {author}
        <SourceGlyph source={source} size={14} />
        {ago}
      </span>
    </div>
  );
}

// Mirrors the dashboard's status palette (decision states, not events).
const STATUS_COLORS: Record<string, { bar: string; pill: string }> = {
  approved: { bar: 'bg-emerald-400', pill: 'bg-emerald-100 text-emerald-800' },
  inProgress: { bar: 'bg-blue-400', pill: 'bg-blue-100 text-blue-800' },
  needsDecision: { bar: 'bg-amber-400', pill: 'bg-amber-100 text-amber-800' },
  disputed: { bar: 'bg-rose-400', pill: 'bg-rose-100 text-rose-800' },
  outOfScope: { bar: 'bg-line-strong', pill: 'bg-fill text-ink-secondary' },
};

export default function LandingPreview() {
  const msgSource: SourceIcon = getLocale() === 'ru' ? 'telegram' : 'slack';
  return (
    <div className="pointer-events-none select-none overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex h-[640px] flex-col bg-app-bg">
        <header className="flex h-12 w-full flex-shrink-0 items-center gap-5 border-b border-line bg-white px-6">
          <img src={logoSrc()} alt="Klynt" className="h-5 w-auto" />
          <span className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs text-ink-secondary">
            {t('preview.p4')}
            <RiArrowDownSLine size={13} className="text-ink-faint" />
          </span>
          <div className="ml-auto flex items-center gap-5">
            <span className="flex items-center gap-2.5">
              <FigmaIcon size={14} />
              {msgSource === 'telegram' ? <TelegramIcon size={14} /> : <SlackIcon size={14} />}
            </span>
            <span className="flex items-center gap-2 text-sm text-ink-secondary">
              <RiSettings3Line size={15} className="text-ink-faint" />
              <span className="hidden lg:inline">{t('nav.projectSettings')}</span>
            </span>
            <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full">
              <Avatar name="demo@klynt.one" email="demo@klynt.one" className="text-[9px]" />
            </span>
          </div>
        </header>

        <main className="relative w-full flex-1 overflow-hidden px-7 py-6">
          <div className="grid grid-cols-12 gap-8">
            <div className="order-1 col-span-8 flex flex-col gap-8">
              <div>
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                {t('preview.p4')}
                <sup className="relative -top-1.5 ml-2.5 text-[11px] font-medium tracking-normal text-ink-faint">Sample</sup>
              </h1>
            </div>
            <p className="mt-1 text-[15px] text-ink-secondary">{t('preview.subtitle')}</p>
            <div className="mt-3 flex flex-wrap items-center gap-0.5">
              <span className="inline-flex items-center rounded-full bg-fill px-2.5 py-1 text-xs font-medium text-ink">{t('dashboard.allAreas')} 16</span>
              {([['approved', 7], ['inProgress', 3], ['needsDecision', 2], ['disputed', 3], ['outOfScope', 1]] as const).map(([k, n]) => (
                <span key={k} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-ink-secondary">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[k].bar}`} />
                  {t(`status.${k}`)} {n}
                </span>
              ))}
            </div>
              </div>

              <section>
                <div className="grid grid-cols-3 gap-2">
                  <FactCard
                    subject={t('preview.card4.subject')}
                    status={
                      <span className="flex items-center gap-1.5 text-ink-muted">
                        <span className="inline-flex shrink-0 items-center gap-1">
                          {t('status.approved')} · {t('preview.scope.mobile')}
                          <RiArrowRightLine size={12} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-ink">{t('preview.proposal.removal')}</span>
                      </span>
                    }
                    ago={t('preview.card4.ago')}
                    disputed
                    source={msgSource}
                  />
                  <FactCard
                    subject={t('preview.card2.subject')}
                    status={
                      <span className="flex items-center gap-1.5 text-ink-muted">
                        <span className="inline-flex shrink-0 items-center gap-1">
                          {t('status.outOfScope')} · {t('preview.scope.mvp')}
                          <RiArrowRightLine size={12} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-ink">{t('preview.proposal.addition')}</span>
                      </span>
                    }
                    ago={t('preview.card2.ago')}
                    disputed
                    source={msgSource}
                  />
                  <FactCard
                    subject={t('preview.card3.subject')}
                    status={`${t('status.needsDecision')} · ${t('preview.scope.firstOrder')}`}
                    statusKey="needsDecision"
                    ago={t('preview.card5.ago')}
                    source={msgSource}
                  />
                  <FactCard
                    subject={t('preview.card10.subject')}
                    status={`${t('status.inProgress')} · ${t('preview.scope.mobile')}`}
                    statusKey="inProgress"
                    event={t('event.changed')}
                    ago={t('preview.card1.ago')}
                    source={msgSource}
                  />
                  <FactCard
                    subject={t('preview.card6.subject')}
                    status={`${t('status.approved')} · ${t('preview.scope.pilot')}`}
                    statusKey="approved"
                    ago={t('preview.card6.ago')}
                    approved
                    actor={t('preview.actor2')}
                    source={msgSource}
                  />
                  <FactCard
                    subject={t('preview.card8.subject')}
                    status={`${t('status.approved')} · ${t('preview.scope.mobile')}`}
                    statusKey="approved"
                    ago={t('preview.ago2d')}
                    approved
                    actor={t('preview.actor2')}
                    source={msgSource}
                  />
                </div>
              </section>

              <section>
                <MockSectionHeader title={t('dashboard.newSinceVisit')} />
                <div className="divide-y divide-line-soft">
                  <LatestEvent
                    icon={<RiEditLine size={14} />}
                    title={t('preview.eventRemove.title')}
                    meta={t('preview.eventRemove.meta')}
                    author={t('preview.actor3')}
                    source={msgSource}
                    ago={t('preview.agoJustNow')}
                  />
                  <LatestEvent
                    icon={<RiEditLine size={14} />}
                    title={t('preview.event2.title')}
                    meta={t('preview.event2.meta')}
                    author={t('preview.actor1')}
                    source={msgSource}
                    ago={t('preview.ago2d')}
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
              </section>
            </div>

            <div className="order-2 col-span-4">
              <section>
                <MockSectionHeader title={t('dashboard.needsAttentionCount', { count: 2 })} caps={false} />
                <div className="space-y-3">
                  <div className="relative rounded-xl border border-line bg-white p-3.5">
                    <span className="absolute -top-2.5 right-3 rounded-full border border-line bg-white px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                      {t('decisionAction.state.approved')}
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold leading-snug text-ink">{t('preview.card4.subject')}</p>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
                      {t('preview.conflictDark.text')}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg border border-transparent bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-[var(--accent-fg)]">
                        {t('decisionAction.excludeScope')}
                      </span>
                      <span className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-ink-secondary">
                        {t('decisionAction.keepCurrent')}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-x-4">
                      <span className="text-[13px] font-medium text-ink-faint">{t('decisionAction.viewEvidence')}</span>
                      <span className="inline-flex items-center text-[13px] font-medium text-ink-faint">
                        {t('dashboard.notSure')}
                        <span className="ml-1.5 flex items-center text-ink-faint opacity-60" aria-hidden="true"><RiInformationLine size={14} /></span>
                      </span>
                    </div>
                  </div>

                  <div className="relative rounded-xl border border-line bg-white p-3.5">
                    <span className="absolute -top-2.5 right-3 rounded-full border border-line bg-white px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                      {t('decisionAction.state.outOfScope')}
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold leading-snug text-ink">{t('preview.card2.subject')}</p>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
                      {t('preview.conflict1.text')}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-[var(--accent-fg)]">
                        {t('decisionAction.includeScope')}
                      </span>
                      <span className="inline-flex min-h-9 max-w-full items-center justify-center rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-ink-secondary">
                        {t('decisionAction.keepCurrent')}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-x-4">
                      <span className="text-[13px] font-medium text-ink-faint">{t('decisionAction.viewEvidence')}</span>
                      <span className="inline-flex items-center text-[13px] font-medium text-ink-faint">
                        {t('dashboard.notSure')}
                        <span className="ml-1.5 flex items-center text-ink-faint opacity-60" aria-hidden="true"><RiInformationLine size={14} /></span>
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
