import { NextRequest, NextResponse } from 'next/server';
import { getIntegration, getProject } from '@/lib/db/queries';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

async function slackApi(method: string, token: string, params?: Record<string, string>) {
  const url = new URL(`https://slack.com/api/${method}`);
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function slackApiPost(method: string, token: string, body: Record<string, string>) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
  });
  return res.json();
}

async function getAuthorizedIntegration(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return { error: unauthorizedResponse() };

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  if (!projectId) {
    return { error: NextResponse.json({ error: 'project_id required' }, { status: 400 }) };
  }

  const project = await getProject(projectId, user.id);
  if (!project) {
    return { error: NextResponse.json({ error: 'Project not found' }, { status: 404 }) };
  }

  const integration = await getIntegration(projectId, 'slack');
  if (!integration) {
    return { error: NextResponse.json({ error: 'Connect Slack first' }, { status: 404 }) };
  }

  return { integration };
}

export async function GET(request: NextRequest) {
  try {
    const { integration, error } = await getAuthorizedIntegration(request);
    if (error) return error;

    const token = integration.access_token_encrypted;
    const channels: { id: string; name: string; is_private: boolean; is_member: boolean }[] = [];
    let cursor = '';

    // Paginate through conversations.list (public + private)
    for (let i = 0; i < 10; i++) {
      const data = await slackApi('conversations.list', token, {
        types: 'public_channel,private_channel',
        exclude_archived: 'true',
        limit: '200',
        ...(cursor ? { cursor } : {}),
      });
      if (!data.ok) {
        return NextResponse.json(
          { error: `Slack API error: ${data.error}` },
          { status: 502 },
        );
      }
      for (const ch of data.channels || []) {
        channels.push({
          id: ch.id,
          name: ch.name,
          is_private: ch.is_private || false,
          is_member: ch.is_member || false,
        });
      }
      cursor = data.response_metadata?.next_cursor || '';
      if (!cursor) break;
    }

    const selected: string[] = integration.config?.channel_ids || [];

    return NextResponse.json({
      channels: channels.sort((a, b) => a.name.localeCompare(b.name)),
      selected,
    });
  } catch (err) {
    console.error('Error listing Slack channels:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { projectId, channelIds } = body as { projectId?: string; channelIds?: string[] };

    if (!projectId || !Array.isArray(channelIds)) {
      return NextResponse.json(
        { error: 'projectId and channelIds[] are required' },
        { status: 400 },
      );
    }

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const integration = await getIntegration(projectId, 'slack');
    if (!integration) {
      return NextResponse.json({ error: 'Connect Slack first' }, { status: 404 });
    }

    const token = integration.access_token_encrypted;

    // Fetch channel names for display + try to join public channels so
    // Events API actually delivers their messages to the webhook.
    const channelNames: Record<string, string> = {};
    const joinFailures: string[] = [];
    for (const id of channelIds) {
      const info = await slackApi('conversations.info', token, { channel: id });
      if (info.ok) channelNames[id] = info.channel.name;

      const join = await slackApiPost('conversations.join', token, { channel: id });
      // 'already_in_channel' and 'method_not_supported_for_channel_type' (private)
      // are non-fatal — private channels need a manual /invite anyway.
      if (!join.ok && !['already_in_channel', 'method_not_supported_for_channel_type'].includes(join.error)) {
        joinFailures.push(`${id}: ${join.error}`);
      }
    }

    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        config: {
          ...integration.config,
          channel_ids: channelIds,
          channel_names: channelNames,
          channels_updated_at: new Date().toISOString(),
        },
      })
      .eq('id', integration.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      channelNames,
      ...(joinFailures.length ? { joinFailures } : {}),
    });
  } catch (err) {
    console.error('Error saving Slack channels:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
