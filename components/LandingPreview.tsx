import {
  RiPlugLine,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiAddLine,
  RiFolderLine,
  RiCheckLine,
  RiEditLine,
} from '@remixicon/react';

import { FigmaIcon, SlackIcon } from '@/components/icons/BrandIcons';
import Avatar from '@/components/Avatar';

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
}: {
  subject: string;
  label: string;
  pillStyle: string;
  context?: string;
  changes?: number;
  ago?: string;
  approved?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-white px-4 py-3">
      <p className="text-[15px] font-semibold leading-snug text-ink">{subject}</p>
      <span className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyle}`}>
        {approved && <RiCheckLine size={11} />}
        {label}
      </span>
      {context && (
        <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-muted line-clamp-2">{context}</p>
      )}
      {changes && (
        <p className="mt-auto pt-3 text-[11px] text-ink-faint">
          {changes} changes{ago ? ` · ${ago}` : ''}
        </p>
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
  source: 'figma' | 'slack';
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
        {source === 'figma' ? <FigmaIcon size={14} /> : <SlackIcon size={14} />}
        {ago}
      </span>
    </div>
  );
}

const NEUTRAL_PILL = 'bg-fill text-ink-secondary';
const AMBER_PILL = 'bg-amber-50 text-amber-700';
const VIOLET_PILL = 'bg-violet-50 text-violet-700';

export default function LandingPreview() {
  return (
    <div className="pointer-events-none select-none overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(27,26,23,0.04),0_12px_32px_-8px_rgba(27,26,23,0.12)]">
      <div className="flex h-[640px] bg-app-bg">
        <aside className="flex h-full w-[200px] flex-shrink-0 flex-col self-start overflow-y-auto bg-white px-4 py-8 shadow-[1px_0_0_0_rgba(0,0,0,0.03),2px_0_8px_-4px_rgba(0,0,0,0.03)]">
          <div className="mb-8 px-2">
            <img
              src="/Klynt_logo.svg"
              alt="Klynt"
              className="h-8 w-auto"
            />
          </div>

          <nav className="flex-1 space-y-1">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Projects</p>
            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiFolderLine size={15} className="flex-shrink-0 text-ink-faint" />
              <span className="truncate">Website redesign</span>
            </div>
            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiFolderLine size={15} className="flex-shrink-0 text-ink-faint" />
              <span className="truncate">Acme rebrand</span>
            </div>
            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiFolderLine size={15} className="flex-shrink-0 text-ink-faint" />
              <span className="truncate">Tesla website</span>
              <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
            </div>
            <div className="relative flex w-full items-center gap-2 rounded-lg bg-[var(--accent-tint)] px-3 py-2 text-left text-sm font-medium text-[var(--accent-link)]">
              <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent)]" />
              <RiFolderLine size={15} className="flex-shrink-0 text-[var(--accent-link)]" />
              <span className="truncate">Lunar mobile</span>
            </div>
            <div className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-xs font-medium text-ink-muted">
              <RiAddLine size={14} />
              New project
            </div>

            <div className="my-4 h-px bg-fill"></div>

            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiPlugLine size={16} className="text-ink-faint" />
              Integrations
            </div>
            <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-secondary">
              <RiSettings3Line size={16} className="text-ink-faint" />
              Settings
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
              <h1 className="text-2xl font-bold tracking-tight text-ink">Lunar mobile</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
                <FigmaIcon size={11} /> Figma
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
                <SlackIcon size={11} /> Slack
              </span>
            </div>
            <p className="mt-1 text-[15px] text-ink-secondary">Mobile app redesign tracked from Figma and Slack.</p>
            <div className="mt-2.5 flex items-baseline justify-between gap-4">
              <p className="text-[13px] text-ink-muted">
                8 areas · 4 approved · 2 need review · 1 pending
              </p>
              <p className="text-xs text-ink-faint">Updated 1d ago</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="order-1 col-span-8 flex flex-col gap-8">
              <section>
                <div className="grid grid-cols-3 gap-2">
                  <FactCard
                    subject="App icon"
                    label="Decision pending"
                    pillStyle={AMBER_PILL}
                    context="Flipped blue → green → blue in 3 days"
                    changes={4}
                    ago="1d ago"
                  />
                  <FactCard
                    subject="Avatar upload"
                    label="Out of scope"
                    pillStyle={VIOLET_PILL}
                    context="Designer added it, PM cut it from MVP"
                    changes={2}
                    ago="10d ago"
                  />
                  <FactCard
                    subject="Settings screen"
                    label="In progress"
                    pillStyle={AMBER_PILL}
                    changes={2}
                    ago="5d ago"
                  />
                  <FactCard
                    subject="Dark mode"
                    label="Approved"
                    pillStyle={NEUTRAL_PILL}
                    context="Approved by Sara · 6d ago"
                    approved
                  />
                  <FactCard
                    subject="Checkout flow"
                    label="Approved"
                    pillStyle={NEUTRAL_PILL}
                    context="Approved by Sara · 8d ago"
                    approved
                  />
                  <FactCard
                    subject="Payment method"
                    label="Added"
                    pillStyle={NEUTRAL_PILL}
                    changes={2}
                    ago="8d ago"
                  />
                </div>
              </section>

              <section>
                <MockSectionHeader title="Latest" />
                <div className="divide-y divide-line-soft">
                  <LatestEvent
                    icon={<RiEditLine size={14} />}
                    title="Reverted to blue, final decision pending"
                    meta="App icon · modify"
                    author="Anna"
                    source="figma"
                    ago="1d"
                  />
                  <LatestEvent
                    icon={<RiEditLine size={14} />}
                    title="Client asked to revert to blue icon"
                    meta="App icon · request"
                    author="Sara"
                    source="slack"
                    ago="1d"
                  />
                </div>
              </section>

              <section>
                <MockSectionHeader
                  title="Activity"
                  right={
                    <div className="flex flex-shrink-0 gap-1 rounded-lg bg-fill/60 p-1">
                      {['24h', '7d', '30d', 'All'].map((p, i) => (
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
                  <p className="mb-1 text-xs font-medium text-ink-faint">Yesterday</p>
                  <div className="divide-y divide-line-soft">
                    <div className="flex items-center gap-3 py-1.5">
                      <span className="w-10 flex-shrink-0 text-xs tabular-nums text-ink-faint">11:00</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-ink">Reverted to blue, final decision pending</span>
                      </div>
                      <span className="flex flex-shrink-0 items-center gap-2.5 text-xs text-ink-faint">
                        <span>Anna</span>
                        <FigmaIcon size={14} />
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-1.5">
                      <span className="w-10 flex-shrink-0 text-xs tabular-nums text-ink-faint">09:00</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-ink">Client asked to revert to blue icon</span>
                      </div>
                      <span className="flex flex-shrink-0 items-center gap-2.5 text-xs text-ink-faint">
                        <span>Sara</span>
                        <SlackIcon size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="order-2 col-span-4">
              <section>
                <MockSectionHeader title="2 decisions need you" caps={false} />
                <div className="space-y-3">
                  <div className="rounded-xl border border-line bg-white p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tabular-nums text-line-strong">01</span>
                      <p className="text-sm font-semibold text-ink">App icon</p>
                      <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Decision conflict
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
                      Client prefers blue. PM's research says green. Final call pending.
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)]">
                        Accept
                      </span>
                      <span className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-secondary">
                        Keep as is
                      </span>
                      <span className="px-2 py-1.5 text-xs font-medium text-ink-faint">
                        Not sure
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-white p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tabular-nums text-line-strong">02</span>
                      <p className="text-sm font-semibold text-ink">Avatar upload</p>
                      <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Scope change
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
                      Designer added it to the profile screen; PM marked it out of scope.
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-secondary">
                        Keep as is
                      </span>
                      <span className="px-2 py-1.5 text-xs font-medium text-ink-faint">
                        Not sure
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
