/**
 * Script to reset processed events for re-testing
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

async function resetEvents() {
  try {
    console.log('🔄 Resetting events for project:', projectId);

    // Reset processed_at for all raw events
    const { error: rawError } = await supabase
      .from('raw_events')
      .update({ processed_at: null })
      .eq('project_id', projectId);

    if (rawError) throw rawError;
    console.log('✅ Reset raw_events processed_at to null');

    // Delete conflicts first (they reference project_facts and candidate_events)
    const { error: conflictsError } = await supabase
      .from('conflicts')
      .delete()
      .eq('project_id', projectId);

    if (conflictsError) throw conflictsError;
    console.log('✅ Deleted conflicts for project');

    // Delete project facts (they reference candidate_events)
    const { error: factsError } = await supabase
      .from('project_facts')
      .delete()
      .eq('project_id', projectId);

    if (factsError) throw factsError;
    console.log('✅ Deleted project_facts for project');

    // Delete fact history for this project
    const { error: historyError } = await supabase
      .from('fact_history')
      .delete()
      .eq('project_id', projectId);

    if (historyError) throw historyError;
    console.log('✅ Deleted fact_history for project');

    // Delete candidate events for this project
    const { error: candidateError } = await supabase
      .from('candidate_events')
      .delete()
      .eq('project_id', projectId);

    if (candidateError) throw candidateError;
    console.log('✅ Deleted candidate_events for project');

    console.log('\n🚀 Reset complete! You can now reprocess events.');
    console.log(`   Run: curl -X POST http://localhost:3003/api/jobs/process-events -H "Content-Type: application/json" -d '{"projectId":"${projectId}"}'`);

  } catch (error) {
    console.error('❌ Error resetting events:', error);
    process.exit(1);
  }
}

resetEvents();
