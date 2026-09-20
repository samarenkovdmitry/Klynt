import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createIntegration, getIntegration, getProject } from '@/lib/db/queries';
import { getSessionUser } from '@/lib/api-auth';
import { encryptToken } from '@/lib/crypto';
import { linearGraphQL } from '@/lib/linear/client';

const LINEAR_CLIENT_ID = process.env.LINEAR_CLIENT_ID;
const LINEAR_CLIENT_SECRET = process.env.LINEAR_CLIENT_SECRET;
const LINEAR_REDIRECT_URI = process.env.LINEAR_REDIRECT_URI;

// Resource types we subscribe to via the org webhook
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

function getRedirectUri(request: NextRequest): string {
  return LINEAR_REDIRECT_URI || `${getBaseUrl(request)}/api/integrations/linear/callback`;
}

function decodeState(state: string): { project_id?: string; nonce?: string } | null {
  try {
    return JSON.parse(Buffer.from(state, 'base64').toString());
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = getBaseUrl(request);
    const redirectUri = getRedirectUri(request);

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Linear OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/integrations?error=linear_oauth_failed`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/integrations?error=invalid_oauth_response`);
    }

    const storedState = request.cookies.get('linear_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(`${baseUrl}/integrations?error=invalid_state`);
    }

    const statePayload = decodeState(storedState);
    if (!statePayload?.project_id) {
      return NextResponse.redirect(`${baseUrl}/integrations?error=invalid_state`);
    }

    const response = NextResponse.redirect(`${baseUrl}/integrations?success=linear_connected&projectId=${statePayload.project_id}`);
    response.cookies.delete('linear_oauth_state');

    if (!LINEAR_CLIENT_ID || !LINEAR_CLIENT_SECRET) {
      console.error('Missing Linear client credentials');
      return NextResponse.redirect(`${baseUrl}/integrations?error=missing_credentials`);
    }

    const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: LINEAR_CLIENT_ID,
        client_secret: LINEAR_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Linear token exchange failed:', errorText);
      return NextResponse.redirect(`${baseUrl}/integrations?error=token_exchange_failed`);
    }

    const tokenData: any = await tokenResponse.json();
    const accessToken: string | undefined = tokenData.access_token;
    if (!accessToken) {
      console.error('Linear token response missing access_token:', tokenData);
      return NextResponse.redirect(`${baseUrl}/integrations?error=token_exchange_failed`);
    }

    const projectId = statePayload.project_id;

    // Verify the session user owns this project
    const user = await getSessionUser();
    const project = user ? await getProject(projectId, user.id) : null;
    if (!project) {
      console.error('Project ownership check failed in Linear callback');
      return NextResponse.redirect(`${baseUrl}/integrations?error=forbidden`);
    }

    // Fetch org identity for routing incoming webhooks to this project
    const orgRes = await linearGraphQL(accessToken, `query { organization { id name urlKey } }`);
    const organization = orgRes?.data?.organization;
    if (!organization) {
      console.error('Failed to fetch Linear organization:', orgRes);
      return NextResponse.redirect(`${baseUrl}/integrations?error=linear_org_failed`);
    }

    // Remove webhooks from a previous connection so reconnects don't pile up
    const existing = await getIntegration(projectId, 'linear');
    const oldWebhookIds: string[] =
      existing?.config?.webhook_ids ||
      (existing?.config?.webhook_id ? [existing.config.webhook_id] : []);
    for (const id of oldWebhookIds) {
      const del = await linearGraphQL(
        accessToken,
        `mutation WebhookDelete($id: String!) { webhookDelete(id: $id) { success } }`,
        { id }
      );
      if (!del?.data?.webhookDelete?.success) {
        console.error('Failed to delete old Linear webhook', id, del);
      }
    }

    // Create an org-wide webhook so issue/comment/project activity flows in
    const webhookSecret = randomBytes(24).toString('hex');
    const webhookRes = await linearGraphQL(
      accessToken,
      `mutation WebhookCreate($input: WebhookCreateInput!) {
        webhookCreate(input: $input) {
          success
          webhook { id enabled }
        }
      }`,
      {
        input: {
          url: `${baseUrl}/api/webhooks/linear`,
          resourceTypes: WEBHOOK_RESOURCE_TYPES,
          allPublicTeams: true,
          secret: webhookSecret,
        },
      }
    );

    const webhook = webhookRes?.data?.webhookCreate?.webhook;
    const webhookOk = webhookRes?.data?.webhookCreate?.success && webhook?.id;
    if (!webhookOk) {
      console.error('Linear webhook creation failed:', webhookRes);
    }

    await createIntegration({
      project_id: projectId,
      source: 'linear',
      access_token_encrypted: encryptToken(accessToken),
      config: {
        organization_id: organization.id,
        organization_name: organization.name,
        organization_url_key: organization.urlKey,
        webhook_id: webhook?.id || null,
        webhook_ids: webhook?.id ? [webhook.id] : [],
        webhook_secret: webhookOk ? encryptToken(webhookSecret) : null,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
        connected_at: new Date().toISOString(),
      },
    });

    console.log('Linear integration created successfully for project:', projectId, {
      org: organization.name,
      webhook: webhook?.id || 'FAILED',
    });

    return response;
  } catch (error) {
    console.error('Error in Linear OAuth callback:', error);
    const baseUrl = getBaseUrl(request);
    return NextResponse.redirect(`${baseUrl}/integrations?error=oauth_callback_failed`);
  }
}
