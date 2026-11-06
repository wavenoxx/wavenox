-- Disposable database only. Existing fixture identities cause this script to fail.
INSERT INTO public.crm_staff_members(id, auth_user_id, email, full_name, role, is_active)
SELECT ('00000000-0000-4000-8000-00000000000' || n)::uuid,
       ('00000000-0000-4000-8000-00000000010' || n)::uuid,
       'fixture' || n || '@example.invalid', 'Fixture ' || n, role, active
FROM (VALUES (1,'owner_admin',true),(2,'sales_coordinator',true),
             (3,'read_only_viewer',true),(4,'sales_coordinator',false)) AS staff(n,role,active);

-- Throw *inside* the audit INSERT after the lead / related-row changes have run.
CREATE FUNCTION crm_private.fail_fixture_audit() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.reason = 'force audit failure' OR NEW.note_body = 'force audit failure' THEN
        RAISE EXCEPTION 'Injected audit failure';
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER fail_fixture_audit BEFORE INSERT ON public.crm_lead_activities
FOR EACH ROW EXECUTE FUNCTION crm_private.fail_fixture_audit();
