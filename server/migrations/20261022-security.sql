BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_valid_after TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS security_rate_limits (key TEXT PRIMARY KEY, hits INT NOT NULL, expires_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS test_history (
 id BIGSERIAL PRIMARY KEY, test_id TEXT NOT NULL, title TEXT NOT NULL,
 action TEXT NOT NULL, actor_id INT, actor_name TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), snapshot JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS test_history_time ON test_history(created_at DESC);
CREATE OR REPLACE FUNCTION capture_test_history() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE tid TEXT; meta JSONB; content JSONB; actor TEXT;
BEGIN
 IF TG_TABLE_NAME='tests' THEN tid=COALESCE(NEW.id,OLD.id);
 ELSE tid=COALESCE(NEW.test_id,OLD.test_id); END IF;
 SELECT to_jsonb(t) INTO meta FROM tests t WHERE id=tid;
 IF meta IS NULL THEN RETURN COALESCE(NEW,OLD); END IF;
 SELECT jsonb_build_object('test',meta,'questions',COALESCE((SELECT jsonb_agg(to_jsonb(q)||jsonb_build_object('options',COALESCE((SELECT jsonb_agg(to_jsonb(o)) FROM options o WHERE o.question_id=q.id),'[]'::jsonb))) FROM questions q WHERE q.test_id=tid),'[]'::jsonb),'results',COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM results r WHERE r.test_id=tid),'[]'::jsonb)) INTO content;
 actor=NULLIF(current_setting('app.actor_id',true),'');
 INSERT INTO test_history(test_id,title,action,actor_id,actor_name,snapshot) VALUES(tid,meta->>'title',COALESCE(NULLIF(current_setting('app.action',true),''),TG_TABLE_NAME||'.'||lower(TG_OP)),actor::int,COALESCE(NULLIF(current_setting('app.actor_name',true),''),'System'),content);
 RETURN COALESCE(NEW,OLD);
END $$;
DROP TRIGGER IF EXISTS test_history_changes ON tests;
CREATE TRIGGER test_history_changes BEFORE UPDATE OR DELETE ON tests FOR EACH ROW EXECUTE FUNCTION capture_test_history();
DROP TRIGGER IF EXISTS test_history_created ON tests;
CREATE TRIGGER test_history_created AFTER INSERT ON tests FOR EACH ROW EXECUTE FUNCTION capture_test_history();
DROP TRIGGER IF EXISTS question_history_changes ON questions;
CREATE TRIGGER question_history_changes BEFORE UPDATE OR DELETE ON questions FOR EACH ROW EXECUTE FUNCTION capture_test_history();
-- New questions are logged after insertion, before their options; final versions can be captured manually.
CREATE TABLE IF NOT EXISTS security_events(id BIGSERIAL PRIMARY KEY,created_at TIMESTAMPTZ DEFAULT now(),actor_id INT,actor_name TEXT,action TEXT NOT NULL,target_id TEXT);
CREATE OR REPLACE FUNCTION audit_user_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' OR NEW.role IS DISTINCT FROM OLD.role OR NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN
 INSERT INTO security_events(actor_id,actor_name,action,target_id) VALUES(NULLIF(current_setting('app.actor_id',true),'')::int,current_setting('app.actor_name',true),CASE WHEN TG_OP='DELETE' THEN 'users.delete' WHEN NEW.role IS DISTINCT FROM OLD.role THEN 'users.role' ELSE 'users.password' END,OLD.id::text);
 END IF;
 IF TG_OP='UPDATE' AND NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN NEW.tokens_valid_after=now(); END IF;
 RETURN COALESCE(NEW,OLD);
END $$;
DROP TRIGGER IF EXISTS audit_user_changes ON users;
CREATE TRIGGER audit_user_changes BEFORE UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_user_change();
COMMIT;
