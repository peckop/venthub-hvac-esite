## 2026-06-02T07:16:37Z
You are the Implementation Worker (Gen 4). Your working directory is c:\Users\alize\venthub-hvac\.agents\worker_m1_gen4.
Please implement the security hardening null-safe fixes to resolve the database authorization bypass vulnerability identified by the Challenger.

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Tasks to Perform:

1. **Create Database Migration (`supabase/migrations/20260602090000_security_hardening_null_fix.sql`)**:
   - Redefine all seven functions to use `COALESCE(auth.role(), '') = 'service_role'` instead of `auth.role() = 'service_role'` in their authorization guard checks:
     - `public.handle_new_user_metadata()`
     - `public.handle_new_user_profile()`
     - `public.set_user_admin_role(user_id UUID, new_role TEXT)`
     - `public.adjust_stock(p_product_id uuid, p_delta int, p_reason text, p_batch_id uuid)`
     - `public.adjust_stock(p_product_id uuid, p_delta int, p_reason text)`
     - `public.set_stock(p_product_id uuid, p_new_qty int, p_reason text, p_batch_id uuid)`
     - `public.set_stock(p_product_id uuid, p_new_qty int, p_reason text)`
   - Make sure all parameters, return types, and SET attributes match the previous definitions exactly.
   - Use `CREATE OR REPLACE FUNCTION ...` inside the migration.

2. **Apply Migration**:
   - Run the newly created migration against the remote database.

3. **Verification**:
   - Run the verification scripts: `node scripts/db/verify_security_hardening.js` and ensure it outputs PASS on all checks (the RPC authentication check should now succeed and block the unauthorized execution when JWT context is empty).
   - Run type checking: `pnpm run type-check`
   - Run linter: `pnpm run lint`
   - Run E2E tests: `pnpm run test:e2e` (confirm all tests pass, including the new security tests added in tests/e2e/challenger_security.test.ts).

Write a detailed handoff report to `c:\Users\alize\venthub-hvac\.agents\worker_m1_gen4\handoff.md` and send me a message with the results of your tests and code changes.
