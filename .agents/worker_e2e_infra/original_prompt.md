## 2026-05-30T19:02:24Z

You are the E2E Testing Worker. Your working directory is c:\Users\alize\venthub-hvac\.agents\worker_e2e_infra.
Your task is to implement Milestone 1 (Test Infrastructure Design) of the E2E Testing Track:
1. Create the `tests/e2e/` directory and implement high-fidelity test mock utilities under `tests/e2e/helpers/`:
   - `mockRequest.ts`: Helper to simulate Next.js `NextRequest` and `NextResponse` for Edge middleware and API testing. It should allow building requests with custom subdomains, custom domains, cookies, headers, and body payloads, and capture responses including custom headers (`x-tenant-id`) and cookies.
   - `mockDb.ts`: Stateful in-memory database engine (`MockDatabaseEngine`) with support for programmatic RLS filtering based on the active security context (tenant ID and user role: 'super_admin', 'admin', 'customer', etc.). It should intercept Supabase-like query chains (`select`, `insert`, `update`, `delete`, `eq`, `single`, `maybeSingle`, `then`) and simulate RLS boundaries to prevent data bleeding.
   - `denoRuntime.ts`: Simulates the Deno Edge Function environment (`globalThis.Deno` stubbing, env mapping) so we can dynamically import and run Supabase Edge Functions under Vitest, providing fully mock-safe variables.
2. Update `package.json` scripts to add `"test:e2e": "vitest run --config vitest.config.ts --dir tests/e2e"`.
3. Create a quick sanity test `tests/e2e/helpers/sanity.test.ts` to verify the request mock, in-memory DB (RLS isolation), and Deno runner simulator functions correctly. Run this sanity test with vitest to ensure it passes.
4. Verify your work using `pnpm run test:e2e` and ensure the build compile checks pass. Write a handoff report at `c:\Users\alize\venthub-hvac\.agents\worker_e2e_infra\handoff.md`.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
