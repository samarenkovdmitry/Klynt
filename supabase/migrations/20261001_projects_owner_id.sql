-- Project owner (auth.users). Was added manually on prod; codified so
-- fresh environments (RU deployment) get the same schema.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
