/**
 * Debug Figma integration token
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.DEFAULT_PROJECT_ID;

if (!supabaseUrl || !supabaseKey || !projectId) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugToken() {
  const { data, error } = await supabase
    .from('integrations')
    .select('id, source, status, access_token_encrypted, refresh_token_encrypted, config, created_at')
    .eq('project_id', projectId)
    .eq('source', 'figma')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('Integration record:');
  console.log(JSON.stringify(data, null, 2));
}

debugToken();
