## 2026-05-30T19:05:59Z
Your task is to implement Milestone 2 (Tier 1 & 2 Test Suite) of the E2E Testing Track:
1. Under `tests/e2e/`, implement 6 test suite files representing our 6 target features, with exactly 10 test cases in each (5 Tier 1 Feature Coverage cases + 5 Tier 2 Boundary & Corner cases, totaling 60 test cases):
   - `tests/e2e/resolution.test.ts`: Tests subdomain resolving, custom domains, default fallbacks, header/cookie propagation, invalid domains, empty headers, dev-mode bypass, and resolution edge cases.
   - `tests/e2e/isolation.test.ts`: Tests isolated query, isolated insert, programmatic RLS check, super_admin RLS bypass, cross-tenant update block, cross-tenant delete block, tenant-hopping block, and SQL-injection/contaminations.
   - `tests/e2e/auth.test.ts`: Tests JWT claims, RBAC guards, signup metadata, login/logout, invalid/expired JWT redirections, missing claims, malformed signatures, and raw metadata tampering protection.
   - `tests/e2e/cache.test.ts`: Tests composite cache keys `[key, lang, tenantId]`, tag-based invalidations, tenant cache boundaries, language isolations, tag overlap collision checks, and empty tenant context lookups.
   - `tests/e2e/features.test.ts`: Tests `getTenantConfig` (server-side), `useTenant` (client-side), dynamic styling (theme injection), 3D orbit flag rendering, default tenant flags, missing/corrupt JSONB parsing, and RSC hook protections.
   - `tests/e2e/webhooks.test.ts`: Tests webhook HMAC validations, realtime channel isolation (`admin-orders-realtime-${tenantId}`), storage bucket paths, stale replay timestamps (>5 mins), invalid HMAC keys, order number collisions, and webhook serialization errors.

2. Ensure all tests use the helpers in `tests/e2e/helpers/` (i.e., `mockRequest.ts`, `mockDb.ts`, and `denoRuntime.ts`) to simulate the runtime environments accurately.
3. Run the test command `pnpm run test:e2e` to verify all 60 test cases pass cleanly.
4. Run `pnpm run type-check` to verify that there are no TypeScript compilation errors.
5. Write a handoff report at `c:\Users\alize\venthub-hvac\.agents\worker_e2e_tiers12\handoff.md`.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
