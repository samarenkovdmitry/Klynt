import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { createDemoProject } from '@/lib/demo-project';

// POST /api/projects/demo — create a seeded sample project for the current user
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  // One demo per user
  const { data: existing, error: existingError } = await supabase
    .from('projects')
    .select('id, slug, name')
    .eq('owner_id', user.id)
    .eq('is_demo', true)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ project: existing, alreadyExists: true });
  }

  // is_demo column not yet migrated — fall back to name match
  if (existingError?.message?.includes('is_demo')) {
    const { data: byName } = await supabase
      .from('projects')
      .select('id, slug, name')
      .eq('owner_id', user.id)
      .ilike('name', 'Lunar mobile%')
      .limit(1)
      .maybeSingle();
    if (byName) {
      return NextResponse.json({ project: byName, alreadyExists: true });
    }
  }

  try {
    const project = await createDemoProject(user.id);
    return NextResponse.json({ project });
  } catch (e) {
    console.error('Failed to create demo project:', e);
    return NextResponse.json({ error: 'Failed to create sample project' }, { status: 500 });
  }
}
