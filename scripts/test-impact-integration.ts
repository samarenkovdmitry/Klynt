// End-to-end check of impact analysis against the real database.
// Uses a mock LLM (no paid calls); creates a throwaway project and removes it.
// Run: tsx scripts/test-impact-integration.ts
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { loadImpactContext, listImpact, saveImpact, reviewImpact, ImpactError } from '../lib/db/impact';
import { analyzeImpact } from '../lib/ai/impact-analysis';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } });

let passed = 0;
const check = async (name: string, fn: () => unknown) => {
  try { await fn(); passed++; console.log(`ok ${name}`); }
  catch (e: any) { console.error(`FAIL ${name}:`, e.message); process.exitCode = 1; }
};
const iso = (d: string) => new Date(d).toISOString();

async function main() {
  const { data: project } = await sb.from('projects')
    .insert({ name: `impact-e2e-${Date.now()}` }).select().single();
  assert.ok(project, 'project insert failed — check service key');
  const pid = project.id;
  console.log('project:', pid);
  const { data: users } = await sb.auth.admin.listUsers();
  const userId = users.users[0]?.id;
  assert.ok(userId, 'no auth user available for reviewed_by');
  try {
    const raws: Record<string, string> = {};
    for (const [key, row] of Object.entries({
      pay: { sid: 'p1', src: 'slack', ts: '2025-03-01', text: 'Client approved adding bank transfer as a new payment method.', ch: 'CPAY' },
      co: { sid: 'c1', src: 'slack', ts: '2025-02-01', text: 'Checkout approved: we confirm payment instantly and show the success state right away.', ch: 'CPROD' },
      icon: { sid: 'i1', src: 'figma', ts: '2025-02-10', text: 'App icon approved in blue.', file: 'abc123', comment: 'cm9' },
      fig: { sid: 'f1', src: 'figma', ts: '2025-02-20', text: 'Checkout updated with a Pending confirmation state.', file: 'abc123', version: 'v3' },
      unrel: { sid: 'u1', src: 'slack', ts: '2025-02-15', text: 'Team lunch moved to Thursday.', ch: 'CRAND' },
    })) {
      const { data } = await sb.from('raw_events').insert({
        project_id: pid, source: row.src, source_event_id: row.sid, event_type: 'message',
        timestamp: iso(row.ts), content: row.text, author_id: 'U1',
        metadata: { channel: (row as any).ch, team_id: 'T1', file_key: (row as any).file, comment_id: (row as any).comment, version_id: (row as any).version, author: { id: 'U1', name: 'Sara' } },
      }).select('id').single();
      raws[key] = data!.id;
    }
    const cands: Record<string, string> = {};
    for (const [key, raw, subject, type] of [
      ['pay', raws.pay, 'Payment method', 'change'],
      ['co', raws.co, 'Checkout flow', 'approval'],
      ['icon', raws.icon, 'App icon', 'approval'],
      ['fig', raws.fig, 'Checkout flow', 'change'],
      ['unrel', raws.unrel, 'Team lunch', 'discussion'],
    ] as const) {
      const { data } = await sb.from('candidate_events').insert({
        raw_event_id: raw, project_id: pid, event_type: type, subject,
        confidence: 0.9, importance: 'high', status: 'confirmed',
      }).select('id').single();
      cands[key] = data!.id;
    }
    const facts: Record<string, string> = {};
    for (const [key, subject, state, ts] of [
      ['pay', 'Payment method', 'added', '2025-03-01'],
      ['co', 'Checkout flow', 'approved', '2025-02-01'],
      ['icon', 'App icon', 'approved', '2025-02-10'],
    ] as const) {
      const { data } = await sb.from('project_facts').insert({
        project_id: pid, subject, subject_type: 'design_component', fact_type: 'state',
        current_state: state, confidence: 0.9, last_updated_at: iso(ts),
      }).select('id').single();
      facts[key] = data!.id;
    }
    await sb.from('fact_history').insert([
      { fact_id: facts.pay, project_id: pid, new_state: 'added', event_id: cands.pay, decided_at: iso('2025-03-01'), confidence: 0.9 },
      { fact_id: facts.co, project_id: pid, new_state: 'approved', event_id: cands.co, decided_at: iso('2025-02-01'), confidence: 0.9, reason: 'Approved by client' },
      { fact_id: facts.icon, project_id: pid, new_state: 'approved', event_id: cands.icon, decided_at: iso('2025-02-10'), confidence: 0.9 },
    ]);

    let ctx = await loadImpactContext(pid, facts.pay);
    await check('signal list contains the payment event', () =>
      assert.equal(ctx.signals[0]?.candidateId, cands.pay));
    await check('decisions exclude source fact and non-approvals', () =>
      assert.deepEqual(ctx.decisionsFor(iso('2025-03-01')).map(d => d.factId).sort(), [facts.co, facts.icon].sort()));
    await check('checkout decision carries later evidence', () =>
      assert.ok(ctx.decisionsFor(iso('2025-03-01')).find(d => d.factId === facts.co)!.laterEvidence.length >= 1));

    const analysis = await analyzeImpact({
      sourceFactId: facts.pay, event: ctx.signals[0],
      decisions: ctx.decisionsFor(ctx.signals[0].timestamp),
      asOf: new Date().toISOString(), locale: 'en',
    }, () => Promise.resolve(JSON.stringify({ assessments: [
      { decisionId: ctx.decisionsFor(ctx.signals[0].timestamp).find(d => d.factId === facts.co)!.id,
        verdict: 'revisit', assumptionQuote: 'we confirm payment instantly',
        eventQuote: 'bank transfer as a new payment method',
        reason: 'Bank transfers settle asynchronously; the approved flow assumes instant confirmation.',
        dependency: 'Instant confirmation may not hold for bank transfer.' },
      { decisionId: ctx.decisionsFor(ctx.signals[0].timestamp).find(d => d.factId === facts.icon)!.id, verdict: 'unrelated' },
    ] })));
    await check('analysis yields one grounded suggestion', () => assert.equal(analysis.suggestions.length, 1));

    let list: Awaited<ReturnType<typeof listImpact>> = [];
    await check('recommendation persisted and listed', async () => {
      await saveImpact(ctx, cands.pay, analysis.suggestions);
      list = await listImpact(await loadImpactContext(pid, facts.pay));
      assert.equal(list.length, 1);
      assert.equal(list[0].targetSubject, 'Checkout flow');
      assert.equal(list[0].decisionEvidence.url!.includes('app.slack.com'), true);
      assert.ok(list[0].eventEvidence.url!.includes('app.slack.com'));
    });
    if (!list.length) throw new Error('stopping: persistence failed');
    await check('duplicate save is idempotent', async () => {
      await saveImpact(ctx, cands.pay, analysis.suggestions);
      assert.equal((await listImpact(await loadImpactContext(pid, facts.pay))).length, 1);
    });
    await check('review records reconsider once', async () => {
      await reviewImpact(await loadImpactContext(pid, facts.pay), list[0].id, 'reconsider', userId);
      const after = await listImpact(await loadImpactContext(pid, facts.pay));
      assert.equal(after[0].review, 'reconsider');
      await assert.rejects(
        reviewImpact(await loadImpactContext(pid, facts.pay), list[0].id, 'not_related', userId),
        (e: any) => e instanceof ImpactError && e.status === 409);
    });
    await check('recommendation visible from target fact too', async () => {
      const targetList = await listImpact(await loadImpactContext(pid, facts.co));
      assert.equal(targetList.length, 1);
    });
    await check('stale recommendation hidden after fact change', async () => {
      await sb.from('project_facts').update({ current_state: 'modify', updated_at: new Date().toISOString() })
        .eq('id', facts.co);
      const stale = await listImpact(await loadImpactContext(pid, facts.pay));
      assert.equal(stale.length, 0);
    });
  } finally {
    const { error } = await sb.from('projects').delete().eq('id', pid);
    console.log('cleanup:', error ? error.message : `project ${pid} deleted`);
  }
  console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`);
}

main().catch(e => { console.error('fatal:', e); process.exitCode = 1; });
