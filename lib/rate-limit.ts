import { supabase } from '@/lib/db/supabase';

// Sliding-window rate limit backed by rate_limit_hits.
// Fails open (logs and allows) if the table isn't migrated yet —
// the limiter must never take the product down.
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const since = new Date(Date.now() - windowMs).toISOString();
    const { count, error } = await supabase
      .from('rate_limit_hits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', since);

    if (error) {
      console.warn('[rate-limit] store unavailable:', error.message);
      return true;
    }
    if ((count ?? 0) >= limit) return false;

    await supabase.from('rate_limit_hits').insert({ key });
    return true;
  } catch (e) {
    console.warn('[rate-limit] check failed:', e);
    return true;
  }
}
