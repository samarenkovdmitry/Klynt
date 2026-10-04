/**
 * Backfill slugs for existing projects.
 * Usage: node scripts/backfill-project-slugs.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'project';
}

async function main() {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, slug')
    .order('created_at', { ascending: true });

  if (error) throw error;

  const used = new Set((projects || []).map(p => p.slug).filter(Boolean));

  for (const p of projects || []) {
    if (p.slug) continue;

    const base = slugify(p.name);
    let slug = base;
    for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
    used.add(slug);

    const { error: upErr } = await supabase
      .from('projects')
      .update({ slug })
      .eq('id', p.id);

    if (upErr) {
      console.error(`✗ ${p.name}: ${upErr.message}`);
    } else {
      console.log(`✓ ${p.name} → /project/${slug}`);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
