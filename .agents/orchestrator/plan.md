# Project Plan: VentHub Supabase Security Hardening & Admin Login Fix

This plan outlines the architecture, milestone decomposition, specialists delegated, and constraints adhered to in order to restore admin login capability and eliminate database security advisories.

---

## 1. Architectural Strategy & Design Constraints

### A. Admin Login Recovery (R1 & R6)
- **RLS Recursion Loop**: Replace the `is_admin_user()` lookup in the `user_profiles` `SELECT` RLS policy with an inline claim-based check. This breaks the recursion where `user_profiles` RLS queries itself.
- **Secure RBAC Role Hook**: Deploy a custom access token JWT hook to dynamically insert `user_role` into JWT claims upon login. Configure middleware to decode and read this secure claim, removing reliance on insecure user-metadata.

### B. Attack Surface Reduction (R2 - R10)
- **GraphQL Shielding**: Add comment directives (`@graphql({"disabled": true})`) to all non-public/sensitive tables to hide them from the GraphQL engine, merging with existing comments where applicable.
- **Storage Policy Hardening**: Restrict bucket list actions on `product-images` while maintaining single-file public access.
- **Function Execution Privileges**: Clean up execution rights on 30 security definer functions, restricting admin, stock, and trigger routines to `service_role` and appropriate system roles, while leaving RLS helpers accessible.
- **Secret Hygiene & Cleanup**: Remove hardcoded webhook secrets, enforce `search_path = public` on webhook triggers, and drop obsolete debug functions.

### C. Zero Regression & Dual-Track Verification
- The core HVAC physics engine must remain untouched.
- All database modifications must be packaged as standard, idempotent migrations in `supabase/migrations/`.
- Frontend code must not be altered, except for the JWT claim read in `src/middleware.ts`.
- Success requires passing all 89 E2E tests and reducing security warnings in `get_advisors({type: 'security'})` to 0.

---

## 2. Milestone Decomposition & Work Items

### Milestone 1: Admin Login & Auth Hook Integration (R1 + R6)
- Fix RLS recursion on `user_profiles` SELECT policy.
- Create `custom_access_token_hook()` database function and configure hooks schema privileges.
- Update `src/middleware.ts` to decode JWT token and read `user_role` claim.
- **Specialists**: Explorer (investigates current schemas and setup) -> Worker (creates migration and edits middleware) -> Reviewers -> Auditor.

### Milestone 2: Database Shielding & Function Hardening (R2, R3, R4, R5, R7, R8, R9, R10)
- GraphQL comments disabling exposure.
- Storage bucket listing restriction.
- Drop obsolete/duplicate RLS policies.
- Fix `handle_supabase_webhook` `search_path`.
- Revoke public execution on 30 functions.
- Webhook secret environment check and debug functions drop.
- Revoke anon `SELECT` privileges on sensitive tables.
- **Specialists**: Explorer -> Worker (creates migration) -> Reviewers -> Auditor.

### Milestone 3: E2E Verification & Security Advisories Resolution
- Run E2E test suite (`pnpm run test:e2e`).
- Verify types and lint checks.
- Verify `get_advisors` security warning count drops to target levels.
- **Specialists**: Challenger -> Auditor.
