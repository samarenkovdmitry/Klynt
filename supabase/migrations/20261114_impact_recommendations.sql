-- Suggestions are separate from confirmed facts and unresolved conflicts.
-- Evidence deletion cascades to suggestions; disconnect must not retain copies.
CREATE TABLE IF NOT EXISTS impact_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_fact_id UUID NOT NULL REFERENCES project_facts(id) ON DELETE CASCADE,
  source_event_id UUID NOT NULL REFERENCES candidate_events(id) ON DELETE CASCADE,
  source_raw_event_id UUID NOT NULL REFERENCES raw_events(id) ON DELETE CASCADE,
  target_fact_id UUID NOT NULL REFERENCES project_facts(id) ON DELETE CASCADE,
  decision_history_id UUID NOT NULL REFERENCES fact_history(id) ON DELETE CASCADE,
  decision_raw_event_id UUID NOT NULL REFERENCES raw_events(id) ON DELETE CASCADE,
  target_revision TEXT NOT NULL,
  assumption_quote TEXT NOT NULL,
  event_quote TEXT NOT NULL,
  reason TEXT NOT NULL,
  dependency TEXT NOT NULL,
  analysis_version TEXT NOT NULL,
  review TEXT CHECK (review IN ('reconsider', 'not_related')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source_fact_id <> target_fact_id),
  UNIQUE(project_id, source_event_id, decision_history_id)
);

CREATE INDEX IF NOT EXISTS idx_impact_source ON impact_recommendations(project_id, source_fact_id);
CREATE INDEX IF NOT EXISTS idx_impact_target ON impact_recommendations(project_id, target_fact_id);
ALTER TABLE impact_recommendations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON impact_recommendations FROM anon, authenticated;
GRANT ALL ON impact_recommendations TO service_role;
