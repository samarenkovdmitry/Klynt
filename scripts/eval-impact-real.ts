// Real-data impact eval: pulls actual project signals from Supabase, runs
// analyzeImpact on each, and writes a review report for manual labelling.
// Run: tsx --env-file=.env.local scripts/eval-impact-real.ts
import { supabase } from '../lib/db/supabase';
import { loadImpactContext } from '../lib/db/impact';
import { analyzeImpact } from '../lib/ai/impact-analysis';
import { getLLM } from '../lib/ai/llm';
import { writeFileSync } from 'fs';

const MAX_ANALYSES = 40;
const OUT = 'design-preview/eval-real-report.md';

async function main() {
  const { data: projects } = await supabase.from('projects').select('id, name').order('created_at', { ascending: false });
  const llm = getLLM();
  const asOf = new Date().toISOString();
  const report: string[] = [`# Impact eval on real data — ${asOf}\n`];
  let analyses = 0, revisit = 0, addressed = 0, clean = 0, failed = 0;
  const seen = new Set<string>();

  for (const p of projects || []) {
    if (analyses >= MAX_ANALYSES) break;
    const { data: facts } = await supabase.from('project_facts').select('id, subject').eq('project_id', p.id);
    if (!facts?.length) continue;
    for (const f of facts) {
      if (analyses >= MAX_ANALYSES) break;
      let ctx;
      try { ctx = await loadImpactContext(p.id, f.id); } catch { continue; }
      for (const signal of ctx.signals) {
        if (analyses >= MAX_ANALYSES) break;
        if (seen.has(signal.candidateId)) continue;
        seen.add(signal.candidateId);
        const decisions = ctx.decisionsFor(signal.timestamp);
        if (!decisions.length) continue;
        analyses++;
        try {
          const prepared = await analyzeImpact({
            sourceFactId: f.id, event: signal, decisions, asOf, locale: 'en',
          }, req => llm.complete(req));
          const verdicts = prepared.suggestions;
          if (verdicts.length) {
            revisit += verdicts.length;
            report.push(`## ${p.name} · signal ${signal.candidateId}\n`);
            report.push(`**Event** [${signal.source} ${signal.timestamp.slice(0, 10)}]:\n> ${signal.content}\n`);
            for (const s of verdicts) {
              report.push(`**→ revisit: ${s.targetSubject}**\n`);
              report.push(`- decision evidence [${s.decisionEvidence.source} ${s.decisionEvidence.timestamp.slice(0, 10)}]:\n  > ${s.decisionEvidence.content}\n`);
              report.push(`- assumptionQuote: "${s.assumptionQuote}"`);
              report.push(`- eventQuote: "${s.eventQuote}"`);
              report.push(`- reason: ${s.reason}`);
              report.push(`- dependency: ${s.dependency}\n`);
            }
          } else clean++;
        } catch (e: any) {
          failed++;
          report.push(`## ${p.name} · signal ${signal.candidateId} — FAILED: ${e.message}\n`);
        }
      }
    }
  }

  report.unshift(`analyses: ${analyses} · revisit suggestions: ${revisit} · clean signals: ${clean} · errors: ${failed}\n`);
  writeFileSync(OUT, report.join('\n'));
  console.log(`analyses: ${analyses} · revisit: ${revisit} · clean: ${clean} · errors: ${failed}`);
  console.log(`report → ${OUT}`);
}
main();
