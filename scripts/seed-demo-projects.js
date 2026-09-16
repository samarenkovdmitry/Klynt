/**
 * Seed demo projects with varied test data
 * Usage: node scripts/seed-demo-projects.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_PROJECTS = [
  {
    name: 'Lunar mobile',
    description: 'iOS & Android app redesign. Figma + Slack.',
    members: [
      { external_user_id: 'designer_anna', external_source: 'figma', name: 'Anna', role: 'designer' },
      { external_user_id: 'pm_john', external_source: 'slack', name: 'John', role: 'pm' },
      { external_user_id: 'client_sara', external_source: 'slack', name: 'Sara', role: 'client' },
    ],
    events: [
      // Week 1: lots of iterations
      { source: 'figma', source_event_id: 'ma_001', event_type: 'comment', author: 'Anna', timestamp: '2026-09-01T10:00:00.000Z', content: 'Home screen wireframe v1 uploaded' },
      { source: 'figma', source_event_id: 'ma_002', event_type: 'comment', author: 'Anna', timestamp: '2026-09-01T11:00:00.000Z', content: 'Changed bottom nav to 5 tabs' },
      { source: 'slack', source_event_id: 'ma_003', event_type: 'message', author: 'John', timestamp: '2026-09-01T14:00:00.000Z', content: 'Home screen looks good, but 5 tabs is too many. Let\'s try 3' },
      { source: 'figma', source_event_id: 'ma_004', event_type: 'comment', author: 'Anna', timestamp: '2026-09-02T10:00:00.000Z', content: 'Updated home screen with 3 tabs' },
      { source: 'slack', source_event_id: 'ma_005', event_type: 'message', author: 'Sara', timestamp: '2026-09-02T16:00:00.000Z', content: '3 tabs is much better. Approved for now' },
      { source: 'figma', source_event_id: 'ma_006', event_type: 'comment', author: 'Anna', timestamp: '2026-09-03T09:00:00.000Z', content: 'Added profile screen' },
      { source: 'figma', source_event_id: 'ma_007', event_type: 'comment', author: 'Anna', timestamp: '2026-09-03T11:00:00.000Z', content: 'Profile screen needs avatar upload' },
      { source: 'slack', source_event_id: 'ma_008', event_type: 'message', author: 'John', timestamp: '2026-09-03T15:00:00.000Z', content: 'Avatar upload is out of scope for MVP' },
      { source: 'figma', source_event_id: 'ma_009', event_type: 'comment', author: 'Anna', timestamp: '2026-09-04T10:00:00.000Z', content: 'Checkout flow v1' },
      { source: 'slack', source_event_id: 'ma_010', event_type: 'message', author: 'Sara', timestamp: '2026-09-04T17:00:00.000Z', content: 'Checkout is missing payment method. Please add' },
      { source: 'figma', source_event_id: 'ma_011', event_type: 'comment', author: 'Anna', timestamp: '2026-09-05T09:00:00.000Z', content: 'Added payment method selection' },
      { source: 'slack', source_event_id: 'ma_012', event_type: 'message', author: 'Sara', timestamp: '2026-09-05T18:00:00.000Z', content: 'Payment flow approved' },
      { source: 'figma', source_event_id: 'ma_013', event_type: 'comment', author: 'Anna', timestamp: '2026-09-06T10:00:00.000Z', content: 'Dark mode variants added' },
      { source: 'slack', source_event_id: 'ma_014', event_type: 'message', author: 'John', timestamp: '2026-09-06T15:00:00.000Z', content: 'Do we really need dark mode now?' },
      { source: 'slack', source_event_id: 'ma_015', event_type: 'message', author: 'Sara', timestamp: '2026-09-07T09:00:00.000Z', content: 'Yes, dark mode is important for launch' },
      { source: 'figma', source_event_id: 'ma_016', event_type: 'comment', author: 'Anna', timestamp: '2026-09-07T11:00:00.000Z', content: 'Finalized dark mode palette' },
      { source: 'figma', source_event_id: 'ma_017', event_type: 'comment', author: 'Anna', timestamp: '2026-09-08T10:00:00.000Z', content: 'Settings screen created' },
      { source: 'slack', source_event_id: 'ma_018', event_type: 'message', author: 'John', timestamp: '2026-09-08T14:00:00.000Z', content: 'Settings should include notifications toggle' },
      { source: 'figma', source_event_id: 'ma_019', event_type: 'comment', author: 'Anna', timestamp: '2026-09-09T09:00:00.000Z', content: 'Added notifications toggle in settings' },
      { source: 'slack', source_event_id: 'ma_020', event_type: 'message', author: 'Sara', timestamp: '2026-09-09T16:00:00.000Z', content: 'App icon: let\'s go with the blue version' },
      { source: 'figma', source_event_id: 'ma_021', event_type: 'comment', author: 'Anna', timestamp: '2026-09-10T10:00:00.000Z', content: 'Blue app icon approved' },
      { source: 'slack', source_event_id: 'ma_022', event_type: 'message', author: 'John', timestamp: '2026-09-10T15:00:00.000Z', content: 'Actually, green app icon tested better' },
      { source: 'figma', source_event_id: 'ma_023', event_type: 'comment', author: 'Anna', timestamp: '2026-09-11T09:00:00.000Z', content: 'Switched to green app icon' },
      { source: 'slack', source_event_id: 'ma_024', event_type: 'message', author: 'Sara', timestamp: '2026-09-11T17:00:00.000Z', content: 'Wait, I liked blue better. Can we revert?' },
      { source: 'figma', source_event_id: 'ma_025', event_type: 'comment', author: 'Anna', timestamp: '2026-09-12T10:00:00.000Z', content: 'Reverted to blue app icon for now' },
    ],
    facts: [
      { subject: 'home screen', subject_type: 'design_component', state: 'approved', confidence: 0.95, importance: 'high' },
      { subject: 'profile screen', subject_type: 'design_component', state: 'modify', confidence: 0.75, importance: 'medium' },
      { subject: 'avatar upload', subject_type: 'design_component', state: 'removed', confidence: 0.85, importance: 'medium' },
      { subject: 'checkout flow', subject_type: 'design_component', state: 'approved', confidence: 0.92, importance: 'high' },
      { subject: 'payment method', subject_type: 'design_component', state: 'added', confidence: 0.88, importance: 'high' },
      { subject: 'dark mode', subject_type: 'design_component', state: 'approved', confidence: 0.80, importance: 'low' },
      { subject: 'settings', subject_type: 'design_component', state: 'modify', confidence: 0.78, importance: 'medium' },
      { subject: 'app icon', subject_type: 'design_component', state: 'modify', confidence: 0.65, importance: 'low' },
    ],
    conflicts: [
      { subject: 'app icon', conflict_type: 'state_change', description: 'App icon switched from blue to green and back multiple times. Final decision unclear.' },
      { subject: 'dark mode', conflict_type: 'scope_question', description: 'John questioned dark mode scope, but Sara insisted it is important for launch.' },
      { subject: 'avatar upload', conflict_type: 'scope_change', description: 'Designer added avatar upload, but PM marked it as out of scope.' },
    ],
  },
  {
    name: 'Acme rebrand',
    description: 'Brand identity system. Logo, colors, typography.',
    members: [
      { external_user_id: 'designer_leo', external_source: 'figma', name: 'Leo', role: 'designer' },
      { external_user_id: 'client_nina', external_source: 'slack', name: 'Nina', role: 'client' },
    ],
    events: [
      { source: 'figma', source_event_id: 'bi_001', event_type: 'comment', author: 'Leo', timestamp: '2026-09-05T10:00:00.000Z', content: 'Primary logo concept' },
      { source: 'slack', source_event_id: 'bi_002', event_type: 'message', author: 'Nina', timestamp: '2026-09-05T15:00:00.000Z', content: 'Logo is too abstract. Can we make it more literal?' },
      { source: 'figma', source_event_id: 'bi_003', event_type: 'comment', author: 'Leo', timestamp: '2026-09-06T10:00:00.000Z', content: 'Updated logo with more literal symbol' },
      { source: 'slack', source_event_id: 'bi_004', event_type: 'message', author: 'Nina', timestamp: '2026-09-06T16:00:00.000Z', content: 'Better, but I still prefer the first one' },
      { source: 'figma', source_event_id: 'bi_005', event_type: 'comment', author: 'Leo', timestamp: '2026-09-07T10:00:00.000Z', content: 'Color palette v1' },
      { source: 'slack', source_event_id: 'bi_006', event_type: 'message', author: 'Nina', timestamp: '2026-09-07T15:00:00.000Z', content: 'Love the navy and gold' },
      { source: 'figma', source_event_id: 'bi_007', event_type: 'comment', author: 'Leo', timestamp: '2026-09-08T10:00:00.000Z', content: 'Typography pairing: Inter + Georgia' },
      { source: 'slack', source_event_id: 'bi_008', event_type: 'message', author: 'Nina', timestamp: '2026-09-08T17:00:00.000Z', content: 'Georgia feels too editorial. Try sans-serif' },
    ],
    facts: [
      { subject: 'logo', subject_type: 'design_component', state: 'modify', confidence: 0.70, importance: 'high' },
      { subject: 'color palette', subject_type: 'design_component', state: 'approved', confidence: 0.95, importance: 'high' },
      { subject: 'typography', subject_type: 'design_component', state: 'modify', confidence: 0.75, importance: 'medium' },
    ],
    conflicts: [
      { subject: 'logo', conflict_type: 'state_change', description: 'Client prefers first logo, but second more literal version was requested.' },
    ],
  },
];

async function createProject(projectData) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name: projectData.name, description: projectData.description })
    .select()
    .single();

  if (error) throw error;
  return project;
}

async function seed() {
  for (const demo of DEMO_PROJECTS) {
    try {
      const project = await createProject(demo);
      console.log(`✅ Created project: ${project.name} (${project.id})`);

      // Create members
      const members = [];
      for (const member of demo.members) {
        const { data, error } = await supabase
          .from('project_members')
          .insert({ ...member, project_id: project.id })
          .select()
          .single();
        if (error) throw error;
        members.push(data);
      }
      console.log(`   Added ${members.length} members`);

      // Create raw events and candidate events
      const facts = [];
      for (const factData of demo.facts) {
        const { data: fact, error } = await supabase
          .from('project_facts')
          .insert({
            project_id: project.id,
            subject: factData.subject,
            subject_type: factData.subject_type,
            fact_type: 'state',
            current_state: factData.state,
            confidence: factData.confidence,
            importance: factData.importance,
            evidence_summary: `Latest decision on ${factData.subject}`,
            last_updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        facts.push(fact);

        // Initial history
        await supabase.from('fact_history').insert({
          fact_id: fact.id,
          project_id: project.id,
          new_state: factData.state,
          decided_at: new Date().toISOString(),
          confidence: factData.confidence,
          reason: `Initial fact: ${factData.subject} is ${factData.state}`,
          evidence: [],
        });
      }

      // Create some raw events and candidate events (sample, not all to save time)
      for (let i = 0; i < Math.min(5, demo.events.length); i++) {
        const event = demo.events[i];
        const { data: raw, error: rawError } = await supabase
          .from('raw_events')
          .insert({
            project_id: project.id,
            source: event.source,
            source_event_id: event.source_event_id,
            event_type: event.event_type,
            author_id: event.author,
            timestamp: event.timestamp,
            content: event.content,
            metadata: '{}',
            processed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (rawError) throw rawError;

        const eventType = event.content.toLowerCase().includes('approved') ? 'approval' :
                          event.content.toLowerCase().includes('?') ? 'question' :
                          event.content.toLowerCase().includes('updated') || event.content.toLowerCase().includes('added') ? 'change' : 'discussion';
        const action = event.content.toLowerCase().includes('removed') ? 'removed' :
                       event.content.toLowerCase().includes('modify') || event.content.toLowerCase().includes('updated') ? 'modify' :
                       event.content.toLowerCase().includes('approved') ? 'approved' :
                       'discussed';

        await supabase.from('candidate_events').insert({
          raw_event_id: raw.id,
          project_id: project.id,
          event_type: eventType,
          subject: 'general',
          action,
          confidence: 0.8,
          importance: 'medium',
          reason: event.content,
          related_entities: [],
          potential_impacts: [],
          status: 'confirmed',
        });
      }

      // Create conflicts
      for (const conflict of demo.conflicts) {
        const matchingFact = facts.find(f => f.subject === conflict.subject);
        await supabase.from('conflicts').insert({
          project_id: project.id,
          subject: conflict.subject,
          conflict_type: conflict.conflict_type,
          description: conflict.description,
          previous_fact_id: matchingFact?.id || null,
          status: 'unresolved',
        });
      }
      console.log(`   Added ${demo.facts.length} facts, ${demo.conflicts.length} conflicts, and sample events`);

    } catch (error) {
      console.error(`❌ Error seeding ${demo.name}:`, error);
    }
  }

  console.log('\n🚀 Demo projects seeded');
  console.log('Refresh /project to see the new projects in the switcher');
}

seed().catch(console.error);
