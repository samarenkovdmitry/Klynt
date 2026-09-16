import { NextRequest, NextResponse } from 'next/server';
import { createIntegration, getProject } from '@/lib/db/queries';
import { getSessionUser } from '@/lib/api-auth';

const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID;
const FIGMA_CLIENT_SECRET = process.env.FIGMA_CLIENT_SECRET;
const FIGMA_REDIRECT_URI = process.env.FIGMA_REDIRECT_URI;

function getBaseUrl(request: NextRequest): string {
  const protocol = request.headers.get('x-forwarded-proto') === 'https' || request.nextUrl.protocol === 'https:'
    ? 'https'
    : 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  return `${protocol}://${host}`;
}

function getRedirectUri(request: NextRequest): string {
  return FIGMA_REDIRECT_URI || `${getBaseUrl(request)}/api/integrations/figma/callback`;
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = getBaseUrl(request);
    const redirectUri = getRedirectUri(request);

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('Figma OAuth error:', error);
      return NextResponse.redirect(`${baseUrl}/?error=figma_oauth_failed`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/?error=invalid_oauth_response`);
    }

    // Verify state parameter
    const storedState = request.cookies.get('figma_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(`${baseUrl}/?error=invalid_state`);
    }

    // Clear state and project cookies
    const response = NextResponse.redirect(`${baseUrl}/integrations?success=figma_connected`);
    response.cookies.delete('figma_oauth_state');
    response.cookies.delete('figma_oauth_project_id');

    // Exchange code for access token
    console.log('Exchanging code for token...');
    console.log('Redirect URI:', redirectUri);
    console.log('Client ID:', FIGMA_CLIENT_ID ? 'Set' : 'Missing');
    console.log('Client Secret:', FIGMA_CLIENT_SECRET ? 'Set' : 'Missing');

    if (!FIGMA_CLIENT_ID || !FIGMA_CLIENT_SECRET) {
      console.error('Missing Figma client credentials');
      return NextResponse.redirect(`${baseUrl}/?error=missing_credentials`);
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${FIGMA_CLIENT_ID}:${FIGMA_CLIENT_SECRET}`).toString('base64');

    // Use new Figma OAuth endpoint with Basic Auth
    const tokenResponse = await fetch('https://api.figma.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: new URLSearchParams({
        redirect_uri: redirectUri,
        code,
        grant_type: 'authorization_code',
      }),
    });

    console.log('Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Figma token exchange failed:', errorText);
      console.error('Status:', tokenResponse.status);
      return NextResponse.redirect(`${baseUrl}/?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();

    // Get project ID from the cookie set at connect time
    const projectId = request.cookies.get('figma_oauth_project_id')?.value;
    if (!projectId) {
      console.error('No project ID available');
      return NextResponse.redirect(`${baseUrl}/integrations?error=no_project`);
    }

    // Verify the session user owns this project
    const user = await getSessionUser();
    const project = user ? await getProject(projectId, user.id) : null;
    if (!project) {
      console.error('Project ownership check failed in Figma callback');
      return NextResponse.redirect(`${baseUrl}/integrations?error=forbidden`);
    }

    // Store integration in database with expiration
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    await createIntegration({
      project_id: projectId,
      source: 'figma',
      access_token_encrypted: tokenData.access_token,
      refresh_token_encrypted: tokenData.refresh_token,
      config: {
        expires_in: tokenData.expires_in,
        expires_at: expiresAt,
        token_type: tokenData.token_type,
        connected_at: new Date().toISOString(),
      },
    });

    console.log('Figma integration created successfully for project:', projectId);

    return response;
  } catch (error) {
    console.error('Error in Figma OAuth callback:', error);
    const baseUrl = getBaseUrl(request);
    return NextResponse.redirect(`${baseUrl}/?error=oauth_callback_failed`);
  }
}
