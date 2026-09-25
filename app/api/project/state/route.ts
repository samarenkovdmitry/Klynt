import { NextRequest, NextResponse } from 'next/server';
import { listProjectFacts, getProjectConflicts, getProject } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function getSince(period: string): string {
  const now = Date.now();
  const msPerHour = 60 * 60 * 1000;

  switch (period) {
    case '24h':
      return new Date(now - 24 * msPerHour).toISOString();
    case '7d':
      return new Date(now - 7 * 24 * msPerHour).toISOString();
    case '30d':
      return new Date(now - 30 * 24 * msPerHour).toISOString();
    case 'all':
      return '1970-01-01T00:00:00.000Z';
    default:
      return new Date(now - 24 * msPerHour).toISOString();
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '24h';
  const projectId = searchParams.get('projectId') || process.env.DEFAULT_PROJECT_ID;

  if (!projectId) {
    return NextResponse.json({ error: 'No default project configured' }, { status: 500 });
  }

  try {
    const since = getSince(period);

    // Auth and project fetch run in parallel; membership check only for non-owners
    const [user, project] = await Promise.all([
      getSessionUser(),
      getProject(projectId),
    ]);
    if (!user) return unauthorizedResponse();
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (project.owner_id !== user.id) {
      const { data: membership } = await supabase
        .from('project_users')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!membership) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
    }

    // Phase 1: all independent queries in parallel
    const [
      { count: factsCount },
      { count: eventsCount },
      { count: conflictsCount },
      { count: integrationsCount },
      facts,
      conflicts,
      { data: history, error: historyError },
      { data: rawEventsInPeriod, error: rawError },
      { data: allRawEvents, error: allRawError },
    ] = await Promise.all([
      supabase.from('project_facts').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('candidate_events').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('conflicts').select('*', { count: 'exact', head: true }).eq('project_id', projectId).eq('status', 'unresolved'),
      supabase.from('integrations').select('*', { count: 'exact', head: true }).eq('project_id', projectId).eq('status', 'active'),
      listProjectFacts(projectId),
      getProjectConflicts(projectId),
      supabase
        .from('fact_history')
        .select()
        .eq('project_id', projectId)
        .order('decided_at', { ascending: true }),
      supabase
        .from('raw_events')
        .select('id, timestamp, source, author_id, content, metadata')
        .eq('project_id', projectId)
        .gte('timestamp', since)
        .order('timestamp', { ascending: false }),
      supabase
        .from('raw_events')
        .select('id, timestamp, source, author_id, content, metadata')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: false })
        .limit(10),
    ]);

    if (historyError) throw historyError;
    if (rawError) throw rawError;
    if (allRawError) throw allRawError;

    // Phase 2: dependent queries in parallel
    const conflictSubjects = [...new Set((conflicts || []).map(c => c.subject).filter(Boolean))];
    const candidateEventIds = [...new Set((history || []).map((h: any) => h.event_id).filter(Boolean))];
    const rawIds = (rawEventsInPeriod || []).map(r => r.id);
    const recentRawIds = (allRawEvents || []).map(r => r.id);
    const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

    const [
      { data: conflictingEvents },
      { data: candidateLinks, error: candError },
      { data: periodCandidates, error: periodCandError },
      { data: recentCandidates, error: recentCandError },
    ] = await Promise.all([
      conflictSubjects.length > 0
        ? supabase
            .from('candidate_events')
            .select('*')
            .eq('project_id', projectId)
            .in('subject', conflictSubjects)
            .in('event_type', ['change', 'decision', 'approval'])
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] as any[], error: null }),
      supabase
        .from('candidate_events')
        .select('id, raw_event_id')
        .in('id', candidateEventIds.length > 0 ? candidateEventIds : [EMPTY_UUID]),
      rawIds.length > 0
        ? supabase.from('candidate_events').select().in('raw_event_id', rawIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      recentRawIds.length > 0
        ? supabase.from('candidate_events').select().in('raw_event_id', recentRawIds)
        : Promise.resolve({ data: [] as any[], error: null }),
    ]);

    if (candError) throw candError;
    if (periodCandError) throw periodCandError;
    if (recentCandError) throw recentCandError;

    const latestEventBySubject = new Map<string, any>();
    for (const ev of (conflictingEvents || [])) {
      if (!latestEventBySubject.has(ev.subject)) {
        latestEventBySubject.set(ev.subject, ev);
      }
    }

    const factBySubject = new Map((facts || []).map(f => [f.subject, f]));

    const enrichedConflicts = (conflicts || []).map(c => ({
      ...c,
      currentState: factBySubject.get(c.subject)?.current_state || null,
      proposedEvent: latestEventBySubject.get(c.subject) || null,
    }));

    const rawTimestamps = new Map((rawEventsInPeriod || []).map(r => [r.id, r.timestamp]));
    const rawSources = new Map((rawEventsInPeriod || []).map(r => {
      const metadata = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
      return [r.id, { source: r.source, author: metadata?.author?.name || r.author_id, content: r.content, metadata }];
    }));


    function buildSourceUrl(source: string | null, metadata: any): string | null {
      if (!source || !metadata) return null;
      if (source === 'figma' && metadata.file_key) {
        let url = `https://www.figma.com/file/${metadata.file_key}`;
        if (metadata.version_id) url += `?version-id=${metadata.version_id}`;
        else if (metadata.comment_id) url += `?comment-id=${metadata.comment_id}`;
        return url;
      }
      if (source === 'gdocs' && metadata.doc_id && metadata.comment_id) {
        return `https://docs.google.com/document/d/${metadata.doc_id}/edit?disco=${metadata.comment_id}`;
      }
      if (source === 'slack' && metadata.team_id && (metadata.channel_id || metadata.channel) && metadata.message_id) {
        const channel = metadata.channel_id || metadata.channel;
        return `https://app.slack.com/client/${metadata.team_id}/${channel}/${metadata.message_id}`;
      }
      return null;
    }

    // Enrich fact history with source/author/content/source_url
    const evidenceRawEventIds = [...new Set((history || []).flatMap((h: any) => h.evidence || []).filter(Boolean))];

    const candidateRawEventMap = new Map<string, string>();
    for (const c of (candidateLinks || [])) {
      candidateRawEventMap.set(c.id, c.raw_event_id);
    }

    const rawEventIdsToFetch = [...new Set([...evidenceRawEventIds, ...candidateRawEventMap.values()])];
    const rawEventMap = new Map<string, { source: string | null; author: string | null; content: string | null; metadata: any; source_url: string | null }>();
    if (rawEventIdsToFetch.length > 0) {
      const { data: rawEventsForHistory, error: rawHistError } = await supabase
        .from('raw_events')
        .select('id, source, author_id, content, metadata')
        .in('id', rawEventIdsToFetch);

      if (rawHistError) throw rawHistError;
      for (const r of (rawEventsForHistory || [])) {
        const metadata = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
        rawEventMap.set(r.id, {
          source: r.source,
          author: metadata?.author?.name || r.author_id,
          content: r.content,
          metadata,
          source_url: buildSourceUrl(r.source, metadata),
        });
      }
    }

    const enrichedHistory = (history || []).map((h: any) => {
      const rawEventId = (h.evidence?.length > 0 && h.evidence[0]) || candidateRawEventMap.get(h.event_id);
      const raw = rawEventId ? rawEventMap.get(rawEventId) : undefined;
      return {
        ...h,
        source: raw?.source || null,
        author: raw?.author || null,
        content: raw?.content || null,
        source_url: raw?.source_url || null,
      };
    });

    let whatChanged: any[] = [];
    if (rawIds.length > 0) {
      whatChanged = (periodCandidates || []).map(e => {
        const raw = rawSources.get(e.raw_event_id);
        return {
          ...e,
          source_timestamp: rawTimestamps.get(e.raw_event_id),
          source: raw?.source,
          author: raw?.author,
          content: raw?.content,
          source_url: buildSourceUrl(raw?.source || null, raw?.metadata),
        };
      }).sort((a, b) => new Date(b.source_timestamp || b.created_at).getTime() - new Date(a.source_timestamp || a.created_at).getTime());
    }

    let recentEvents: any[] = [];
    if (allRawEvents && allRawEvents.length > 0) {
      const recentTimestamps = new Map(allRawEvents.map(r => [r.id, r.timestamp]));
      const recentSources = new Map(allRawEvents.map(r => {
        const metadata = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
        return [r.id, { source: r.source, author: metadata?.author?.name || r.author_id }];
      }));

      recentEvents = (recentCandidates || []).map(e => ({
        ...e,
        source_timestamp: recentTimestamps.get(e.raw_event_id),
        source: recentSources.get(e.raw_event_id)?.source,
        author: recentSources.get(e.raw_event_id)?.author,
      })).sort((a, b) => new Date(b.source_timestamp || b.created_at).getTime() - new Date(a.source_timestamp || a.created_at).getTime());
    }

    return NextResponse.json({
      projectId,
      period,
      project,
      stats: {
        facts: factsCount ?? 0,
        events: eventsCount ?? 0,
        openConflicts: conflictsCount ?? 0,
        activeIntegrations: integrationsCount ?? 0,
      },
      currentState: facts,
      history: enrichedHistory,
      conflicts: enrichedConflicts || [],
      recentEvents: recentEvents || [],
      whatChanged: whatChanged || [],
    });

  } catch (error) {
    console.error('Error fetching project state:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
