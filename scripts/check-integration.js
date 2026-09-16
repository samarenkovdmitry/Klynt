/**
 * Script to check Figma integration status
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIntegration() {
  try {
    console.log('🔍 Checking Figma integration...');

    const { data, error } = await supabase
      .from('integrations')
      .select()
      .eq('source', 'figma')
      .eq('project_id', process.env.DEFAULT_PROJECT_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ No Figma integration found');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Figma integration found!');
      console.log('\n📋 Integration Details:');
      console.log(`   ID: ${data.id}`);
      console.log(`   Source: ${data.source}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Last Sync: ${data.last_sync_at || 'Never'}`);
      console.log(`   Created: ${data.created_at}`);
      console.log(`   Config:`, data.config);
    }

  } catch (error) {
    console.error('❌ Error checking integration:', error);
    process.exit(1);
  }
}

checkIntegration();
