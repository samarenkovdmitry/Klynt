import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { listProjectFacts, getProjectConflicts, getProject } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';
import { generateProjectSummary, SummaryInput } from '@/lib/ai/summary-generator';

// Cached across serverless invocations — the stamp arg changes whenever
// facts/events/conflicts change, so new activity produces a fresh summary.
const getCachedSummary = unstable_cache(
  async (input: SummaryInput, _stamp: string) => generateProjectSummary(input),
  ['project-summary'],
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || process.env.DEFAULT_PROJECT_ID;

  if (!projectId) {
    return NextResponse.json({ error: 'No default project configured' }, { status: 500 });
  }

  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const currentState = await listProjectFacts(projectId);
    const conflicts = await getProjectConflicts(projectId);

    // Get recent events from last 7 days
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentEvents, error: eventsError } = await supabase
      .from('candidate_events')
      .select()
      .eq('project_id', projectId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(15);

    if (eventsError) throw eventsError;

    const stamp = [
      ...currentState.map(f => f.updated_at || f.created_at),
      ...(recentEvents || []).map(e => e.created_at),
      ...conflicts.map(c => c.created_at),
    ].filter(Boolean).sort().pop() || 'empty';
    const stampKey = `${stamp}:${currentState.length}:${(recentEvents || []).length}:${conflicts.length}`;

    const summary = await getCachedSummary({
      projectId,
      currentState,
      recentEvents: recentEvents || [],
      conflicts,
      since,
    }, stampKey);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error generating project summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
