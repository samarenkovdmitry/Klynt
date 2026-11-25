import { supabase } from '@/lib/db/supabase';
import { LUNAR_DESCRIPTION } from './demo-lunar';
import { seedLunarProject } from './seed-lunar';

// A realistic demo project: a mobile app redesign with a client, a PM and
// a designer. Events arrive already interpreted (candidate_events) and
// drive project_facts + fact_history + conflicts, so the dashboard shows
// the full "truth layer" without any AI calls.
export async function createDemoProject(ownerId: string) {
  const base = {
    name: 'Lunar mobile',
    description: LUNAR_DESCRIPTION,
    owner_id: ownerId,
    slug: `sample-lunar-mobile-${Date.now().toString(36)}`,
  };

  let { data: project, error } = await supabase
    .from('projects')
    .insert({ ...base, is_demo: true })
    .select()
    .single();

  // is_demo column not yet migrated — insert without it
  if (error && error.message?.includes('is_demo')) {
    ({ data: project, error } = await supabase.from('projects').insert(base).select().single());
  }
  if (error) throw error;

  try {
    await seedLunarProject(supabase, project!.id);
  } catch (seedError) {
    // Never leave a partially populated sample that prevents the next retry.
    const cleanup = await supabase.from('projects').delete().eq('id', project!.id).eq('owner_id', ownerId);
    if (cleanup.error) console.error('Failed to clean up incomplete sample:', cleanup.error.message);
    throw seedError;
  }
  return project!;
}
