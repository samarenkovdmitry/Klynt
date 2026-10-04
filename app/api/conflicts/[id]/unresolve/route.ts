import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getProject } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { data: conflict, error: conflictError } = await supabase
      .from('conflicts')
      .select()
      .eq('id', id)
      .single();

    if (conflictError) throw conflictError;
    if (!conflict) {
      return NextResponse.json({ error: 'Conflict not found' }, { status: 404 });
    }

    const project = await getProject(conflict.project_id, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Conflict not found' }, { status: 404 });
    }

    const { data: fact } = await supabase
      .from('project_facts')
      .select()
      .eq('project_id', conflict.project_id)
      .eq('subject', conflict.subject)
      .single();

    if (fact) {
      const { data: latestHistory } = await supabase
        .from('fact_history')
        .select('previous_state')
        .eq('fact_id', fact.id)
        .order('decided_at', { ascending: false })
        .limit(1)
        .single();

      const revertState = latestHistory?.previous_state || fact.current_state;

      const { data: candidate } = await supabase
        .from('candidate_events')
        .select('id')
        .eq('project_id', conflict.project_id)
        .eq('subject', conflict.subject)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const eventId = candidate?.id;

      const { error: updateError } = await supabase
        .from('project_facts')
        .update({ current_state: revertState, last_updated_at: new Date().toISOString() })
        .eq('id', fact.id);

      if (updateError) throw updateError;

      if (eventId) {
        const { error: historyError } = await supabase.from('fact_history').insert({
          fact_id: fact.id,
          project_id: conflict.project_id,
          event_id: eventId,
          previous_state: fact.current_state,
          new_state: revertState,
          decided_at: new Date().toISOString(),
          confidence: 0.9,
          reason: 'Reverted after conflict unresolved',
          evidence: [],
        });
        if (historyError) throw historyError;
      }
    }

    const { data, error } = await supabase
      .from('conflicts')
      .update({
        status: 'unresolved',
        resolution: null,
        resolved_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, conflict: data });
  } catch (error) {
    console.error('Error unresolving conflict:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
