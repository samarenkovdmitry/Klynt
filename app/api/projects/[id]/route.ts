import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/db/queries';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const project = await getProject(id, user.id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const [
      { count: factsCount },
      { count: eventsCount },
      { count: conflictsCount },
      { count: integrationsCount },
    ] = await Promise.all([
      supabase.from('project_facts').select('*', { count: 'exact', head: true }).eq('project_id', id),
      supabase.from('candidate_events').select('*', { count: 'exact', head: true }).eq('project_id', id),
      supabase.from('conflicts').select('*', { count: 'exact', head: true }).eq('project_id', id).eq('status', 'unresolved'),
      supabase.from('integrations').select('*', { count: 'exact', head: true }).eq('project_id', id).eq('status', 'active'),
    ]);

    return NextResponse.json({
      project,
      stats: {
        facts: factsCount ?? 0,
        events: eventsCount ?? 0,
        openConflicts: conflictsCount ?? 0,
        activeIntegrations: integrationsCount ?? 0,
      },
    });

  } catch (error) {
    console.error('Error fetching project details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const project = await getProject(id, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    const { data, error } = await supabase
      .from('projects')
      .update({ name, description })
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    return NextResponse.json({ project: data });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const project = await getProject(id, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
