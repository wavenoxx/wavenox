-- Disposable loopback database only. Never apply these fixtures to a deployed database.
CREATE FUNCTION project_private.fail_test_audit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.summary='force project audit failure' THEN RAISE EXCEPTION 'Injected project audit failure'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER fail_test_project_audit BEFORE INSERT ON public.project_activities
FOR EACH ROW EXECUTE FUNCTION project_private.fail_test_audit();
