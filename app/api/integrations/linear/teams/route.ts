import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getIntegration, getProject } from '@/lib/db/queries';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { decryptToken, encryptToken } from '@/lib/crypto';
import { linearGraphQL } from '@/lib/linear/client';

const WEBHOOK_RESOURCE_TYPES = ['Issue', 'Comment', 'Project'];

function getBaseUrl(request: NextRequest): string {
  const protocol =
    request.headers.get('x-forwarded-proto') === 'https' || request.nextUrl.protocol === 'https:'
      ? 'https'
      : 'http';
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.host;
  return `${protocol}://${host}`;
}

async function getAuthorizedIntegration(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return { error: unauthorizedResponse() };

  const projectId =
    request.method === 'GET'
      ? request.nextUrl.searchParams.get('project_id')
      : (await request.json().catch(() => ({}))).projectId;
  if (!projectId) {
    return { error: NextResponse.json({ error: 'project_id required' }, { status: 400 }) };
  }

  const project = await getProject(projectId, user.id);
  if (!project) {
    return { error: NextResponse.json({ error: 'Project not found' }, { status: 404 }) };
  }

  const integration = await getIntegration(projectId, 'linear');
  if (!integration) {
    return { error: NextResponse.json({ error: 'Linear not connected' }, { status: 400 }) };
  }

  return { user, project, integration };
}

// GET: list Linear teams + current selection
export async function GET(request: NextRequest) {
  const ctx = await getAuthorizedIntegration(request);
  if ('error' in ctx) return ctx.error;
  const { integration } = ctx;

  const token = decryptToken(integration.access_token_encrypted);
  const res = await linearGraphQL(token, `query { teams { nodes { id name key } } }`);

  const nodes = res?.data?.teams?.nodes;
  if (!nodes) {
    console.error('Failed to list Linear teams:', res);
    return NextResponse.json({ error: 'Failed to load teams' }, { status: 500 });
  }

  return NextResponse.json({
    teams: nodes.map((t: any) => ({ id: t.id, name: t.name, key: t.key })),
    selected: integration.config?.team_ids || [],
  });
}

// POST: save team selection and recreate webhooks to match
export async function POST(request: NextRequest) {
  const ctx = await getAuthorizedIntegration(request);
  if ('error' in ctx) return ctx.error;
  const { integration } = ctx;

  const body = await request.json().catch(() => ({}));
  const teamIds: string[] = Array.isArray(body.teamIds) ? body.teamIds : [];
  const teamNames: Record<string, string> = body.teamNames || {};

  const token = decryptToken(integration.access_token_encrypted);

  // Remove existing webhook(s) — one per team or the all-teams one
  const oldWebhookIds: string[] =
    integration.config?.webhook_ids ||
    (integration.config?.webhook_id ? [integration.config.webhook_id] : []);
  for (const id of oldWebhookIds) {
    const res = await linearGraphQL(
      token,
      `mutation WebhookDelete($id: String!) { webhookDelete(id: $id) { success } }`,
      { id }
    );
    if (!res?.data?.webhookDelete?.success) {
      console.error('Failed to delete Linear webhook', id, res);
    }
  }

  // One shared signing secret for all new webhooks
  const webhookSecret = randomBytes(24).toString('hex');
  const webhookUrl = `${getBaseUrl(request)}/api/webhooks/linear`;

  const newWebhookIds: string[] = [];
  if (teamIds.length === 0) {
    // Empty selection = all public teams
    const res = await linearGraphQL(
      token,
      `mutation WebhookCreate($input: WebhookCreateInput!) {
        webhookCreate(input: $input) { success webhook { id } }
      }`,
      { input: { url: webhookUrl, resourceTypes: WEBHOOK_RESOURCE_TYPES, allPublicTeams: true, secret: webhookSecret } }
    );
    const id = res?.data?.webhookCreate?.webhook?.id;
    if (res?.data?.webhookCreate?.success && id) newWebhookIds.push(id);
    else console.error('Linear webhookCreate (all teams) failed:', res);
  } else {
    for (const teamId of teamIds) {
      const res = await linearGraphQL(
        token,
        `mutation WebhookCreate($input: WebhookCreateInput!) {
          webhookCreate(input: $input) { success webhook { id } }
        }`,
        { input: { url: webhookUrl, resourceTypes: WEBHOOK_RESOURCE_TYPES, teamId, secret: webhookSecret } }
      );
      const id = res?.data?.webhookCreate?.webhook?.id;
      if (res?.data?.webhookCreate?.success && id) newWebhookIds.push(id);
      else console.error(`Linear webhookCreate failed for team ${teamId}:`, res);
    }
  }

  if (newWebhookIds.length === 0) {
    return NextResponse.json({ error: 'Failed to create webhooks' }, { status: 500 });
  }

  const { error } = await supabase
    .from('integrations')
    .update({
      config: {
        ...integration.config,
        team_ids: teamIds,
        team_names: teamNames,
        webhook_ids: newWebhookIds,
        webhook_id: newWebhookIds[0],
        webhook_secret: encryptToken(webhookSecret),
      },
    })
    .eq('id', integration.id);

  if (error) {
    console.error('Failed to save Linear team selection:', error);
    return NextResponse.json({ error: 'Failed to save selection' }, { status: 500 });
  }

  return NextResponse.json({ saved: true, webhooks: newWebhookIds.length });
}
