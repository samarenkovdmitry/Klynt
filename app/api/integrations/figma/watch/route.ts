import { NextRequest, NextResponse } from 'next/server';
import { getIntegration, getProject } from '@/lib/db/queries';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

// Extract a file key from a Figma URL or accept a raw key.
// Handles figma.com/file/KEY, figma.com/design/KEY, figma.com/board/KEY.
function parseFileKey(input: string): string | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/figma\.com\/(?:file|design|board|proto)\/([A-Za-z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  if (/^[A-Za-z0-9]{10,64}$/.test(trimmed)) return trimmed;
  return null;
}

async function createFileWebhook(
  accessToken: string,
  fileKey: string,
  eventType: 'FILE_COMMENT' | 'FILE_VERSION_UPDATE',
  description: string,
  endpoint: string,
  passcode: string,
): Promise<{ id?: string; error?: string; status: number }> {
  const res = await fetch('https://api.figma.com/v2/webhooks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: eventType,
      endpoint,
      passcode,
      description,
      context: 'file',
      context_id: fileKey,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { id: data.id, error: data.message, status: res.status };
}

async function deleteFileWebhook(accessToken: string, webhookId: string): Promise<void> {
  await fetch(`https://api.figma.com/v2/webhooks/${webhookId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

function webhookEndpoint(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://klynt.one';
  return process.env.FIGMA_WEBHOOK_URL || `${base.replace(/\/$/, '')}/api/webhooks/figma`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { projectId } = body;
    const fileKey = parseFileKey(body.fileUrl || body.fileKey || '');

    if (!projectId || !fileKey) {
      return NextResponse.json(
        { error: 'projectId and a Figma file URL (or key) are required' },
        { status: 400 },
      );
    }

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const integration = await getIntegration(projectId, 'figma');
    if (!integration) {
      return NextResponse.json({ error: 'Connect Figma first' }, { status: 404 });
    }

    const accessToken = integration.access_token_encrypted;

    // Verify the token can read this file and grab its display name
    const fileRes = await fetch(
      `https://api.figma.com/v1/files/${fileKey}?depth=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!fileRes.ok) {
      return NextResponse.json(
        { error: 'Cannot access this Figma file — check the link and permissions' },
        { status: 400 },
      );
    }
    const fileData = await fileRes.json();
    const fileName = fileData.name || fileKey;

    // Try live webhooks first — requires a Professional+ team on Figma's side
    const passcode = process.env.FIGMA_WEBHOOK_PASSCODE;
    let syncMode: 'webhooks' | 'polling' = 'polling';
    const webhookIds: Record<string, string | undefined> = {};

    if (passcode) {
      const endpoint = webhookEndpoint();
      const comment = await createFileWebhook(
        accessToken, fileKey, 'FILE_COMMENT', 'Klynt Figma integration', endpoint, passcode,
      );
      const version = await createFileWebhook(
        accessToken, fileKey, 'FILE_VERSION_UPDATE', 'Klynt Figma version tracking', endpoint, passcode,
      );
      webhookIds.comment_webhook_id = comment.id;
      webhookIds.version_webhook_id = version.id;
      if (comment.id || version.id) syncMode = 'webhooks';
      if (!comment.id && !version.id) {
        console.log('Figma webhook creation failed, falling back to polling:', {
          comment: comment.error, version: version.error,
        });
      }
    }

    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        config: {
          ...integration.config,
          file_key: fileKey,
          file_name: fileName,
          sync_mode: syncMode,
          watched_at: new Date().toISOString(),
          ...webhookIds,
        },
      })
      .eq('id', integration.id);

    if (updateError) throw updateError;

    return NextResponse.json({ fileName, mode: syncMode });
  } catch (error) {
    console.error('Error setting Figma watch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    if (!projectId) {
      return NextResponse.json({ error: 'project_id required' }, { status: 400 });
    }

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const integration = await getIntegration(projectId, 'figma');
    if (!integration) {
      return NextResponse.json({ error: 'Figma integration not found' }, { status: 404 });
    }

    const accessToken = integration.access_token_encrypted;
    const cfg = integration.config || {};

    // Best-effort cleanup of live webhooks
    for (const id of [cfg.comment_webhook_id, cfg.version_webhook_id]) {
      if (id) await deleteFileWebhook(accessToken, id).catch(() => {});
    }

    const {
      file_key, file_name, sync_mode, watched_at,
      comment_webhook_id, version_webhook_id, last_poll_at,
      ...restConfig
    } = cfg;

    const { error: updateError } = await supabase
      .from('integrations')
      .update({ config: restConfig })
      .eq('id', integration.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing Figma watch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
