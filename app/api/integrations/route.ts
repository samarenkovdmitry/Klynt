import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getIntegration, getProject, listOwnedProjectIds } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { decryptToken } from '@/lib/crypto';
import { linearGraphQL } from '@/lib/linear/client';
import { normalizeKeywords } from '@/lib/filters';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const projectIds = await listOwnedProjectIds(user.id);

    const { data: integrations, error } = projectIds.length > 0
      ? await supabase
          .from('integrations')
          .select('id, project_id, source, status, last_sync_at, config, created_at, updated_at')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })
      : { data: [], error: null };

    if (error) throw error;

    // Attach imported-event counts so the UI can show exactly what came in
    const withCounts = await Promise.all(
      (integrations || []).map(async (i) => {
        const { count } = await supabase
          .from('raw_events')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', i.project_id)
          .eq('source', i.source);
        return { ...i, event_count: count ?? 0 };
      }),
    );

    return NextResponse.json({ integrations: withCounts });
  } catch (error) {
    console.error('Error listing integrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/integrations — update per-integration settings.
// Currently: privacy keyword denylist in config.excluded_keywords.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { projectId, source, excludedKeywords } = await request.json();
    if (!projectId || !source || !Array.isArray(excludedKeywords)) {
      return NextResponse.json(
        { error: 'projectId, source and excludedKeywords[] required' },
        { status: 400 },
      );
    }

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const integration = await getIntegration(projectId, source);
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const keywords = normalizeKeywords(excludedKeywords);

    const { error } = await supabase
      .from('integrations')
      .update({ config: { ...integration.config, excluded_keywords: keywords } })
      .eq('id', integration.id);

    if (error) throw error;

    return NextResponse.json({ excluded_keywords: keywords });
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/integrations?project_id=&source=
// Removes the integration and best-effort cleans up provider-side webhooks.
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const source = searchParams.get('source');
    if (!projectId || !source) {
      return NextResponse.json({ error: 'project_id and source required' }, { status: 400 });
    }

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const integration = await getIntegration(projectId, source);
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const token = integration.access_token_encrypted
      ? decryptToken(integration.access_token_encrypted)
      : null;

    // Best-effort provider cleanup — failures don't block the disconnect
    try {
      if (source === 'linear' && token) {
        const webhookIds: string[] =
          integration.config?.webhook_ids ||
          (integration.config?.webhook_id ? [integration.config.webhook_id] : []);
        for (const id of webhookIds) {
          await linearGraphQL(
            token,
            `mutation WebhookDelete($id: String!) { webhookDelete(id: $id) { success } }`,
            { id }
          );
        }
      } else if (source === 'figma' && token) {
        const webhookIds = [
          integration.config?.comment_webhook_id,
          integration.config?.version_webhook_id,
        ].filter(Boolean);
        for (const id of webhookIds) {
          await fetch(`https://api.figma.com/v2/webhooks/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else if (source === 'telegram' && token) {
        const { telegramApi } = await import('@/lib/telegram/client');
        await telegramApi(token, 'deleteWebhook', { drop_pending_updates: true });
      }
    } catch (e) {
      console.error(`Provider cleanup failed for ${source}:`, e);
    }

    // Purge data imported from this source: raw_events → candidate_events
    // (cascade), fact_evidence (cascade via raw_events). Blocking FKs are
    // severed first: conflicts/facts keep their rows but lose the evidence.
    try {
      const { data: sourceEvents } = await supabase
        .from('raw_events')
        .select('id')
        .eq('project_id', projectId)
        .eq('source', source);
      const eventIds = (sourceEvents || []).map((e) => e.id);

      if (eventIds.length > 0) {
        const { data: cands } = await supabase
          .from('candidate_events')
          .select('id')
          .in('raw_event_id', eventIds);
        const candIds = (cands || []).map((c) => c.id);

        if (candIds.length > 0) {
          await supabase.from('conflicts').update({ new_event_id: null }).in('new_event_id', candIds);
          await supabase.from('project_facts').update({ primary_event_id: null }).in('primary_event_id', candIds);
          await supabase.from('fact_history').delete().in('event_id', candIds);
          await supabase.from('candidate_events').delete().in('id', candIds);
        }
        await supabase.from('raw_events').delete().in('id', eventIds);
      }
    } catch (e) {
      console.error(`Data purge failed for ${source}:`, e);
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', integration.id);

    if (error) throw error;

    return NextResponse.json({ disconnected: true });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
