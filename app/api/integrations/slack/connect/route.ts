import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { getProject } from '@/lib/db/queries';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_REDIRECT_URI = process.env.SLACK_REDIRECT_URI;

const SLACK_SCOPES = 'channels:history channels:read chat:write users:read team:read';

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

function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}

function encodeState(projectId: string, nonce: string): string {
  return Buffer.from(JSON.stringify({ project_id: projectId, nonce })).toString('base64');
}

export async function GET(request: NextRequest) {
  try {
    if (!SLACK_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Slack client ID not configured' },
        { status: 500 }
      );
    }

    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id') || '';

    if (!projectId) {
      return NextResponse.json({ error: 'project_id required' }, { status: 400 });
    }

    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const nonce = generateNonce();
    const state = encodeState(projectId, nonce);
    const redirectUri = getRedirectUri(request);

    const slackAuthUrl = new URL('https://slack.com/oauth/v2/authorize');
    slackAuthUrl.searchParams.set('client_id', SLACK_CLIENT_ID);
    slackAuthUrl.searchParams.set('redirect_uri', redirectUri);
    slackAuthUrl.searchParams.set('scope', SLACK_SCOPES);
    slackAuthUrl.searchParams.set('user_scope', 'users:read');
    slackAuthUrl.searchParams.set('state', state);

    const response = NextResponse.redirect(slackAuthUrl.toString());
    response.cookies.set('slack_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Error initiating Slack OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
