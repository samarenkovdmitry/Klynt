import { NextRequest, NextResponse } from 'next/server';
import { createProject, listProjects, listOwnedProjectIds } from '@/lib/db/queries';
import { supabase } from '@/lib/db/supabase';
import { getSessionUser, unauthorizedResponse } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await createProject(name, description, user.id);

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorizedResponse();

    const projects = await listProjects(user.id);
    const projectIds = await listOwnedProjectIds(user.id);

    const { data: conflicts } = projectIds.length > 0
      ? await supabase
          .from('conflicts')
          .select('project_id, status')
          .in('project_id', projectIds)
      : { data: [] };

    const counts: Record<string, number> = {};
    for (const c of conflicts || []) {
      if (c.status !== 'resolved') {
        counts[c.project_id] = (counts[c.project_id] || 0) + 1;
      }
    }

    const projectsWithCounts = projects.map(p => ({
      ...p,
      unresolved_count: counts[p.id] || 0,
    }));

    return NextResponse.json({ projects: projectsWithCounts });
  } catch (error) {
    console.error('Error listing projects:', error);
    return NextResponse.json({ error: 'Failed to list projects' }, { status: 500 });
  }
}
