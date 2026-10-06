// One-off: 'Вне рамок проекта' → 'Вне проекта' in live RU demo facts.
// Usage: npx tsx scripts/patch-demo-ru-scope-label.ts

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env.ru'), override: true });

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: facts } = await sb
    .from('project_facts')
    .select('id, current_value')
    .eq('subject', 'загрузка аватара');

  let patched = 0;
  for (const f of facts || []) {
    if (f.current_value?.display_state === 'Вне рамок проекта') {
      await sb
        .from('project_facts')
        .update({
          current_value: { ...f.current_value, display_state: 'Вне проекта' },
          evidence_summary: 'Сейчас: вне проекта',
        })
        .eq('id', f.id);
      patched++;
    }
  }
  console.log('Facts patched:', patched);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
