import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { getProject } from '@/lib/db/queries';

const LINEAR_CLIENT_ID = process.env.LINEAR_CLIENT_ID;
const LINEAR_REDIRECT_URI = process.env.LINEAR_REDIRECT_URI;

// `admin` is required to create webhooks via the API — Linear gates
// webhookCreate/webhookDelete behind the admin scope, not just `write`.
// App actors (`actor=app`) can't hold the admin scope, so the token must
// act as the connecting user — who must be a Linear workspace admin.
const LINEAR_SCOPES = 'read,write,admin';

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

function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}

function encodeState(projectId: string, nonce: string): string {
  return Buffer.from(JSON.stringify({ project_id: projectId, nonce })).toString('base64');
}

export async function GET(request: NextRequest) {
  try {
    if (!LINEAR_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Linear client ID not configured' },
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

    const linearAuthUrl = new URL('https://linear.app/oauth/authorize');
    linearAuthUrl.searchParams.set('client_id', LINEAR_CLIENT_ID);
    linearAuthUrl.searchParams.set('redirect_uri', redirectUri);
    linearAuthUrl.searchParams.set('response_type', 'code');
    linearAuthUrl.searchParams.set('scope', LINEAR_SCOPES);
    linearAuthUrl.searchParams.set('state', state);
    linearAuthUrl.searchParams.set('prompt', 'consent');

    const response = NextResponse.redirect(linearAuthUrl.toString());
    response.cookies.set('linear_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Error initiating Linear OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
