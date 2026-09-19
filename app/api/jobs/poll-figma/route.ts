import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { createRawEvent, getRawEvent, updateIntegrationLastSync } from '@/lib/db/queries';
import { getSessionUser } from '@/lib/api-auth';

const MAX_NEW_PER_RUN = 25; // cap inserts per file per run

function isAuthorized(request: NextRequest): Promise<boolean> | boolean {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) {
    return true;
  }
  return getSessionUser().then(Boolean);
}

async function pollFileVersions(integration: any, fileKey: string, fileName: string) {
  const token = integration.access_token_encrypted;
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/versions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { error: `versions ${res.status}`, inserted: 0 };

  const { versions = [] } = await res.json();
  let inserted = 0;

  for (const v of versions.slice(0, MAX_NEW_PER_RUN)) {
    const sourceEventId = `version_${v.id}`;
    const existing = await getRawEvent(integration.project_id, 'figma', sourceEventId);
    if (existing) continue;

    await createRawEvent({
      project_id: integration.project_id,
      source: 'figma',
      source_event_id: sourceEventId,
      event_type: 'file_version',
      author_id: v.user?.id,
      timestamp: v.created_at,
      content: v.label
        ? `New version in ${fileName}: ${v.label}`
        : `New version saved in ${fileName}${v.description ? `: ${v.description}` : ''}`,
      metadata: {
        file_key: fileKey,
        file_name: fileName,
        version: { id: v.id, label: v.label, description: v.description, user: v.user },
        ...(v.user?.id ? { author: { id: v.user.id, name: v.user.handle || v.user.id, avatar_url: v.user.img_url || undefined } } : {}),
        via: 'polling',
      },
    });
    inserted++;
  }
  return { inserted };
}

async function pollFileComments(integration: any, fileKey: string, fileName: string) {
  const token = integration.access_token_encrypted;
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { error: `comments ${res.status}`, inserted: 0 };

  const { comments = [] } = await res.json();
  let inserted = 0;

  for (const c of comments.slice(0, MAX_NEW_PER_RUN)) {
    const sourceEventId = `comment_${c.id}`;
    const existing = await getRawEvent(integration.project_id, 'figma', sourceEventId);
    if (existing) continue;

    await createRawEvent({
      project_id: integration.project_id,
      source: 'figma',
      source_event_id: sourceEventId,
      event_type: 'comment',
      author_id: c.user?.id,
      timestamp: c.created_at,
      content: c.message,
      metadata: {
        file_key: fileKey,
        file_name: fileName,
        comment: {
          id: c.id,
          parent_id: c.parent_id,
          user: c.user,
          resolved_at: c.resolved_at,
          client_meta: c.client_meta,
        },
        ...(c.user?.id ? { author: { id: c.user.id, name: c.user.handle || c.user.id, avatar_url: c.user.img_url || undefined } } : {}),
        via: 'polling',
      },
    });
    inserted++;
  }
  return { inserted };
}

async function run(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: integrations, error } = await supabase
      .from('integrations')
      .select()
      .eq('source', 'figma')
      .eq('status', 'active');

    if (error) throw error;

    const results: any[] = [];
    for (const integration of integrations || []) {
      const cfg = integration.config || {};
      const fileKey = cfg.file_key;
      // Only poll files without live webhooks — webhook mode already delivers events
      if (!fileKey || cfg.sync_mode === 'webhooks') continue;

      const versions = await pollFileVersions(integration, fileKey, cfg.file_name || fileKey);
      const comments = await pollFileComments(integration, fileKey, cfg.file_name || fileKey);

      await updateIntegrationLastSync(integration.id);
      await supabase
        .from('integrations')
        .update({ config: { ...cfg, last_poll_at: new Date().toISOString() } })
        .eq('id', integration.id);

      results.push({
        project_id: integration.project_id,
        file_key: fileKey,
        versions,
        comments,
      });
    }

    return NextResponse.json({ polled: results.length, results });
  } catch (err) {
    console.error('Error polling Figma:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
