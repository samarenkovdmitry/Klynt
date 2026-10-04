import { createClient } from '@supabase/supabase-js';
import { decryptToken, encryptToken } from '@/lib/crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID;
const FIGMA_CLIENT_SECRET = process.env.FIGMA_CLIENT_SECRET;

interface FigmaTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export async function getFigmaAccessToken(projectId: string): Promise<string> {
  const { data: integrations, error } = await supabase
    .from('integrations')
    .select()
    .eq('project_id', projectId)
    .eq('source', 'figma')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  const integration = integrations?.[0];

  if (error || !integration) {
    throw new Error('No active Figma integration found. Run Figma OAuth first.');
  }

  const expiresAt = integration.config?.expires_at;
  const now = new Date();

  // If token is expired or expires within 5 minutes, refresh it
  if (expiresAt && new Date(expiresAt).getTime() - now.getTime() < 5 * 60 * 1000) {
    console.log('Figma token expired or about to expire. Refreshing...');
    const tokens = await refreshFigmaToken(decryptToken(integration.refresh_token_encrypted));
    await storeFigmaTokens(integration.id, tokens);
    return tokens.access_token;
  }

  return decryptToken(integration.access_token_encrypted);
}

async function refreshFigmaToken(refreshToken: string): Promise<FigmaTokens> {
  if (!FIGMA_CLIENT_ID || !FIGMA_CLIENT_SECRET) {
    throw new Error('Missing Figma client credentials');
  }

  const auth = Buffer.from(`${FIGMA_CLIENT_ID}:${FIGMA_CLIENT_SECRET}`).toString('base64');

  const response = await fetch('https://api.figma.com/v1/oauth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Figma refresh failed: ${JSON.stringify(data)}`);
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_in: data.expires_in,
    token_type: data.token_type || 'bearer',
  };
}

async function storeFigmaTokens(integrationId: string, tokens: FigmaTokens) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const { data: existing } = await supabase
    .from('integrations')
    .select('config')
    .eq('id', integrationId)
    .single();

  const { error } = await supabase
    .from('integrations')
    .update({
      access_token_encrypted: encryptToken(tokens.access_token),
      refresh_token_encrypted: encryptToken(tokens.refresh_token),
      config: {
        ...existing?.config,
        expires_in: tokens.expires_in,
        expires_at: expiresAt,
        token_type: tokens.token_type,
        refreshed_at: new Date().toISOString(),
      },
    })
    .eq('id', integrationId);

  if (error) throw error;
}

export function getFigmaClient(projectId: string) {
  return {
    async fetch(path: string, options: RequestInit = {}) {
      const token = await getFigmaAccessToken(projectId);
      return fetch(`https://api.figma.com${path}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  };
}
