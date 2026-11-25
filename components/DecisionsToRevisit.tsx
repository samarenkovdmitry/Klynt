'use client';

import { useEffect, useState } from 'react';
import { RiArrowRightUpLine } from '@remixicon/react';
import type { ImpactEvidence, ImpactRecord } from '@/lib/ai/impact-analysis';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Copy belongs to this experimental drawer surface; both deployments use it.
const copy = {
  en: {
    title: 'Decisions to revisit', intro: 'A recent change may affect earlier agreements in other areas.',
    target: 'Open area', previous: 'Earlier decision', newSignal: 'New signal', why: 'Why revisit', sources: 'Evidence and connection',
    event: 'New signal', connection: 'Dependency', reconsider: 'Reconsider', unrelated: 'Not related',
    marked: 'Marked for review', dismissed: 'Dismissed for this change', saving: 'Saving…',
    advisory: 'Suggestions only. Existing approvals stay unchanged.',
    loadError: 'Could not load recommendations. Try again.', retry: 'Retry',
    error: 'Could not complete the check. Try again.',
    history_limit: 'This project exceeds the current pilot history limit. No partial analysis was performed.',
    rate_limited: 'The check limit has been reached. Try again in an hour.',
    outdated: 'This recommendation changed. Reload it before making a decision.',
    reviewed: 'Reviewed suggestions',
  },
};

type Data = { recommendations: ImpactRecord[] };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US',
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
  const C = copy.en;
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
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
        setError('');
      })
      .catch(e => { if (!controller.signal.aborted) setError(e.message === 'history_limit' ? C.history_limit : C.loadError); });
    return () => controller.abort();
  }, [endpoint, reload, C]);

  async function submit(body: Record<string, string>, key: string) {
    setBusy(key);
    setError('');
    try {
      const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) { setError(errorText(result.error)); return; }
      setData(previous => previous ? { ...previous, recommendations: result.recommendations } : null);
    } catch {
      setError(C.error);
    } finally {
      setBusy(null);
    }
  }

  const active = data?.recommendations.filter(r => !r.review) || [];
  const reviewed = data?.recommendations.filter(r => r.review) || [];

  if (!data) {
    return error ? (
      <div role="alert" className="text-xs text-red-700">
        {error}
        <button type="button" onClick={() => setReload(n => n + 1)} className="ml-2 underline">{C.retry}</button>
      </div>
    ) : null;
  }
  if (!active.length && !reviewed.length) return null;

  return (
    <section aria-labelledby="impact-heading" className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
      <h3 id="impact-heading" className="flex items-center gap-1.5 text-sm font-semibold text-ink">
        {C.title}
        {active.length > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1 text-[11px] font-semibold leading-none text-amber-800">{active.length}</span>
        )}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{C.intro}</p>
      {error && <div role="alert" className="mt-3 text-xs text-red-700">{error}</div>}
      <div className="mt-3 space-y-3">
        {active.map(r => <article key={r.id} className="rounded-lg border border-line bg-white p-3">
          <button type="button" onClick={() => onOpenFact(r.targetFactId)} title={C.target}
            className="inline-flex items-center gap-1 text-left text-sm font-semibold text-[var(--accent-link)] hover:underline">
            {capitalize(r.targetSubject)}
            <RiArrowRightUpLine size={13} className="shrink-0" />
          </button>
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
              onClick={() => submit({ id: r.id, review: 'reconsider' }, r.id)}
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-medium text-[var(--accent-fg)] disabled:opacity-50">
              {busy === r.id ? C.saving : C.reconsider}
            </button>
            <button type="button" disabled={!!busy}
              onClick={() => submit({ id: r.id, review: 'not_related' }, r.id)}
              className="rounded-lg border border-line px-3 py-2 text-xs text-ink-secondary disabled:opacity-50">{C.unrelated}</button>
          </div>
        </article>)}
      </div>
      {reviewed.length > 0 && <details className="mt-3 text-xs text-ink-muted">
        <summary className="cursor-pointer">{C.reviewed} · {reviewed.length}</summary>
        <ul className="mt-2 space-y-2">
          {reviewed.map(r => <li key={r.id}>{r.targetSubject} — {r.review === 'reconsider' ? C.marked : C.dismissed}</li>)}
        </ul>
      </details>}
      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">{C.advisory}</p>
    </section>
  );
}
