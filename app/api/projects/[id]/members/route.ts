import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getProject } from '@/lib/db/queries';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const project = await getProject(id, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('project_members')
      .select('id, name, email, role, external_source')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ members: data || [] });
  } catch (error) {
    console.error('Error listing project members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const project = await getProject(id, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('project_members')
      .insert({
        project_id: id,
        external_user_id: email,
        external_source: 'manual',
        name,
        email,
        role,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, member: data });
  } catch (error) {
    console.error('Error inviting project member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
