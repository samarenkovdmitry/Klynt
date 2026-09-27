-- Generic sliding-window rate limit store.
CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_key_created
  ON rate_limit_hits (key, created_at DESC);
