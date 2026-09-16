-- Klynt Core Schema
-- Creates the database structure for the Project Truth Layer system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Project members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL,
  external_source TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, external_user_id, external_source)
);

-- 3. Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  config JSONB,
  status TEXT DEFAULT 'active',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, source)
);

-- 4. Raw events table
CREATE TABLE IF NOT EXISTS raw_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  author_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT,
  metadata JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, source, source_event_id)
);

-- Indexes for raw_events
CREATE INDEX IF NOT EXISTS idx_raw_events_project_timestamp ON raw_events(project_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_raw_events_source ON raw_events(source);
CREATE INDEX IF NOT EXISTS idx_raw_events_processed ON raw_events(processed_at) WHERE processed_at IS NULL;

-- 5. Candidate events table
CREATE TABLE IF NOT EXISTS candidate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_event_id UUID NOT NULL REFERENCES raw_events(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  action TEXT,
  confidence DECIMAL(3,2) NOT NULL,
  importance TEXT NOT NULL,
  reason TEXT,
  related_entities TEXT[],
  potential_impacts TEXT[],
  status TEXT DEFAULT 'pending',
  confirmed_by UUID REFERENCES project_members(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for candidate_events
CREATE INDEX IF NOT EXISTS idx_candidate_events_project ON candidate_events(project_id);
CREATE INDEX IF NOT EXISTS idx_candidate_events_status ON candidate_events(status);
CREATE INDEX IF NOT EXISTS idx_candidate_events_confidence ON candidate_events(confidence DESC);

-- 6. Project facts table
CREATE TABLE IF NOT EXISTS project_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  fact_type TEXT NOT NULL,
  current_state TEXT NOT NULL,
  current_value JSONB,
  confidence DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  importance TEXT NOT NULL DEFAULT 'medium',
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  evidence_summary TEXT,
  primary_event_id UUID REFERENCES candidate_events(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, subject, subject_type)
);

-- Indexes for project_facts
CREATE INDEX IF NOT EXISTS idx_project_facts_project ON project_facts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_facts_state ON project_facts(current_state);
CREATE INDEX IF NOT EXISTS idx_project_facts_type ON project_facts(fact_type);

-- 7. Fact history table
CREATE TABLE IF NOT EXISTS fact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_id UUID NOT NULL REFERENCES project_facts(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  previous_state TEXT,
  new_state TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  event_id UUID NOT NULL REFERENCES candidate_events(id),
  decided_by UUID REFERENCES project_members(id),
  decided_at TIMESTAMP WITH TIME ZONE NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  reason TEXT,
  evidence TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fact_history
CREATE INDEX IF NOT EXISTS idx_fact_history_fact ON fact_history(fact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fact_history_project ON fact_history(project_id, created_at DESC);

-- 8. Fact evidence table
CREATE TABLE IF NOT EXISTS fact_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_id UUID NOT NULL REFERENCES project_facts(id) ON DELETE CASCADE,
  raw_event_id UUID NOT NULL REFERENCES raw_events(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fact_id, raw_event_id)
);

-- Indexes for fact_evidence
CREATE INDEX IF NOT EXISTS idx_fact_evidence_fact ON fact_evidence(fact_id);

-- 9. Conflicts table
CREATE TABLE IF NOT EXISTS conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  conflict_type TEXT NOT NULL,
  previous_fact_id UUID REFERENCES project_facts(id),
  new_event_id UUID REFERENCES candidate_events(id),
  status TEXT DEFAULT 'unresolved',
  resolution TEXT,
  resolved_by UUID REFERENCES project_members(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  description TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conflicts
CREATE INDEX IF NOT EXISTS idx_conflicts_project ON conflicts(project_id, status);
CREATE INDEX IF NOT EXISTS idx_conflicts_subject ON conflicts(subject);

-- 10. Entities table
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  aliases TEXT[],
  related_entities UUID[],
  figma_node_id TEXT,
  figma_file_key TEXT,
  slack_channel_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, canonical_name)
);

-- Indexes for entities
CREATE INDEX IF NOT EXISTS idx_entities_project ON entities(project_id);
CREATE INDEX IF NOT EXISTS idx_entities_canonical ON entities(canonical_name);

-- Views for common queries

-- Current project state view
CREATE OR REPLACE VIEW current_project_state AS
SELECT
  p.id as project_id,
  p.name as project_name,
  pf.subject,
  pf.subject_type,
  pf.fact_type,
  pf.current_state,
  pf.current_value,
  pf.importance,
  pf.confidence,
  pf.last_updated_at,
  pf.evidence_summary,
  pm.name as decided_by_name,
  pm.role as decided_by_role
FROM project_facts pf
JOIN projects p ON pf.project_id = p.id
LEFT JOIN project_members pm ON pf.primary_event_id IN (
  SELECT ce.id FROM candidate_events ce WHERE ce.id = pf.primary_event_id
)
WHERE pf.current_state NOT IN ('removed', 'deprecated');

-- Recent changes view
CREATE OR REPLACE VIEW recent_changes AS
SELECT
  fh.project_id,
  fh.fact_id,
  pf.subject,
  fh.previous_state,
  fh.new_state,
  fh.decided_at,
  fh.confidence,
  pm.name as decided_by,
  pm.role as decided_by_role,
  ce.event_type,
  ce.importance
FROM fact_history fh
JOIN project_facts pf ON fh.fact_id = pf.id
LEFT JOIN candidate_events ce ON fh.event_id = ce.id
LEFT JOIN project_members pm ON fh.decided_by = pm.id
ORDER BY fh.decided_at DESC;

-- Unresolved conflicts view
CREATE OR REPLACE VIEW unresolved_conflicts AS
SELECT
  c.id,
  c.project_id,
  c.subject,
  c.conflict_type,
  c.description,
  c.detected_at,
  pf.current_state as current_fact_state,
  ce.event_type as new_event_type,
  ce.confidence as new_event_confidence
FROM conflicts c
LEFT JOIN project_facts pf ON c.previous_fact_id = pf.id
LEFT JOIN candidate_events ce ON c.new_event_id = ce.id
WHERE c.status = 'unresolved';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_events_updated_at BEFORE UPDATE ON candidate_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_facts_updated_at BEFORE UPDATE ON project_facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
