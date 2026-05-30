# Project Plan: VentHub Multi-Tenant SaaS Foundation (Phase 1)

This plan outlines the architecture, milestone decomposition, specialists delegated, and constraints adhered to in order to transform VentHub's single-tenant HVAC platform into a production-ready, multi-tenant SaaS foundation.

---

## 1. Architectural Strategy & Design Constraints

### A. Core HVAC Physics Engine Agnosticism
- **Rule**: Keep `hvacCalculations.ts` completely pristine, unaffected, and tenant-agnostic.
- **Result**: Core physics and HVAC math operate strictly on inputs, with multi-tenancy handled at the persistence, caching, routing, and access control layers.

### B. Edge-Safe Tenant Resolution (R3)
- **Rule**: Next.js Edge Middleware must resolve tenants statically in under 50ms without executing direct database queries to comply with edge limits.
- **Result**: Created an Edge-safe resolver (`src/lib/tenantResolver.ts`) mapping hosts and subdomains to active tenant records. Localhost maps dynamically to the default tenant UUID in development, while production domains resolve on the fly.

### C. Database Multi-Tenancy & Golden Triad (R1, R10)
- **Rule**: PostgreSQL schema isolation must strictly follow the Golden Triad rule: `GRANT` -> `ENABLE ROW LEVEL SECURITY` -> `CREATE POLICY` in that exact order.
- **Result**: Extended 21 tables with indexed `tenant_id` columns, seeded default tenant `'d3b07384-d113-495f-a558-8c38634e0000'` (slug `'default'`), and utilized a security definer dynamic RLS helper `jwt_tenant_id()` with a locked search path to prevent tenant-hopping.

### D. Zero-Cheating Integrity Policy
- **Rule**: No dummy implementations, hardcoded test strings, or mock bypasses in production code. Must pass independent Forensic Auditing with a CLEAN verdict.
- **Result**: Fully programmatic RLS boundaries, authentic webhooks, and genuine isolated channels.

---

## 2. Milestone Decomposition & Delegation

### Milestone 1: Database & Schema Isolation
- **Scope**: Extended 21 tables with `tenant_id`, indexes, dynamic `jwt_tenant_id()` RPC, updated 108 existing RLS policies under the Golden Triad, seeded default tenant.
- **Specialist Assigned**: Database Sub-Orchestrator (`sub_orch_m1` - Conv ID `744ad993-7877-41e9-925f-575cb8954dbc`)
- **Status**: **100% COMPLETE & AUDITED (CLEAN)**

### Milestone 2: Middleware, Domain Resolution & Auth Linkage
- **Scope**: `tenantResolver.ts` static mapper, `middleware.ts` header/cookie decoration, Supabase Auth metadata trigger hooks, profiles sync.
- **Specialist Assigned**: Middleware Sub-Orchestrator (`sub_orch_m2` - Conv ID `c61ebd5e-14be-426b-a262-9dc3f90f4762`)
- **Status**: **100% COMPLETE & AUDITED (CLEAN)**

### Milestone 3: Caching, Feature Flags & Realtime Isolation
- **Scope**: Isolated Next.js dynamic `unstable_cache` composite keys and revalidation tags per tenant, hybrid server/client feature flag contexts (`getTenantConfig()` & `useTenant()`), dynamic realtime subscriptions.
- **Specialist Assigned**: Cache & Feature Flags Sub-Orchestrator (`sub_orch_m3` - Conv ID `50d60b74-c44d-4922-bdd8-75a6ccdc2299`)
- **Status**: **100% COMPLETE & AUDITED (CLEAN)**

### Milestone 4: Edge Functions, Storage Policies & Email Branding
- **Scope**: Tenant parameter context mapping on Deno endpoints, webhook collision prevention check, product images bucket RLS with prefix checking, dynamic brand email variables.
- **Specialist Assigned**: Webhooks & Storage Sub-Orchestrator (`sub_orch_m4` - Conv ID `db2e1a66-a1fa-4332-a9a3-eb9aef6e5f45`)
- **Status**: **100% COMPLETE & AUDITED (CLEAN)**

### Milestone 5: E2E Verification & Adversarial Hardening
- **Scope**: Compiles with 0 TypeScript type errors, successful production `next build`, independent E2E track with 79 tests passing cleanly, and 10 Tier 5 adversarial tests checking for folder escapes, claims bypass, and CSS injection.
- **Specialists Assigned**: E2E Testing Orchestrator (`sub_orch_e2e`), Integration Worker (`worker_m5`), Adversarial Challenger (`challenger_m5`), and Forensic Auditor (`auditor_final`).
- **Status**: **100% COMPLETE & AUDITED (CLEAN)**

---

## 3. Retrospective Notes
- **Sandboxed Deno Concurrency**: High-concurrency test runs in Vitest caused race conditions when unlinking the same temporary compiled files. Process-isolated random suffix naming resolved thread collisions instantly.
- **Sentry/Webpack Windows Workaround**: Legacy webpack page-manifest compilation hooks on Windows systems were bypassed via custom App Router rules, keeping production telemetry stable.
