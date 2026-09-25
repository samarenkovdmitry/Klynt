import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import {
  SESSION_USER_ID_HEADER,
  SESSION_USER_EMAIL_HEADER,
} from '@/lib/supabase/middleware';

// Middleware verifies the session once per request and forwards the
// result in internal headers (spoofed values are stripped at the edge).
// Routes that run without middleware fall back to a real getUser() call.
export async function getSessionUser() {
  const h = headers();
  const id = h.get(SESSION_USER_ID_HEADER);
  if (id) {
    return { id, email: h.get(SESSION_USER_EMAIL_HEADER) ?? undefined } as any;
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
