ALTER TABLE reports ADD COLUMN status text NOT NULL DEFAULT 'ready';
ALTER TABLE reports ADD COLUMN extraction jsonb;
