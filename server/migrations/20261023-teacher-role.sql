BEGIN;
ALTER TABLE tests ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS tests_created_by_idx ON tests(created_by);
-- Existing unowned tests remain accessible only to administrators for management.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_allowed;
ALTER TABLE users ADD CONSTRAINT users_role_allowed CHECK (role IN ('student','teacher','admin'));
COMMIT;
