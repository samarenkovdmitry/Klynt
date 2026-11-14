'use client';

import { useEffect, useState } from 'react';
import { getLocale } from '@/lib/i18n';
import type { ImpactEvidence, ImpactRecord } from '@/lib/ai/impact-analysis';

// Copy belongs to this experimental drawer surface; both deployments use it.
const copy = {
  en: {
    title: 'Decisions to revisit', intro: 'Check whether a change affects an earlier agreement in another area.',
    signal: 'Change to check', check: 'Check impact', checking: 'Checking…', loading: 'Loading recommendations…',
    noSignal: 'No eligible changes found for this area yet.',
    noResult: 'No grounded recommendations found in the checked decisions. This is not a guarantee that nothing is affected.',
    coverage: 'decisions checked', more: 'Only a subset was checked. Other decisions may also be affected.',
    target: 'Open area', previous: 'Earlier decision', newSignal: 'New signal', why: 'Why revisit', sources: 'Evidence and connection',
    event: 'New signal', connection: 'Dependency', reconsider: 'Reconsider', unrelated: 'Not related',
    marked: 'Marked for review', dismissed: 'Dismissed for this change', saving: 'Saving…',
    advisory: 'Suggestions only. Existing approvals stay unchanged.',
    checkDecisions: 'Check decisions',
    loadError: 'Could not load recommendations. Try again.', retry: 'Retry',
    error: 'Could not complete the check. Try again.',
    history_limit: 'This project exceeds the current pilot history limit. No partial analysis was performed.',
    rate_limited: 'The check limit has been reached. Try again in an hour.',
    outdated: 'This recommendation changed. Reload it before making a decision.',
    reviewed: 'Reviewed suggestions',
  },
  ru: {
    title: 'Решения для пересмотра', intro: 'Проверьте, затрагивает ли изменение прежние договорённости в других областях.',
    signal: 'Изменение для проверки', check: 'Проверить влияние', checking: 'Проверяем…', loading: 'Загружаем рекомендации…',
    noSignal: 'Для этой области пока нет подходящих изменений.',
    noResult: 'В проверенных решениях не найдено рекомендаций с достаточными основаниями. Это не гарантирует отсутствие влияния.',
    coverage: 'решений проверено', more: 'Проверена только часть решений. Изменение может затрагивать и другие.',
    target: 'Открыть область', previous: 'Прежнее решение', newSignal: 'Новое событие', why: 'Почему стоит перепроверить', sources: 'Основания и связь',
    event: 'Новое событие', connection: 'Зависимость', reconsider: 'Пересмотреть', unrelated: 'Не связано',
    marked: 'Отмечено для проверки', dismissed: 'Отклонено для этого изменения', saving: 'Сохраняем…',
    advisory: 'Это рекомендации. Действующие согласования не меняются.',
    checkDecisions: 'Проверить решения',
    loadError: 'Не удалось загрузить рекомендации. Попробуйте ещё раз.', retry: 'Повторить',
    error: 'Не удалось завершить проверку. Попробуйте ещё раз.',
    history_limit: 'История проекта превышает текущий лимит пилота. Частичный анализ не выполнялся.',
    rate_limited: 'Лимит проверок достигнут. Попробуйте через час.',
    outdated: 'Рекомендация изменилась. Загрузите её заново перед решением.',
    reviewed: 'Рассмотренные рекомендации',
  },
};

type Signal = ImpactEvidence & { candidateId: string };
type Data = { signals: Signal[]; recommendations: ImpactRecord[] };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(getLocale() === 'ru' ? 'ru-RU' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' });

function Evidence({ evidence, quote }: { evidence: ImpactEvidence; quote: string }) {
  return (
    <div className="rounded-lg border border-line-soft bg-white px-3 py-2">
      <blockquote className="whitespace-pre-wrap text-xs leading-relaxed text-ink-secondary">{quote}</blockquote>
      <div className="mt-2 flex flex-wrap gap-x-2 text-[11px] text-ink-muted">
        {evidence.url ? (
          <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-link)] hover:underline">
            {evidence.source} ↗
          </a>
        ) : <span>{evidence.source}</span>}
        {evidence.author && <span>{evidence.author}</span>}
        <time dateTime={evidence.timestamp}>{fmtDate(evidence.timestamp)}</time>
      </div>
    </div>
  );
}

export default function DecisionsToRevisit({
  projectId, factId, onOpenFact,
}: { projectId: string; factId: string; onOpenFact: (id: string) => void }) {
  const C = copy[getLocale()];
  const [data, setData] = useState<Data | null>(null);
  const [eventId, setEventId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [coverage, setCoverage] = useState<{ checked: number; eligible: number } | null>(null);
  const [expandedByUser, setExpandedByUser] = useState(false);
  const endpoint = `/api/impact?projectId=${encodeURIComponent(projectId)}&factId=${encodeURIComponent(factId)}`;
  const errorText = (code?: string) =>
    code === 'history_limit' || code === 'rate_limited' || code === 'outdated' ? C[code] : C.error;

  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, { signal: controller.signal })
      .then(async res => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'load_failed');
        setData(body);
        setEventId(body.signals[0]?.candidateId || '');
        setError('');
      })
      .catch(e => { if (!controller.signal.aborted) setError(e.message === 'history_limit' ? C.history_limit : C.loadError); });
    return () => controller.abort();
  }, [endpoint, reload, C]);

  async function submit(method: 'POST' | 'PATCH', body: Record<string, string>, key: string) {
    setBusy(key);
    setError('');
    try {
      const response = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) { setError(errorText(result.error)); return; }
      setData(previous => previous ? { ...previous, recommendations: result.recommendations } : null);
      if (method === 'POST') setCoverage({ checked: result.checked, eligible: result.eligible });
    } catch {
      setError(C.error);
    } finally {
      setBusy(null);
    }
  }

  const active = data?.recommendations.filter(r => !r.review) || [];
  const reviewed = data?.recommendations.filter(r => r.review) || [];
  if (data && !active.length && !reviewed.length && !data.signals.length && !busy) return null;
  const open = expandedByUser || active.length > 0 || coverage !== null;
  return (
    <section aria-labelledby="impact-heading" className="rounded-xl border border-amber-200/70 bg-amber-50/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 id="impact-heading" className="text-sm font-semibold text-ink">
          {C.title}{active.length > 0 && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">{active.length}</span>}
        </h3>
        {data && !open && (
          <button type="button" onClick={() => setExpandedByUser(true)}
            className="flex-shrink-0 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink-secondary hover:bg-fill-soft">
            {C.checkDecisions}
          </button>
        )}
      </div>
      {open && <p className="mt-1 text-xs leading-relaxed text-ink-muted">{C.intro}</p>}
      {open && !data && !error && <p className="mt-3 text-xs text-ink-muted">{C.loading}</p>}
      {error && <div role="alert" className="mt-3 text-xs text-red-700">
        {error}
        <button type="button" onClick={() => setReload(n => n + 1)} className="ml-2 underline">{C.retry}</button>
      </div>}
      {open && coverage && <div role="status" className="mt-3 space-y-1 text-xs text-ink-muted">
        <p>{coverage.checked} {C.coverage}</p>
        {coverage.checked < coverage.eligible && <p>{C.more}</p>}
        {!active.length && <p>{C.noResult}</p>}
      </div>}
      <div className="mt-3 space-y-3">
        {open && active.map(r => <article key={r.id} className="rounded-lg border border-line bg-white p-3">
          <button type="button" onClick={() => onOpenFact(r.targetFactId)} title={C.target}
            className="text-left text-sm font-semibold text-[var(--accent-link)] hover:underline">{r.targetSubject} ↗</button>
          <p className="mt-3 text-[11px] font-medium text-ink-muted">{C.previous}</p>
          <blockquote className="mt-1 text-sm leading-relaxed text-ink-secondary">{r.assumptionQuote}</blockquote>
          <p className="mt-3 text-[11px] font-medium text-ink-muted">{C.newSignal}</p>
          <blockquote className="mt-1 text-sm leading-relaxed text-ink-secondary">{r.eventQuote}</blockquote>
          <p className="mt-3 text-[11px] font-medium text-ink-muted">{C.why}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{r.reason}</p>
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer text-[var(--accent-link)]">{C.sources}</summary>
            <div className="mt-2 space-y-2">
              <p className="text-ink-muted">{C.connection}: {r.dependency}</p>
              <p className="font-medium text-ink-secondary">{C.previous}</p>
              <Evidence evidence={r.decisionEvidence} quote={r.assumptionQuote} />
              <p className="font-medium text-ink-secondary">{C.event}</p>
              <Evidence evidence={r.eventEvidence} quote={r.eventQuote} />
            </div>
          </details>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={!!busy}
              onClick={() => submit('PATCH', { id: r.id, review: 'reconsider' }, r.id)}
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-medium text-[var(--accent-fg)] disabled:opacity-50">
              {busy === r.id ? C.saving : C.reconsider}
            </button>
            <button type="button" disabled={!!busy}
              onClick={() => submit('PATCH', { id: r.id, review: 'not_related' }, r.id)}
              className="rounded-lg border border-line px-3 py-2 text-xs text-ink-secondary disabled:opacity-50">{C.unrelated}</button>
          </div>
        </article>)}
      </div>
      {open && reviewed.length > 0 && <details className="mt-3 text-xs text-ink-muted">
        <summary className="cursor-pointer">{C.reviewed} · {reviewed.length}</summary>
        <ul className="mt-2 space-y-2">
          {reviewed.map(r => <li key={r.id}>{r.targetSubject} — {r.review === 'reconsider' ? C.marked : C.dismissed}</li>)}
        </ul>
      </details>}
      {open && data && (
        <div className="mt-3 space-y-2 border-t border-line-soft pt-3">
          {data.signals.length ? <>
            <label htmlFor="impact-event" className="block text-xs font-medium text-ink-secondary">{C.signal}</label>
            <select id="impact-event" value={eventId} disabled={!!busy}
              onChange={e => { setEventId(e.target.value); setCoverage(null); }}
              className="w-full rounded-lg border border-line bg-white px-2 py-2 text-xs text-ink">
              {data.signals.map(s => <option key={s.candidateId} value={s.candidateId}>
                {fmtDate(s.timestamp)} · {s.content.slice(0, 100)}
              </option>)}
            </select>
            <button type="button" disabled={!!busy || !eventId}
              onClick={() => submit('POST', { eventId }, 'analyze')}
              className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-fill-soft disabled:opacity-50">
              {busy === 'analyze' ? C.checking : C.check}
            </button>
          </> : <p className="text-xs text-ink-muted">{C.noSignal}</p>}
        </div>
      )}
      {open && <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">{C.advisory}</p>}
    </section>
  );
}
