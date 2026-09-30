// One-off: seed the locale-aware demo project for a given account email.
// Usage: npx tsx scripts/seed-demo-ru.ts hello@klynt.one

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

process.env.NEXT_PUBLIC_MARKET = 'ru';
process.env.NEXT_PUBLIC_LOCALE = 'ru';

const email = process.argv[2] || 'hello@klynt.one';

async function main() {
  // Dynamic imports so NEXT_PUBLIC_* env is set before module-level locale reads.
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: users } = await sb.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email === email);
  if (!user) throw new Error(`User ${email} not found`);

  const { createDemoProject } = await import('../lib/demo-project');
  const project = await createDemoProject(user.id);
  console.log('Demo project created:', project.id, project.slug);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
