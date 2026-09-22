import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

// GET: public invite info for the accept page (project name only — no sensitive data)
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = await params;

  const { data: invite } = await supabase
    .from('project_invites')
    .select('id, email, expires_at, accepted_at, project_id')
    .eq('token', token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'Invite already accepted' }, { status: 410 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 410 });
  }

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', invite.project_id)
    .single();

  return NextResponse.json({
    projectName: project?.name || 'a project',
    email: invite.email,
  });
}

// POST: accept the invite as the logged-in user
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const { token } = await params;

  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  const { data: invite } = await supabase
    .from('project_invites')
    .select('id, email, project_id, expires_at, accepted_at')
    .eq('token', token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'Invite already accepted' }, { status: 410 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 410 });
  }

  const { error: memberError } = await supabase
    .from('project_users')
    .upsert(
      { project_id: invite.project_id, user_id: user.id, email: invite.email, role: 'member' },
      { onConflict: 'project_id,user_id' }
    );

  if (memberError) {
    console.error('Failed to add project member:', memberError);
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 });
  }

  await supabase
    .from('project_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  const { data: project } = await supabase
    .from('projects')
    .select('slug, name')
    .eq('id', invite.project_id)
    .single();

  return NextResponse.json({ accepted: true, slug: project?.slug, projectName: project?.name });
}
