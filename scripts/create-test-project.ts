/**
 * Script to create a test project in Klynt database
 * Usage: npx tsx scripts/create-test-project.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
const result = config({ path: envPath });
console.log('Env loaded:', result.error ? 'Error' : 'Success');
console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

import { createProject } from '../lib/db/queries';

async function createTestProject() {
  try {
    console.log('🚀 Creating test project...');

    const project = await createProject(
      'Test Project',
      'Initial test project for Klynt development'
    );

    console.log('✅ Project created successfully!');
    console.log('\n📋 Project Details:');
    console.log(`   ID: ${project.id}`);
    console.log(`   Name: ${project.name}`);
    console.log(`   Description: ${project.description}`);
    console.log(`   Created: ${project.created_at}`);

    console.log('\n🔧 Next Steps:');
    console.log('   Add this to your .env.local:');
    console.log(`   DEFAULT_PROJECT_ID=${project.id}`);

    console.log('\n💡 Tip: Save this ID for testing webhook endpoints and AI processing');

  } catch (error) {
    console.error('❌ Error creating project:', error);
    process.exit(1);
  }
}

createTestProject();
