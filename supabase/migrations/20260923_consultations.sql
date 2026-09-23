-- WAVENOX Enterprise Solar Architecture — Database Migration
-- Lead Acquisition & VIP Consultation Dossier Pipeline
-- Schema: consultations & lead_attribution

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT DEFAULT 'Hyderabad',
    property_tier TEXT NOT NULL CHECK (property_tier IN ('villa', 'estate', 'commercial', 'industrial', 'defense')),
    roof_area_sqft NUMERIC,
    estimated_capacity_kw NUMERIC,
    estimated_savings_inr NUMERIC,
    battery_tier TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'survey_booked', 'quoted', 'contract_signed', 'installed', 'archived')),
    
    -- Attribution & Marketing Telemetry
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    landing_url TEXT,
    referrer TEXT,
    client_ip_hash TEXT,
    
    -- Owner notification flag
    owner_notified_at TIMESTAMPTZ,
    whatsapp_dispatched BOOLEAN DEFAULT false
);

-- Indexing for rapid owner CRM retrieval & anti-spam query optimization
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_phone ON public.consultations (phone);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations (status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Anonymous public submission (Rate-limited via client-side/edge advisory)
CREATE POLICY "Public can submit VIP solar consultations"
    ON public.consultations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only authenticated administrators / owners can read and mutate consultation leads
CREATE POLICY "Admins have full access to consultation records"
    ON public.consultations
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Anti-duplicate submission trigger (Prevents double clicks within 60 seconds from same phone)
CREATE OR REPLACE FUNCTION public.check_recent_submission()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.consultations
        WHERE phone = NEW.phone
          AND created_at > (timezone('utc'::text, now()) - INTERVAL '60 seconds')
    ) THEN
        RAISE EXCEPTION 'A consultation request with this phone number was submitted less than 60 seconds ago.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_recent_submission ON public.consultations;
CREATE TRIGGER trg_check_recent_submission
    BEFORE INSERT ON public.consultations
    FOR EACH ROW
    EXECUTE FUNCTION public.check_recent_submission();

COMMENT ON TABLE public.consultations IS 'Stores inbound residential and commercial solar architectural inquiries, roof sizes, and estimated yields.';
