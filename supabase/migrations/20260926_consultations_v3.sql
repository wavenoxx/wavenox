-- WAVENOX Architectural Solar — Migration v3
-- Fix enterprise company fields and expand source check constraint
-- File: supabase/migrations/20260926_consultations_v3.sql

-- 1. Add company_name and company_url columns for enterprise / commercial leads
ALTER TABLE public.consultations 
    ADD COLUMN IF NOT EXISTS company_name TEXT,
    ADD COLUMN IF NOT EXISTS company_url TEXT;

-- 2. Expand source check constraint to include net_metering and architects forms
ALTER TABLE public.consultations 
    DROP CONSTRAINT IF EXISTS consultations_source_check;

ALTER TABLE public.consultations 
    ADD CONSTRAINT consultations_source_check 
    CHECK (source IS NULL OR source IN ('drawer', 'studio', 'enterprise', 'net_metering', 'architects'));

-- 3. Index on company_name for CRM searching
CREATE INDEX IF NOT EXISTS idx_consultations_company_name ON public.consultations (company_name);
