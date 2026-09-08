// Core event types for Klynt

export type Source = 'figma' | 'slack' | 'email' | 'notion';

export type EventType = 'message' | 'comment' | 'file_version' | 'file_update' | 'library_publish';

export interface RawEvent {
  id: string;
  project_id: string;
  source: Source;
  source_event_id: string;
  event_type: EventType;
  author_id?: string;
  timestamp: Date;
  content?: string;
  metadata: Record<string, any>;
  processed_at?: Date;
  created_at: Date;
}

export interface FigmaWebhookEvent {
  event_type: 'FILE_COMMENT' | 'FILE_VERSION_UPDATE' | 'FILE_UPDATE' | 'LIBRARY_PUBLISH' | 'FILE_DELETE';
  file_key: string;
  file_name: string;
  timestamp: string;
  passcode: string;
  // FILE_COMMENT specific
  comment?: FigmaComment;
  // FILE_VERSION_UPDATE specific
  version?: FigmaVersion;
}

export interface FigmaComment {
  id: string;
  text: string;
  user: {
    id: string;
    handle: string;
    img_url: string;
  };
  created_at: string;
  resolved_at?: string;
  parent_id?: string;
  order_id?: number;
  client_meta: any;
}

export interface FigmaVersion {
  id: string;
  created_at: string;
  label: string;
  description: string;
  user: {
    id: string;
    handle: string;
    img_url: string;
  };
}

export interface SlackWebhookEvent {
  type: string;
  team_id: string;
  api_app_id: string;
  event: {
    type: 'message' | 'message_changed' | 'message_replied';
    user: string;
    text: string;
    ts: string;
    channel: string;
    thread_ts?: string;
    parent_user_id?: string;
    subtype?: string;
  };
  event_id: string;
  event_time: number;
}

export interface SlackMessage {
  user: string;
  text: string;
  ts: string;
  channel: string;
  thread_ts?: string;
  parent_user_id?: string;
  subtype?: string;
}

// AI interpretation types
export type CandidateEventType =
  | 'decision'
  | 'request'
  | 'discussion'
  | 'approval'
  | 'change'
  | 'question'
  | 'commitment'
  | 'blocker'
  | 'scope_change'
  | 'idea';

export type Importance = 'low' | 'medium' | 'high';

export type CandidateStatus = 'pending' | 'confirmed' | 'rejected' | 'superseded';

export interface CandidateEvent {
  id: string;
  raw_event_id: string;
  project_id: string;
  event_type: CandidateEventType;
  subject: string;
  action?: string;
  confidence: number; // 0.00 to 1.00
  importance: Importance;
  reason?: string;
  related_entities: string[];
  potential_impacts: string[];
  status: CandidateStatus;
  confirmed_by?: string;
  confirmed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Project fact types
export type FactType = 'decision' | 'approval' | 'state' | 'question' | 'blocker' | 'commitment';

export interface ProjectFact {
  id: string;
  project_id: string;
  subject: string;
  subject_type: string;
  fact_type: FactType;
  current_state: string;
  current_value?: Record<string, any>;
  confidence: number;
  importance: Importance;
  last_updated_at: Date;
  evidence_summary?: string;
  primary_event_id?: string;
  created_at: Date;
  updated_at: Date;
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
  decided_at: Date;
  confidence: number;
  reason?: string;
  evidence: string[];
  created_at: Date;
}

export interface Conflict {
  id: string;
  project_id: string;
  subject: string;
  conflict_type: 'state_change' | 'contradiction' | 'missing_confirmation';
  previous_fact_id?: string;
  new_event_id?: string;
  status: 'unresolved' | 'resolved' | 'ignored';
  resolution?: 'keep_previous' | 'confirm_new' | 'merge';
  resolved_by?: string;
  resolved_at?: Date;
  description: string;
  detected_at: Date;
  created_at: Date;
}
