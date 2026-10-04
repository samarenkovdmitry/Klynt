/**
 * Script to check project facts with history
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

async function checkFacts() {
  try {
    console.log('🔍 Checking project facts with history...');
    console.log(`   Project ID: ${projectId}\n`);

    // Project facts
    const { data: facts, error: factsError } = await supabase
      .from('project_facts')
      .select()
      .eq('project_id', projectId)
      .order('last_updated_at', { ascending: false });

    if (factsError) throw factsError;

    console.log(`🎯 Project Facts: ${facts ? facts.length : 0}`);
    if (facts && facts.length > 0) {
      facts.forEach((f, i) => {
        console.log(`\n${i + 1}. ${f.subject}`);
        console.log(`   Current State: ${f.current_state} (${(f.confidence * 100).toFixed(0)}% confidence)`);
        console.log(`   Evidence: ${f.evidence_summary || 'None'}`);

        // Get history for this fact
        getFactHistory(f.id);
      });
    }

    async function getFactHistory(factId) {
      const { data: history, error: historyError } = await supabase
        .from('fact_history')
        .select()
        .eq('fact_id', factId)
        .order('created_at', { ascending: true });

      if (historyError) throw historyError;

      if (history && history.length > 0) {
        console.log(`   History:`);
        history.forEach((h, i) => {
          console.log(`     ${i + 1}. ${h.previous_state || '(new)'} → ${h.new_state} at ${new Date(h.decided_at).toLocaleString()}`);
        });
      }
    }

    // Conflicts
    const { data: conflicts, error: conflictsError } = await supabase
      .from('conflicts')
      .select()
      .eq('project_id', projectId);

    if (conflictsError) throw conflictsError;

    console.log(`\n\n⚠️  Conflicts: ${conflicts ? conflicts.length : 0}`);
    if (conflicts && conflicts.length > 0) {
      conflicts.forEach((conflict, i) => {
        console.log(`\n${i + 1}. ${conflict.subject} (${conflict.conflict_type})`);
        console.log(`   ${conflict.description}`);
        console.log(`   Detected: ${new Date(conflict.detected_at).toLocaleString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking facts:', error);
    process.exit(1);
  }
}

checkFacts();
