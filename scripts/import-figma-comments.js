/**
 * Import real Figma comments from a file
 * Usage: node scripts/import-figma-comments.js <file_key>
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.DEFAULT_PROJECT_ID;
const fileKey = process.argv[2];

if (!supabaseUrl || !supabaseKey || !projectId) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

if (!fileKey) {
  console.error('❌ Please provide Figma file key as argument');
  console.error('   Example: node scripts/import-figma-comments.js KfrHUfxDKYsD4gBevU1VV4');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getFigmaAccessToken() {
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

  // Check expiration
  const expiresAt = integration.config?.expires_at;
  const now = new Date();

  if (expiresAt && new Date(expiresAt).getTime() - now.getTime() < 5 * 60 * 1000) {
    console.log('Token expired, refreshing...');
    const clientId = process.env.FIGMA_CLIENT_ID;
    const clientSecret = process.env.FIGMA_CLIENT_SECRET;
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://api.figma.com/v1/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: new URLSearchParams({
        refresh_token: integration.refresh_token_encrypted,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Refresh failed: ${JSON.stringify(data)}`);

    const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        access_token_encrypted: data.access_token,
        refresh_token_encrypted: data.refresh_token,
        config: {
          ...integration.config,
          expires_in: data.expires_in,
          expires_at: newExpiresAt,
          token_type: data.token_type,
          refreshed_at: new Date().toISOString(),
        },
      })
      .eq('id', integration.id);

    if (updateError) throw updateError;

    return data.access_token;
  }

  return integration.access_token_encrypted;
}

async function importFigmaComments(fileKey, accessToken) {
  try {
    console.log('🔍 Fetching Figma comments...');
    console.log(`   File key: ${fileKey}`);

    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Figma API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    console.log(`\n💬 Found ${data.comments ? data.comments.length : 0} comments`);

    if (!data.comments || data.comments.length === 0) {
      console.log('No comments to import.');
      return;
    }

    let imported = 0;
    for (const comment of data.comments) {
      const { data: existing } = await supabase
        .from('raw_events')
        .select('id')
        .eq('project_id', projectId)
        .eq('source', 'figma')
        .eq('source_event_id', comment.id)
        .single();

      if (existing) {
        console.log(`   ⚠️  Skipping duplicate: ${comment.id}`);
        continue;
      }

      const { error } = await supabase
        .from('raw_events')
        .insert({
          project_id: projectId,
          source: 'figma',
          source_event_id: String(comment.id),
          event_type: 'comment',
          author_id: comment.user?.handle || comment.user?.id || 'unknown',
          timestamp: new Date(comment.created_at).toISOString(),
          content: comment.message || '',
          metadata: JSON.stringify({
            file_key: fileKey,
            comment_id: comment.id,
            file_name: fileKey,
            resolved: comment.resolved_at ? true : false,
            order_id: comment.order_id,
          }),
        });

      if (error) {
        console.error(`   ❌ Error importing comment ${comment.id}:`, error);
      } else {
        console.log(`   ✅ Imported: ${comment.user?.handle || 'unknown'} - ${(comment.message || '').substring(0, 60)}...`);
        imported++;
      }
    }

    console.log(`\n🚀 Imported ${imported} new Figma comments`);
    console.log('\n💡 Next steps:');
    console.log(`   1. Process events: curl -X POST http://localhost:3003/api/jobs/process-events -H "Content-Type: application/json" -d '{"projectId":"${projectId}"}'`);
    console.log(`   2. View: http://localhost:3003/project`);

  } catch (error) {
    console.error('❌ Error importing Figma comments:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    const accessToken = await getFigmaAccessToken();
    await importFigmaComments(fileKey, accessToken);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
