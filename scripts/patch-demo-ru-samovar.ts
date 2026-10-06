// One-off: rename the seeded RU demo project "Lunar mobile" → "Самовар".
// Updates projects.name/description and raw_events metadata
// (chat channel + figma file_name) in place — no reseed needed.
// Usage: npx tsx scripts/patch-demo-ru-samovar.ts

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env.ru'), override: true });

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: projects } = await sb
    .from('projects')
    .select('id, name, slug')
    .ilike('name', 'Lunar mobile%');

  console.log('Projects found:', (projects || []).map(p => p.name));
  const projectIds = (projects || []).map(p => p.id);

  for (const pid of projectIds) {
    await sb
      .from('projects')
      .update({
        name: 'Самовар',
        description: 'Редизайн приложения доставки «Самовар». Решения и изменения из Figma и Telegram.',
      })
      .eq('id', pid);
  }
  console.log('Projects renamed:', projectIds.length);

  // Chat channel + figma file_name inside raw_events.metadata
  const { data: events } = await sb
    .from('raw_events')
    .select('id, project_id, metadata')
    .in('project_id', projectIds.length ? projectIds : ['-']);

  let patched = 0;
  for (const e of events || []) {
    const m = e.metadata || {};
    const next = { ...m };
    if (m.channel === 'lunar-mobile') next.channel = 'samovar-app';
    if (m.file_name === 'Lunar mobile') next.file_name = 'Самовар';
    if (m.file_key === 'demoLunarFile') next.file_key = 'demoSamovarFile';
    if (next.channel !== m.channel || next.file_name !== m.file_name || next.file_key !== m.file_key) {
      await sb.from('raw_events').update({ metadata: next }).eq('id', e.id);
      patched++;
    }
  }
  console.log('Events patched:', patched);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
