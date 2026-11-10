# WAVENOX — Antigravity 2.0 Continuation Handoff

**Updated:** 10 November 2026  
**Repository:** `https://github.com/wavenoxx/wavenox`  
**Main Baseline (Merged Step 8 PR #12):** `3cab87aa15c66b7eb29e9bffdc77dfe3fd8976c5` (source commit `d8583ec91510753d0f7b6ce6ed7cabf9b556a48b`)  
**Final Release-Gate Repair Branch:** `fix/wavenox-step8-final-release-gates`

---

## 1. Workspace & Worktree Topology

- **Preserved Historical Checkout (DO NOT MODIFY OR RESET):** `/Users/bunny/.gemini/antigravity/scratch/wavenox` (remains untouched on `feat/wavenox-step5-crm-attribution` at `f1e7645b366a448e99d3ac644c4f1df3f5af6750` with 5 local uncommitted files).
- **Clean Continuation Worktree:** `/Users/bunny/.gemini/antigravity/scratch/wavenox-step8` tracking `fix/wavenox-step8-final-release-gates` from `origin/main` (`3cab87aa15c66b7eb29e9bffdc77dfe3fd8976c5`).

---

## 2. Completed Roadmap Summary (Steps 1–8)

1. **Steps 1–2:** Brand architecture, calm architectural design system, DPDP consent-first lead pipeline (`LIVE` fail-closed default vs explicit `DEMO` simulation), and responsive media pipeline.
2. **Step 3:** Regulatory tariff and solar financial engine (`src/config/solar.ts`, `src/config/regulatory.ts`, `src/config/sources.ts`) with TGERC FY 2026–27 telescopic slabs, TGERC Regulation No. 1 of 2025 monthly billing-period settlement (`₹2.57/kWh` verified proceeding rate for TGSPDCL/TGNPDCL), APERC LT-I(A) schedule, PM Surya Ghar CFA (`₹30,000`/`₹60,000`/`₹78,000`), and SBI PM Surya Ghar loan tiers (`6.00%` / `8.15%` p.a. effective 15 Oct 2026, direct-to-loan Month-6 DBT prepayment recast).
3. **Step 4:** Intelligent Solar Configurator & Personalized Design Studio (`/deploy`) with deterministic recommendation engine (`src/config/recommendation.ts`), manual override preservation, rooftop feasibility, and battery backup guidance.
4. **Step 5:** Private internal CRM (`/ops`), multi-touch attribution, role-based staff authorization (`owner_admin`, `sales_coordinator`, `read_only_viewer` with server-side PII masking), and server-only Supabase RPCs with mandatory transactional audit rows (`supabase/migrations/20261106_step5_crm_and_attribution.sql`, `20261106190500_step5_crm_server_only_audit_hardening.sql`).
5. **Step 6:** Ephemeral local bill preview and redaction (`src/lib/bill-document.ts`), server-only OpenAI bill extraction adapter (`src/server/bill-extraction.ts`, disabled by default unless `BILL_AI_ENABLED=true`), mandatory human review (`src/components/BillIntelligence.tsx`), and measured rectangle/L-shape roof obstruction planner (`src/components/RoofSketcher.tsx`).
6. **Step 7:** Customer installation journey portal (`/portal`), approved email OTP + 1-hour HttpOnly opaque session (`src/server/project-http.ts`, `src/server/project-store.ts`), 10 private project tables and atomic audited RPCs (`supabase/migrations/20261108174500_step7_installation_journey_portal.sql`), and private reviewed image document delivery (`src/server/project-files.ts`).
7. **Step 8 & Final Release-Gate Continuation:**
   - Cross-instance staff logout revocation check (`supabase/migrations/20261109182756_step8_staff_session_revocation.sql`, `crm_session_is_active`).
   - Bounded server error logging (`src/lib/error-capture.ts`), bounded phone rate-limiter (`2,000` active keys), and unified SSR/static security and cache headers (`src/server/response-policy.ts`, `src/server.ts`).
   - Sitemap (`16` public routes, no fabricated `<lastmod>`) and `robots.txt` (`/portal`, `/ops`, `/api/`, `/_serverFn/` disallowed).
   - Resolution of all 6 mobile `scrollable-region-focusable` Axe violations (`/warranty`, `/about-this-project`, `/legal/disclosures` at `320px` and `390px`) and `/deploy` mobile LCP (`4,913.7 ms` -> `3,751.7 ms`, performance score `82` -> `89`, TBT `60 ms` -> `0 ms`).
   - Restoration of `.github/workflows/step5-hardening.yml` triggers for `pull_request` to `main` and `push` to `main` and `fix/wavenox-step8-final-release-gates`.

---

## 3. Non-Negotiable Production Guardrails

- **Do NOT** run production database migrations or restore/modify Supabase project `razcywkwnpgxgjbwdjdj` without explicit operator approval and a verified backup/restore rehearsal (`docs/STEP8_DEPLOYMENT_RUNBOOK.md`).
- **Do NOT** enable `BILL_AI_ENABLED=true` or `PORTAL_EMAIL_ENABLED=true` in production until quota, cost alerts, SMTP templates, and privacy reviews are signed off (`docs/STEP8_PRODUCTION_READINESS.md`).
- **Do NOT** set `BRAND_CONFIG.status` to `"active"` or promote a Vercel deployment to production until legal/commercial identity and release sign-off are completed.
