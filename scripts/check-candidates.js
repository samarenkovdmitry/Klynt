/**
 * Script to check candidate events and project facts
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

async function checkResults() {
  try {
    console.log('🔍 Checking candidate events and facts...');
    console.log(`   Project ID: ${projectId}`);

    // Candidate events
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidate_events')
      .select()
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (candidatesError) throw candidatesError;

    console.log(`\n\nn📋 Candidate Events: ${candidates ? candidates.length : 0}`);
    if (candidates && candidates.length > 0) {
      candidates.forEach((c, i) => {
        console.log(`\n${i + 1}. ${c.subject}: ${c.event_type} (${(c.confidence * 100).toFixed(0)}% confidence)`);
        console.log(`   Action: ${c.action || 'N/A'}`);
        console.log(`   Importance: ${c.importance}`);
        console.log(`   Status: ${c.status}`);
        console.log(`   Reason: ${c.reason}`);
        console.log(`   Related: ${c.related_entities ? c.related_entities.join(', ') : 'None'}`);
      });
    }

    // Project facts
    const { data: facts, error: factsError } = await supabase
      .from('project_facts')
      .select()
      .eq('project_id', projectId)
      .order('last_updated_at', { ascending: false });

    if (factsError) throw factsError;

    console.log(`\n\n🎯 Project Facts: ${facts ? facts.length : 0}`);
    if (facts && facts.length > 0) {
      facts.forEach((f, i) => {
        console.log(`\n${i + 1}. ${f.subject}: ${f.current_state} (${(f.confidence * 100).toFixed(0)}% confidence)`);
        console.log(`   Evidence: ${f.evidence_summary || 'None'}`);
      });
    }

    // Conflicts
    const { data: conflicts, error: conflictsError } = await supabase
      .from('conflicts')
      .select()
      .eq('project_id', projectId);

    if (conflictsError) throw conflictsError;

    console.log(`�\n\n\n\n⚠️  Conflicts: ${conflicts ? conflicts.length : 0}`);
    if (conflicts && conflicts.length > 0) {
      conflicts.forEach((conflict, i) => {
        console.log(`\n${i + 1}. ${conflict.subject}: ${conflict.description}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking results:', error);
    process.exit(1);
  }
}

checkResults();
