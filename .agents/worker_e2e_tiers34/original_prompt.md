## 2026-05-30T22:12:10+03:00
You are the E2E Testing Worker. Your working directory is c:\Users\alize\venthub-hvac\.agents\worker_e2e_tiers34.
Your task is to implement Milestone 3 (Tier 3 & 4 Test Suite) of the E2E Testing Track:
1. Implement the following two new test suite files under `tests/e2e/`:
   - `tests/e2e/pairwise.test.ts`: Contains at least 6 pairwise feature interaction test cases covering major feature intersections:
     * Case 1: Tenant Resolution (F1) + Database Isolation (F2) (e.g. dynamic resolution of Tenant A routing down to DB RLS to ensure correct isolation).
     * Case 2: Database Isolation (F2) + Auth JWT/Profiles (F3) (e.g. checking that updating a user profile RLS correctly matches the JWT tenant_id claim).
     * Case 3: Tenant Resolution (F1) + Feature Flags (F5) (e.g. checking that subdomain routing resolves different feature configurations).
     * Case 4: Cache Key Isolation (F4) + Webhooks/Realtime (F6) (e.g. checking that database change webhooks invalidate only the specific tenant's cache keys).
     * Case 5: Feature Flags (F5) + Auth JWT/Profiles (F3) (e.g. checking that depending on user profile RBAC and tenant flags, UI features render differently).
     * Case 6: Cache Key Isolation (F4) + Database Isolation (F2) (e.g. checking that reading from isolated tables populates separated cache entries, and cache bypass correctly respects DB RLS).
   - `tests/e2e/scenarios.test.ts`: Contains at least 5 comprehensive, realistic workload scenario test cases:
     * Scenario 1: Multi-Tenant Onboarding & Interaction (F1, F2, F3, F5) - Onboard a new tenant, create their profile, verify their resolved subdomains, verify feature flags are set, and perform database queries to ensure isolation from other tenants.
     * Scenario 2: Double-Tenant Checkout & Stock Check (F2, F6) - Two tenants concurrently running checkout on products with limited stock. Ensure stock levels are correctly decremented only in their respective tenant catalog without race conditions or cross-contamination.
     * Scenario 3: Cross-Tenant Leakage Attack Simulation (F1, F2, F4, F6) - Act as a malicious user on Tenant A attempting to breach boundaries: query Tenant B's products, inject Tenant B's tenant_id into cookie/JWT metadata, attempt to invalidate Tenant B's cache, and intercept Tenant B's webhook calls. Verify all are blocked.
     * Scenario 4: Webhook Concurrency Collision (F6) - Simultaneously firing webhook updates with overlapping order numbers from multiple tenants. Ensure the webhook correctly targets the appropriate orders by checking `tenant_id` scope and avoids updating the wrong tenant's order.
     * Scenario 5: Custom Domain Resolution Edge Case (F1, F2) - Domain resolution with complex paths, trailing slashes, and locale prefixes. Ensure the tenant is correctly resolved and maps downstream database contexts without any latency or route loss.

2. Ensure all tests use the helpers in `tests/e2e/helpers/` (`mockRequest.ts`, `mockDb.ts`, and `denoRuntime.ts`) to simulate the runtime environments accurately.
3. Run the test command `pnpm run test:e2e` to verify all test cases pass cleanly (should be 79 tests in total: 8 sanity + 60 tiers1-2 + 11 tiers3-4).
4. Run `pnpm run type-check` to verify that there are no TypeScript compilation errors.
5. Write a handoff report at `c:\Users\alize\venthub-hvac\.agents\worker_e2e_tiers34\handoff.md`.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
