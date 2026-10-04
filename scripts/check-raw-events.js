/**
 * Script to check raw events for a project
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

async function checkRawEvents() {
  try {
    console.log('🔍 Checking raw events...');
    console.log(`   Project ID: ${projectId}`);

    // Get all raw events
    const { data: allEvents, error: allError } = await supabase
      .from('raw_events')
      .select()
      .eq('project_id', projectId)
      .order('timestamp', { ascending: true });

    if (allError) throw allError;

    console.log(`\n\n📊 Total raw events: ${allEvents ? allEvents.length : 0}`);
    if (allEvents && allEvents.length > 0) {
      allEvents.forEach((event, i) => {
        console.log(`\n${i + 1}. ${event.source} - ${event.content}`);
        console.log(`   ID: ${event.id}`);
        console.log(`   Source Event ID: ${event.source_event_id}`);
        console.log(`   Processed at: ${event.processed_at || 'Not processed'}`);
        console.log(`   Timestamp: ${event.timestamp}`);
      });
    }

    // Get unprocessed events
    const { data: unprocessed, error: unprocessedError } = await supabase
      .from('raw_events')
      .select()
      .eq('project_id', projectId)
      .is('processed_at', null)
      .order('timestamp', { ascending: true });

    if (unprocessedError) throw unprocessedError;

    console.log(`\n🔄 Unprocessed events: ${unprocessed ? unprocessed.length : 0}`);

  } catch (error) {
    console.error('❌ Error checking raw events:', error);
    process.exit(1);
  }
}

checkRawEvents();
