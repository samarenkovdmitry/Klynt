import { createRawEvent, getRawEvent } from '@/lib/db/queries';
import { linearGraphQL } from '@/lib/linear/client';

// Seed a freshly connected project with recent activity so the dashboard
// isn't empty while waiting for the first live webhook/poll event.
// All inserts dedupe on (project_id, source, source_event_id).

async function insertIfNew(event: {
  project_id: string;
  source: 'slack' | 'figma' | 'linear';
  source_event_id: string;
  event_type: string;
  author_id?: string;
  timestamp: string;
  content?: string;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  const existing = await getRawEvent(event.project_id, event.source, event.source_event_id);
  if (existing) return false;
  await createRawEvent(event as any);
  return true;
}

async function slackApi(token: string, method: string, params: Record<string, string>) {
  if (method === 'conversations.join') {
    const res = await fetch(`https://slack.com/api/${method}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  }
  const q = new URL(`https://slack.com/api/${method}`);
  for (const [k, v] of Object.entries(params)) q.searchParams.set(k, v);
  const res = await fetch(q.toString(), { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

const SLACK_BACKFILL_CHANNELS = 3;
const SLACK_BACKFILL_MESSAGES = 10;

export async function backfillSlack(projectId: string, token: string, config: any): Promise<number> {
  let channelIds: string[] = config?.channel_ids || [];

  if (channelIds.length === 0) {
    const list = await slackApi(token, 'conversations.list', {
      types: 'public_channel',
      limit: '20',
      exclude_archived: 'true',
    });
    channelIds = (list?.channels || [])
      .filter((c: any) => c.is_member)
      .slice(0, SLACK_BACKFILL_CHANNELS)
      .map((c: any) => c.id);
    // If the bot isn't in any channel yet, join the first few
    if (channelIds.length === 0) {
      channelIds = (list?.channels || []).slice(0, SLACK_BACKFILL_CHANNELS).map((c: any) => c.id);
      for (const id of channelIds) {
        await slackApi(token, 'conversations.join', { channel: id }).catch(() => {});
      }
    }
  }

  let inserted = 0;
  for (const channel of channelIds.slice(0, 5)) {
    const hist = await slackApi(token, 'conversations.history', {
      channel,
      limit: String(SLACK_BACKFILL_MESSAGES),
    });
    for (const m of hist?.messages || []) {
      if (!m.ts || !m.text) continue;
      if (m.subtype && !['thread_broadcast'].includes(m.subtype)) continue;
      const ok = await insertIfNew({
        project_id: projectId,
        source: 'slack',
        source_event_id: m.ts,
        event_type: 'message',
        author_id: m.user,
        timestamp: new Date(parseFloat(m.ts) * 1000).toISOString(),
        content: m.text,
        metadata: { channel, team_id: config?.team_id, backfill: true },
      });
      if (ok) inserted++;
    }
  }
  return inserted;
}

export async function backfillLinear(projectId: string, token: string, config: any): Promise<number> {
  const teamIds: string[] = config?.team_ids || [];
  const filter = teamIds.length > 0 ? `, filter: { team: { id: { in: ${JSON.stringify(teamIds)} } } }` : '';
  const res = await linearGraphQL(
    token,
    `query { issues(first: 15, orderBy: updatedAt${filter}) { nodes { id identifier title url updatedAt state { name } assignee { displayName name } team { id name } } } }`
  );
  const issues = res?.data?.issues?.nodes || [];

  let inserted = 0;
  for (const issue of issues) {
    const ok = await insertIfNew({
      project_id: projectId,
      source: 'linear',
      source_event_id: `backfill:${issue.id}`,
      event_type: 'issue',
      timestamp: new Date(issue.updatedAt).toISOString(),
      content: `${issue.identifier}: ${issue.title}${issue.state?.name ? ` [${issue.state.name}]` : ''}`,
      metadata: {
        type: 'Issue',
        action: 'backfill',
        identifier: issue.identifier,
        title: issue.title,
        state: issue.state?.name,
        team: issue.team?.name,
        url: issue.url,
        organization_id: config?.organization_id,
        backfill: true,
        ...(issue.assignee ? { author: { name: issue.assignee.displayName || issue.assignee.name } } : {}),
      },
    });
    if (ok) inserted++;
  }
  return inserted;
}

export async function backfillFigma(projectId: string, token: string, config: any): Promise<number> {
  const fileKey = config?.file_key;
  if (!fileKey) return 0;
  const fileName = config?.file_name || 'the file';
  const headers = { Authorization: `Bearer ${token}` };

  let inserted = 0;

  const commentsRes = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, { headers });
  const comments = (await commentsRes.json().catch(() => ({})))?.comments || [];
  for (const c of comments.slice(0, 10)) {
    const ok = await insertIfNew({
      project_id: projectId,
      source: 'figma',
      source_event_id: `backfill:comment:${c.id}`,
      event_type: 'comment',
      author_id: c.user?.id,
      timestamp: new Date(c.created_at).toISOString(),
      content: c.message,
      metadata: {
        file_key: fileKey,
        file_name: fileName,
        comment_id: c.id,
        backfill: true,
        ...(c.user ? { author: { id: c.user.id, name: c.user.handle || c.user.id, avatar_url: c.user.img_url } } : {}),
      },
    });
    if (ok) inserted++;
  }

  const versionsRes = await fetch(`https://api.figma.com/v1/files/${fileKey}/versions?page_size=5`, { headers });
  const versions = (await versionsRes.json().catch(() => ({})))?.versions || [];
  for (const v of versions.slice(0, 5)) {
    const ok = await insertIfNew({
      project_id: projectId,
      source: 'figma',
      source_event_id: `backfill:version:${v.id}`,
      event_type: 'file_version',
      author_id: v.user?.id,
      timestamp: new Date(v.created_at).toISOString(),
      content: v.label ? `New version in ${fileName}: ${v.label}` : `New version saved in ${fileName}`,
      metadata: {
        file_key: fileKey,
        file_name: fileName,
        version_id: v.id,
        backfill: true,
        ...(v.user ? { author: { id: v.user.id, name: v.user.handle || v.user.id, avatar_url: v.user.img_url } } : {}),
      },
    });
    if (ok) inserted++;
  }

  return inserted;
}

export async function backfillIntegration(integration: {
  project_id: string;
  source: string;
  access_token_encrypted?: string | null;
  config?: any;
}, token: string): Promise<number> {
  try {
    switch (integration.source) {
      case 'slack':
        return await backfillSlack(integration.project_id, token, integration.config);
      case 'linear':
        return await backfillLinear(integration.project_id, token, integration.config);
      case 'figma':
        return await backfillFigma(integration.project_id, token, integration.config);
      default:
        return 0;
    }
  } catch (e) {
    console.error(`Backfill failed for ${integration.source}:`, e);
    return 0;
  }
}
