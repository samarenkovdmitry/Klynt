// Pipeline scenario harness: seeds raw events into a dedicated test project,
// runs the REAL processProjectEvents with a stubbed interpreter (no LLM),
// and asserts the resulting facts/conflicts/candidates. Deterministic — the
// pipeline's DB behaviour is what is under test, not the model.
// Run: tsx --env-file=.env.local scripts/scenario-pipeline.ts
import { supabase } from '../lib/db/supabase';
import { createProject, createRawEvent } from '../lib/db/queries';
import { processProjectEvents, applyCandidateToFacts } from '../lib/pipeline';
import { resolveSlackMessageEvent } from '../lib/slack-events';
import type { AIInterpretation, EventInput } from '../lib/ai/event-processor';

const PROJECT_NAME = '_scenarios_test';
const TABLES = [
  'impact_recommendations', 'conflicts', 'fact_history',
  'candidate_events', 'project_facts', 'entities', 'raw_events',
];

const I = (over: Partial<AIInterpretation>): AIInterpretation => ({
  event_type: 'discussion', subject: 'misc', confidence: 0.9,
  importance: 'medium', reason: 'fixture',
  related_entities: [], potential_impacts: [], ...over,
});

const interp = (map: [string, Partial<AIInterpretation>][]) =>
  async (ev: EventInput): Promise<AIInterpretation> => {
    for (const [needle, over] of map) {
      if ((ev.content || '').includes(needle)) return I(over);
    }
    return I({});
  };

type Ctx = { previousEvents?: EventInput[]; projectFacts?: any[]; threadContext?: EventInput[] };

let failures = 0;
function check(ok: boolean, label: string) {
  console.log(`   ${ok ? '✓' : '✗ FAIL'} ${label}`);
  if (!ok) failures++;
}

async function getProject(): Promise<string> {
  const { data } = await supabase.from('projects').select('id').eq('name', PROJECT_NAME).limit(1).maybeSingle();
  if (data) return data.id;
  return (await createProject(PROJECT_NAME, 'Pipeline scenario fixtures')).id;
}

async function wipe(projectId: string) {
  for (const t of TABLES) await supabase.from(t).delete().eq('project_id', projectId);
}

async function db(projectId: string) {
  const [f, c, cand, h, r] = await Promise.all([
    supabase.from('project_facts').select('*').eq('project_id', projectId),
    supabase.from('conflicts').select('*').eq('project_id', projectId),
    supabase.from('candidate_events').select('*').eq('project_id', projectId),
    supabase.from('fact_history').select('*').eq('project_id', projectId),
    supabase.from('raw_events').select('*').eq('project_id', projectId),
  ]);
  return {
    facts: f.data || [], conflicts: c.data || [], candidates: cand.data || [],
    history: h.data || [], raws: r.data || [],
  };
}

async function emit(projectId: string, e: { content?: string; ts: string; id: string; source?: string; meta?: any }) {
  await createRawEvent({
    project_id: projectId,
    source: (e.source || 'slack') as any,
    source_event_id: e.id,
    event_type: 'message' as any,
    timestamp: e.ts,
    content: e.content,
    metadata: e.meta || {},
  });
}

async function main() {
  const projectId = await getProject();
  console.log(`Scenario project: ${projectId}\n`);

  // ── 1. Subject drift: conflict links via previous_fact_id and auto-resolves
  console.log('1) subject drift → conflict linked + auto-resolved by evidence');
  await wipe(projectId);
  await emit(projectId, { id: 's1a', ts: '2026-03-01T10:00Z', content: 'Client approved Dark mode for mobile.' });
  await emit(projectId, { id: 's1b', ts: '2026-03-02T10:00Z', content: 'Anna asked to remove Dark Mode from mobile.' });
  await emit(projectId, { id: 's1c', ts: '2026-03-03T10:00Z', content: 'Client confirmed: dark mode stays in mobile.' });
  await processProjectEvents(projectId, interp([
    ['asked to remove', { event_type: 'request', subject: 'Dark Mode', action: 'remove' }],
    ['approved', { event_type: 'decision', subject: 'Dark mode', action: 'approve' }],
    ['confirmed', { event_type: 'approval', subject: 'dark mode', action: 'approve' }],
  ]));
  {
    const d = await db(projectId);
    const conflict = d.conflicts[0];
    check(d.facts.length === 1, `one fact despite subject drift (got ${d.facts.length})`);
    check(!!conflict && conflict.previous_fact_id === d.facts[0]?.id, 'conflict carries previous_fact_id');
    check(conflict?.status === 'resolved' && /new evidence/i.test(conflict?.resolution || ''),
      `conflict auto-resolved by evidence (status=${conflict?.status})`);
    check(d.candidates.length === 3, `all 3 events became candidates (got ${d.candidates.length})`);
  }

  // ── 2. Containment merge: "flow tooltips" is the same entity as "flow"
  console.log('2) containment merge — qualified name stays one fact');
  await wipe(projectId);
  await emit(projectId, { id: 's2a', ts: '2026-03-01T10:00Z', content: 'Onboarding flow approved.' });
  await emit(projectId, { id: 's2b', ts: '2026-03-02T10:00Z', content: 'Onboarding flow tooltips changed per review.' });
  await processProjectEvents(projectId, interp([
    ['approved', { event_type: 'decision', subject: 'Onboarding flow', action: 'approve' }],
    ['changed', { event_type: 'change', subject: 'Onboarding flow tooltips', action: 'modify' }],
  ]));
  {
    const d = await db(projectId);
    check(d.facts.length === 1, `qualified subject merged into one fact (got ${d.facts.length})`);
    check(d.history.length >= 2, `both events in fact history (got ${d.history.length})`);
  }

  // ── 3. Low confidence stays pending — visible but not a fact
  console.log('3) low confidence → pending candidate, no fact');
  await wipe(projectId);
  await emit(projectId, { id: 's3a', ts: '2026-03-01T10:00Z', content: 'Maybe we should revisit the colors at some point.' });
  await processProjectEvents(projectId, interp([
    ['revisit', { event_type: 'idea', subject: 'Colors', confidence: 0.5 }],
  ]));
  {
    const d = await db(projectId);
    check(d.candidates[0]?.status === 'pending', `candidate is pending (got ${d.candidates[0]?.status})`);
    check(d.facts.length === 0, 'no fact created from a weak signal');
    check(!!d.raws[0]?.processed_at, 'raw event still marked processed');
  }

  // ── 4. Dead letter: permanently failing event is skipped, not retried forever
  console.log('4) dead letter after 5 attempts');
  await wipe(projectId);
  await emit(projectId, { id: 's4a', ts: '2026-03-01T10:00Z', content: 'Broken payload event.' });
  const boom = async (): Promise<AIInterpretation> => { throw new Error('fixture failure'); };
  for (let i = 0; i < 5; i++) await processProjectEvents(projectId, boom);
  {
    const d = await db(projectId);
    const raw = d.raws[0];
    check(!!raw?.processed_at, 'dead-lettered event marked processed');
    check((raw?.metadata?.processing_attempts || 0) >= 5, `attempts tracked (got ${raw?.metadata?.processing_attempts})`);
    check(d.candidates.length === 0, 'no candidate produced');
  }

  // ── 5. Thread context: a bare "yes, confirmed" reply sees its parent
  console.log('5) thread context reaches the interpreter');
  await wipe(projectId);
  await emit(projectId, { id: '1700000000.0001', ts: '2026-03-01T10:00Z', content: 'Shall we move the release to Friday?', meta: { channel: 'C1' } });
  await emit(projectId, { id: '1700000000.0002', ts: '2026-03-01T10:05Z', content: 'yes, confirmed', meta: { channel: 'C1', thread_ts: '1700000000.0001' } });
  {
    let seen: Ctx | undefined;
    await processProjectEvents(projectId, async (ev, ctx) => {
      if ((ev.content || '').includes('yes, confirmed')) seen = ctx;
      return I((ev.content || '').includes('confirmed')
        ? { event_type: 'approval', subject: 'Release date', action: 'approve' }
        : { event_type: 'question', subject: 'Release date' });
    });
    check(!!seen?.threadContext?.length, 'reply received threadContext');
    check((seen?.threadContext || []).some(e => (e.content || '').includes('release to Friday')),
      'parent message included in threadContext');
  }

  // ── 6. Slack routing: noise skipped, edits stored as new statements
  console.log('6) slack message routing (pure)');
  {
    const del = resolveSlackMessageEvent({ type: 'message', subtype: 'message_deleted', ts: '1' });
    check(del.kind === 'skip', 'message_deleted skipped');
    const join = resolveSlackMessageEvent({ type: 'message', subtype: 'channel_join', text: 'x joined', ts: '1' });
    check(join.kind === 'skip', 'channel_join skipped');
    const bot = resolveSlackMessageEvent({ type: 'message', subtype: 'bot_message', text: 'bot', ts: '1' });
    check(bot.kind === 'skip', 'bot_message skipped');
    const edit = resolveSlackMessageEvent(
      { type: 'message', subtype: 'message_changed', ts: '10', channel: 'C1', message: { ts: '9', text: 'release moved to next Friday', user: 'U1' } },
      '10',
    );
    check(edit.kind === 'edit' && edit.kind === 'edit' && edit.editedTs === '9', 'message_changed resolved as edit');
    const plain = resolveSlackMessageEvent({ type: 'message', ts: '5', text: 'hello', user: 'U2', channel: 'C1' });
    check(plain.kind === 'message' && plain.text === 'hello', 'plain message passes through');
    const empty = resolveSlackMessageEvent({ type: 'message', ts: '6' });
    check(empty.kind === 'skip', 'content-free event skipped');
  }

  // ── 7. Pending → human confirm → fact via the same pipeline
  console.log('7) pending candidate promoted by confirmation');
  await wipe(projectId);
  await emit(projectId, { id: 's7a', ts: '2026-03-01T10:00Z', content: 'We might go with the compact sidebar after all.' });
  await processProjectEvents(projectId, interp([
    ['compact sidebar', { event_type: 'decision', subject: 'Sidebar', action: 'approve', confidence: 0.5 }],
  ]));
  {
    let d = await db(projectId);
    check(d.candidates[0]?.status === 'pending' && d.facts.length === 0, 'weak decision stays pending');
    const cand = d.candidates[0];
    const raw = d.raws[0];
    await applyCandidateToFacts(projectId, raw, cand, I({
      event_type: cand.event_type, subject: cand.subject, action: cand.action,
      confidence: cand.confidence,
    }), []);
    d = await db(projectId);
    check(d.facts.length === 1 && d.facts[0].subject === 'Sidebar', 'confirmed candidate creates the fact');
    check(d.history.length === 1, 'history records the confirmed event');
  }

  // ── 8. Telegram reply context: reply_to_message_id links to the parent
  console.log('8) telegram reply reaches the interpreter with parent context');
  await wipe(projectId);
  await emit(projectId, { id: '501', ts: '2026-03-01T10:00Z', source: 'telegram', content: 'Proposal: switch to the compact sidebar', meta: { chat_id: 1 } });
  await emit(projectId, { id: '502', ts: '2026-03-01T10:05Z', source: 'telegram', content: 'agreed', meta: { chat_id: 1, reply_to_message_id: 501 } });
  {
    let seen: Ctx | undefined;
    await processProjectEvents(projectId, async (ev, ctx) => {
      if (ev.content === 'agreed') seen = ctx;
      return I(ev.content === 'agreed'
        ? { event_type: 'approval', subject: 'Sidebar', action: 'approve' }
        : { event_type: 'request', subject: 'Sidebar', action: 'modify' });
    });
    check(!!seen?.threadContext?.length, 'telegram reply received threadContext');
    check((seen?.threadContext || []).some(e => (e.content || '').includes('compact sidebar')),
      'parent message included for telegram reply');
  }

  console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll scenario checks passed');
  process.exitCode = failures ? 1 : 0;
}

main().catch(e => { console.error(e); process.exit(1); });
