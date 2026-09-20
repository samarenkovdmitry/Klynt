import { NextRequest, NextResponse } from 'next/server';
import { createIntegration, getProject } from '@/lib/db/queries';
import { getSessionUser } from '@/lib/api-auth';
import { encryptToken } from '@/lib/crypto';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;
const SLACK_REDIRECT_URI = process.env.SLACK_REDIRECT_URI;

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
  return SLACK_REDIRECT_URI || `${getBaseUrl(request)}/api/integrations/slack/callback`;
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
      console.error('Slack OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/integrations?error=slack_oauth_failed`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/integrations?error=invalid_oauth_response`);
    }

    const storedState = request.cookies.get('slack_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(`${baseUrl}/integrations?error=invalid_state`);
    }

    const statePayload = decodeState(storedState);
    if (!statePayload?.project_id) {
      return NextResponse.redirect(`${baseUrl}/integrations?error=invalid_state`);
    }

    const response = NextResponse.redirect(`${baseUrl}/integrations?success=slack_connected`);
    response.cookies.delete('slack_oauth_state');

    if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
      console.error('Missing Slack client credentials');
      return NextResponse.redirect(`${baseUrl}/integrations?error=missing_credentials`);
    }

    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Slack token exchange failed:', errorText);
      return NextResponse.redirect(`${baseUrl}/integrations?error=token_exchange_failed`);
    }

    const tokenData: any = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack token response error:', tokenData.error);
      return NextResponse.redirect(`${baseUrl}/integrations?error=token_exchange_failed`);
    }

    const projectId = statePayload.project_id;

    // Verify the session user owns this project
    const user = await getSessionUser();
    const project = user ? await getProject(projectId, user.id) : null;
    if (!project) {
      console.error('Project ownership check failed in Slack callback');
      return NextResponse.redirect(`${baseUrl}/integrations?error=forbidden`);
    }

    await createIntegration({
      project_id: projectId,
      source: 'slack',
      access_token_encrypted: encryptToken(tokenData.access_token),
      config: {
        team_id: tokenData.team?.id,
        team_name: tokenData.team?.name,
        channel: tokenData.incoming_webhook?.channel,
        authed_user: tokenData.authed_user,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
        user_scope: tokenData.user_scope,
        connected_at: new Date().toISOString(),
      },
    });

    console.log('Slack integration created successfully for project:', projectId);

    return response;
  } catch (error) {
    console.error('Error in Slack OAuth callback:', error);
    const baseUrl = getBaseUrl(request);
    return NextResponse.redirect(`${baseUrl}/integrations?error=oauth_callback_failed`);
  }
}
