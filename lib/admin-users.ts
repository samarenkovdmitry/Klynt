import { supabase } from '@/lib/db/supabase';
import type { User } from '@supabase/supabase-js';

// admin.listUsers is paged — a single call sees only the first ~50 users,
// so "does this account exist" checks must walk the pages.
export async function findAuthUserByEmail(email: string): Promise<User | undefined> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    const found = users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found;
    if (users.length < 200) break;
  }
  return undefined;
}
