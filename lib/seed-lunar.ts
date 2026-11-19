import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { LUNAR_AREAS, LUNAR_PEOPLE, LUNAR_IMPACTS, type DemoState } from './demo-lunar';
import { IMPACT_VERSION, validateImpact } from './ai/impact-analysis';

// Also used by the explicit refresh script, so new and existing samples agree.
export function buildLunarSeed(projectId: string, now = new Date(), existingMembers: { id: string; external_user_id: string; external_source: string }[] = []) {
  const timestamp = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();
  const rows = LUNAR_AREAS.flatMap(area => area.events.map(event => ({
    area, event, rawId: randomUUID(), candidateId: randomUUID(), historyId: randomUUID(),
    at: timestamp(event.hoursAgo),
  }))).sort((a, b) => a.at.localeCompare(b.at));
  if (new Set(rows.map(r => r.event.key)).size !== rows.length) throw new Error('Duplicate demo event key');
  const byKey = new Map(rows.map(row => [row.event.key, row]));
  const factIds = new Map(LUNAR_AREAS.map(area => [area.subject, randomUUID()]));
  const memberIds = new Map(Object.entries(LUNAR_PEOPLE).map(([name, person]) => [
    name, existingMembers.find(m => m.external_user_id === `demo_${name.toLowerCase()}` && m.external_source === person.source)?.id || randomUUID(),
  ]));
  const labels: Record<DemoState, string> = {
    approved: 'Approved', in_progress: 'In progress', out_of_scope: 'Out of scope', undecided: 'Needs decision',
  };
  const project_members = Object.entries(LUNAR_PEOPLE).map(([name, person]) => ({
    id: memberIds.get(name)!, project_id: projectId, name, role: person.role,
    external_user_id: `demo_${name.toLowerCase()}`, external_source: person.source,
  }));
  const raw_events = rows.map(({ event, rawId, at }) => ({
    id: rawId, project_id: projectId, source: event.source,
    source_event_id: `lunar_v2_${event.key}`,
    event_type: event.source === 'slack' ? 'message' : 'comment',
    author_id: event.author, timestamp: at, content: event.content,
    // Deliberately no fabricated provider URLs or file/channel ids.
    metadata: { author: { name: event.author }, demo: true, channel_name: 'lunar-mobile' },
    processed_at: at, created_at: at,
  }));
  const candidate_events = rows.map(({ area, event, rawId, candidateId, at }) => ({
    id: candidateId, project_id: projectId, raw_event_id: rawId,
    event_type: event.type, subject: area.subject, action: event.action,
    confidence: event.type === 'idea' || event.type === 'discussion' ? 0.85 : 0.96,
    importance: area.importance, reason: event.reason, related_entities: [area.subject],
    potential_impacts: [], status: 'confirmed', created_at: at, updated_at: at,
  }));
  const project_facts = LUNAR_AREAS.map(area => {
    const events = rows.filter(r => r.area === area && r.event.state);
    const latest = events.at(-1)!;
    if (!latest) throw new Error(`Missing decision state: ${area.subject}`);
    return {
      id: factIds.get(area.subject)!, project_id: projectId, subject: area.subject,
      subject_type: 'design_component', fact_type: 'state', current_state: latest.event.state!,
      current_value: { scope: area.scope, display_state: labels[latest.event.state!] },
      confidence: latest.event.state === 'undecided' ? 0.75 : 0.96,
      importance: area.importance, evidence_summary: latest.event.reason,
      primary_event_id: latest.candidateId, last_updated_at: latest.at,
      created_at: events[0].at, updated_at: latest.at,
    };
  });
  const previous = new Map<string, DemoState>();
  const fact_history = rows.filter(r => r.event.state).map(({ area, event, candidateId, rawId, historyId, at }) => {
    const before = previous.get(area.subject) || null;
    previous.set(area.subject, event.state!);
    return {
      id: historyId, project_id: projectId, fact_id: factIds.get(area.subject)!,
      event_id: candidateId, previous_state: before, new_state: event.state!,
      new_value: { scope: area.scope, display_state: labels[event.state!] },
      decided_by: memberIds.get(event.author)!, decided_at: at,
      confidence: event.state === 'undecided' ? 0.75 : 0.96,
      reason: event.reason, evidence: [rawId], created_at: at,
    };
  });
  const fact_evidence = rows.map(({ area, rawId, at }) => ({
    id: randomUUID(), project_id: projectId, fact_id: factIds.get(area.subject)!,
    raw_event_id: rawId, relevance_score: 1, created_at: at,
  }));
  const conflicts = LUNAR_AREAS.filter(area => area.conflict).map(area => {
    const conflict = area.conflict!;
    const proposal = byKey.get(conflict.event)!;
    const resolved = conflict.resolvedBy ? byKey.get(conflict.resolvedBy)! : null;
    if (!proposal || (conflict.resolvedBy && !resolved)) throw new Error('Missing conflict evidence');
    return {
      id: randomUUID(), project_id: projectId, subject: area.subject, conflict_type: conflict.type,
      previous_fact_id: factIds.get(area.subject)!, new_event_id: proposal.candidateId,
      status: resolved ? 'resolved' : 'unresolved', description: conflict.description,
      resolution: resolved?.event.reason || null,
      resolved_by: resolved ? memberIds.get(resolved.event.author)! : null,
      resolved_at: resolved?.at || null, detected_at: proposal.at, created_at: proposal.at,
    };
  });
  return { project_members, raw_events, candidate_events, project_facts, fact_history, fact_evidence, conflicts, byKey, factIds };
}

export async function seedLunarProject(db: SupabaseClient, projectId: string, now = new Date(), seed = buildLunarSeed(projectId, now)) {
  const tables = ['project_members', 'raw_events', 'candidate_events', 'project_facts', 'fact_history', 'fact_evidence', 'conflicts'] as const;
  for (const table of tables) {
    const records: Record<string, unknown>[] = seed[table];
    const { error } = table === 'project_members'
      ? await db.from(table).upsert(records, { onConflict: 'id' })
      : await db.from(table).insert(records);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  // Read timestamp representation back before computing the revision used by
  // listImpact. PostgreSQL returns +00:00 rather than the input's trailing Z.
  const { data: facts, error } = await db.from('project_facts').select('*').eq('project_id', projectId);
  if (error) throw error;
  const recommendations = LUNAR_IMPACTS.map(impact => {
    const source = seed.byKey.get(impact.source)!;
    const target = seed.byKey.get(impact.target)!;
    const fact = facts!.find(f => f.id === seed.factIds.get(target.area.subject))!;
    const revision = JSON.stringify([
      fact.updated_at, fact.primary_event_id,
      ...seed.candidate_events.filter(e => e.subject === target.area.subject).map(e => e.id).sort(),
    ]);
    const evidence = (row: typeof source) => ({
      id: row.rawId, source: row.event.source, timestamp: row.at, content: row.event.content, author: row.event.author,
    });
    // Exercise the same evidence validator as live recommendations.
    validateImpact({ assessments: [{
      decisionId: target.historyId, verdict: 'revisit',
      assumptionQuote: impact.assumption, eventQuote: impact.signal,
      reason: impact.reason, dependency: impact.dependency,
    }] }, {
      sourceFactId: seed.factIds.get(source.area.subject)!,
      event: evidence(source), asOf: now.toISOString(), locale: 'en',
      decisions: [{
        id: target.historyId, factId: fact.id, subject: fact.subject, state: fact.current_state,
        revision, evidence: evidence(target), laterEvidence: [],
      }],
    });
    return {
      project_id: projectId, source_fact_id: seed.factIds.get(source.area.subject)!,
      source_event_id: source.candidateId, source_raw_event_id: source.rawId,
      target_fact_id: fact.id, decision_history_id: target.historyId,
      decision_raw_event_id: target.rawId, target_revision: revision,
      assumption_quote: impact.assumption, event_quote: impact.signal,
      reason: impact.reason, dependency: impact.dependency,
      analysis_version: IMPACT_VERSION, created_at: source.at,
    };
  });
  const result = await db.from('impact_recommendations').insert(recommendations);
  if (result.error) throw result.error;
  return { facts: seed.project_facts.length, events: seed.raw_events.length, conflicts: seed.conflicts.length, impacts: recommendations.length };
}
