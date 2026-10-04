import type { Metadata } from 'next';
import { RiCheckLine, RiEditLine, RiArrowRightSLine } from '@remixicon/react';

import { TelegramIcon } from '@/components/icons/BrandIcons';
import Avatar from '@/components/Avatar';
import { logoSrc } from '@/lib/market';

export const metadata: Metadata = {
  title: 'Сравнение кириллических шрифтов — Klynt',
  robots: { index: false },
};

// Fonts are loaded via <link> below — next/font fetches at build time and a
// stalled download blocks dev-server compilation of the whole app.
const FONTS = [
  {
    id: 'inter',
    name: 'Inter (сейчас)',
    note: 'Текущий шрифт RU-деплоя — крупный x-height',
    fontFamily: "'Inter', var(--font-instrument), sans-serif",
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    note: 'Геометрический гротеск, характерные пропорции',
    fontFamily: "'Montserrat', var(--font-instrument), sans-serif",
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    note: 'Нейтральный гуманистический, читаемый в мелком кегле',
    fontFamily: "'Open Sans', var(--font-instrument), sans-serif",
  },
  {
    id: 'manrope',
    name: 'Manrope',
    note: 'Современный геометрический, компактнее Inter',
    fontFamily: "'Manrope', var(--font-instrument), sans-serif",
  },
  {
    id: 'roboto-flex',
    name: 'Roboto Flex',
    note: 'Вариативный, системно-нейтральный',
    fontFamily: "'Roboto Flex', var(--font-instrument), sans-serif",
  },
];

const STATE_BAR = [
  { cls: 'bg-emerald-300', w: '50%' },
  { cls: 'bg-amber-400', w: '25%' },
  { cls: 'bg-blue-400', w: '12.5%' },
  { cls: 'bg-violet-400', w: '12.5%' },
];

const LEGEND = [
  { cls: 'bg-emerald-300', text: '4 подтверждено' },
  { cls: 'bg-amber-400', text: '2 на ревью' },
  { cls: 'bg-blue-400', text: '1 новых' },
  { cls: 'bg-violet-400', text: '1 в ожидании' },
];

function FactCard({ label, pillStyle, subject, context, changes, ago, approved, dimmed }: {
  label: string; pillStyle: string; subject: string; context?: string; changes?: number; ago?: string; approved?: boolean; dimmed?: boolean;
}) {
  return (
    <div className={`flex flex-col rounded-xl border border-line bg-white px-4 py-3 ${dimmed ? 'opacity-75' : ''}`}>
      <p className="text-[15px] font-semibold leading-snug text-ink">{subject}</p>
      <span className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyle}`}>
        {approved && <RiCheckLine size={11} />}
        {label}
      </span>
      {context && <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-muted line-clamp-2">{context}</p>}
      {changes && <p className="mt-auto pt-3 text-[11px] text-ink-faint">{changes} изменений{ago ? ` · ${ago}` : ''}</p>}
    </div>
  );
}

function Specimen() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* Landing hero chunk */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Лендинг</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-[44px] sm:leading-[1.05]">
          Знайте, что сейчас действительно актуально в проекте.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-secondary">
          Klynt подключается к вашим инструментам, собирает важное и держит команду в курсе текущего состояния проекта.
        </p>
        <div className="mt-6 flex max-w-md items-center gap-2">
          <div className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink-faint">
            вы@студия.рф
          </div>
          <div className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[var(--accent-fg)]">
            Получить ранний доступ
          </div>
        </div>
        <p className="mt-8 max-w-md text-[15px] leading-relaxed text-ink-secondary">
          Съешь ещё этих мягких французских булок, да выпей чаю. 0123456789
        </p>
        <p className="mt-2 max-w-md text-[13px] text-ink-muted">
          Смешанный текст: загрузка аватара, Figma file v12, hello@klynt.one — д’Артаньян и триптих Ёлки.
        </p>
      </div>

      {/* Dashboard chunk */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Дашборд</p>
        <div className="rounded-2xl border border-line bg-fill-soft p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Lunar mobile</h1>
            <span className="rounded-full border border-dashed border-line px-2.5 py-1 text-[11px] font-medium text-ink-faint">
              Пример
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
              <TelegramIcon size={11} /> Telegram
            </span>
          </div>
          <p className="mt-1 text-[15px] text-ink-secondary">Редизайн мобильного приложения — события из Telegram.</p>

          <div className="mt-3">
            <div className="flex h-1.5 overflow-hidden rounded-full bg-fill">
              {STATE_BAR.map((s, i) => (
                <div key={i} className={s.cls} style={{ width: s.w }} />
              ))}
            </div>
            <p className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-[13px] text-ink-muted">
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span>8 областей</span>
                {LEGEND.map((l, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${l.cls}`} />
                    {l.text}
                  </span>
                ))}
              </span>
              <span className="text-xs text-ink-faint">Обновлено 8 мин назад</span>
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <FactCard
              subject="Загрузка аватара"
              label="Решение не принято"
              pillStyle="bg-violet-50 text-violet-700"
              context="Дизайнер добавила загрузку аватара, но PM пометил как вне объёма."
              changes={11}
              ago="3 дн назад"
            />
            <FactCard
              subject="Флоу оплаты"
              label="Подтверждено"
              pillStyle="bg-fill text-ink-secondary"
              context="Подтвердила Сара · 2 дн назад"
              approved
              dimmed
            />
          </div>

          <div className="mt-4 rounded-xl border border-line bg-white p-3.5">
            <p className="mb-2 text-[13px] font-semibold text-ink-secondary">1 решение ждёт вас</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tabular-nums text-line-strong">01</span>
              <p className="text-sm font-semibold text-ink">Тёмная тема</p>
              <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                Вопрос по объёму
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-ink-secondary">
              Дизайнер предложила экраны тёмной темы. В документе по объёму решения нет.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-auto flex items-center gap-0.5 text-xs font-medium leading-none text-ink-muted">
                Контекст
                <RiArrowRightSLine size={14} className="translate-y-px" />
              </span>
              <span className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)]">Принять</span>
              <span className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-secondary">Оставить как есть</span>
              <span className="px-2 py-1.5 text-xs font-medium text-ink-faint">Не уверен</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">Последнее</p>
            <div className="flex items-center gap-3 border-t border-line-soft py-2.5">
              <span className="flex-shrink-0 text-ink-faint"><RiEditLine size={14} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">Вернули синюю иконку приложения</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">Иконка приложения · изменение</p>
              </div>
              <span className="flex flex-shrink-0 items-center gap-2 text-xs text-ink-faint">
                <span className="flex items-center gap-1">
                  <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                    <Avatar name="Анна" email="anna@acme.co" className="text-[8px]" />
                  </span>
                  Анна
                </span>
                <TelegramIcon size={14} />
                5 дн назад
              </span>
            </div>
            <div className="flex items-center gap-3 border-t border-line-soft py-2.5">
              <span className="flex-shrink-0 text-ink-faint"><RiCheckLine size={14} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">Типографика подтверждена</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">Типографика · подтверждено</p>
              </div>
              <span className="flex flex-shrink-0 items-center gap-2 text-xs text-ink-faint">
                <span className="flex items-center gap-1">
                  <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                    <Avatar name="Сара" email="sarah@acme.co" className="text-[8px]" />
                  </span>
                  Сара
                </span>
                <TelegramIcon size={14} />
                2 ч назад
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FontsRuPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Roboto+Flex:wght@400;500;600;700&display=swap"
      />

      <header className="mx-auto max-w-7xl px-6 pb-10 pt-14">
        <img src={logoSrc()} alt="Klynt" className="h-8 w-auto" />
        <h1 className="mt-10 text-3xl font-bold tracking-tight text-ink">Кириллические шрифты</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-ink-secondary">
          Одинаковые фрагменты интерфейса в каждом шрифте-кандидате. Текущий: Inter.
        </p>
        <nav className="mt-6 flex flex-wrap gap-2">
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
