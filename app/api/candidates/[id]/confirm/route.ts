import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { getProject, getCandidateEvent, updateCandidateEventStatus, listProjectFacts } from '@/lib/db/queries';
import { supabase } from '@/lib/db/supabase';
import { applyCandidateToFacts, STATE_CHANGING_EVENTS } from '@/lib/pipeline';

// POST /api/candidates/[id]/confirm — a human vouches for a low-confidence
// interpretation. The candidate is applied through the same fact pipeline as
// auto-confirmed events, then marked confirmed.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const candidate = await getCandidateEvent(id);
    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    const project = await getProject(candidate.project_id, user.id);
    if (!project) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    if (candidate.status !== 'pending') {
      return NextResponse.json({ error: 'not_pending' }, { status: 409 });
    }

    const { data: raw } = await supabase
      .from('raw_events')
      .select('id, timestamp')
      .eq('id', candidate.raw_event_id)
      .single();
    if (!raw) return NextResponse.json({ error: 'Source event missing' }, { status: 404 });

    let applied = null;
    if (STATE_CHANGING_EVENTS.includes(candidate.event_type)) {
      const projectFacts = await listProjectFacts(candidate.project_id);
      applied = await applyCandidateToFacts(candidate.project_id, raw, candidate, {
        event_type: candidate.event_type as any,
        subject: candidate.subject,
        action: candidate.action,
        confidence: candidate.confidence,
        importance: candidate.importance as any,
        reason: candidate.reason || '',
        related_entities: candidate.related_entities || [],
        potential_impacts: candidate.potential_impacts || [],
      }, projectFacts);
    }

    // Applied first: a failure above leaves the candidate pending and retryable.
    await updateCandidateEventStatus(candidate.id, 'confirmed', user.id);
    return NextResponse.json({ success: true, applied });
  } catch (error) {
    console.error('Error confirming candidate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
