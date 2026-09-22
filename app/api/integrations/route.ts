import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getIntegration, getProject, listOwnedProjectIds } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { decryptToken } from '@/lib/crypto';
import { linearGraphQL } from '@/lib/linear/client';

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

    return NextResponse.json({ integrations: integrations || [] });
  } catch (error) {
    console.error('Error listing integrations:', error);
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
      }
    } catch (e) {
      console.error(`Provider cleanup failed for ${source}:`, e);
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
