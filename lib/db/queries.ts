import { supabase, Project, RawEvent, CandidateEvent, ProjectFact, FactHistory, Conflict } from './supabase';
import { slugify } from '@/lib/slug';

// Project operations
export async function createProject(name: string, description?: string, ownerId?: string): Promise<Project> {
  const base = slugify(name);

  let slug = base;
  for (let i = 2; i <= 20; i++) {
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${base}-${i}`;
  }

  let { data, error } = await supabase
    .from('projects')
    .insert({ name, description, owner_id: ownerId, slug })
    .select()
    .single();

  // slug column not migrated yet — insert without it
  if (error && /slug/i.test(error.message || '')) {
    const retry = await supabase
      .from('projects')
      .insert({ name, description, owner_id: ownerId })
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  return data;
}

export async function getProject(projectId: string, ownerId?: string): Promise<Project | null> {
  let query = supabase
    .from('projects')
    .select()
    .eq('id', projectId);

  if (ownerId) query = query.eq('owner_id', ownerId);

  const { data, error } = await query.single();

  if (error) return null;
  return data;
}

export async function listProjects(ownerId?: string): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select()
    .order('created_at', { ascending: false });

  if (ownerId) query = query.eq('owner_id', ownerId);

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function listOwnedProjectIds(ownerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', ownerId);

  if (error) throw error;
  return (data || []).map((p: { id: string }) => p.id);
}

// Raw Event operations
export async function createRawEvent(event: Omit<RawEvent, 'id' | 'created_at'>): Promise<RawEvent> {
  const { data, error } = await supabase
    .from('raw_events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRawEvent(projectId: string, source: string, sourceEventId: string): Promise<RawEvent | null> {
  const { data, error } = await supabase
    .from('raw_events')
    .select()
    .eq('project_id', projectId)
    .eq('source', source)
    .eq('source_event_id', sourceEventId)
    .single();

  if (error) return null;
  return data;
}

export async function getUnprocessedEvents(projectId: string, limit = 50): Promise<RawEvent[]> {
  const { data, error } = await supabase
    .from('raw_events')
    .select()
    .eq('project_id', projectId)
    .is('processed_at', null)
    .order('timestamp', { ascending: true })
    .limit(limit);

  console.log('getUnprocessedEvents query:', { projectId, data: data?.length, error });

  if (error) throw error;
  return data || [];
}

export async function markEventProcessed(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('raw_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('id', eventId);

  if (error) throw error;
}

// Candidate Event operations
export async function createCandidateEvent(event: Omit<CandidateEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CandidateEvent> {
  const { data, error } = await supabase
    .from('candidate_events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCandidateEvent(eventId: string): Promise<CandidateEvent | null> {
  const { data, error } = await supabase
    .from('candidate_events')
    .select()
    .eq('id', eventId)
    .single();

  if (error) return null;
  return data;
}

export async function updateCandidateEventStatus(
  eventId: string,
  status: CandidateEvent['status'],
  confirmedBy?: string
): Promise<void> {
  const updateData: any = { status };
  if (status === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString();
    if (confirmedBy) updateData.confirmed_by = confirmedBy;
  }

  const { error } = await supabase
    .from('candidate_events')
    .update(updateData)
    .eq('id', eventId);

  if (error) throw error;
}

export async function getPendingCandidateEvents(projectId: string): Promise<CandidateEvent[]> {
  const { data, error } = await supabase
    .from('candidate_events')
    .select()
    .eq('project_id', projectId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Project Fact operations
export async function createProjectFact(fact: Omit<ProjectFact, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectFact> {
  const { data, error } = await supabase
    .from('project_facts')
    .insert(fact)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProjectFact(
  factId: string,
  updates: Partial<Omit<ProjectFact, 'id' | 'project_id' | 'created_at'>>
): Promise<ProjectFact> {
  const { data, error } = await supabase
    .from('project_facts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', factId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectFact(projectId: string, subject: string, subjectType: string): Promise<ProjectFact | null> {
  const { data, error } = await supabase
    .from('project_facts')
    .select()
    .eq('project_id', projectId)
    .eq('subject', subject)
    .eq('subject_type', subjectType)
    .single();

  if (error) return null;
  return data;
}

export async function listProjectFacts(projectId: string): Promise<ProjectFact[]> {
  const { data, error } = await supabase
    .from('project_facts')
    .select()
    .eq('project_id', projectId)
    .order('last_updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCurrentProjectState(projectId: string) {
  const { data, error } = await supabase
    .from('current_project_state')
    .select()
    .eq('project_id', projectId);

  if (error) throw error;
  return data || [];
}

// Fact History operations
export async function createFactHistory(factHistory: Omit<FactHistory, 'id' | 'created_at'>): Promise<FactHistory> {
  const { data, error } = await supabase
    .from('fact_history')
    .insert(factHistory)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Conflict operations
export async function createConflict(conflict: Omit<Conflict, 'id' | 'created_at'>): Promise<Conflict> {
  const { data, error } = await supabase
    .from('conflicts')
    .insert(conflict)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectConflicts(projectId: string): Promise<Conflict[]> {
  const { data, error } = await supabase
    .from('conflicts')
    .select()
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function resolveConflict(
  conflictId: string,
  resolution: Conflict['resolution'],
  resolvedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('conflicts')
    .update({
      status: 'resolved',
      resolution,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', conflictId);

  if (error) throw error;
}

// Integration operations
export async function createIntegration(integration: {
  project_id: string;
  source: string;
  access_token_encrypted: string;
  refresh_token_encrypted?: string;
  config?: Record<string, any>;
}) {
  const { data, error } = await supabase
    .from('integrations')
    .upsert(integration, { onConflict: 'project_id,source', ignoreDuplicates: false })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getIntegration(projectId: string, source: string) {
  const { data, error } = await supabase
    .from('integrations')
    .select()
    .eq('project_id', projectId)
    .eq('source', source)
    .single();

  if (error) return null;
  return data;
}

export async function getIntegrationByFileKey(fileKey: string, source: string = 'figma') {
  const { data, error } = await supabase
    .from('integrations')
    .select()
    .filter('config->>file_key', 'eq', fileKey)
    .eq('source', source)
    .maybeSingle();

  if (error) {
    console.error('Error finding integration by file key:', error);
    return null;
  }

  return data;
}

export async function getIntegrationByLinearOrg(organizationId: string) {
  const { data, error } = await supabase
    .from('integrations')
    .select()
    .filter('config->>organization_id', 'eq', organizationId)
    .eq('source', 'linear')
    .maybeSingle();

  if (error) {
    console.error('Error finding Linear integration by organization id:', error);
    return null;
  }

  return data;
}

export async function getIntegrationByTeamId(teamId: string) {
  const { data, error } = await supabase
    .from('integrations')
    .select()
    .filter('config->>team_id', 'eq', teamId)
    .eq('source', 'slack')
    .maybeSingle();

  if (error) {
    console.error('Error finding Slack integration by team id:', error);
    return null;
  }

  return data;
}

export async function updateIntegrationLastSync(integrationId: string): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', integrationId);

  if (error) throw error;
}
