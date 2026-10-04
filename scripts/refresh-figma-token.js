/**
 * Refresh Figma access token
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.DEFAULT_PROJECT_ID;
const clientId = process.env.FIGMA_CLIENT_ID;
const clientSecret = process.env.FIGMA_CLIENT_SECRET;

if (!supabaseUrl || !supabaseKey || !projectId || !clientId || !clientSecret) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function refreshToken() {
  try {
    const { data: integration, error } = await supabase
      .from('integrations')
      .select()
      .eq('project_id', projectId)
      .eq('source', 'figma')
      .single();

    if (error || !integration) {
      throw new Error('No Figma integration found');
    }

    const refreshToken = integration.refresh_token_encrypted;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://api.figma.com/v1/oauth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    console.log('Refresh response:', response.status);
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`Refresh failed: ${JSON.stringify(data)}`);
    }

    // Update integration
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        access_token_encrypted: data.access_token,
        refresh_token_encrypted: data.refresh_token,
        config: {
          ...integration.config,
          expires_in: data.expires_in,
          refreshed_at: new Date().toISOString(),
        },
      })
      .eq('id', integration.id);

    if (updateError) throw updateError;

    console.log('✅ Token refreshed successfully');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

refreshToken();
