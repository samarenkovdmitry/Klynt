/**
 * Import real Figma version history from a file
 * Usage: node scripts/import-figma-versions.js <file_key>
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
  console.error('   Example: node scripts/import-figma-versions.js KfrHUfxDKYsD4gBevU1VV4');
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

    return { token: data.access_token, integration };
  }

  return { token: integration.access_token_encrypted, integration };
}

async function importFigmaVersions(fileKey, accessToken) {
  try {
    console.log('🔍 Fetching Figma version history...');
    console.log(`   File key: ${fileKey}`);

    const fileInfoResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const fileInfo = fileInfoResponse.ok ? await fileInfoResponse.json() : { name: fileKey };
    const fileName = fileInfo.name || fileKey;

    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/versions`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Figma API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    console.log(`\n📦 Found ${data.versions ? data.versions.length : 0} versions`);

    if (!data.versions || data.versions.length === 0) {
      console.log('No versions to import.');
      return;
    }

    let imported = 0;
    for (const version of data.versions) {
      const sourceEventId = `figma_version_${version.id}`;
      const { data: existing } = await supabase
        .from('raw_events')
        .select('id')
        .eq('project_id', projectId)
        .eq('source', 'figma')
        .eq('source_event_id', sourceEventId)
        .single();

      if (existing) {
        console.log(`   ⚠️  Skipping duplicate: ${sourceEventId}`);
        continue;
      }

      const content = version.description
        ? `${fileName} — Version ${version.label || version.id}: ${version.description}`
        : `${fileName} — Version ${version.label || version.id} created`;

      const { error } = await supabase
        .from('raw_events')
        .insert({
          project_id: projectId,
          source: 'figma',
          source_event_id: sourceEventId,
          event_type: 'version_update',
          author_id: version.user?.handle || version.user?.id || 'unknown',
          timestamp: new Date(version.created_at).toISOString(),
          content: content,
          metadata: JSON.stringify({
            file_key: fileKey,
            version_id: version.id,
            label: version.label,
            description: version.description,
            file_name: fileName,
          }),
        });

      if (error) {
        console.error(`   ❌ Error importing version ${version.id}:`, error);
      } else {
        console.log(`   ✅ Imported: ${version.user?.handle || 'unknown'} - ${content.substring(0, 60)}...`);
        imported++;
      }
    }

    console.log(`\n🚀 Imported ${imported} new Figma versions`);
    console.log('\n💡 Next steps:');
    console.log(`   1. Process events: curl -X POST http://localhost:3003/api/jobs/process-events -H "Content-Type: application/json" -d '{"projectId":"${projectId}"}'`);
    console.log(`   2. View: http://localhost:3003/project`);

  } catch (error) {
    console.error('❌ Error importing Figma versions:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    const { token: accessToken, integration } = await getFigmaAccessToken();
    await importFigmaVersions(fileKey, accessToken);

    // Store file_key in integration config so webhook handler can route by file_key
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        config: {
          ...(integration.config || {}),
          file_key: fileKey,
        },
      })
      .eq('id', integration.id);

    if (updateError) {
      console.error('❌ Failed to update integration config:', updateError);
    } else {
      console.log('📝 Updated integration config with file_key');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
