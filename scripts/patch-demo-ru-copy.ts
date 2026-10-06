// One-off: update the seeded RU demo project copy to the new wording.
// Updates fact display_state labels, conflict descriptions and the project
// description in place — no reseed needed.
// Usage: npx tsx scripts/patch-demo-ru-copy.ts

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env.ru'), override: true });

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Find the RU demo project by its RU subject names
  const { data: facts } = await sb
    .from('project_facts')
    .select('id, project_id, subject, current_value')
    .in('subject', ['загрузка аватара', 'иконка приложения', 'главный экран', 'нижняя навигация', 'флоу оплаты', 'тёмная тема', 'экран настроек', 'способ оплаты']);

  const projectIds = [...new Set((facts || []).map(f => f.project_id))];
  console.log('Demo projects found:', projectIds);

  const DISPLAY: Record<string, string> = {
    'загрузка аватара': 'Вне рамок проекта',
    'иконка приложения': 'Ждёт решения',
    'главный экран': 'Согласовано',
    'нижняя навигация': 'Согласовано',
    'флоу оплаты': 'Согласовано',
    'тёмная тема': 'Согласовано',
    'экран настроек': 'В работе',
    'способ оплаты': 'Добавлено',
  };

  for (const f of facts || []) {
    const display = DISPLAY[f.subject];
    if (!display) continue;
    await sb
      .from('project_facts')
      .update({
        current_value: { ...(f.current_value || {}), display_state: display },
        evidence_summary: `Сейчас: ${display.toLowerCase()}`,
      })
      .eq('id', f.id);
  }
  console.log('Facts updated:', (facts || []).length);

  const CONFLICT_DESC: Record<string, string> = {
    'иконка приложения': 'Клиент просит вернуть синюю иконку. В плане остаётся зелёная.',
    'загрузка аватара': 'В макете появилась загрузка фото. В согласованный объём она не входит.',
  };
  for (const pid of projectIds) {
    for (const [subject, description] of Object.entries(CONFLICT_DESC)) {
      await sb
        .from('conflicts')
        .update({ description })
        .eq('project_id', pid)
        .eq('subject', subject);
    }
    await sb
      .from('projects')
      .update({ description: 'Редизайн мобильного приложения. Решения и изменения из Figma и Telegram.' })
      .eq('id', pid);

    // RU-studio author names: demo_john → Игорь (PM), demo_sara → Мария (client)
    for (const [externalId, name] of [['demo_john', 'Игорь'], ['demo_sara', 'Мария']] as const) {
      await sb
        .from('project_members')
        .update({ name })
        .eq('project_id', pid)
        .eq('external_user_id', externalId);
    }
  }
  console.log('Conflicts + project description + member names updated');

  // Author names embedded in raw_events.metadata.author.name
  const RENAME: Record<string, string> = { 'Джон': 'Игорь', 'Сара': 'Мария' };
  const { data: events } = await sb
    .from('raw_events')
    .select('id, project_id, metadata')
    .in('project_id', projectIds);
  let renamed = 0;
  for (const e of events || []) {
    const name = e.metadata?.author?.name;
    if (name && RENAME[name]) {
      await sb
        .from('raw_events')
        .update({ metadata: { ...e.metadata, author: { ...e.metadata.author, name: RENAME[name] } } })
        .eq('id', e.id);
      renamed++;
    }
  }
  console.log('Event authors renamed:', renamed);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
