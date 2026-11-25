import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/db/queries';
import { processProjectEvents } from '@/lib/pipeline';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { supabase } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  try {
    const isCron = !!process.env.CRON_SECRET &&
      request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;

    const body = await request.json().catch(() => ({}));

    let projectIds: string[];
    if (isCron) {
      // Cron mode: process the given project, or every project with pending events
      if (body.projectId) {
        projectIds = [body.projectId];
      } else {
        const { data } = await supabase
          .from('raw_events')
          .select('project_id')
          .is('processed_at', null);
        projectIds = [...new Set((data || []).map(r => r.project_id))];
      }
    } else {
      const { projectId } = body;
      if (!projectId) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
      }
      const user = await getSessionUser();
      if (!user) return unauthorizedResponse();
      const project = await getProject(projectId, user.id);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      projectIds = [projectId];
    }

    const totals = { processed: 0, factsCreated: 0, factsUpdated: 0, conflictsDetected: 0, conflictsResolved: 0 };
    for (const projectId of projectIds) {
      const r = await processProjectEvents(projectId);
      totals.processed += r.processed;
      totals.factsCreated += r.factsCreated;
      totals.factsUpdated += r.factsUpdated;
      totals.conflictsDetected += r.conflictsDetected;
      totals.conflictsResolved += r.conflictsResolved;
    }

    return NextResponse.json({ message: 'Events processed successfully', ...totals });
  } catch (error) {
    console.error('Error in process-events job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Vercel Cron invokes endpoints via GET — delegate to the same handler.
export { POST as GET };
