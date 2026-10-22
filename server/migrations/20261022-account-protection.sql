BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE OR REPLACE FUNCTION protect_user_data() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN
  IF current_setting('app.maintenance_user_purge',true) IS DISTINCT FROM 'on' THEN
   RAISE EXCEPTION 'Physical account deletion is disabled; archive the account instead' USING ERRCODE='42501';
  END IF;
  RETURN OLD;
 END IF;
 IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
  NEW.tokens_valid_after=now();
  INSERT INTO security_events(actor_id,actor_name,action,target_id)
  VALUES(NULLIF(current_setting('app.actor_id',true),'')::int,current_setting('app.actor_name',true),CASE WHEN NEW.deleted_at IS NULL THEN 'users.restore' ELSE 'users.archive' END,OLD.id::text);
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_user_data_changes ON users;
CREATE TRIGGER protect_user_data_changes BEFORE UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION protect_user_data();
COMMIT;
