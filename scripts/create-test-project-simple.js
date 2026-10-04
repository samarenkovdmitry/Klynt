/**
 * Simple script to create a test project
 * Usage: node scripts/create-test-project-simple.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestProject() {
  try {
    console.log('🚀 Creating test project...');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: 'Test Project',
        description: 'Initial test project for Klynt development'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Project created successfully!');
    console.log('\n📋 Project Details:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Description: ${data.description}`);
    console.log(`   Created: ${data.created_at}`);

    console.log('\n🔧 Next Steps:');
    console.log('   Add this to your .env.local:');
    console.log(`   DEFAULT_PROJECT_ID=${data.id}`);

    console.log('\n💡 Tip: Save this ID for testing webhook endpoints and AI processing');

  } catch (error) {
    console.error('❌ Error creating project:', error);
    process.exit(1);
  }
}

createTestProject();
