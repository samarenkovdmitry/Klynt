import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { getProject } from '@/lib/db/queries';

const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID;
const FIGMA_REDIRECT_URI = process.env.FIGMA_REDIRECT_URI;

function getRedirectUri(request: NextRequest): string {
  if (FIGMA_REDIRECT_URI) return FIGMA_REDIRECT_URI;
  const protocol = request.headers.get('x-forwarded-proto') === 'https' || request.nextUrl.protocol === 'https:'
    ? 'https'
    : 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  return `${protocol}://${host}/api/integrations/figma/callback`;
}

export async function GET(request: NextRequest) {
  try {
    if (!FIGMA_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Figma client ID not configured' },
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

    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15);

    // Build redirect URI (prefer env, fallback to dynamic)
    const redirectUri = getRedirectUri(request);

    // Build Figma OAuth URL
    const figmaAuthUrl = new URL('https://www.figma.com/oauth');
    figmaAuthUrl.searchParams.append('client_id', FIGMA_CLIENT_ID);
    figmaAuthUrl.searchParams.append('redirect_uri', redirectUri);
    figmaAuthUrl.searchParams.append('scope', 'file_content:read file_comments:read file_versions:read current_user:read webhooks:write');
    figmaAuthUrl.searchParams.append('state', state);
    figmaAuthUrl.searchParams.append('response_type', 'code');

    // Store state and project ID in cookies for verification
    const response = NextResponse.redirect(figmaAuthUrl.toString());
    response.cookies.set('figma_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });
    response.cookies.set('figma_oauth_project_id', projectId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    console.error('Error initiating Figma OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
