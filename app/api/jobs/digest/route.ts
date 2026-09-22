import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { generateProjectSummary } from '@/lib/ai/summary-generator';
import { sendDigestEmail } from '@/lib/send-digest-email';
import { getSiteUrl } from '@/lib/site';

// POST /api/jobs/digest
// Cron mode: Authorization: Bearer $CRON_SECRET — digests for all projects with
// activity in the window. Session mode: { projectId } for a project you can access.
// Query param: ?hours=24 (default) — the lookback window.

async function getRecipients(projectId: string, ownerId?: string): Promise<string[]> {
  const emails = new Set<string>();

  if (ownerId) {
    const { data } = await supabase.auth.admin.getUserById(ownerId);
    if (data?.user?.email) emails.add(data.user.email);
  }

  const { data: members } = await supabase
    .from('project_users')
    .select('email')
    .eq('project_id', projectId);
  for (const m of members || []) {
    if (m.email) emails.add(m.email);
  }

  return [...emails];
}

async function sendProjectDigest(projectId: string, sinceIso: string) {
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, owner_id')
    .eq('id', projectId)
    .single();
  if (!project) return { skipped: 'no project' };

  // Activity in the window
  const { data: recentEvents } = await supabase
    .from('candidate_events')
    .select('subject, action, event_type, reason, created_at')
    .eq('project_id', projectId)
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!recentEvents || recentEvents.length === 0) {
    return { skipped: 'no activity' };
  }

  const [{ data: currentState }, { data: conflicts }] = await Promise.all([
    supabase
      .from('project_facts')
      .select('subject, current_state, confidence')
      .eq('project_id', projectId)
      .order('last_updated_at', { ascending: false })
      .limit(15),
    supabase
      .from('conflicts')
      .select('subject, description')
      .eq('project_id', projectId)
      .neq('status', 'resolved')
      .limit(5),
  ]);

  const summary = await generateProjectSummary({
    projectId,
    currentState: currentState || [],
    recentEvents,
    conflicts: conflicts || [],
    since: sinceIso,
  });

  const projectUrl = `${getSiteUrl()}/project/${project.slug || project.id}`;
  const recipients = await getRecipients(projectId, project.owner_id);

  let sent = 0;
  const failures: string[] = [];
  for (const email of recipients) {
    try {
      await sendDigestEmail(email, project.name, summary, projectUrl);
      sent++;
    } catch (e) {
      console.error(`Digest email failed for ${email}:`, e);
      failures.push(email);
    }
  }

  return { sent, failed: failures.length, recipients: recipients.length, events: recentEvents.length };
}

export async function POST(request: NextRequest) {
  try {
    const isCron = !!process.env.CRON_SECRET &&
      request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;

    const body = await request.json().catch(() => ({}));
    const hours = Math.min(Number(new URL(request.url).searchParams.get('hours')) || 24, 168);
    const sinceIso = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    let projectIds: string[];

    if (isCron) {
      if (body.projectId) {
        projectIds = [body.projectId];
      } else {
        // Every project that had interpreted activity in the window
        const { data } = await supabase
          .from('candidate_events')
          .select('project_id')
          .gte('created_at', sinceIso);
        projectIds = [...new Set((data || []).map((r: { project_id: string }) => r.project_id))];
      }
    } else {
      const { projectId } = body;
      if (!projectId) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
      }
      const user = await getSessionUser();
      if (!user) return unauthorizedResponse();

      const { data: project } = await supabase
        .from('projects')
        .select('id, owner_id')
        .eq('id', projectId)
        .single();
      if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

      const isOwner = project.owner_id === user.id;
      if (!isOwner) {
        const { data: membership } = await supabase
          .from('project_users')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .maybeSingle();
        if (!membership) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      projectIds = [projectId];
    }

    const results: Record<string, unknown> = {};
    for (const pid of projectIds) {
      try {
        results[pid] = await sendProjectDigest(pid, sinceIso);
      } catch (e) {
        console.error(`Digest failed for project ${pid}:`, e);
        results[pid] = { error: 'digest failed' };
      }
    }

    return NextResponse.json({ message: 'Digest run complete', since: sinceIso, results });
  } catch (error) {
    console.error('Error in digest job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
