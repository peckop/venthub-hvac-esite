# Plan: Implement Milestone 3 (Tier 3 & 4 Test Suite)

This plan details the implementation of pairwise feature interaction tests and comprehensive workload scenario tests for VentHub's E2E testing framework.

## 1. Implement `tests/e2e/pairwise.test.ts`
This suite will contain at least 6 pairwise feature interaction test cases covering major feature intersections:

- **Case 1: Tenant Resolution (F1) + Database Isolation (F2)**:
  - Dynamic resolution of `Tenant A` host header routing down to DB RLS to ensure correct isolation.
  - Test will simulate two distinct subdomains, resolve them, configure the `MockDatabaseEngine`'s security context, and query products, checking that each retrieves only its respective tenant's seeded records.

- **Case 2: Database Isolation (F2) + Auth JWT/Profiles (F3)**:
  - Checking that updating a user profile RLS correctly matches the JWT `tenant_id` claim.
  - Test will seed profiles, set the security context using JWT tenant ID, and attempt to update self profile (success) versus other profile (blocked/no changes).

- **Case 3: Tenant Resolution (F1) + Feature Flags (F5)**:
  - Checking that subdomain routing resolves different feature configurations.
  - Test will simulate requests to `engineering` and `sales`, resolving to specific tenant IDs, and asserting that the retrieved server-side feature flags match their target registries.

- **Case 4: Cache Key Isolation (F4) + Webhooks/Realtime (F6)**:
  - Checking that database change webhooks invalidate only the specific tenant's cache keys.
  - Test will cache product portals for `Tenant A` and `Tenant B`, then simulate a webhook invalidating cache for `Tenant A` only, proving `Tenant B`'s cache remains untouched.

- **Case 5: Feature Flags (F5) + Auth JWT/Profiles (F3)**:
  - Checking that depending on user profile RBAC and tenant flags, UI features render differently.
  - Test will define a UI feature renderer and test various matrix combinations of user role (admin/sales/customer) and tenant feature flags (`enableAdvancedAnalytics` true/false).

- **Case 6: Cache Key Isolation (F4) + Database Isolation (F2)**:
  - Checking that reading from isolated tables populates separated cache entries, and cache bypass correctly respects DB RLS.
  - Test will verify that cached entries represent only respective tenant products, and using `bypassCache: true` directly queries the DB and respects DB RLS.

## 2. Implement `tests/e2e/scenarios.test.ts`
This suite will contain at least 5 comprehensive, realistic workload scenario test cases:

- **Scenario 1: Multi-Tenant Onboarding & Interaction (F1, F2, F3, F5)**:
  - Flow: Onboard `tenant-new-999` with subdomain `new-hvac`, set flags (`enable3DViewer: true`), create user `new-user` as admin. Simulate dashboard request, dynamically resolve tenant, verify flags, perform DB queries ensuring isolation.

- **Scenario 2: Double-Tenant Checkout & Stock Check (F2, F6)**:
  - Flow: Two tenants running checkouts concurrently on stock-limited products. Decrement stocks in respective tenant catalogs and verify no race conditions, leaks, or cross-contamination.

- **Scenario 3: Cross-Tenant Leakage Attack Simulation (F1, F2, F4, F6)**:
  - Flow: Act as a malicious user on `Tenant A`. Try to query `Tenant B`'s products, inject `Tenant B`'s `tenant_id` into session, try to invalidate `Tenant B`'s cache, and intercept `Tenant B`'s webhooks. Assert that all are blocked/denied.

- **Scenario 4: Webhook Concurrency Collision (F6)**:
  - Flow: Simulate multiple webhooks simultaneously firing updates with overlapping order numbers (`ORD-COL-100`) from `Tenant A` and `Tenant B`. Verify correct `tenant_id` scope mapping so that only the targeted order updates.

- **Scenario 5: Custom Domain Resolution Edge Case (F1, F2)**:
  - Flow: Test domain resolution with complex paths, trailing slashes, and locale prefixes (e.g. `https://custom-hvac.com/tr/admin/dashboard/`). Verify that the tenant is correctly resolved and maps downstream database contexts without route loss.

## 3. Verification & Execution
- Run `pnpm run test:e2e` to verify all 79 tests pass successfully.
- Run `pnpm run type-check` to confirm no TypeScript compilation errors.
- Write handoff.md under `c:\Users\alize\venthub-hvac\.agents\worker_e2e_tiers34\handoff.md`.
