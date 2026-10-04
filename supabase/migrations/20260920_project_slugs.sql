-- Human-readable project URLs (/project/<slug>)

ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON projects(slug);
