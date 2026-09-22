import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { generateProjectSummary } from '@/lib/ai/summary-generator';
import { sendDigestEmail } from '@/lib/send-digest-email';
import { getSiteUrl } from '@/lib/site';

// POST /api/jobs/digest
// Cron mode: Authorization: Bearer $CRON_SECRET — adaptive digests for all
// projects: send when >= MIN_EVENTS new events since the last digest, or when
// any activity piled up for >= QUIET_DAYS. Session mode: { projectId } forces
// a digest for a project you can access.

const MIN_EVENTS = 5;         // busy project -> digest now
const QUIET_DAYS = 7;         // quiet project -> weekly rollup
const MAX_WINDOW_DAYS = 30;   // never dig deeper than this

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

async function sendProjectDigest(project: { id: string; name: string; slug?: string; owner_id?: string }, sinceIso: string, now: string) {
  // Activity in the window
  const { data: recentEvents } = await supabase
    .from('candidate_events')
    .select('subject, action, event_type, reason, created_at')
    .eq('project_id', project.id)
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
      .eq('project_id', project.id)
      .order('last_updated_at', { ascending: false })
      .limit(15),
    supabase
      .from('conflicts')
      .select('subject, description')
      .eq('project_id', project.id)
      .neq('status', 'resolved')
      .limit(5),
  ]);

  const summary = await generateProjectSummary({
    projectId: project.id,
    currentState: currentState || [],
    recentEvents,
    conflicts: conflicts || [],
    since: sinceIso,
  });

  const projectUrl = `${getSiteUrl()}/project/${project.slug || project.id}`;
  const recipients = await getRecipients(project.id, project.owner_id);

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

  if (sent > 0) {
    await supabase
      .from('projects')
      .update({ last_digest_at: now })
      .eq('id', project.id);
  }

  return { sent, failed: failures.length, recipients: recipients.length, events: recentEvents.length, since: sinceIso };
}

export async function POST(request: NextRequest) {
  try {
    const isCron = !!process.env.CRON_SECRET &&
      request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;

    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();

    const results: Record<string, unknown> = {};

    if (isCron && !body.projectId) {
      // Adaptive cron mode: per project, window = since last digest (or project
      // creation), capped at MAX_WINDOW_DAYS.
      const capIso = new Date(Date.now() - MAX_WINDOW_DAYS * 86400 * 1000).toISOString();
      const quietCutoff = new Date(Date.now() - QUIET_DAYS * 86400 * 1000).toISOString();

      const { data: active } = await supabase
        .from('candidate_events')
        .select('project_id')
        .gte('created_at', capIso);
      const projectIds = [...new Set((active || []).map((r: { project_id: string }) => r.project_id))];

      const { data: projects } = projectIds.length
        ? await supabase
            .from('projects')
            .select('id, name, slug, owner_id, last_digest_at, created_at')
            .in('id', projectIds)
        : { data: [] };

      for (const project of projects || []) {
        const lastDigest = project.last_digest_at || project.created_at;
        const sinceIso = lastDigest > capIso ? lastDigest : capIso;

        const { count } = await supabase
          .from('candidate_events')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .gte('created_at', sinceIso);

        const n = count || 0;
        if (n === 0) {
          results[project.id] = { skipped: 'no activity' };
          continue;
        }

        // Quiet accumulation: below threshold -> only weekly, and only if the
        // last digest (or project start) is already QUIET_DAYS old.
        const due = n >= MIN_EVENTS || lastDigest <= quietCutoff;
        if (!due) {
          results[project.id] = { skipped: 'accumulating', events: n, since: sinceIso };
          continue;
        }

        try {
          results[project.id] = await sendProjectDigest(project, sinceIso, now);
        } catch (e) {
          console.error(`Digest failed for project ${project.id}:`, e);
          results[project.id] = { error: 'digest failed' };
        }
      }
    } else {
      // Single project: session mode (manual trigger) or cron with projectId.
      const { projectId } = body;
      if (!projectId) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
      }

      const { data: project } = await supabase
        .from('projects')
        .select('id, name, slug, owner_id, last_digest_at, created_at')
        .eq('id', projectId)
        .single();
      if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

      if (!isCron) {
        const user = await getSessionUser();
        if (!user) return unauthorizedResponse();
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
      }

      const capIso = new Date(Date.now() - MAX_WINDOW_DAYS * 86400 * 1000).toISOString();
      const lastDigest = project.last_digest_at || project.created_at;
      const sinceIso = lastDigest > capIso ? lastDigest : capIso;

      try {
        results[project.id] = await sendProjectDigest(project, sinceIso, now);
      } catch (e) {
        console.error(`Digest failed for project ${project.id}:`, e);
        results[project.id] = { error: 'digest failed' };
      }
    }

    return NextResponse.json({ message: 'Digest run complete', results });
  } catch (error) {
    console.error('Error in digest job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
