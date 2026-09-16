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

    const body = await request.json().catch(() => ({}));
    const { decision, newState, resolution } = body;

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

    // Find the related project fact by subject
    const { data: fact } = await supabase
      .from('project_facts')
      .select()
      .eq('project_id', conflict.project_id)
      .eq('subject', conflict.subject)
      .single();

    let finalState = fact?.current_state;
    let finalResolution = resolution;

    if (fact) {
      if (decision === 'accept_new' && newState) {
        finalState = newState;
        finalResolution = resolution || `Accepted: ${newState}`;
      } else if (decision === 'unclear') {
        finalState = 'unclear';
        finalResolution = resolution || 'Marked as unclear';
      } else if (decision === 'keep_current') {
        finalResolution = resolution || `Kept current state: ${finalState}`;
      }

      if (!finalResolution) {
        finalResolution = 'Resolved manually';
      }

      // Find an event to reference in history
      let eventId = conflict.new_event_id;
      if (!eventId) {
        const { data: candidate } = await supabase
          .from('candidate_events')
          .select('id')
          .eq('project_id', conflict.project_id)
          .eq('subject', conflict.subject)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        eventId = candidate?.id;
      }

      await supabase
        .from('project_facts')
        .update({
          current_state: finalState,
          confidence: 0.9,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', fact.id);

      if (eventId) {
        await supabase.from('fact_history').insert({
          fact_id: fact.id,
          project_id: conflict.project_id,
          event_id: eventId,
          previous_state: fact.current_state,
          new_state: finalState,
          decided_at: new Date().toISOString(),
          confidence: 0.9,
          reason: finalResolution,
          evidence: [],
        });
      }
    }

    const { data, error } = await supabase
      .from('conflicts')
      .update({
        status: 'resolved',
        resolution: finalResolution,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, conflict: data });
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
