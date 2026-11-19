// Dry run: npx tsx scripts/refresh-lunar-demo.ts <project UUID>
// Apply:   npx tsx scripts/refresh-lunar-demo.ts <project UUID> --apply
// Replaces only synthetic history; real connector data and memberships survive.
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildLunarSeed, seedLunarProject } from '../lib/seed-lunar';
import { LUNAR_DESCRIPTION } from '../lib/demo-lunar';

config({ path: '.env.local', quiet: true });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const tables = ['project_members', 'raw_events', 'candidate_events', 'project_facts', 'fact_history', 'fact_evidence', 'conflicts', 'impact_recommendations'] as const;
type Table = typeof tables[number];
type Row = { id: string; [key: string]: unknown };
const deleteOrder: Table[] = ['impact_recommendations', 'conflicts', 'fact_evidence', 'fact_history', 'project_facts', 'candidate_events', 'raw_events'];

async function main() {
  const projectId = process.argv[2];
  if (!/^[0-9a-f-]{36}$/.test(projectId || '')) throw new Error('Pass an explicit project UUID');
  const projectResult = await db.from('projects').select('id,name,slug,is_demo,description').eq('id', projectId).single();
  if (projectResult.error) throw projectResult.error;
  const project = projectResult.data;
  if (!project.is_demo || project.name !== 'Lunar mobile' || !project.slug?.startsWith('sample-lunar-mobile-')) {
    throw new Error('Only the explicitly selected Lunar Sample can be refreshed');
  }
  const snapshot = {} as Record<Table, Row[]>;
  for (const table of tables) {
    const result = await db.from(table).select('*').eq('project_id', projectId).limit(1001);
    if (result.error) throw result.error;
    if (result.data.length > 1000) throw new Error(`Refusing a partial backup of ${table}`);
    snapshot[table] = result.data;
  }
  const demoRaw = new Set(snapshot.raw_events.filter(r =>
    /^(demo_|lunar_v2_)/.test(String(r.source_event_id))).map(r => r.id));
  const demoCandidates = new Set(snapshot.candidate_events.filter(r => demoRaw.has(String(r.raw_event_id))).map(r => r.id));
  const demoSubjects = new Set(snapshot.candidate_events.filter(r => demoCandidates.has(r.id)).map(r => r.subject));
  const demoFacts = new Set(snapshot.project_facts.filter(r => demoSubjects.has(r.subject)).map(r => r.id));
  if (snapshot.candidate_events.some(r => demoSubjects.has(r.subject) && !demoCandidates.has(r.id)) ||
      snapshot.fact_history.some(r => demoFacts.has(String(r.fact_id)) && !demoCandidates.has(String(r.event_id)))) {
    throw new Error('A demo area has non-demo history; review it manually before replacement');
  }
  const affected: Record<Table, Row[]> = {
    project_members: [],
    raw_events: snapshot.raw_events.filter(r => demoRaw.has(r.id)),
    candidate_events: snapshot.candidate_events.filter(r => demoCandidates.has(r.id)),
    project_facts: snapshot.project_facts.filter(r => demoFacts.has(r.id)),
    fact_history: snapshot.fact_history.filter(r => demoFacts.has(String(r.fact_id))),
    fact_evidence: snapshot.fact_evidence.filter(r => demoFacts.has(String(r.fact_id)) || demoRaw.has(String(r.raw_event_id))),
    conflicts: snapshot.conflicts.filter(r => demoFacts.has(String(r.previous_fact_id)) || demoCandidates.has(String(r.new_event_id))),
    impact_recommendations: snapshot.impact_recommendations.filter(r =>
      demoFacts.has(String(r.source_fact_id)) || demoFacts.has(String(r.target_fact_id))),
  };
  const now = new Date();
  const members = snapshot.project_members.map(m => ({
    id: m.id, external_user_id: String(m.external_user_id), external_source: String(m.external_source),
  }));
  const seed = buildLunarSeed(projectId, now, members);
  const preservedFacts = snapshot.project_facts.filter(f => !demoFacts.has(f.id));
  if (preservedFacts.some(f => seed.project_facts.some(s => s.subject === f.subject))) {
    throw new Error('A new sample area would overwrite a non-demo fact');
  }
  console.log(JSON.stringify({
    project: project.slug, oldDemoEvents: demoRaw.size, oldDemoFacts: demoFacts.size,
    newDemoEvents: seed.raw_events.length, newDemoFacts: seed.project_facts.length,
    preservedImportedEvents: snapshot.raw_events.length - demoRaw.size,
    preservedOtherFacts: preservedFacts.length,
  }, null, 2));
  if (!process.argv.includes('--apply')) return;

  const folder = await mkdtemp(join(tmpdir(), 'klynt-lunar-backup-'));
  const backup = join(folder, `${projectId}.json`);
  await writeFile(backup, JSON.stringify({ project, tables: snapshot }, null, 2), { mode: 0o600, flag: 'wx' });
  console.log(`Backup: ${backup}`);

  async function remove(table: Table, ids: string[]) {
    for (let offset = 0; offset < ids.length; offset += 100) {
      const result = await db.from(table).delete().eq('project_id', projectId).in('id', ids.slice(offset, offset + 100));
      if (result.error) throw new Error(`${table}: ${result.error.message}`);
    }
  }
  try {
    for (const table of deleteOrder) await remove(table, affected[table].map(r => r.id));
    const counts = await seedLunarProject(db, projectId, now, seed);
    const updated = await db.from('projects').update({ description: LUNAR_DESCRIPTION }).eq('id', projectId).eq('is_demo', true);
    if (updated.error) throw updated.error;
    console.log('Refreshed', counts);
  } catch (error) {
    console.error('Refresh failed; restoring the previous demo from backup.');
    const impacts = await db.from('impact_recommendations').delete().eq('project_id', projectId)
      .in('source_fact_id', seed.project_facts.map(f => f.id));
    if (impacts.error) throw new Error(`Restore blocked; use ${backup}: ${impacts.error.message}`);
    for (const table of deleteOrder) {
      if (table !== 'impact_recommendations') await remove(table, seed[table].map(r => r.id));
    }
    await remove('project_members', seed.project_members.filter(m => !members.some(old => old.id === m.id)).map(m => m.id));
    // Restore pre-existing member fields as well as all replaced rows.
    affected.project_members = snapshot.project_members.filter(m => seed.project_members.some(s => s.id === m.id));
    for (const table of tables) {
      if (!affected[table].length) continue;
      const restored = await db.from(table).upsert(affected[table], { onConflict: 'id' });
      if (restored.error) throw new Error(`Restore ${table} failed; use ${backup}: ${restored.error.message}`);
    }
    const restored = await db.from('projects').update({ description: project.description }).eq('id', projectId);
    if (restored.error) throw restored.error;
    throw error;
  }
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
