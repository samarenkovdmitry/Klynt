import { NextRequest, NextResponse } from 'next/server';
import { listProjectFacts, getProjectConflicts, getProject } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';
import { generateProjectSummary } from '@/lib/ai/summary-generator';

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

    const summary = await generateProjectSummary({
      projectId,
      currentState,
      recentEvents: recentEvents || [],
      conflicts,
      since,
    });

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error generating project summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
