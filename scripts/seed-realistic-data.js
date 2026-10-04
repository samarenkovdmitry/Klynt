require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const now = new Date();
const dayAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

const PROJECTS = [
  {
    name: 'Lunar mobile',
    description: 'iOS & Android app redesign. Figma + Slack.',
    fileKey: 'mock_lunar_file',
    members: [
      { external_user_id: 'anna', external_source: 'figma', name: 'Anna', role: 'designer', avatar_url: '' },
      { external_user_id: 'john', external_source: 'slack', name: 'John', role: 'pm' },
      { external_user_id: 'sara', external_source: 'slack', name: 'Sara', role: 'client' },
    ],
    events: [
      { source: 'figma', author: 'Anna', daysAgo: 12, hour: 10, content: 'Home screen wireframe v1 uploaded. Exploring 5-tab bottom nav.', metadata: { comment_id: 'lunar_c1' } },
      { source: 'slack', author: 'John', daysAgo: 12, hour: 14, content: '5 tabs feels like too many for a mobile app. Can we try 3 tabs instead?', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s1' } },
      { source: 'figma', author: 'Anna', daysAgo: 11, hour: 10, content: 'Updated home screen with 3-tab navigation. Cleaner layout.', metadata: { comment_id: 'lunar_c2' } },
      { source: 'slack', author: 'Sara', daysAgo: 11, hour: 16, content: '3 tabs is much better. Approved for now.', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s2' } },
      { source: 'figma', author: 'Anna', daysAgo: 10, hour: 10, content: 'Added profile screen with avatar upload placeholder.', metadata: { comment_id: 'lunar_c3' } },
      { source: 'slack', author: 'John', daysAgo: 10, hour: 15, content: 'Avatar upload is out of scope for MVP. We can add it later.', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s3' } },
      { source: 'figma', author: 'Anna', daysAgo: 9, hour: 10, content: 'Checkout flow v1. Need feedback on payment placement.', metadata: { comment_id: 'lunar_c4' } },
      { source: 'slack', author: 'Sara', daysAgo: 9, hour: 17, content: 'Checkout is missing a payment method. Please add before review.', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s4' } },
      { source: 'figma', author: 'Anna', daysAgo: 8, hour: 10, content: 'Added payment method selection screen.', metadata: { comment_id: 'lunar_c5' } },
      { source: 'slack', author: 'Sara', daysAgo: 8, hour: 18, content: 'Payment flow looks good. Approved.', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s5' } },
      { source: 'figma', author: 'Anna', daysAgo: 7, hour: 10, content: 'Dark mode variants added for main screens.', metadata: { comment_id: 'lunar_c6' } },
      { source: 'slack', author: 'John', daysAgo: 7, hour: 15, content: 'Do we really need dark mode now? It adds a lot of work.', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s6' } },
      { source: 'slack', author: 'Sara', daysAgo: 6, hour: 9, content: 'Yes, dark mode is important for launch. Keep it.', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s7' } },
      { source: 'figma', author: 'Anna', daysAgo: 6, hour: 11, content: 'Finalized dark mode color palette.', metadata: { comment_id: 'lunar_c7' } },
      { source: 'figma', author: 'Anna', daysAgo: 5, hour: 10, content: 'Settings screen created with notifications toggle.', metadata: { comment_id: 'lunar_c8' } },
      { source: 'slack', author: 'John', daysAgo: 5, hour: 14, content: 'Settings should include a notifications toggle. Good that you added it.', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s8' } },
      { source: 'slack', author: 'Sara', daysAgo: 4, hour: 10, content: 'App icon: let\'s go with the blue version. It feels more premium.', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s9' } },
      { source: 'figma', author: 'Anna', daysAgo: 4, hour: 11, content: 'Blue app icon approved and applied.', metadata: { comment_id: 'lunar_c9' } },
      { source: 'slack', author: 'John', daysAgo: 3, hour: 14, content: 'Actually, the green app icon tested better in user research.', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s10' } },
      { source: 'figma', author: 'Anna', daysAgo: 2, hour: 10, content: 'Switched to green app icon based on John\'s research.', metadata: { comment_id: 'lunar_c10' } },
      { source: 'slack', author: 'Sara', daysAgo: 1, hour: 9, content: 'Wait, I liked blue better. Can we revert before the review?', metadata: { channel: 'lunar-mobile', message_id: 'lunar_s11' } },
      { source: 'figma', author: 'Anna', daysAgo: 1, hour: 11, content: 'Reverted to blue app icon for now. Need final decision.', metadata: { comment_id: 'lunar_c11' } },
    ],
    facts: [
      { subject: 'home screen', state: 'approved', confidence: 0.95 },
      { subject: 'profile screen', state: 'modify', confidence: 0.75 },
      { subject: 'avatar upload', state: 'removed', confidence: 0.85 },
      { subject: 'checkout flow', state: 'approved', confidence: 0.92 },
      { subject: 'payment method', state: 'added', confidence: 0.88 },
      { subject: 'dark mode', state: 'approved', confidence: 0.80 },
      { subject: 'settings', state: 'modify', confidence: 0.78 },
      { subject: 'app icon', state: 'modify', confidence: 0.55 },
    ],
    conflicts: [
      { subject: 'app icon', conflict_type: 'state_change', description: 'App icon switched from blue to green and back. Final decision pending.' },
      { subject: 'dark mode', conflict_type: 'scope_question', description: 'John questioned dark mode scope, but Sara insisted it is important for launch.' },
      { subject: 'avatar upload', conflict_type: 'scope_change', description: 'Designer added avatar upload, but PM marked it as out of scope.' },
    ],
  },
  {
    name: 'Acme rebrand',
    description: 'Brand identity system. Logo, colors, typography.',
    fileKey: 'mock_acme_file',
    members: [
      { external_user_id: 'leo', external_source: 'figma', name: 'Leo', role: 'designer' },
      { external_user_id: 'nina', external_source: 'slack', name: 'Nina', role: 'client' },
    ],
    events: [
      { source: 'figma', author: 'Leo', daysAgo: 10, hour: 10, content: 'Primary logo concept uploaded. Abstract geometric mark.', metadata: { comment_id: 'acme_c1' } },
      { source: 'slack', author: 'Nina', daysAgo: 10, hour: 15, content: 'Logo is too abstract. Can we make it more literal?', metadata: { channel: 'acme-rebrand', message_id: 'acme_s1' } },
      { source: 'figma', author: 'Leo', daysAgo: 9, hour: 10, content: 'Updated logo with more literal symbol. More recognizable.', metadata: { comment_id: 'acme_c2' } },
      { source: 'slack', author: 'Nina', daysAgo: 9, hour: 16, content: 'Better, but I still prefer the first abstract version.', metadata: { channel: 'acme-rebrand', message_id: 'acme_s2' } },
      { source: 'figma', author: 'Leo', daysAgo: 8, hour: 10, content: 'Color palette v1: navy, gold, off-white.', metadata: { comment_id: 'acme_c3' } },
      { source: 'slack', author: 'Nina', daysAgo: 8, hour: 17, content: 'Love the navy and gold. Approved.', metadata: { channel: 'acme-rebrand', message_id: 'acme_s3' } },
      { source: 'figma', author: 'Leo', daysAgo: 7, hour: 10, content: 'Typography pairing: Inter + Georgia. Editorial feel.', metadata: { comment_id: 'acme_c4' } },
      { source: 'slack', author: 'Nina', daysAgo: 7, hour: 17, content: 'Georgia feels too editorial. Try a clean sans-serif for headers.', metadata: { channel: 'acme-rebrand', message_id: 'acme_s4' } },
      { source: 'figma', author: 'Leo', daysAgo: 6, hour: 10, content: 'Switched to Inter for both headers and body.', metadata: { comment_id: 'acme_c5' } },
      { source: 'slack', author: 'Nina', daysAgo: 6, hour: 14, content: 'Much better. Typography is now approved.', metadata: { channel: 'acme-rebrand', message_id: 'acme_s5' } },
    ],
    facts: [
      { subject: 'logo', state: 'modify', confidence: 0.60 },
      { subject: 'color palette', state: 'approved', confidence: 0.95 },
      { subject: 'typography', state: 'approved', confidence: 0.85 },
    ],
    conflicts: [
      { subject: 'logo', conflict_type: 'state_change', description: 'Client prefers first abstract logo, but second more literal version was requested.' },
    ],
  },
  {
    name: 'Tesla website',
    description: 'Marketing website redesign. Hero, pricing, checkout.',
    fileKey: 'mock_tesla_file',
    members: [
      { external_user_id: 'max', external_source: 'figma', name: 'Max', role: 'designer' },
      { external_user_id: 'sophie', external_source: 'slack', name: 'Sophie', role: 'client' },
      { external_user_id: 'paul', external_source: 'slack', name: 'Paul', role: 'pm' },
    ],
    events: [
      { source: 'figma', author: 'Max', daysAgo: 11, hour: 10, content: 'Hero section v1 with full-bleed image.', metadata: { comment_id: 'tesla_c1' } },
      { source: 'slack', author: 'Sophie', daysAgo: 11, hour: 15, content: 'Hero looks great. Approved to move forward.', metadata: { channel: 'tesla-website', message_id: 'tesla_s1' } },
      { source: 'figma', author: 'Max', daysAgo: 10, hour: 10, content: 'Pricing section with 3 tiers added.', metadata: { comment_id: 'tesla_c2' } },
      { source: 'slack', author: 'Paul', daysAgo: 10, hour: 15, content: 'Pricing section should be removed. We handle pricing through sales.', metadata: { channel: 'tesla-website', message_id: 'tesla_s2' } },
      { source: 'slack', author: 'Sophie', daysAgo: 9, hour: 10, content: 'I disagree. Pricing needs to be transparent. Keep it.', metadata: { channel: 'tesla-website', message_id: 'tesla_s3' } },
      { source: 'figma', author: 'Max', daysAgo: 8, hour: 10, content: 'Checkout flow v1. Simple 2-step form.', metadata: { comment_id: 'tesla_c3' } },
      { source: 'slack', author: 'Sophie', daysAgo: 8, hour: 16, content: 'Checkout flow approved. Make it mobile-friendly.', metadata: { channel: 'tesla-website', message_id: 'tesla_s4' } },
      { source: 'figma', author: 'Max', daysAgo: 7, hour: 10, content: 'Dark mode hero and pricing variants.', metadata: { comment_id: 'tesla_c4' } },
      { source: 'slack', author: 'Paul', daysAgo: 7, hour: 14, content: 'Do we need dark mode for a marketing site?', metadata: { channel: 'tesla-website', message_id: 'tesla_s5' } },
      { source: 'slack', author: 'Sophie', daysAgo: 6, hour: 9, content: 'Yes, dark mode is part of the brand direction.', metadata: { channel: 'tesla-website', message_id: 'tesla_s6' } },
      { source: 'figma', author: 'Max', daysAgo: 6, hour: 11, content: 'Newsletter form added to footer.', metadata: { comment_id: 'tesla_c5' } },
      { source: 'slack', author: 'Paul', daysAgo: 5, hour: 10, content: 'Newsletter form approved.', metadata: { channel: 'tesla-website', message_id: 'tesla_s7' } },
      { source: 'figma', author: 'Max', daysAgo: 4, hour: 10, content: 'Footer with links and legal.', metadata: { comment_id: 'tesla_c6' } },
      { source: 'slack', author: 'Sophie', daysAgo: 3, hour: 16, content: 'Footer looks good, but legal links need review.', metadata: { channel: 'tesla-website', message_id: 'tesla_s8' } },
    ],
    facts: [
      { subject: 'hero section', state: 'approved', confidence: 0.95 },
      { subject: 'pricing section', state: 'modify', confidence: 0.55 },
      { subject: 'checkout flow', state: 'approved', confidence: 0.90 },
      { subject: 'dark mode', state: 'approved', confidence: 0.80 },
      { subject: 'newsletter form', state: 'approved', confidence: 0.85 },
      { subject: 'footer', state: 'modify', confidence: 0.70 },
    ],
    conflicts: [
      { subject: 'pricing section', conflict_type: 'scope_change', description: 'PM wants to remove pricing, but client insists it should stay transparent.' },
      { subject: 'dark mode', conflict_type: 'scope_question', description: 'PM questions dark mode need, but client says it is brand direction.' },
    ],
  },
];

function inferEventTypeAndAction(content) {
  const lower = content.toLowerCase();

  const subjectMap = [
    { keys: ['home screen', 'home', 'bottom nav', 'tab'], subject: 'home screen' },
    { keys: ['profile', 'avatar'], subject: 'profile screen' },
    { keys: ['payment method', 'payment method selection'], subject: 'payment method' },
    { keys: ['checkout'], subject: 'checkout flow' },
    { keys: ['dark mode'], subject: 'dark mode' },
    { keys: ['settings'], subject: 'settings' },
    { keys: ['app icon', 'icon'], subject: 'app icon' },
    { keys: ['logo'], subject: 'logo' },
    { keys: ['color palette', 'navy', 'gold'], subject: 'color palette' },
    { keys: ['typography', 'serif', 'sans-serif', 'inter', 'georgia'], subject: 'typography' },
    { keys: ['hero'], subject: 'hero section' },
    { keys: ['pricing'], subject: 'pricing section' },
    { keys: ['newsletter'], subject: 'newsletter form' },
    { keys: ['footer'], subject: 'footer' },
  ];

  let subject = 'general';
  for (const m of subjectMap) {
    if (m.keys.some(k => lower.includes(k))) {
      subject = m.subject;
      break;
    }
  }

  let action = 'discussed';
  if (lower.includes('approved') || lower.includes('agreed')) action = 'approved';
  else if (lower.includes('removed') || lower.includes('remove')) action = 'removed';
  else if (lower.includes('added') || lower.includes('add')) action = 'added';
  else if (lower.includes('updated') || lower.includes('changed') || lower.includes('modified') || lower.includes('modify') || lower.includes('switched') || lower.includes('reverted')) action = 'modified';
  else if (lower.includes('?') || lower.includes('can we') || lower.includes('are you sure') || lower.includes('do we need')) action = 'questioned';
  else if (lower.includes('need') || lower.includes('should') || lower.includes('try') || lower.includes('please')) action = 'requested';

  let eventType = 'discussion';
  if (action === 'approved') eventType = 'approval';
  else if (['removed', 'added', 'modified'].includes(action)) eventType = 'change';
  else if (action === 'questioned') eventType = 'question';
  else if (action === 'requested') eventType = 'request';

  return { subject, action, eventType };
}

async function seed() {
  for (const demo of PROJECTS) {
    console.log(`\n🌱 ${demo.name}`);

    let { data: project } = await supabase.from('projects').select('id').eq('name', demo.name).single();

    if (!project) {
      const { data, error } = await supabase.from('projects').insert({ name: demo.name, description: demo.description }).select().single();
      if (error) throw error;
      project = data;
      console.log(`   Created project ${project.id}`);
    } else {
      console.log(`   Found project ${project.id}`);
    }

    // Delete existing data in dependency order
    const tables = ['fact_history', 'fact_evidence', 'conflicts', 'project_facts', 'candidate_events', 'raw_events', 'project_members'];
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('project_id', project.id);
      if (error) console.error(`delete ${table} error:`, error.message);
    }

    // Members
    const members = [];
    for (const m of demo.members) {
      const { data, error } = await supabase.from('project_members').insert({ ...m, project_id: project.id }).select().single();
      if (error) throw error;
      members.push(data);
    }

    // Facts
    const facts = [];
    for (const f of demo.facts) {
      const { data, error } = await supabase.from('project_facts').insert({
        project_id: project.id,
        subject: f.subject,
        subject_type: 'design_component',
        fact_type: 'state',
        current_state: f.state,
        confidence: f.confidence,
        importance: f.confidence > 0.8 ? 'high' : 'medium',
        evidence_summary: `Current state for ${f.subject}`,
        last_updated_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      facts.push(data);

      await supabase.from('fact_history').insert({
        fact_id: data.id,
        project_id: project.id,
        new_state: f.state,
        decided_at: new Date().toISOString(),
        confidence: f.confidence,
        reason: `Initial state: ${f.subject} is ${f.state}`,
        evidence: [],
      });
    }

    // Conflicts
    for (const c of demo.conflicts) {
      const matchingFact = facts.find(f => f.subject === c.subject);
      await supabase.from('conflicts').insert({
        project_id: project.id,
        subject: c.subject,
        conflict_type: c.conflict_type,
        description: c.description,
        previous_fact_id: matchingFact?.id || null,
        status: 'unresolved',
      });
    }

    // Raw events and candidate events
    for (let i = 0; i < demo.events.length; i++) {
      const e = demo.events[i];
      const timestamp = dayAgo(e.daysAgo);
      timestamp.setHours(e.hour, 0, 0, 0);

      const metadata = {
        file_name: demo.name,
        file_key: demo.fileKey,
        ...(e.source === 'figma' ? { comment_id: e.metadata?.comment_id || `${i + 1}` } : {}),
        ...(e.source === 'slack' ? {
          channel: e.metadata?.channel || 'general',
          message_id: e.metadata?.message_id || `${i + 1}`,
          team_id: 'T' + demo.name.replace(/\s/g, '').toLowerCase(),
        } : {}),
      };

      const { data: raw, error: rawError } = await supabase.from('raw_events').insert({
        project_id: project.id,
        source: e.source,
        source_event_id: `${demo.fileKey}_${i}`,
        event_type: e.source === 'figma' ? 'comment' : 'message',
        author_id: e.author,
        timestamp: timestamp.toISOString(),
        content: e.content,
        metadata: JSON.stringify(metadata),
        processed_at: new Date().toISOString(),
      }).select().single();
      if (rawError) throw rawError;

      const { subject, action, eventType } = inferEventTypeAndAction(e.content);
      const confidence = e.content.toLowerCase().includes('approved') ? 0.95 : 0.8;

      await supabase.from('candidate_events').insert({
        raw_event_id: raw.id,
        project_id: project.id,
        event_type: eventType,
        subject,
        action,
        confidence,
        importance: 'medium',
        reason: e.content,
        related_entities: [subject],
        potential_impacts: [],
        status: 'confirmed',
      });
    }

    console.log(`   ✅ ${members.length} members, ${demo.facts.length} facts, ${demo.conflicts.length} conflicts, ${demo.events.length} events`);
  }

  console.log('\n🚀 Done');
}

seed().catch(console.error);
