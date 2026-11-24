import { supabase, type CandidateEvent, type FactHistory, type ProjectFact, type RawEvent } from './supabase';
import { subjectsMatch } from './queries';
import { IMPACT_VERSION, type ImpactDecision, type ImpactEvidence, type ImpactRecord, type ImpactSuggestion } from '../ai/impact-analysis';

const LIMIT = 500;
const approved = new Set(['approve', 'approved', 'confirmed']);
const signalTypes = new Set(['decision', 'approval', 'change', 'scope_change', 'request']);
const normalized = (s: string) => s.trim().toLowerCase();

export class ImpactError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}

function checked<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

// Provider URLs come from trusted ids rather than AI output.
function sourceUrl(raw: RawEvent): string | undefined {
  const m = raw.metadata || {};
  if (raw.source === 'figma' && m.file_key) {
    const url = new URL(`https://www.figma.com/file/${encodeURIComponent(m.file_key)}`);
    const comment = m.comment_id || m.comment?.id;
    const version = m.version_id || m.version?.id;
    if (comment) url.searchParams.set('comment-id', comment);
    else if (version) url.searchParams.set('version-id', version);
    return url.toString();
  }
  if (raw.source === 'slack' && m.team_id && (m.channel_id || m.channel)) {
    return `https://app.slack.com/client/${encodeURIComponent(m.team_id)}/${encodeURIComponent(m.channel_id || m.channel)}/${encodeURIComponent(raw.source_event_id)}`;
  }
  if (raw.source === 'linear' && typeof m.url === 'string') {
    try {
      const url = new URL(m.url);
      if (url.protocol === 'https:' && url.hostname === 'linear.app') return url.toString();
    } catch { /* The original quote remains available without a provider URL. */ }
  }
  if (raw.source === 'telegram' && String(m.chat_id).startsWith('-100') && /^\d+$/.test(raw.source_event_id)) {
    return `https://t.me/c/${String(m.chat_id).slice(4)}/${raw.source_event_id}`;
  }
}

function evidence(raw: RawEvent): ImpactEvidence {
  return {
    id: raw.id, content: raw.content || '', source: raw.source, timestamp: raw.timestamp,
    author: raw.metadata?.author?.name || raw.author_id, url: sourceUrl(raw),
  };
}

// Intentionally bounded pilot snapshot. Refuse incomplete histories rather than
// asserting that no dependency was found after silently dropping older data.
export async function loadImpactContext(projectId: string, factId: string) {
  const [factsResult, historyResult, candidatesResult, entitiesResult] = await Promise.all([
    supabase.from('project_facts').select('*').eq('project_id', projectId).limit(LIMIT + 1),
    supabase.from('fact_history').select('*').eq('project_id', projectId).order('decided_at', { ascending: false }).limit(LIMIT + 1),
    supabase.from('candidate_events').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(LIMIT + 1),
    supabase.from('entities').select('canonical_name, aliases').eq('project_id', projectId).limit(LIMIT + 1),
  ]);
  const facts = checked(factsResult) as ProjectFact[];
  const history = checked(historyResult) as FactHistory[];
  const candidates = checked(candidatesResult) as CandidateEvent[];
  const entities = checked(entitiesResult) as { canonical_name: string; aliases: string[] | null }[];
  if ([facts, history, candidates, entities].some(rows => rows.length > LIMIT)) {
    throw new ImpactError('history_limit', 422);
  }
  const fact = facts.find(f => f.id === factId);
  if (!fact) throw new ImpactError('not_found', 404);
  const ids = [...new Set(candidates.map(c => c.raw_event_id))];
  const rawEvents: RawEvent[] = [];
  for (let start = 0; start < ids.length; start += 100) {
    const result = await supabase.from('raw_events').select('*').eq('project_id', projectId).in('id', ids.slice(start, start + 100));
    rawEvents.push(...checked(result) as RawEvent[]);
  }
  const rawById = new Map(rawEvents.map(r => [r.id, r]));
  const eventById = new Map(candidates.map(c => [c.id, c]));
  function eventsFor(target: ProjectFact) {
    const names = [normalized(target.subject)];
    for (const e of entities) {
      if (normalized(e.canonical_name) === normalized(target.subject)) {
        for (const alias of e.aliases || []) names.push(normalized(alias));
      }
    }
    const eventIds = new Set(history.filter(h => h.fact_id === target.id).map(h => h.event_id));
    // Same matcher as entity resolution — a drifted or qualified subject
    // ("dark mode toggle" vs "dark mode") is still this fact's signal.
    return candidates.filter(c => eventIds.has(c.id) || names.some(n => subjectsMatch(n, c.subject)));
  }
  function revision(target: ProjectFact) {
    return JSON.stringify([target.updated_at, target.primary_event_id, ...eventsFor(target).map(c => c.id).sort()]);
  }
  const now = Date.now();
  const signals = eventsFor(fact).filter(c => {
    const raw = rawById.get(c.raw_event_id);
    return raw?.content && new Date(raw.timestamp).getTime() <= now &&
      signalTypes.has(c.event_type) && c.status === 'confirmed';
  }).sort((a, b) =>
    new Date(rawById.get(b.raw_event_id)!.timestamp).getTime() -
    new Date(rawById.get(a.raw_event_id)!.timestamp).getTime(),
  ).slice(0, 15).map(c => ({ ...evidence(rawById.get(c.raw_event_id)!), candidateId: c.id }));

  function decisionsFor(eventTimestamp: string): ImpactDecision[] {
    const decisions: ImpactDecision[] = [];
    for (const target of facts) {
      if (target.id === factId || !approved.has(normalized(target.current_state)) ||
          new Date(target.last_updated_at) >= new Date(eventTimestamp)) continue;
      const decision = history.find(h => h.fact_id === target.id);
      if (!decision || !approved.has(normalized(decision.new_state))) continue;
      const candidate = eventById.get(decision.event_id);
      const raw = candidate && rawById.get(candidate.raw_event_id);
      if (!raw?.content) continue;
      decisions.push({
        id: decision.id, factId: target.id, subject: target.subject,
        state: target.current_state, revision: revision(target), evidence: evidence(raw),
        laterEvidence: eventsFor(target)
          .map(c => rawById.get(c.raw_event_id))
          .filter((r): r is RawEvent => !!r?.content && r.id !== raw.id)
          .map(evidence),
      });
    }
    return decisions;
  }
  return { projectId, fact, facts, history, rawById, signals, revision, decisionsFor };
}

type Context = Awaited<ReturnType<typeof loadImpactContext>>;

export async function listImpact(context: Context): Promise<ImpactRecord[]> {
  const result = await supabase.from('impact_recommendations').select('*')
    .eq('project_id', context.projectId)
    .or(`source_fact_id.eq.${context.fact.id},target_fact_id.eq.${context.fact.id}`)
    .order('created_at', { ascending: false }).limit(101);
  const rows = checked(result);
  if (rows.length > 100) throw new ImpactError('history_limit', 422);
  return rows.flatMap(row => {
    const target = context.facts.find(f => f.id === row.target_fact_id);
    const original = context.rawById.get(row.decision_raw_event_id);
    const event = context.rawById.get(row.source_raw_event_id);
    if (!target || context.revision(target) !== row.target_revision || !original || !event ||
        !original.content?.includes(row.assumption_quote) || !event.content?.includes(row.event_quote)) return [];
    return [{
      id: row.id, decisionId: row.decision_history_id, targetFactId: row.target_fact_id,
      targetSubject: target.subject, revision: row.target_revision,
      assumptionQuote: row.assumption_quote, eventQuote: row.event_quote,
      reason: row.reason, dependency: row.dependency, review: row.review,
      decisionEvidence: evidence(original), eventEvidence: evidence(event),
    }];
  });
}

export async function saveImpact(context: Context, candidateId: string, suggestions: ImpactSuggestion[]) {
  if (!suggestions.length) return;
  const result = await supabase.from('impact_recommendations').upsert(suggestions.map(s => ({
    project_id: context.projectId, source_fact_id: context.fact.id, source_event_id: candidateId,
    source_raw_event_id: s.eventEvidence.id, target_fact_id: s.targetFactId,
    decision_history_id: s.decisionId, decision_raw_event_id: s.decisionEvidence.id,
    target_revision: s.revision, assumption_quote: s.assumptionQuote, event_quote: s.eventQuote,
    reason: s.reason, dependency: s.dependency, analysis_version: IMPACT_VERSION,
  })), { onConflict: 'project_id,source_event_id,decision_history_id', ignoreDuplicates: true });
  if (result.error) throw result.error;
}

export async function reviewImpact(context: Context, id: string, review: 'reconsider' | 'not_related', userId: string) {
  const active = (await listImpact(context)).find(r => r.id === id);
  if (!active || active.review) throw new ImpactError('outdated', 409);
  const result = await supabase.from('impact_recommendations')
    .update({ review, reviewed_by: userId, reviewed_at: new Date().toISOString() })
    .eq('project_id', context.projectId).eq('id', id).is('review', null).select('id').maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) throw new ImpactError('outdated', 409);
}
