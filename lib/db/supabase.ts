import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service role client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types based on our schema
export interface Project {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  external_user_id: string;
  external_source: string;
  role: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Integration {
  id: string;
  project_id: string;
  source: string;
  access_token_encrypted: string;
  refresh_token_encrypted?: string;
  config?: Record<string, any>;
  status: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RawEvent {
  id: string;
  project_id: string;
  source: string;
  source_event_id: string;
  event_type: string;
  author_id?: string;
  timestamp: string;
  content?: string;
  metadata: Record<string, any>;
  processed_at?: string;
  created_at: string;
}

export interface CandidateEvent {
  id: string;
  raw_event_id: string;
  project_id: string;
  event_type: string;
  subject: string;
  action?: string;
  confidence: number;
  importance: string;
  reason?: string;
  related_entities: string[];
  potential_impacts: string[];
  status: string;
  confirmed_by?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFact {
  id: string;
  project_id: string;
  subject: string;
  subject_type: string;
  fact_type: string;
  current_state: string;
  current_value?: Record<string, any>;
  confidence: number;
  importance: string;
  last_updated_at: string;
  evidence_summary?: string;
  primary_event_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FactHistory {
  id: string;
  fact_id: string;
  project_id: string;
  previous_state?: string;
  new_state: string;
  previous_value?: Record<string, any>;
  new_value?: Record<string, any>;
  event_id: string;
  decided_by?: string;
  decided_at: string;
  confidence: number;
  reason?: string;
  evidence: string[];
  created_at: string;
}

export interface Conflict {
  id: string;
  project_id: string;
  subject: string;
  conflict_type: string;
  previous_fact_id?: string;
  new_event_id?: string;
  status: string;
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  description: string;
  detected_at: string;
  created_at: string;
}

export interface Entity {
  id: string;
  project_id: string;
  name: string;
  type: string;
  canonical_name: string;
  aliases: string[];
  related_entities: string[];
  figma_node_id?: string;
  figma_file_key?: string;
  slack_channel_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
