-- WAVENOX Architectural Solar — Migration v2
-- Lead Pipeline, Consent Auditing, and Zero-Trust RLS Hardening
-- File: supabase/migrations/20260924_consultations_v2.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create table if not present, or alter existing table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT DEFAULT 'Hyderabad',
    property_tier TEXT NOT NULL DEFAULT 'villa',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'survey_booked', 'quoted', 'contract_signed', 'installed', 'archived'))
);

-- 2. Add columns if not existing
ALTER TABLE public.consultations 
    ADD COLUMN IF NOT EXISTS reference_code TEXT,
    ADD COLUMN IF NOT EXISTS pin_code TEXT,
    ADD COLUMN IF NOT EXISTS discom_code TEXT,
    ADD COLUMN IF NOT EXISTS monthly_bill_inr NUMERIC,
    ADD COLUMN IF NOT EXISTS system_kw NUMERIC,
    ADD COLUMN IF NOT EXISTS battery_units INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS net_price_inr NUMERIC,
    ADD COLUMN IF NOT EXISTS source TEXT,
    ADD COLUMN IF NOT EXISTS roof_area_sqft NUMERIC,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS consent_given BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS consent_version TEXT,
    ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS utm_source TEXT,
    ADD COLUMN IF NOT EXISTS utm_medium TEXT,
    ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
    ADD COLUMN IF NOT EXISTS utm_term TEXT,
    ADD COLUMN IF NOT EXISTS utm_content TEXT,
    ADD COLUMN IF NOT EXISTS landing_url TEXT,
    ADD COLUMN IF NOT EXISTS referrer TEXT,
    ADD COLUMN IF NOT EXISTS client_ip_hash TEXT,
    ADD COLUMN IF NOT EXISTS owner_notified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS whatsapp_dispatched BOOLEAN DEFAULT false;

-- Backfill reference_code for any existing rows that might lack one
UPDATE public.consultations 
SET reference_code = 'WNX-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6))
WHERE reference_code IS NULL OR reference_code = '';

-- Enforce NOT NULL and UNIQUE on reference_code
ALTER TABLE public.consultations 
    ALTER COLUMN reference_code SET NOT NULL;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'consultations_reference_code_key'
    ) THEN
        ALTER TABLE public.consultations ADD CONSTRAINT consultations_reference_code_key UNIQUE (reference_code);
    END IF;
END $$;

-- Normalize any legacy property_tier values from v1 before enforcing v2 constraint
UPDATE public.consultations
SET property_tier = 'villa'
WHERE property_tier IN ('estate', 'defense');

UPDATE public.consultations
SET property_tier = 'commercial'
WHERE property_tier = 'industrial';

UPDATE public.consultations
SET property_tier = 'villa'
WHERE property_tier NOT IN ('villa', 'independent_home', 'commercial');

-- Enforce updated check constraint for property_tier: ('villa', 'independent_home', 'commercial')
ALTER TABLE public.consultations 
    DROP CONSTRAINT IF EXISTS consultations_property_tier_check;

ALTER TABLE public.consultations 
    ADD CONSTRAINT consultations_property_tier_check 
    CHECK (property_tier IN ('villa', 'independent_home', 'commercial'));

-- Enforce check constraint for source: ('drawer', 'studio', 'enterprise')
ALTER TABLE public.consultations 
    DROP CONSTRAINT IF EXISTS consultations_source_check;

ALTER TABLE public.consultations 
    ADD CONSTRAINT consultations_source_check 
    CHECK (source IS NULL OR source IN ('drawer', 'studio', 'enterprise'));

-- 3. Indexes for rapid lookups and CRM deduplication
CREATE INDEX IF NOT EXISTS idx_consultations_reference_code ON public.consultations (reference_code);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_phone ON public.consultations (phone);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations (status);

-- 4. Zero-Trust Security: Drop public RLS policies
-- All inserts and queries must go through trusted server-side functions using SUPABASE_SERVICE_ROLE_KEY
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit VIP solar consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins have full access to consultation records" ON public.consultations;
DROP POLICY IF EXISTS "Public can insert consultations" ON public.consultations;

-- 5. Anti-duplicate submission trigger (Prevents double clicks within 60 seconds from same phone)
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

COMMENT ON TABLE public.consultations IS 'Stores inbound residential and commercial solar inquiries with full consent audits, financial snapshots, and reference codes.';
