// Mock checks for impact analysis — no LLM, no DB, no network.
// Verifies grounding rules: a suggestion must reference a real earlier
// approved decision and quote both sources verbatim.
import assert from 'node:assert/strict';
import {
  analyzeImpact, prepareImpact, MAX_IMPACT_DECISIONS,
  type ImpactDecision, type ImpactInput,
} from '../lib/ai/impact-analysis';

let passed = 0;
function check(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`ok ${name}`); })
    .catch(e => { console.error(`FAIL ${name}:`, e.message); process.exitCode = 1; });
}

async function main() {
const ev = (id: string, content: string, timestamp = '2025-03-01T00:00:00Z') =>
  ({ id, source: 'slack', timestamp, content });
const decision = (id: string, factId: string, subject: string, content: string, opts: Partial<ImpactDecision> = {}): ImpactDecision => ({
  id, factId, subject, state: 'approved', revision: 'r1',
  evidence: { id: `raw-${id}`, source: 'slack', timestamp: '2025-02-01T00:00:00Z', content },
  laterEvidence: [], ...opts,
});

const checkout = decision('d1', 'f-checkout', 'Checkout flow',
  'Checkout approved: we confirm payment instantly and show the success state right away.');
const icon = decision('d2', 'f-icon', 'App icon', 'App icon approved in blue.');
const event = ev('e1', 'Client approved adding bank transfer as a new payment method.');

const input: ImpactInput = {
  sourceFactId: 'f-payment', event,
  decisions: [checkout, icon], asOf: '2025-03-02T00:00:00Z', locale: 'en',
};

function llm(assessments: unknown) {
  return () => Promise.resolve(JSON.stringify({ assessments }));
}

const revisit = {
  decisionId: 'd1', verdict: 'revisit',
  assumptionQuote: 'we confirm payment instantly',
  eventQuote: 'bank transfer as a new payment method',
  reason: 'The approved checkout assumes instant confirmation; bank transfers settle asynchronously.',
  dependency: 'Instant confirmation may not hold for bank transfer.',
};
const unrelated = (id: string) => ({ decisionId: id, verdict: 'unrelated' });

await check('dependency → one grounded suggestion', async () => {
  const r = await analyzeImpact(input, llm([revisit, unrelated('d2')]));
  assert.equal(r.suggestions.length, 1);
  assert.equal(r.checked, 2);
  assert.equal(r.suggestions[0].targetSubject, 'Checkout flow');
  assert.equal(r.suggestions[0].eventEvidence.id, 'e1');
  assert.equal(r.suggestions[0].decisionEvidence.id, 'raw-d1');
});

await check('topic-only relation → unrelated → no suggestions', async () => {
  const r = await analyzeImpact(input, llm([unrelated('d1'), unrelated('d2')]));
  assert.equal(r.suggestions.length, 0);
});

await check('already_addressed → no suggestions', async () => {
  const r = await analyzeImpact(input, llm([
    { decisionId: 'd1', verdict: 'already_addressed' }, unrelated('d2'),
  ]));
  assert.equal(r.suggestions.length, 0);
});

await check('fabricated decisionId → rejected', async () => {
  await assert.rejects(
    analyzeImpact(input, llm([{ ...revisit, decisionId: 'fake' }, unrelated('d2')])),
    /Invalid impact decision reference/);
});

await check('quote absent from source → rejected', async () => {
  await assert.rejects(
    analyzeImpact(input, llm([{ ...revisit, assumptionQuote: 'a fabricated quote never said' }, unrelated('d2')])),
    /lacks grounded evidence/);
});

await check('incomplete assessments → rejected', async () => {
  await assert.rejects(
    analyzeImpact(input, llm([revisit])), /Incomplete impact assessment/);
});

await check('malformed JSON → rejected', async () => {
  await assert.rejects(analyzeImpact(input, () => Promise.resolve('not json')));
});

await check('prepareImpact filters wrong candidates', () => {
  const p = prepareImpact({
    ...input,
    decisions: [
      decision('same', 'f-payment', 'Payment', 'same fact'),
      decision('pending', 'f-x', 'X', 'x', { state: 'in_progress' }),
      decision('newer', 'f-y', 'Y', 'y', { evidence: { id: 'r', source: 's', timestamp: '2025-04-01', content: 'y' } }),
      checkout,
    ],
  });
  assert.deepEqual(p.decisions.map(d => d.id), ['d1']);
});

await check('one decision per fact, newest history wins', () => {
  const p = prepareImpact({
    ...input,
    decisions: [
      checkout,
      decision('d-older', 'f-checkout', 'Checkout flow', 'older approval',
        { evidence: { id: 'r2', source: 's', timestamp: '2025-01-15T00:00:00Z', content: 'older' } }),
    ],
  });
  assert.deepEqual(p.decisions.map(d => d.id), ['d1']);
});

await check('decision cap at MAX_IMPACT_DECISIONS', () => {
  const many = Array.from({ length: 30 }, (_, i) =>
    decision(`d${i}`, `f${i}`, `S${i}`, `approved thing ${i}`,
      { evidence: { id: `r${i}`, source: 's', timestamp: `2025-01-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z`, content: 'x' } }));
  assert.equal(prepareImpact({ ...input, decisions: many }).decisions.length, MAX_IMPACT_DECISIONS);
});

await check('future or empty event → rejected', () => {
  assert.throws(() => prepareImpact({ ...input, event: ev('e2', 'x', '2026-01-01') }));
  assert.throws(() => prepareImpact({ ...input, event: ev('e3', '  ') }));
});

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`);
}

main();

