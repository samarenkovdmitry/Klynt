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
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    // Get project details and stats
    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const [
      { count: factsCount },
      { count: eventsCount },
      { count: conflictsCount },
      { count: integrationsCount },
    ] = await Promise.all([
      supabase.from('project_facts').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('candidate_events').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('conflicts').select('*', { count: 'exact', head: true }).eq('project_id', projectId).eq('status', 'unresolved'),
      supabase.from('integrations').select('*', { count: 'exact', head: true }).eq('project_id', projectId).eq('status', 'active'),
    ]);

    // Get current facts
    const facts = await listProjectFacts(projectId);

    // Get unresolved conflicts
    const conflicts = await getProjectConflicts(projectId);

    // Enrich conflicts with the most recent candidate event for the same subject
    const conflictSubjects = [...new Set((conflicts || []).map(c => c.subject).filter(Boolean))];
    const { data: conflictingEvents } = conflictSubjects.length > 0
      ? await supabase
          .from('candidate_events')
          .select('*')
          .eq('project_id', projectId)
          .in('subject', conflictSubjects)
          .in('event_type', ['change', 'decision', 'approval'])
          .order('created_at', { ascending: false })
      : { data: [] };

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

    // Get history for all facts
    const factIds = facts.map(f => f.id);
    const { data: history, error: historyError } = await supabase
      .from('fact_history')
      .select()
      .in('fact_id', factIds.length > 0 ? factIds : ['00000000-0000-0000-0000-000000000000'])
      .order('decided_at', { ascending: true });

    if (historyError) throw historyError;

    const since = getSince(period);

    // Get raw events in period
    const { data: rawEventsInPeriod, error: rawError } = await supabase
      .from('raw_events')
      .select('id, timestamp, source, author_id, content, metadata')
      .eq('project_id', projectId)
      .gte('timestamp', since)
      .order('timestamp', { ascending: false });

    if (rawError) throw rawError;

    const rawIds = (rawEventsInPeriod || []).map(r => r.id);
    const rawTimestamps = new Map((rawEventsInPeriod || []).map(r => [r.id, r.timestamp]));
    const rawSources = new Map((rawEventsInPeriod || []).map(r => {
      const metadata = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
      return [r.id, { source: r.source, author: r.author_id, content: r.content, metadata }];
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
    const candidateEventIds = [...new Set((history || []).map((h: any) => h.event_id).filter(Boolean))];
    const evidenceRawEventIds = [...new Set((history || []).flatMap((h: any) => h.evidence || []).filter(Boolean))];

    const candidateRawEventMap = new Map<string, string>();
    if (candidateEventIds.length > 0) {
      const { data: candidateLinks, error: candError } = await supabase
        .from('candidate_events')
        .select('id, raw_event_id')
        .in('id', candidateEventIds);

      if (candError) throw candError;
      for (const c of (candidateLinks || [])) {
        candidateRawEventMap.set(c.id, c.raw_event_id);
      }
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
          author: r.author_id,
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
      const { data, error } = await supabase
        .from('candidate_events')
        .select()
        .in('raw_event_id', rawIds);

      if (error) throw error;
      whatChanged = (data || []).map(e => {
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

    // Recent activity (all time, top 10 by source timestamp)
    const { data: allRawEvents, error: allRawError } = await supabase
      .from('raw_events')
      .select('id, timestamp, source, author_id, content, metadata')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (allRawError) throw allRawError;

    let recentEvents: any[] = [];
    if (allRawEvents && allRawEvents.length > 0) {
      const recentRawIds = allRawEvents.map(r => r.id);
      const recentTimestamps = new Map(allRawEvents.map(r => [r.id, r.timestamp]));
      const recentSources = new Map(allRawEvents.map(r => [r.id, { source: r.source, author: r.author_id }]));

      const { data, error } = await supabase
        .from('candidate_events')
        .select()
        .in('raw_event_id', recentRawIds);

      if (error) throw error;
      recentEvents = (data || []).map(e => ({
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
