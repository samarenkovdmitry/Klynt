require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function inferSubjectAndAction(content) {
  const lower = content.toLowerCase();

  const subjectMap = [
    { keys: ['home screen', 'home', '3 tabs', '5 tabs', 'bottom nav', 'tab'], subject: 'home screen' },
    { keys: ['payment method', 'payment', 'checkout', 'pricing'], subject: 'payment method' },
    { keys: ['checkout'], subject: 'checkout flow' },
    { keys: ['dark mode'], subject: 'dark mode' },
    { keys: ['settings'], subject: 'settings' },
    { keys: ['app icon', 'icon'], subject: 'app icon' },
    { keys: ['profile', 'avatar'], subject: 'profile screen' },
    { keys: ['logo'], subject: 'logo' },
    { keys: ['color', 'palette'], subject: 'color palette' },
    { keys: ['typography', 'serif', 'sans-serif', 'font'], subject: 'typography' },
    { keys: ['pricing section'], subject: 'pricing section' },
  ];

  let subject = 'general';
  for (const m of subjectMap) {
    if (m.keys.some(k => lower.includes(k))) {
      subject = m.subject;
      break;
    }
  }

  let action = 'discussed';
  if (lower.includes('approved') || lower.includes('agreed') || lower.includes('confirmed')) action = 'approved';
  else if (lower.includes('removed') || lower.includes('remove') || lower.includes('delete')) action = 'removed';
  else if (lower.includes('added') || lower.includes('add')) action = 'added';
  else if (lower.includes('updated') || lower.includes('changed') || lower.includes('modified') || lower.includes('modify') || lower.includes('switched') || lower.includes('reverted')) action = 'modified';
  else if (lower.includes('?') || lower.includes('can we') || lower.includes('are you sure')) action = 'questioned';
  else if (lower.includes('need') || lower.includes('should') || lower.includes('try')) action = 'requested';

  return { subject, action };
}

async function fix() {
  const { data: projects, error: perr } = await supabase.from('projects').select('id, name');
  if (perr) throw perr;

  for (const project of projects) {
    console.log(`\nn🔧 ${project.name}`);

    const { data: rawEvents, error: rerr } = await supabase
      .from('raw_events')
      .select('id, source, content, metadata')
      .eq('project_id', project.id)
      .order('timestamp', { ascending: false });
    if (rerr) throw rerr;

    for (const raw of rawEvents || []) {
      const { data: candidate, error: cerr } = await supabase
        .from('candidate_events')
        .select('id, reason, event_type, action')
        .eq('raw_event_id', raw.id)
        .single();
      if (cerr) continue;

      const content = candidate.reason || raw.content;
      const { subject, action } = inferSubjectAndAction(content);

      let eventType = 'discussion';
      if (action === 'approved') eventType = 'approval';
      else if (action === 'removed' || action === 'added' || action === 'modified') eventType = 'change';
      else if (action === 'questioned') eventType = 'question';
      else if (action === 'requested') eventType = 'request';

      const { error: uerr } = await supabase
        .from('candidate_events')
        .update({ subject, action, event_type: eventType })
        .eq('id', candidate.id);
      if (uerr) console.error('update candidate err', uerr);

      // Update Slack metadata with message/channel IDs for demo
      if (raw.source === 'slack' && typeof raw.metadata === 'string' && raw.metadata.includes('mock')) {
        const meta = JSON.parse(raw.metadata || '{}');
        if (!meta.message_id) {
          const newMeta = JSON.stringify({
            ...meta,
            message_id: `demo_${raw.id.slice(0, 8)}`,
            channel_id: 'C12345',
            team_id: 'T12345',
            workspace: 'klynt-demo',
          });
          const { error: merr } = await supabase.from('raw_events').update({ metadata: newMeta }).eq('id', raw.id);
          if (merr) console.error('update raw err', merr);
        }
      }
    }
  }
  console.log('\n✅ Done');
}

fix().catch(console.error);
