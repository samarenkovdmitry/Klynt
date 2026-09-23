import { supabase } from '@/lib/db/supabase';

// A realistic demo project: 12 days of a mobile app redesign with a
// client, a PM and a designer. Events arrive already interpreted
// (candidate_events) and drive project_facts + fact_history + conflicts,
// so the dashboard shows the full "truth layer" without any AI calls.

const now = Date.now();
const daysAgo = (d: number, hour = 10) =>
  new Date(now - d * 86400 * 1000 + hour * 3600 * 1000).toISOString();

interface DemoEvent {
  daysAgo: number;
  hour: number;
  source: 'figma' | 'slack' | 'linear';
  author: 'Anna' | 'John' | 'Sara';
  content: string;
  subject: string;
  event_type: string;
  action: string;
  reason: string;
  importance: 'low' | 'medium' | 'high';
  confidence: number;
  figma?: boolean;
}

const AUTHORS = {
  Anna: { source: 'figma', role: 'designer' },
  John: { source: 'slack', role: 'pm' },
  Sara: { source: 'slack', role: 'client' },
} as const;

const EVENTS: DemoEvent[] = [
  { daysAgo: 12, hour: 10, source: 'figma', author: 'Anna', subject: 'home screen', event_type: 'change', action: 'add', confidence: 0.9, importance: 'high', figma: true,
    content: 'Home screen wireframe v1 uploaded. Exploring a 5-tab bottom navigation.',
    reason: 'Home screen wireframe v1 added' },
  { daysAgo: 12, hour: 14, source: 'slack', author: 'John', subject: 'bottom navigation', event_type: 'request', action: 'modify', confidence: 0.85, importance: 'medium',
    content: 'Home looks good, but 5 tabs feels like too many for mobile. Can we try 3?',
    reason: '3-tab navigation requested instead of 5' },
  { daysAgo: 11, hour: 10, source: 'figma', author: 'Anna', subject: 'bottom navigation', event_type: 'change', action: 'modify', confidence: 0.9, importance: 'medium', figma: true,
    content: 'Updated home screen with 3-tab navigation. Cleaner layout.',
    reason: 'Bottom navigation changed to 3 tabs' },
  { daysAgo: 11, hour: 16, source: 'slack', author: 'Sara', subject: 'bottom navigation', event_type: 'approval', action: 'approve', confidence: 0.95, importance: 'high',
    content: '3 tabs is much better. Approved for now.',
    reason: '3-tab navigation approved by client' },
  { daysAgo: 10, hour: 10, source: 'figma', author: 'Anna', subject: 'avatar upload', event_type: 'change', action: 'add', confidence: 0.8, importance: 'medium', figma: true,
    content: 'Added profile screen with avatar upload placeholder.',
    reason: 'Avatar upload added to profile screen' },
  { daysAgo: 10, hour: 15, source: 'slack', author: 'John', subject: 'avatar upload', event_type: 'scope_change', action: 'remove', confidence: 0.9, importance: 'high',
    content: 'Avatar upload is out of scope for MVP. We can add it later.',
    reason: 'Avatar upload marked out of scope for MVP' },
  { daysAgo: 9, hour: 10, source: 'figma', author: 'Anna', subject: 'checkout flow', event_type: 'change', action: 'add', confidence: 0.9, importance: 'high', figma: true,
    content: 'Checkout flow v1. Need feedback on payment placement.',
    reason: 'Checkout flow v1 added' },
  { daysAgo: 9, hour: 17, source: 'slack', author: 'Sara', subject: 'payment method', event_type: 'request', action: 'add', confidence: 0.9, importance: 'high',
    content: 'Checkout is missing a payment method step. Please add before review.',
    reason: 'Payment method step requested in checkout' },
  { daysAgo: 8, hour: 10, source: 'figma', author: 'Anna', subject: 'payment method', event_type: 'change', action: 'add', confidence: 0.9, importance: 'high', figma: true,
    content: 'Added payment method selection screen.',
    reason: 'Payment method screen added' },
  { daysAgo: 8, hour: 18, source: 'slack', author: 'Sara', subject: 'checkout flow', event_type: 'approval', action: 'approve', confidence: 0.95, importance: 'high',
    content: 'Payment flow looks good. Approved.',
    reason: 'Checkout flow approved by client' },
  { daysAgo: 7, hour: 10, source: 'figma', author: 'Anna', subject: 'dark mode', event_type: 'change', action: 'add', confidence: 0.85, importance: 'medium', figma: true,
    content: 'Dark mode variants added for main screens.',
    reason: 'Dark mode variants added' },
  { daysAgo: 7, hour: 15, source: 'slack', author: 'John', subject: 'dark mode', event_type: 'question', action: 'undecided', confidence: 0.8, importance: 'medium',
    content: 'Do we really need dark mode now? It adds a lot of work.',
    reason: 'Dark mode scope questioned' },
  { daysAgo: 6, hour: 9, source: 'slack', author: 'Sara', subject: 'dark mode', event_type: 'decision', action: 'approve', confidence: 0.9, importance: 'medium',
    content: 'Yes, dark mode is important for launch. Keep it.',
    reason: 'Dark mode kept for launch per client' },
  { daysAgo: 5, hour: 10, source: 'figma', author: 'Anna', subject: 'settings screen', event_type: 'change', action: 'add', confidence: 0.9, importance: 'medium', figma: true,
    content: 'Settings screen created with notifications toggle.',
    reason: 'Settings screen added' },
  { daysAgo: 4, hour: 10, source: 'slack', author: 'Sara', subject: 'app icon', event_type: 'decision', action: 'approve', confidence: 0.9, importance: 'medium',
    content: "App icon: let's go with the blue version. It feels more premium.",
    reason: 'Blue app icon approved by client' },
  { daysAgo: 3, hour: 14, source: 'slack', author: 'John', subject: 'app icon', event_type: 'decision', action: 'modify', confidence: 0.85, importance: 'high',
    content: 'Actually, the green app icon tested better in user research.',
    reason: 'Green app icon proposed after user research' },
  { daysAgo: 2, hour: 10, source: 'figma', author: 'Anna', subject: 'app icon', event_type: 'change', action: 'modify', confidence: 0.9, importance: 'medium', figma: true,
    content: "Switched to green app icon based on John's research.",
    reason: 'App icon switched to green' },
  { daysAgo: 1, hour: 9, source: 'slack', author: 'Sara', subject: 'app icon', event_type: 'request', action: 'modify', confidence: 0.85, importance: 'high',
    content: 'Wait, I liked blue better. Can we revert before the review?',
    reason: 'Client asked to revert to blue icon' },
  { daysAgo: 1, hour: 11, source: 'figma', author: 'Anna', subject: 'app icon', event_type: 'change', action: 'modify', confidence: 0.85, importance: 'high', figma: true,
    content: 'Reverted to blue app icon for now. Need final decision.',
    reason: 'Reverted to blue, final decision pending' },
];

// Final fact states: subject -> { state, display, confidence, importance }
const FACTS: Record<string, { state: string; display: string; confidence: number; importance: string }> = {
  'home screen':        { state: 'approved', display: 'Approved',          confidence: 0.95, importance: 'high' },
  'bottom navigation':  { state: 'approved', display: 'Approved',          confidence: 0.95, importance: 'high' },
  'avatar upload':      { state: 'removed',  display: 'Out of scope',      confidence: 0.85, importance: 'medium' },
  'checkout flow':      { state: 'approved', display: 'Approved',          confidence: 0.92, importance: 'high' },
  'payment method':     { state: 'added',    display: 'Added',             confidence: 0.88, importance: 'high' },
  'dark mode':          { state: 'approved', display: 'Approved',          confidence: 0.80, importance: 'low' },
  'settings screen':    { state: 'modify',   display: 'In progress',       confidence: 0.78, importance: 'medium' },
  'app icon':           { state: 'modify',   display: 'Decision pending',  confidence: 0.55, importance: 'high' },
};

const CONFLICTS = [
  {
    subject: 'app icon',
    conflict_type: 'state_change',
    description: 'App icon flipped blue → green → blue in 3 days. Client and PM disagree; final decision still pending.',
  },
  {
    subject: 'avatar upload',
    conflict_type: 'scope_change',
    description: 'Designer added avatar upload to the profile screen, but the PM marked it out of scope for MVP.',
  },
];

export async function createDemoProject(ownerId: string) {
  const base = {
    name: 'Sample · Lunar mobile',
    description: 'Sample project — a mobile app redesign tracked from Figma and Slack.',
    owner_id: ownerId,
    slug: `sample-lunar-mobile-${Date.now().toString(36)}`,
  };

  let { data: project, error } = await supabase
    .from('projects')
    .insert({ ...base, is_demo: true })
    .select()
    .single();

  // is_demo column not yet migrated — insert without it
  if (error && error.message?.includes('is_demo')) {
    ({ data: project, error } = await supabase.from('projects').insert(base).select().single());
  }
  if (error) throw error;
  return seedProjectData(project!);
}

async function seedProjectData(project: { id: string }) {
  const projectId = project.id;

  // People directory (external authors)
  for (const [name, meta] of Object.entries(AUTHORS)) {
    await supabase.from('project_members').insert({
      project_id: projectId,
      external_user_id: `demo_${name.toLowerCase()}`,
      external_source: meta.source,
      name,
      role: meta.role,
    });
  }

  // Facts + per-event raw/candidate rows + history
  const factIds: Record<string, string> = {};
  const eventRows: { candidateId: string; rawId: string; e: DemoEvent }[] = [];

  // last_updated_at = timestamp of the most recent event on that subject
  const lastEventAt = (subject: string) => {
    const e = [...EVENTS].reverse().find(ev => ev.subject === subject);
    return e ? daysAgo(e.daysAgo, e.hour) : daysAgo(0, 9);
  };

  for (const [subject, f] of Object.entries(FACTS)) {
    const { data: fact } = await supabase
      .from('project_facts')
      .insert({
        project_id: projectId,
        subject,
        subject_type: 'design_component',
        fact_type: 'state',
        current_state: f.state,
        current_value: { display_state: f.display },
        confidence: f.confidence,
        importance: f.importance,
        evidence_summary: `Latest: ${f.display.toLowerCase()}`,
        last_updated_at: lastEventAt(subject),
      })
      .select('id')
      .single();
    if (fact) factIds[subject] = fact.id;
  }

  for (const [i, e] of EVENTS.entries()) {
    const ts = daysAgo(e.daysAgo, e.hour);
    const metadata = {
      author: { name: e.author },
      ...(e.source === 'slack'
        ? { channel: 'lunar-mobile', channel_id: 'C0DEMO', team_id: 'T0DEMO', message_id: `demo_${i}` }
        : {}),
      ...(e.source === 'figma'
        ? { file_key: 'demoLunarFile', file_name: 'Lunar mobile', comment_id: `demo_c${i}` }
        : {}),
    };

    const { data: raw } = await supabase
      .from('raw_events')
      .insert({
        project_id: projectId,
        source: e.source,
        source_event_id: `demo_${i}`,
        event_type: e.source === 'slack' ? 'message' : 'comment',
        author_id: e.author,
        timestamp: ts,
        content: e.content,
        metadata,
        processed_at: ts,
      })
      .select('id')
      .single();
    if (!raw) continue;

    const { data: cand } = await supabase
      .from('candidate_events')
      .insert({
        raw_event_id: raw.id,
        project_id: projectId,
        event_type: e.event_type,
        subject: e.subject,
        action: e.action,
        confidence: e.confidence,
        importance: e.importance,
        reason: e.reason,
        related_entities: [e.subject],
        potential_impacts: [],
        status: 'confirmed',
        created_at: ts,
      })
      .select('id')
      .single();
    if (!cand) continue;

    eventRows.push({ candidateId: cand.id, rawId: raw.id, e });
  }

  // Fact history: one row per state-changing event on a fact's subject
  const prevState: Record<string, string> = {};
  for (const { candidateId, rawId, e } of eventRows) {
    const factId = factIds[e.subject];
    if (!factId) continue;
    const previous = prevState[e.subject] || null;
    await supabase.from('fact_history').insert({
      fact_id: factId,
      project_id: projectId,
      previous_state: previous,
      new_state: e.action,
      event_id: candidateId,
      decided_at: daysAgo(e.daysAgo, e.hour),
      confidence: e.confidence,
      reason: e.reason,
      evidence: [rawId],
    });
    prevState[e.subject] = e.action;
  }

  for (const c of CONFLICTS) {
    await supabase.from('conflicts').insert({
      project_id: projectId,
      subject: c.subject,
      conflict_type: c.conflict_type,
      previous_fact_id: factIds[c.subject] || null,
      status: 'unresolved',
      description: c.description,
    });
  }

  return project;
}
