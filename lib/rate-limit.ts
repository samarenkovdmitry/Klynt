import { supabase } from '@/lib/db/supabase';

// Sliding-window rate limit backed by rate_limit_hits.
// Fails open (logs and allows) if the table isn't migrated yet —
// the limiter must never take the product down.
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    // Insert first, then count including our own hit: the check-then-insert
    // order let two concurrent requests both pass under the limit.
    const { data: hit, error: insertError } = await supabase
      .from('rate_limit_hits')
      .insert({ key })
      .select('id')
      .single();
    if (insertError) {
      console.warn('[rate-limit] store unavailable:', insertError.message);
      return true;
    }

    const since = new Date(Date.now() - windowMs).toISOString();
    const { count, error } = await supabase
      .from('rate_limit_hits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', since);

    if (error) {
      console.warn('[rate-limit] count failed:', error.message);
      return true;
    }
    if ((count ?? 0) > limit) {
      // Over the limit — withdraw our hit so denied attempts don't
      // themselves burn the budget.
      if (hit?.id) await supabase.from('rate_limit_hits').delete().eq('id', hit.id);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[rate-limit] check failed:', e);
    return true;
  }
}
