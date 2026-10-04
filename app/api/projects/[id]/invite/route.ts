import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabase } from '@/lib/db/supabase';
import { getProject } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';
import { sendProjectInviteEmail } from '@/lib/send-invite-email';
import { getSiteUrl } from '@/lib/site';

// GET: pending invites for the project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  const project = await getProject(id, user.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('project_invites')
    .select('id, email, created_at, expires_at')
    .eq('project_id', id)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return NextResponse.json({ invites: data || [] });
}

// POST { email } — create invite and email the link
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  const project = await getProject(id, user.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const { email } = await request.json().catch(() => ({}));
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Already a member?
  const { data: existingMember } = await supabase
    .from('project_users')
    .select('id')
    .eq('project_id', id)
    .eq('email', cleanEmail)
    .maybeSingle();
  if (existingMember) {
    return NextResponse.json({ error: 'This person is already in the project' }, { status: 409 });
  }

  const token = randomBytes(24).toString('hex');
  const { data: invite, error } = await supabase
    .from('project_invites')
    .upsert(
      {
        project_id: id,
        email: cleanEmail,
        token,
        invited_by: user.id,
        accepted_at: null,
        expires_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      },
      { onConflict: 'project_id,email' }
    )
    .select('id, email, created_at')
    .single();

  if (error) {
    console.error('Failed to create invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }

  const acceptUrl = `${getSiteUrl()}/invite/${token}`;
  try {
    await sendProjectInviteEmail(cleanEmail, project.name, user.email?.split('@')[0] || null, acceptUrl);
  } catch (e) {
    console.error('Failed to send invite email:', e);
    return NextResponse.json({ error: 'Invite created but email failed to send', invite }, { status: 502 });
  }

  return NextResponse.json({ success: true, invite });
}

// DELETE ?email= — revoke a pending invite
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return unauthorizedResponse();

  const project = await getProject(id, user.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const email = new URL(request.url).searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const { error } = await supabase
    .from('project_invites')
    .delete()
    .eq('project_id', id)
    .eq('email', email.toLowerCase())
    .is('accepted_at', null);

  if (error) throw error;

  // If they already accepted, remove their membership too
  await supabase
    .from('project_users')
    .delete()
    .eq('project_id', id)
    .eq('email', email.toLowerCase());

  return NextResponse.json({ deleted: true });
}
