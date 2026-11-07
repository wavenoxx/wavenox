-- WAVENOX Architectural Solar — Migration v4 (Step 5)
-- Private CRM, Staff Authorization, Follow-Up Operations, Immutable Audit Log & Multi-Touch Attribution
-- File: supabase/migrations/20261106_step5_crm_and_attribution.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. STAFF MEMBERSHIP & ROLE REGISTRY (Invite-Only Server-Controlled Allowlist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crm_staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner_admin', 'sales_coordinator', 'read_only_viewer')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_staff_members_auth_user_id ON public.crm_staff_members (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_crm_staff_members_active_role ON public.crm_staff_members (is_active, role);

COMMENT ON TABLE public.crm_staff_members IS 'Server-controlled staff allowlist binding Supabase Auth user IDs to WAVENOX CRM roles.';

-- ============================================================================
-- 2. ADDITIVE CRM, ATTRIBUTION & PRIVACY EXTENSIONS ON public.consultations
-- ============================================================================
ALTER TABLE public.consultations
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES public.crm_staff_members(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS next_followup_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS qualified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS qualification_outcome TEXT,
    ADD COLUMN IF NOT EXISTS disqualification_reason TEXT,
    ADD COLUMN IF NOT EXISTS stage_updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS crm_version INT NOT NULL DEFAULT 1,
    -- Multi-touch marketing attribution fields (additive to existing utm_* columns)
    ADD COLUMN IF NOT EXISTS first_touch_source TEXT,
    ADD COLUMN IF NOT EXISTS first_touch_medium TEXT,
    ADD COLUMN IF NOT EXISTS first_touch_campaign TEXT,
    ADD COLUMN IF NOT EXISTS first_touch_landing_path TEXT,
    ADD COLUMN IF NOT EXISTS first_touch_referrer_domain TEXT,
    ADD COLUMN IF NOT EXISTS first_touch_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_touch_source TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_medium TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_campaign TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_landing_path TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_referrer_domain TEXT,
    ADD COLUMN IF NOT EXISTS last_touch_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS conversion_path TEXT,
    ADD COLUMN IF NOT EXISTS attribution_channel TEXT,
    ADD COLUMN IF NOT EXISTS click_id_type TEXT,
    ADD COLUMN IF NOT EXISTS click_id_value TEXT,
    -- Privacy & retention governance flags
    ADD COLUMN IF NOT EXISTS retention_category TEXT NOT NULL DEFAULT 'enquiry_24m',
    ADD COLUMN IF NOT EXISTS consent_withdrawn_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS do_not_contact BOOLEAN NOT NULL DEFAULT false;

-- Constrain new enum-like columns idempotently
ALTER TABLE public.consultations
    DROP CONSTRAINT IF EXISTS consultations_qualification_outcome_check;
ALTER TABLE public.consultations
    ADD CONSTRAINT consultations_qualification_outcome_check
    CHECK (qualification_outcome IS NULL OR qualification_outcome IN ('pending', 'qualified', 'disqualified', 'nurture'));

ALTER TABLE public.consultations
    DROP CONSTRAINT IF EXISTS consultations_attribution_channel_check;
ALTER TABLE public.consultations
    ADD CONSTRAINT consultations_attribution_channel_check
    CHECK (attribution_channel IS NULL OR attribution_channel IN ('paid_search', 'paid_social', 'organic_search', 'referral', 'direct', 'unknown'));

ALTER TABLE public.consultations
    DROP CONSTRAINT IF EXISTS consultations_click_id_type_check;
ALTER TABLE public.consultations
    ADD CONSTRAINT consultations_click_id_type_check
    CHECK (click_id_type IS NULL OR click_id_type IN ('gclid', 'gbraid', 'wbraid', 'fbclid'));

ALTER TABLE public.consultations
    DROP CONSTRAINT IF EXISTS consultations_retention_category_check;
ALTER TABLE public.consultations
    ADD CONSTRAINT consultations_retention_category_check
    CHECK (retention_category IN ('enquiry_24m', 'project_lifecycle_25y', 'legal_hold'));

-- Operational CRM indexes
CREATE INDEX IF NOT EXISTS idx_consultations_assigned_staff_id ON public.consultations (assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_consultations_next_followup_at ON public.consultations (next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultations_source ON public.consultations (source);
CREATE INDEX IF NOT EXISTS idx_consultations_attribution_channel ON public.consultations (attribution_channel);
CREATE INDEX IF NOT EXISTS idx_consultations_utm_campaign ON public.consultations (utm_campaign);
CREATE INDEX IF NOT EXISTS idx_consultations_city ON public.consultations (city);
CREATE INDEX IF NOT EXISTS idx_consultations_discom_code ON public.consultations (discom_code);

-- ============================================================================
-- 3. IMMUTABLE LEAD ACTIVITY & AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crm_lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    actor_staff_id UUID REFERENCES public.crm_staff_members(id) ON DELETE SET NULL,
    actor_label TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (
        action_type IN (
            'lead_created',
            'stage_changed',
            'owner_assigned',
            'note_added',
            'followup_scheduled',
            'followup_completed',
            'followup_rescheduled',
            'qualification_updated',
            'data_corrected',
            'privacy_request_logged'
        )
    ),
    note_body TEXT,
    before_state JSONB,
    after_state JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_lead_activities_lead_created ON public.crm_lead_activities (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_lead_activities_action_type ON public.crm_lead_activities (action_type);

-- Prevent UPDATE or DELETE on audit events so CRM history is append-only
CREATE OR REPLACE FUNCTION public.prevent_crm_activity_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'crm_lead_activities is an immutable append-only audit log; UPDATE and DELETE are prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_crm_activity_mutation ON public.crm_lead_activities;
CREATE TRIGGER trg_prevent_crm_activity_mutation
    BEFORE UPDATE OR DELETE ON public.crm_lead_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_crm_activity_mutation();

COMMENT ON TABLE public.crm_lead_activities IS 'Append-only audit trail of CRM stage transitions, ownership changes, staff notes, follow-ups, and data corrections.';

-- ============================================================================
-- 4. FOLLOW-UP TASKS TABLE (Stored in UTC, Displayed in Asia/Kolkata IST)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crm_followup_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    assigned_staff_id UUID NOT NULL REFERENCES public.crm_staff_members(id) ON DELETE RESTRICT,
    created_by_staff_id UUID REFERENCES public.crm_staff_members(id) ON DELETE SET NULL,
    task_type TEXT NOT NULL CHECK (
        task_type IN (
            'call',
            'whatsapp_review',
            'bill_review',
            'site_survey_confirm',
            'quote_followup',
            'contract_followup'
        )
    ),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    due_at TIMESTAMPTZ NOT NULL,
    summary TEXT NOT NULL CHECK (char_length(summary) BETWEEN 2 AND 500),
    completed_at TIMESTAMPTZ,
    completion_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_followup_tasks_lead_id ON public.crm_followup_tasks (lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_followup_tasks_assigned_status_due ON public.crm_followup_tasks (assigned_staff_id, status, due_at ASC);
CREATE INDEX IF NOT EXISTS idx_crm_followup_tasks_status_due ON public.crm_followup_tasks (status, due_at ASC);

COMMENT ON TABLE public.crm_followup_tasks IS 'Scheduled internal follow-up actions for solar consultations. Never implies automatic customer communication.';

-- ============================================================================
-- 5. PRIVACY & DATA PRINCIPAL REQUEST REGISTER (DPDP Act Governance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crm_privacy_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('access', 'correction', 'erasure', 'consent_withdrawal')),
    status TEXT NOT NULL DEFAULT 'received' CHECK (
        status IN (
            'received',
            'identity_verification_pending',
            'under_review',
            'fulfilled',
            'rejected_retention_mandate'
        )
    ),
    responsible_staff_id UUID REFERENCES public.crm_staff_members(id) ON DELETE SET NULL,
    resolution_summary TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_privacy_requests_lead_id ON public.crm_privacy_requests (lead_id);

-- ============================================================================
-- 6. ATOMIC TRANSACTIONAL RPC FUNCTIONS FOR MULTI-TABLE CRM MUTATIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.crm_transition_lead_stage(
    p_lead_id UUID,
    p_actor_staff_id UUID,
    p_actor_label TEXT,
    p_new_status TEXT,
    p_expected_version INT,
    p_reason TEXT DEFAULT NULL,
    p_qualification_outcome TEXT DEFAULT NULL,
    p_disqualification_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current RECORD;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_retention TEXT;
BEGIN
    SELECT id, status, crm_version, qualification_outcome, retention_category
    INTO v_current
    FROM public.consultations
    WHERE id = p_lead_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'LEAD_NOT_FOUND';
    END IF;

    IF v_current.crm_version <> p_expected_version THEN
        RAISE EXCEPTION 'CONCURRENT_MODIFICATION_CONFLICT';
    END IF;

    v_retention := CASE
        WHEN p_new_status IN ('contract_signed', 'installed') THEN 'project_lifecycle_25y'
        ELSE v_current.retention_category
    END;

    UPDATE public.consultations
    SET status = p_new_status,
        stage_updated_at = v_now,
        last_activity_at = v_now,
        qualified_at = CASE WHEN p_new_status = 'qualified' AND qualified_at IS NULL THEN v_now ELSE qualified_at END,
        qualification_outcome = COALESCE(p_qualification_outcome, qualification_outcome),
        disqualification_reason = COALESCE(p_disqualification_reason, disqualification_reason),
        retention_category = v_retention,
        crm_version = crm_version + 1
    WHERE id = p_lead_id;

    INSERT INTO public.crm_lead_activities (
        lead_id,
        actor_staff_id,
        actor_label,
        action_type,
        before_state,
        after_state,
        reason,
        created_at
    ) VALUES (
        p_lead_id,
        p_actor_staff_id,
        p_actor_label,
        'stage_changed',
        jsonb_build_object('status', v_current.status, 'crm_version', v_current.crm_version),
        jsonb_build_object('status', p_new_status, 'crm_version', v_current.crm_version + 1),
        p_reason,
        v_now
    );

    RETURN jsonb_build_object(
        'lead_id', p_lead_id,
        'previous_status', v_current.status,
        'new_status', p_new_status,
        'crm_version', v_current.crm_version + 1,
        'updated_at', v_now
    );
END;
$$;

-- ============================================================================
-- 7. ZERO-TRUST GRANTS & EXPLICIT STAFF-VERIFIED ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_followup_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_privacy_requests ENABLE ROW LEVEL SECURITY;

-- Revoke all default public and anonymous privileges on CRM tables
REVOKE ALL ON public.consultations FROM PUBLIC, anon;
REVOKE ALL ON public.crm_staff_members FROM PUBLIC, anon;
REVOKE ALL ON public.crm_lead_activities FROM PUBLIC, anon;
REVOKE ALL ON public.crm_followup_tasks FROM PUBLIC, anon;
REVOKE ALL ON public.crm_privacy_requests FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.crm_transition_lead_stage(UUID, UUID, TEXT, TEXT, INT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- Helper functions that resolve the caller's verified active staff role from crm_staff_members
CREATE OR REPLACE FUNCTION public.get_active_crm_staff_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.crm_staff_members
    WHERE auth_user_id = auth.uid()
      AND is_active = true
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_active_crm_staff_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id
    FROM public.crm_staff_members
    WHERE auth_user_id = auth.uid()
      AND is_active = true
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_active_crm_staff_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_active_crm_staff_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_active_crm_staff_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_active_crm_staff_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.crm_transition_lead_stage(UUID, UUID, TEXT, TEXT, INT, TEXT, TEXT, TEXT) TO service_role;

-- Explicit table grants for authenticated role (subject to strict RLS predicates below)
GRANT SELECT, UPDATE ON public.consultations TO authenticated;
GRANT SELECT ON public.crm_staff_members TO authenticated;
GRANT SELECT, INSERT ON public.crm_lead_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.crm_followup_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.crm_privacy_requests TO authenticated;

-- Drop any legacy or prior policies before creating strict role-checked policies
DROP POLICY IF EXISTS "Public can submit VIP solar consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins have full access to consultation records" ON public.consultations;
DROP POLICY IF EXISTS "Public can insert consultations" ON public.consultations;
DROP POLICY IF EXISTS "crm_staff_select_consultations" ON public.consultations;
DROP POLICY IF EXISTS "crm_staff_update_consultations" ON public.consultations;

-- Consultations: Only active provisioned CRM staff can read; only owner_admin or sales_coordinator can update
CREATE POLICY "crm_staff_select_consultations"
    ON public.consultations
    FOR SELECT
    TO authenticated
    USING (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator', 'read_only_viewer')
    );

CREATE POLICY "crm_staff_update_consultations"
    ON public.consultations
    FOR UPDATE
    TO authenticated
    USING (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator')
    )
    WITH CHECK (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator')
    );

-- Staff Members: Active staff can read staff directory; only owner_admin can mutate
DROP POLICY IF EXISTS "crm_staff_select_members" ON public.crm_staff_members;
DROP POLICY IF EXISTS "crm_owner_manage_members" ON public.crm_staff_members;

CREATE POLICY "crm_staff_select_members"
    ON public.crm_staff_members
    FOR SELECT
    TO authenticated
    USING (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator', 'read_only_viewer')
    );

CREATE POLICY "crm_owner_manage_members"
    ON public.crm_staff_members
    FOR ALL
    TO authenticated
    USING (public.get_active_crm_staff_role() = 'owner_admin')
    WITH CHECK (public.get_active_crm_staff_role() = 'owner_admin');

-- Lead Activities: Active staff can read; only owner_admin or sales_coordinator can insert matching their staff ID
DROP POLICY IF EXISTS "crm_staff_select_activities" ON public.crm_lead_activities;
DROP POLICY IF EXISTS "crm_staff_insert_activities" ON public.crm_lead_activities;

CREATE POLICY "crm_staff_select_activities"
    ON public.crm_lead_activities
    FOR SELECT
    TO authenticated
    USING (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator', 'read_only_viewer')
    );

CREATE POLICY "crm_staff_insert_activities"
    ON public.crm_lead_activities
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator')
        AND actor_staff_id = public.get_active_crm_staff_id()
    );

-- Follow-Up Tasks: Active staff can read; only owner_admin or sales_coordinator can create/update
DROP POLICY IF EXISTS "crm_staff_select_tasks" ON public.crm_followup_tasks;
DROP POLICY IF EXISTS "crm_staff_insert_tasks" ON public.crm_followup_tasks;
DROP POLICY IF EXISTS "crm_staff_update_tasks" ON public.crm_followup_tasks;

CREATE POLICY "crm_staff_select_tasks"
    ON public.crm_followup_tasks
    FOR SELECT
    TO authenticated
    USING (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator', 'read_only_viewer')
    );

CREATE POLICY "crm_staff_insert_tasks"
    ON public.crm_followup_tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator')
    );

CREATE POLICY "crm_staff_update_tasks"
    ON public.crm_followup_tasks
    FOR UPDATE
    TO authenticated
    USING (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator')
    )
    WITH CHECK (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator')
    );

-- Privacy Requests: Only owner_admin or sales_coordinator can read; only owner_admin can insert/update
DROP POLICY IF EXISTS "crm_staff_select_privacy_requests" ON public.crm_privacy_requests;
DROP POLICY IF EXISTS "crm_owner_manage_privacy_requests" ON public.crm_privacy_requests;

CREATE POLICY "crm_staff_select_privacy_requests"
    ON public.crm_privacy_requests
    FOR SELECT
    TO authenticated
    USING (
        public.get_active_crm_staff_role() IN ('owner_admin', 'sales_coordinator')
    );

CREATE POLICY "crm_owner_manage_privacy_requests"
    ON public.crm_privacy_requests
    FOR ALL
    TO authenticated
    USING (public.get_active_crm_staff_role() = 'owner_admin')
    WITH CHECK (public.get_active_crm_staff_role() = 'owner_admin');
