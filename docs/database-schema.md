# Klynt Database Schema

## Overview

This schema implements the pipeline: Raw Events → AI Interpretation → Project Facts → Current State

## Core Tables

### 1. projects

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. project_members

```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  external_user_id TEXT NOT NULL, -- Slack user ID, Figma user ID, etc.
  external_source TEXT NOT NULL, -- 'slack', 'figma', etc.
  role TEXT NOT NULL, -- 'client', 'designer', 'developer', 'pm', 'stakeholder'
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, external_user_id, external_source)
);
```

### 3. integrations

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'figma', 'slack'
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  config JSONB, -- source-specific config (channel IDs, file keys, etc.)
  status TEXT DEFAULT 'active', -- 'active', 'error', 'disconnected'
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, source)
);
```

### 4. raw_events

```sql
CREATE TABLE raw_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'figma', 'slack'
  source_event_id TEXT NOT NULL, -- External event ID
  event_type TEXT NOT NULL, -- 'message', 'comment', 'file_version', etc.
  author_id TEXT, -- External user ID
  timestamp TIMESTAMP NOT NULL,
  content TEXT, -- Raw text content
  metadata JSONB NOT NULL, -- Full source-specific payload
  processed_at TIMESTAMP, -- When AI processing started
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, source, source_event_id)
);

CREATE INDEX idx_raw_events_project_timestamp ON raw_events(project_id, timestamp DESC);
CREATE INDEX idx_raw_events_source ON raw_events(source);
CREATE INDEX idx_raw_events_processed ON raw_events(processed_at) WHERE processed_at IS NULL;
```

### 5. candidate_events

```sql
CREATE TABLE candidate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_event_id UUID NOT NULL REFERENCES raw_events(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- AI interpretation
  event_type TEXT NOT NULL, -- 'decision', 'request', 'discussion', 'approval', 'change', 'question', 'commitment', 'blocker', 'scope_change'
  subject TEXT NOT NULL, -- Entity being discussed (e.g., 'pricing_section')
  action TEXT, -- 'add', 'remove', 'modify', 'approve', 'reject', etc.
  confidence DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  importance TEXT NOT NULL, -- 'low', 'medium', 'high'

  -- Context
  reason TEXT, -- AI explanation
  related_entities TEXT[], -- Array of entity identifiers
  potential_impacts TEXT[], -- What this might affect

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected', 'superseded'
  confirmed_by UUID REFERENCES project_members(id),
  confirmed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_candidate_events_project ON candidate_events(project_id);
CREATE INDEX idx_candidate_events_status ON candidate_events(status);
CREATE INDEX idx_candidate_events_confidence ON candidate_events(confidence DESC);
```

### 6. project_facts

```sql
CREATE TABLE project_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Fact identity
  subject TEXT NOT NULL, -- Entity name (e.g., 'pricing_section')
  subject_type TEXT NOT NULL, -- 'design_component', 'content', 'feature', 'requirement', etc.

  -- Current state
  fact_type TEXT NOT NULL, -- 'decision', 'approval', 'state', 'question', 'blocker', 'commitment'
  current_state TEXT NOT NULL, -- e.g., 'approved', 'removed', 'in_progress', 'undecided'
  current_value JSONB, -- Structured data about current state

  -- Metadata
  confidence DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  importance TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  last_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Evidence
  evidence_summary TEXT, -- Human-readable explanation
  primary_event_id UUID REFERENCES candidate_events(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(project_id, subject, subject_type)
);

CREATE INDEX idx_project_facts_project ON project_facts(project_id);
CREATE INDEX idx_project_facts_state ON project_facts(current_state);
CREATE INDEX idx_project_facts_type ON project_facts(fact_type);
```

### 7. fact_history

```sql
CREATE TABLE fact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_id UUID NOT NULL REFERENCES project_facts(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Historical state
  previous_state TEXT,
  new_state TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB,

  -- Transition
  event_id UUID NOT NULL REFERENCES candidate_events(id),
  decided_by UUID REFERENCES project_members(id),
  decided_at TIMESTAMP NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,

  -- Context
  reason TEXT,
  evidence TEXT[], -- Array of raw_event IDs

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fact_history_fact ON fact_history(fact_id, created_at DESC);
CREATE INDEX idx_fact_history_project ON fact_history(project_id, created_at DESC);
```

### 8. fact_evidence

```sql
CREATE TABLE fact_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_id UUID NOT NULL REFERENCES project_facts(id) ON DELETE CASCADE,
  raw_event_id UUID NOT NULL REFERENCES raw_events(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3,2) NOT NULL, -- How relevant this evidence is (0.00 to 1.00)
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(fact_id, raw_event_id)
);

CREATE INDEX idx_fact_evidence_fact ON fact_evidence(fact_id);
```

### 9. conflicts

```sql
CREATE TABLE conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Conflict details
  subject TEXT NOT NULL,
  conflict_type TEXT NOT NULL, -- 'state_change', 'contradiction', 'missing_confirmation'

  -- Conflicting facts
  previous_fact_id UUID REFERENCES project_facts(id),
  new_event_id UUID REFERENCES candidate_events(id),

  -- Resolution
  status TEXT DEFAULT 'unresolved', -- 'unresolved', 'resolved', 'ignored'
  resolution TEXT, -- 'keep_previous', 'confirm_new', 'merge'
  resolved_by UUID REFERENCES project_members(id),
  resolved_at TIMESTAMP,

  -- Context
  description TEXT NOT NULL,
  detected_at TIMESTAMP DEFAULT NOW(),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conflicts_project ON conflicts(project_id, status);
CREATE INDEX idx_conflicts_subject ON conflicts(subject);
```

### 10. entities

```sql
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Entity identity
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'design_component', 'page', 'feature', 'content_block', etc.
  canonical_name TEXT NOT NULL, -- Normalized name for matching

  -- Entity resolution
  aliases TEXT[], -- Alternative names/phrases that refer to this entity
  related_entities UUID[], -- IDs of related entities

  -- Source mapping
  figma_node_id TEXT,
  figma_file_key TEXT,
  slack_channel_id TEXT,

  metadata JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(project_id, canonical_name)
);

CREATE INDEX idx_entities_project ON entities(project_id);
CREATE INDEX idx_entities_canonical ON entities(canonical_name);
```

## Views for Common Queries

### 11. current_project_state (View)

```sql
CREATE VIEW current_project_state AS
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
```

### 12. recent_changes (View)

```sql
CREATE VIEW recent_changes AS
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
```

### 13. unresolved_conflicts (View)

```sql
CREATE VIEW unresolved_conflicts AS
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
```

## Pipeline Flow

1. **Ingestion**: Webhooks/API calls → `raw_events`
2. **AI Processing**: Background job reads unprocessed `raw_events` → creates `candidate_events`
3. **Confirmation**: User/system confirms high-confidence `candidate_events`
4. **Fact Creation**: Confirmed events create/update `project_facts`
5. **History**: State changes recorded in `fact_history`
6. **Evidence**: Links between facts and events in `fact_evidence`
7. **Conflict Detection**: System detects conflicts → creates `conflicts` records
8. **Entity Resolution**: AI matches mentions to `entities`

## Key Design Decisions

1. **Separation of Raw and Interpreted**: Never lose raw source data
2. **Candidate Events**: AI interpretation is always tentative until confirmed
3. **History**: All state changes are preserved in `fact_history`
4. **Evidence**: Every fact must be traceable to source events
5. **Confidence**: AI confidence scores prevent automatic overwrites
6. **Conflicts**: Explicit conflict detection and resolution
7. **Entity Resolution**: Canonical names with aliases for fuzzy matching
