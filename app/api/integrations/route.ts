import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { listOwnedProjectIds } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const projectIds = await listOwnedProjectIds(user.id);

    const { data: integrations, error } = projectIds.length > 0
      ? await supabase
          .from('integrations')
          .select('id, project_id, source, status, last_sync_at, config, created_at, updated_at')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })
      : { data: [], error: null };

    if (error) throw error;

    return NextResponse.json({ integrations: integrations || [] });
  } catch (error) {
    console.error('Error listing integrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
