/**
 * Script to seed mock Figma and Slack events for testing Klynt pipeline
 * Usage: node scripts/seed-mock-events.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.DEFAULT_PROJECT_ID;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

if (!projectId) {
  console.error('❌ Missing DEFAULT_PROJECT_ID environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const mockEvents = [
  {
    source: 'figma',
    source_event_id: 'figma_comment_001',
    event_type: 'comment',
    author_id: 'designer_anna',
    timestamp: '2026-09-03T10:00:00Z',
    content: 'I\'ve updated the pricing section based on client feedback',
    metadata: {
      file_name: 'Homepage',
      comment_id: '123',
      file_key: 'mock_file_key',
    },
  },
  {
    source: 'slack',
    source_event_id: 'slack_msg_001',
    event_type: 'message',
    author_id: 'client_mike',
    timestamp: '2026-09-03T14:30:00Z',
    content: 'The pricing section looks great, let\'s move forward with this',
    metadata: {
      channel: 'project-test',
      user: 'client_mike',
      team_id: 'mock_team',
    },
  },
  {
    source: 'slack',
    source_event_id: 'slack_msg_002',
    event_type: 'message',
    author_id: 'client_mike',
    timestamp: '2026-09-06T11:00:00Z',
    content: 'Actually, let\'s remove the pricing section entirely. We decided to go with a different model',
    metadata: {
      channel: 'project-test',
      user: 'client_mike',
      team_id: 'mock_team',
    },
  },
  {
    source: 'figma',
    source_event_id: 'figma_comment_002',
    event_type: 'comment',
    author_id: 'designer_anna',
    timestamp: '2026-09-06T15:00:00Z',
    content: 'Are you sure about removing pricing? That was a key section in the original brief',
    metadata: {
      file_name: 'Homepage',
      comment_id: '124',
      file_key: 'mock_file_key',
    },
  },
  {
    source: 'slack',
    source_event_id: 'slack_msg_003',
    event_type: 'message',
    author_id: 'client_mike',
    timestamp: '2026-09-06T16:00:00Z',
    content: 'Yes, confirmed. Remove pricing. We\'ll handle pricing discussions separately',
    metadata: {
      channel: 'project-test',
      user: 'client_mike',
      team_id: 'mock_team',
    },
  },
];

async function seedMockEvents() {
  try {
    console.log('🌱 Seeding mock events...');
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Events: ${mockEvents.length}`);

    for (const event of mockEvents) {
      const { data, error } = await supabase
        .from('raw_events')
        .insert({
          ...event,
          project_id: projectId,
          metadata: JSON.stringify(event.metadata),
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          console.log(`   ⚠️  Skipped duplicate: ${event.source_event_id}`);
        } else {
          throw error;
        }
      } else {
        console.log(`   ✅ Created: ${event.source} - ${event.content.substring(0, 50)}...`);
      }
    }

    console.log('\n🚀 Mock events seeded successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Process events via API: curl -X POST http://localhost:3000/api/jobs/process-events -H "Content-Type: application/json" -d \'{"projectId":"' + projectId + '"}\'');
    console.log('   3. Check project facts and conflicts in Supabase');

  } catch (error) {
    console.error('❌ Error seeding mock events:', error);
    process.exit(1);
  }
}

seedMockEvents();
