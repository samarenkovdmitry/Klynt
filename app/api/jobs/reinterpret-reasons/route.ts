import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser } from '@/lib/api-auth';
import { interpretEvent } from '@/lib/ai/event-processor';

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') === `Bearer ${secret}`) {
    return true;
  }
  return !!(await getSessionUser());
}

const META_REASON_PATTERNS = [
  'ambiguous',
  'lacks context',
  'lack of context',
  'uncertain',
  'could refer',
  'could be a',
  'minimal context',
  'vague',
];

function needsRewrite(reason: string | null): boolean {
  if (!reason) return false;
  if (reason.length > 80) return true;
  const lower = reason.toLowerCase();
  return META_REASON_PATTERNS.some(p => lower.includes(p));
}

// Verbatim copy of the raw message — not an interpretation
function isVerbatimCopy(reason: string | null, content: string | null): boolean {
  if (!reason || !content) return false;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9а-яё]+/giu, ' ').replace(/\s+/g, ' ').trim();
  const nr = norm(reason);
  const nc = norm(content);
  return nr === nc || nc.includes(nr);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: candidates, error } = await supabase
      .from('candidate_events')
      .select('id, raw_event_id, reason, raw_events(content)')
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) throw error;

    const stale = (candidates || []).filter(c =>
      needsRewrite(c.reason) ||
      isVerbatimCopy(c.reason, (c.raw_events as any)?.content)
    );
    let updated = 0;
    const errors: string[] = [];

    for (const candidate of stale) {
      const { data: raw } = await supabase
        .from('raw_events')
        .select('*')
        .eq('id', candidate.raw_event_id)
        .maybeSingle();

      if (!raw) continue;

      const interpretation = await interpretEvent({
        source: raw.source,
        event_type: raw.event_type,
        timestamp: raw.timestamp,
        content: raw.content,
        author_id: raw.author_id,
        metadata: raw.metadata,
      });

      if (!interpretation.reason || interpretation.reason === 'AI interpretation failed') {
        continue;
      }

      const { error: upErr } = await supabase
        .from('candidate_events')
        .update({ reason: interpretation.reason })
        .eq('id', candidate.id);

      if (upErr) {
        errors.push(`${candidate.id}: ${upErr.message}`);
        continue;
      }

      await supabase
        .from('fact_history')
        .update({ reason: interpretation.reason })
        .eq('event_id', candidate.id)
        .eq('reason', candidate.reason);

      updated++;
    }

    return NextResponse.json({ scanned: candidates?.length || 0, stale: stale.length, updated, errors });
  } catch (err) {
    console.error('Error reinterpreting reasons:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
