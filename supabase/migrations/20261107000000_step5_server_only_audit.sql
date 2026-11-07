-- Forward upgrade for both new installs and databases with the original Step 5 migration.
-- The migration runner applies this file as one transaction.
CREATE OR REPLACE FUNCTION public.protect_consultation_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF OLD.id IS DISTINCT FROM NEW.id
       OR OLD.reference_code IS DISTINCT FROM NEW.reference_code
       OR OLD.created_at IS DISTINCT FROM NEW.created_at
       OR OLD.source IS DISTINCT FROM NEW.source
       OR OLD.notes IS DISTINCT FROM NEW.notes
       OR OLD.consent_given IS DISTINCT FROM NEW.consent_given
       OR OLD.consent_version IS DISTINCT FROM NEW.consent_version
       OR OLD.consent_at IS DISTINCT FROM NEW.consent_at THEN
        RAISE EXCEPTION 'IMMUTABLE_CONSULTATION_FIELD_VIOLATION: id, reference_code, created_at, source, customer notes, and original consent provenance cannot be modified.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_consultation_immutable_fields ON public.consultations;
CREATE TRIGGER trg_protect_consultation_immutable_fields
    BEFORE UPDATE ON public.consultations
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_consultation_immutable_fields();
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_followup_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_privacy_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.consultations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.crm_staff_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_activities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.crm_followup_tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.crm_privacy_requests FORCE ROW LEVEL SECURITY;

-- Explicitly revoke all direct Data API privileges from PUBLIC, anon, AND authenticated
REVOKE ALL ON TABLE public.consultations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.crm_staff_members FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.crm_lead_activities FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.crm_followup_tasks FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.crm_privacy_requests FROM PUBLIC, anon, authenticated;

-- Drop any legacy or prior policies that exposed tables to anon or authenticated roles
DROP POLICY IF EXISTS "Public can submit VIP solar consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins have full access to consultation records" ON public.consultations;
DROP POLICY IF EXISTS "Public can insert consultations" ON public.consultations;
DROP POLICY IF EXISTS "crm_staff_select_consultations" ON public.consultations;
DROP POLICY IF EXISTS "crm_staff_update_consultations" ON public.consultations;
DROP POLICY IF EXISTS "crm_service_role_consultations" ON public.consultations;

DROP POLICY IF EXISTS "crm_staff_select_members" ON public.crm_staff_members;
DROP POLICY IF EXISTS "crm_owner_manage_members" ON public.crm_staff_members;
DROP POLICY IF EXISTS "crm_service_role_staff_members" ON public.crm_staff_members;

DROP POLICY IF EXISTS "crm_staff_select_activities" ON public.crm_lead_activities;
DROP POLICY IF EXISTS "crm_staff_insert_activities" ON public.crm_lead_activities;
DROP POLICY IF EXISTS "crm_service_role_activities_select" ON public.crm_lead_activities;
DROP POLICY IF EXISTS "crm_service_role_activities_insert" ON public.crm_lead_activities;

DROP POLICY IF EXISTS "crm_staff_select_tasks" ON public.crm_followup_tasks;
DROP POLICY IF EXISTS "crm_staff_insert_tasks" ON public.crm_followup_tasks;
DROP POLICY IF EXISTS "crm_staff_update_tasks" ON public.crm_followup_tasks;
DROP POLICY IF EXISTS "crm_service_role_tasks" ON public.crm_followup_tasks;

DROP POLICY IF EXISTS "crm_staff_select_privacy_requests" ON public.crm_privacy_requests;
DROP POLICY IF EXISTS "crm_owner_manage_privacy_requests" ON public.crm_privacy_requests;
DROP POLICY IF EXISTS "crm_service_role_privacy_requests" ON public.crm_privacy_requests;


-- RLS defaults to deny. Supabase service_role has BYPASSRLS, but still needs table grants.
REVOKE ALL ON public.consultations, public.crm_staff_members, public.crm_lead_activities,
    public.crm_followup_tasks, public.crm_privacy_requests FROM service_role;
GRANT SELECT, INSERT, UPDATE ON public.consultations, public.crm_followup_tasks TO service_role;
GRANT SELECT, INSERT ON public.crm_lead_activities, public.crm_privacy_requests TO service_role;
GRANT SELECT, UPDATE (is_active) ON public.crm_staff_members TO service_role; -- FOR SHARE lock

DROP FUNCTION IF EXISTS public.get_active_crm_staff_role();
DROP FUNCTION IF EXISTS public.get_active_crm_staff_id();
ALTER FUNCTION public.check_recent_submission() SET search_path = '';
ALTER FUNCTION public.prevent_crm_activity_mutation() SET search_path = '';
REVOKE ALL ON FUNCTION public.check_recent_submission(), public.prevent_crm_activity_mutation(),
    public.protect_consultation_immutable_fields() FROM PUBLIC, anon, authenticated;

CREATE SCHEMA IF NOT EXISTS crm_private;
REVOKE ALL ON SCHEMA crm_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA crm_private TO service_role;

-- Freeze membership until commit. The server obtains this id from the verified Auth user.
CREATE FUNCTION crm_private.writer(actor_id uuid) RETURNS public.crm_staff_members
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE actor public.crm_staff_members;
BEGIN
    SELECT * INTO actor FROM public.crm_staff_members
    WHERE id = actor_id AND is_active AND role IN ('owner_admin','sales_coordinator') FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'FORBIDDEN_STAFF_ROLE' USING ERRCODE = '42501'; END IF;
    RETURN actor;
END;
$$;

CREATE FUNCTION crm_private.lock_lead(lead_id uuid, expected_version int) RETURNS public.consultations
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE lead public.consultations;
BEGIN
    SELECT * INTO lead FROM public.consultations WHERE id = lead_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'LEAD_NOT_FOUND'; END IF;
    IF lead.crm_version IS DISTINCT FROM expected_version THEN
        RAISE EXCEPTION 'CONCURRENT_MODIFICATION_CONFLICT' USING ERRCODE = 'PT409';
    END IF;
    RETURN lead;
END;
$$;

CREATE FUNCTION crm_private.audit(lead_id uuid, actor public.crm_staff_members, action text,
    note text, old_state jsonb, new_state jsonb, reason text) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE event_id uuid;
BEGIN
    INSERT INTO public.crm_lead_activities(lead_id, actor_staff_id, actor_label, action_type,
        note_body, before_state, after_state, reason)
    VALUES (lead_id, actor.id, actor.full_name, action, note, old_state, new_state, reason)
    RETURNING id INTO STRICT event_id;
    RETURN event_id;
END;
$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA crm_private FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA crm_private TO service_role;
DROP FUNCTION IF EXISTS public.crm_transition_lead_stage(UUID, UUID, TEXT, TEXT, INT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.crm_transition_lead_stage(
    p_lead_id UUID,
    p_actor_staff_id UUID,
    p_new_status TEXT,
    p_expected_version INT,
    p_reason TEXT DEFAULT NULL,
    p_qualification_outcome TEXT DEFAULT NULL,
    p_disqualification_reason TEXT DEFAULT NULL,
    p_restore_from_archive BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_staff public.crm_staff_members;
    v_current public.consultations%ROWTYPE;
    v_updated public.consultations%ROWTYPE;
    v_activity_id UUID;
    v_now TIMESTAMPTZ := now();
    v_retention TEXT;
    v_qual_outcome TEXT;
BEGIN
    v_staff := crm_private.writer(p_actor_staff_id);
    v_current := crm_private.lock_lead(p_lead_id, p_expected_version);
    IF p_new_status IS NULL OR NOT (p_new_status = ANY(CASE v_current.status
        WHEN 'new' THEN ARRAY['contacted','qualified','survey_booked','archived']
        WHEN 'contacted' THEN ARRAY['new','qualified','survey_booked','quoted','archived']
        WHEN 'qualified' THEN ARRAY['contacted','survey_booked','quoted','archived']
        WHEN 'survey_booked' THEN ARRAY['contacted','qualified','quoted','archived']
        WHEN 'quoted' THEN ARRAY['contacted','qualified','survey_booked','contract_signed','archived']
        WHEN 'contract_signed' THEN ARRAY['quoted','installed','archived']
        WHEN 'installed' THEN ARRAY['contract_signed','archived']
        WHEN 'archived' THEN ARRAY['new','contacted','qualified','survey_booked','quoted']
        ELSE ARRAY[]::text[] END)) THEN
        RAISE EXCEPTION 'INVALID_STAGE_TRANSITION';
    END IF;
    IF length(p_reason) > 500 OR length(p_disqualification_reason) > 300 THEN
        RAISE EXCEPTION 'INVALID_STAGE_INPUT';
    END IF;

    IF v_current.status = 'archived' THEN
        IF NOT COALESCE(p_restore_from_archive, false) THEN
            RAISE EXCEPTION 'ARCHIVED_LEAD_LOCKED';
        END IF;
        IF v_staff.role <> 'owner_admin' THEN
            RAISE EXCEPTION 'FORBIDDEN_ARCHIVE_RESTORE';
        END IF;
    END IF;

    IF p_new_status IN ('quoted', 'contract_signed', 'installed', 'archived')
       AND char_length(trim(COALESCE(p_reason, ''))) < 5 THEN
        RAISE EXCEPTION 'EVIDENCE_REASON_REQUIRED';
    END IF;

    v_retention := CASE
        WHEN v_current.retention_category <> 'legal_hold' AND p_new_status IN ('contract_signed', 'installed') THEN 'project_lifecycle_25y'
        ELSE v_current.retention_category
    END;

    v_qual_outcome := CASE
        WHEN p_new_status = 'qualified' THEN COALESCE(p_qualification_outcome, 'qualified')
        ELSE COALESCE(p_qualification_outcome, v_current.qualification_outcome)
    END;

    UPDATE public.consultations
    SET status = p_new_status,
        stage_updated_at = v_now,
        last_activity_at = v_now,
        last_contacted_at = CASE WHEN p_new_status = 'contacted' AND last_contacted_at IS NULL THEN v_now ELSE last_contacted_at END,
        qualified_at = CASE WHEN p_new_status = 'qualified' AND qualified_at IS NULL THEN v_now ELSE qualified_at END,
        qualification_outcome = v_qual_outcome,
        disqualification_reason = COALESCE(p_disqualification_reason, disqualification_reason),
        retention_category = v_retention,
        crm_version = crm_version + 1
    WHERE id = p_lead_id
    RETURNING * INTO v_updated;

    v_activity_id := crm_private.audit(p_lead_id, v_staff, 'stage_changed', NULL,
        jsonb_build_object('status', v_current.status, 'crm_version', v_current.crm_version,
            'qualification_outcome', v_current.qualification_outcome),
        jsonb_build_object('status', v_updated.status, 'crm_version', v_updated.crm_version,
            'qualification_outcome', v_updated.qualification_outcome), p_reason);
    RETURN jsonb_build_object('lead', to_jsonb(v_updated), 'activity_id', v_activity_id);
END;
$$;

CREATE FUNCTION public.crm_atomic_update_lead_with_audit(p_lead_id uuid, p_expected_version int,
    p_patch jsonb, p_actor_staff_id uuid, p_action_type text, p_note_body text, p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    actor public.crm_staff_members := crm_private.writer(p_actor_staff_id);
    prior public.consultations := crm_private.lock_lead(p_lead_id, p_expected_version);
    result public.consultations;
    permitted text[];
    before_state jsonb;
    after_state jsonb;
    event_id uuid;
BEGIN
    IF jsonb_typeof(p_patch) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'INVALID_PATCH'; END IF;
    CASE p_action_type
        WHEN 'owner_assigned' THEN
            permitted := ARRAY['assigned_staff_id'];
            IF NOT p_patch ? 'assigned_staff_id' THEN RAISE EXCEPTION 'MISSING_ASSIGNEE'; END IF;
            IF actor.role <> 'owner_admin' AND ((p_patch->>'assigned_staff_id')::uuid IS DISTINCT FROM actor.id
                OR (prior.assigned_staff_id IS NOT NULL AND prior.assigned_staff_id <> actor.id)) THEN
                RAISE EXCEPTION 'FORBIDDEN_ASSIGNMENT' USING ERRCODE = '42501';
            END IF;
            IF p_patch->>'assigned_staff_id' IS NOT NULL THEN
                PERFORM crm_private.writer((p_patch->>'assigned_staff_id')::uuid);
            END IF;
        WHEN 'note_added' THEN
            permitted := ARRAY['qualification_outcome','disqualification_reason'];
            IF length(btrim(coalesce(p_note_body,''))) NOT BETWEEN 2 AND 1000
                OR length(p_patch->>'disqualification_reason') > 300 THEN RAISE EXCEPTION 'INVALID_NOTE'; END IF;
        WHEN 'data_corrected' THEN
            permitted := ARRAY['client_name','city','pin_code','discom_code','monthly_bill_inr','roof_area_sqft','company_name'];
            IF p_patch = '{}' OR length(btrim(coalesce(p_reason,''))) NOT BETWEEN 5 AND 500
                OR jsonb_strip_nulls(p_patch) <> p_patch
                OR length(btrim(p_patch->>'client_name')) NOT BETWEEN 2 AND 100
                OR length(btrim(p_patch->>'city')) NOT BETWEEN 2 AND 100
                OR p_patch->>'pin_code' !~ '^[1-9][0-9]{5}$'
                OR length(p_patch->>'discom_code') > 50 OR length(p_patch->>'company_name') > 150
                OR (p_patch->>'monthly_bill_inr')::numeric NOT BETWEEN 0 AND 100000000
                OR (p_patch->>'roof_area_sqft')::numeric NOT BETWEEN 0 AND 5000000 THEN
                RAISE EXCEPTION 'INVALID_CORRECTION';
            END IF;
        ELSE RAISE EXCEPTION 'INVALID_ACTION';
    END CASE;
    IF p_patch - permitted <> '{}' THEN RAISE EXCEPTION 'INVALID_PATCH_FIELDS'; END IF;
    IF EXISTS (SELECT FROM jsonb_each(p_patch) AS field
        WHERE CASE WHEN field.key IN ('roof_area_sqft','monthly_bill_inr') THEN jsonb_typeof(field.value) <> 'number'
                   WHEN field.key = 'assigned_staff_id' THEN jsonb_typeof(field.value) NOT IN ('string','null')
                   ELSE jsonb_typeof(field.value) <> 'string' END) THEN
        RAISE EXCEPTION 'INVALID_PATCH_TYPE';
    END IF;
    result := jsonb_populate_record(prior, p_patch);
    UPDATE public.consultations SET assigned_staff_id = result.assigned_staff_id,
        client_name = result.client_name, city = result.city, pin_code = result.pin_code,
        discom_code = result.discom_code, monthly_bill_inr = result.monthly_bill_inr,
        roof_area_sqft = result.roof_area_sqft, company_name = result.company_name,
        qualification_outcome = result.qualification_outcome, disqualification_reason = result.disqualification_reason,
        last_activity_at = now(), crm_version = crm_version + 1
    WHERE id = prior.id RETURNING * INTO STRICT result;
    SELECT jsonb_object_agg(key, to_jsonb(prior)->key), jsonb_object_agg(key, to_jsonb(result)->key)
        INTO before_state, after_state FROM jsonb_object_keys(p_patch) AS key;
    event_id := crm_private.audit(prior.id, actor, p_action_type, p_note_body, before_state, after_state, p_reason);
    RETURN jsonb_build_object('lead', to_jsonb(result), 'activity_id', event_id);
END;
$$;

CREATE FUNCTION public.crm_mutate_followup(p_lead_id uuid, p_expected_version int, p_actor_staff_id uuid,
    p_action text, p_task_id uuid, p_assignee uuid, p_due_at timestamptz, p_task_type text,
    p_note text, p_contact_confirmed boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    actor public.crm_staff_members := crm_private.writer(p_actor_staff_id);
    lead public.consultations := crm_private.lock_lead(p_lead_id, p_expected_version);
    prior public.crm_followup_tasks;
    result public.crm_followup_tasks;
    event_id uuid;
BEGIN
    IF p_action IN ('followup_rescheduled','followup_completed') THEN
        SELECT * INTO prior FROM public.crm_followup_tasks WHERE id = p_task_id AND lead_id = lead.id FOR UPDATE;
        IF NOT FOUND THEN RAISE EXCEPTION 'TASK_NOT_FOUND'; END IF;
        IF prior.status <> 'pending' THEN RAISE EXCEPTION 'CONCURRENT_MODIFICATION_CONFLICT' USING ERRCODE = 'PT409'; END IF;
        IF prior.assigned_staff_id <> actor.id AND actor.role <> 'owner_admin' THEN
            RAISE EXCEPTION 'FORBIDDEN_TASK' USING ERRCODE = '42501';
        END IF;
    END IF;
    IF p_action IN ('followup_scheduled','followup_rescheduled') THEN
        PERFORM crm_private.writer(p_assignee);
        IF p_assignee <> actor.id AND actor.role <> 'owner_admin' THEN RAISE EXCEPTION 'FORBIDDEN_ASSIGNMENT' USING ERRCODE = '42501'; END IF;
        IF p_due_at IS NULL OR NOT isfinite(p_due_at) THEN RAISE EXCEPTION 'INVALID_DUE_DATE'; END IF;
    END IF;
    CASE p_action
        WHEN 'followup_scheduled' THEN
            IF length(btrim(coalesce(p_note,''))) NOT BETWEEN 3 AND 300 THEN RAISE EXCEPTION 'INVALID_SUMMARY'; END IF;
            INSERT INTO public.crm_followup_tasks(lead_id, assigned_staff_id, created_by_staff_id, task_type, due_at, summary)
                VALUES (lead.id, p_assignee, actor.id, p_task_type, p_due_at, p_note) RETURNING * INTO STRICT result;
        WHEN 'followup_rescheduled' THEN
            IF length(btrim(coalesce(p_note,''))) NOT BETWEEN 2 AND 300 THEN RAISE EXCEPTION 'INVALID_REASON'; END IF;
            UPDATE public.crm_followup_tasks SET assigned_staff_id = p_assignee, due_at = p_due_at, updated_at = now()
                WHERE id = prior.id RETURNING * INTO STRICT result;
        WHEN 'followup_completed' THEN
            IF length(btrim(coalesce(p_note,''))) NOT BETWEEN 2 AND 500 THEN RAISE EXCEPTION 'INVALID_COMPLETION_NOTE'; END IF;
            UPDATE public.crm_followup_tasks SET status = 'completed', completed_at = now(), completion_note = p_note, updated_at = now()
                WHERE id = prior.id RETURNING * INTO STRICT result;
        ELSE RAISE EXCEPTION 'INVALID_TASK_ACTION';
    END CASE;
    UPDATE public.consultations SET next_followup_at = (SELECT min(due_at) FROM public.crm_followup_tasks
        WHERE lead_id = lead.id AND status = 'pending'), last_activity_at = now(), crm_version = crm_version + 1,
        last_contacted_at = CASE WHEN p_action = 'followup_completed' AND p_contact_confirmed THEN now() ELSE last_contacted_at END
        WHERE id = lead.id;
    event_id := crm_private.audit(lead.id, actor, p_action, p_note, to_jsonb(prior), to_jsonb(result) ||
        jsonb_build_object('customer_contact_confirmed', p_action = 'followup_completed' AND p_contact_confirmed), NULL);
    RETURN jsonb_build_object('id', result.id, 'activity_id', event_id);
END;
$$;

CREATE FUNCTION public.crm_log_privacy_request(p_lead_id uuid, p_expected_version int, p_actor_staff_id uuid,
    p_type text, p_status text, p_summary text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    actor public.crm_staff_members := crm_private.writer(p_actor_staff_id);
    lead public.consultations;
    request_id uuid;
    event_id uuid;
BEGIN
    IF actor.role <> 'owner_admin' THEN RAISE EXCEPTION 'FORBIDDEN_PRIVACY' USING ERRCODE = '42501'; END IF;
    lead := crm_private.lock_lead(p_lead_id, p_expected_version);
    IF length(btrim(coalesce(p_summary,''))) NOT BETWEEN 5 AND 500 THEN RAISE EXCEPTION 'INVALID_SUMMARY'; END IF;
    INSERT INTO public.crm_privacy_requests(lead_id, request_type, status, responsible_staff_id, resolution_summary, resolved_at)
        VALUES (lead.id, p_type, p_status, actor.id, p_summary, CASE WHEN p_status = 'fulfilled' THEN now() END)
        RETURNING id INTO STRICT request_id;
    UPDATE public.consultations SET do_not_contact = do_not_contact OR p_type = 'consent_withdrawal',
        consent_withdrawn_at = CASE WHEN p_type = 'consent_withdrawal' THEN coalesce(consent_withdrawn_at, now()) ELSE consent_withdrawn_at END,
        last_activity_at = now(), crm_version = crm_version + 1 WHERE id = lead.id;
    event_id := crm_private.audit(lead.id, actor, 'privacy_request_logged', NULL, jsonb_build_object('do_not_contact',lead.do_not_contact),
        jsonb_build_object('privacy_request_id',request_id,'request_type',p_type,'status',p_status,
            'do_not_contact',lead.do_not_contact OR p_type = 'consent_withdrawal'), p_summary);
    RETURN jsonb_build_object('id', request_id, 'activity_id', event_id);
END;
$$;
REVOKE ALL ON FUNCTION public.crm_transition_lead_stage(uuid,uuid,text,int,text,text,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_transition_lead_stage(uuid,uuid,text,int,text,text,text,boolean) TO service_role;
REVOKE ALL ON FUNCTION public.crm_atomic_update_lead_with_audit(uuid,int,jsonb,uuid,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_atomic_update_lead_with_audit(uuid,int,jsonb,uuid,text,text,text) TO service_role;
REVOKE ALL ON FUNCTION public.crm_mutate_followup(uuid,int,uuid,text,uuid,uuid,timestamptz,text,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_mutate_followup(uuid,int,uuid,text,uuid,uuid,timestamptz,text,text,boolean) TO service_role;
REVOKE ALL ON FUNCTION public.crm_log_privacy_request(uuid,int,uuid,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crm_log_privacy_request(uuid,int,uuid,text,text,text) TO service_role;
