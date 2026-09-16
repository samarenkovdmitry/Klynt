import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { listOwnedProjectIds } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

const STATE_LABELS: Record<string, string> = {
  approved: 'Approved',
  added: 'New',
  modify: 'Needs review',
  modified: 'Needs review',
  removed: 'Decision pending',
};

function capitalize(s?: string | null) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function POST() {
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  const projectIds = await listOwnedProjectIds(user.id);
  if (projectIds.length === 0) {
    return NextResponse.json({ updated: 0, total: 0 });
  }

  const { data: facts, error } = await supabase
    .from('project_facts')
    .select('id, current_state, current_value')
    .in('project_id', projectIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;

  for (const fact of (facts || [])) {
    const state = (fact.current_state || '').toLowerCase();
    const displayState = STATE_LABELS[state] || capitalize(fact.current_state);
    const currentValue = typeof fact.current_value === 'object' && fact.current_value !== null
      ? fact.current_value as Record<string, any>
      : {};

    if (currentValue.display_state === displayState) continue;

    const { error: updateError } = await supabase
      .from('project_facts')
      .update({
        current_value: { ...currentValue, display_state: displayState },
      })
      .eq('id', fact.id);

    if (updateError) {
      console.error(`Failed to update fact ${fact.id}:`, updateError);
      continue;
    }

    updated++;
  }

  return NextResponse.json({ updated, total: (facts || []).length });
}
