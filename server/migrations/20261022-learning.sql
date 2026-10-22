BEGIN;
ALTER TABLE results ADD COLUMN IF NOT EXISTS review JSONB;
ALTER TABLE results ADD COLUMN IF NOT EXISTS submission_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS results_user_submission_unique ON results(user_id, submission_id) WHERE submission_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS password_reset_requests (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
COMMIT;
