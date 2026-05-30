## 2026-05-30T19:06:08Z
You are running as a worker subagent with the role of "Database & RLS Implementer".
Your working directory is `c:\Users\alize\venthub-hvac\.agents\worker_m1`.
Your parent is the Milestone 1 Database Sub-Orchestrator (conversation ID: 744ad993-7877-41e9-925f-575cb8954dbc).

You are tasked with designing and implementing the database migration for the multi-tenant SaaS foundation transition.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please execute the following steps meticulously:
1. Initialize your `BRIEFING.md` and `progress.md` in your working directory `c:\Users\alize\venthub-hvac\.agents\worker_m1`.
2. Inspect the codebase, specifically the existing migrations under `supabase/migrations/` and the explorer analysis reports in `c:\Users\alize\venthub-hvac\.agents\sub_orch_m1\explorer_analysis.md` and `c:\Users\alize\venthub-hvac\.agents\sub_orch_m1\parsed_policies.json`.
3. Create a version-controlled, idempotent Supabase migration SQL file under `supabase/migrations/` named `20260530220000_tenant_schema_setup.sql`.
4. In this migration file, implement the following:
   a. Create the `public.tenants` table if it does not exist, with columns: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `name text NOT NULL UNIQUE`, `subdomain text UNIQUE`, `custom_domain text UNIQUE`, `is_active boolean NOT NULL DEFAULT true`, `created_at timestamptz NOT NULL DEFAULT now()`.
   b. Apply the Golden Triad rule to `public.tenants` in this exact sequence:
      - `GRANT SELECT ON public.tenants TO anon;`
      - `GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO authenticated;`
      - `GRANT ALL ON public.tenants TO service_role;`
      - `ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;`
      - Recreate policies for `public.tenants`:
        - A SELECT policy permitting `anon` and `authenticated` access (`USING (true)`).
        - An ALL policy permitting `service_role` access (`USING (true)`).
   c. Populate a default tenant row:
      - ID: `'d3b07384-d113-495f-a558-8c38634e0000'`
      - Name: `'Default Tenant'`
      - Subdomain: `'default'`
      - is_active: `true`
      Using `ON CONFLICT (id) DO NOTHING;` to guarantee idempotency.
   d. Establish the dynamic JWT claims resolver RPC helper function `public.jwt_tenant_id()` returning `uuid`.
      - It must extract `tenant_id` from `app_metadata` in the JWT (`current_setting('request.jwt.claims', true)`).
      - If missing or empty, it must fall back to the default tenant ID `'d3b07384-d113-495f-a558-8c38634e0000'`.
      - Specify `SECURITY DEFINER` and explicitly set `SET search_path = public, pg_catalog;` for security.
   e. Add `tenant_id` column to all 20 Tenant-Aware tables identified by the explorer:
      1. `shopping_carts`
      2. `cart_items`
      3. `venthub_orders`
      4. `venthub_order_items`
      5. `venthub_returns`
      6. `coupons`
      7. `inventory_movements`
      8. `inventory_settings`
      9. `price_lists`
      10. `product_prices`
      11. `order_attachments`
      12. `order_notes`
      13. `order_refund_events`
      14. `user_profiles`
      15. `user_addresses`
      16. `user_invoice_profiles`
      17. `wizard_selections`
      18. `shipping_email_events`
      19. `shipping_webhook_events`
      20. `returns_webhook_events`
      Use idempotent commands:
      ```sql
      ALTER TABLE public.<table_name> ADD COLUMN IF NOT EXISTS tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE;
      ```
   f. For each of these 20 Tenant-Aware tables, create an index on the foreign key column `tenant_id` to ensure optimal lookup performance:
      ```sql
      CREATE INDEX IF NOT EXISTS idx_<table_name>_tenant_id ON public.<table_name>(tenant_id);
      ```
   g. Apply the Golden Triad rule for all 20 Tenant-Aware tables. Explicitly:
      - Grant permissions (`anon` -> SELECT; `authenticated` -> SELECT, INSERT, UPDATE, DELETE; `service_role` -> ALL).
      - Enable RLS: `ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;`.
      - Recreate all existing RLS policies on these tables to check `tenant_id = public.jwt_tenant_id()`. (e.g. `DROP POLICY IF EXISTS <policy_name> ON public.<table_name>; CREATE POLICY <policy_name> ON public.<table_name> ... USING (tenant_id = public.jwt_tenant_id() AND ...)`).
      - For UPDATE policies, you MUST specify both `USING` and `WITH CHECK` conditions checking `tenant_id = public.jwt_tenant_id()`.
5. Execute/verify the migration on the database:
   - Check if the local Supabase container/Docker is running. If yes, apply the migration.
   - If not, verify the SQL file syntactically for Postgres compliance.
6. Run the TypeScript compiler type-check (`pnpm run type-check`) to ensure type safety across the application codebase.
7. Write a detailed handoff report in `handoff.md` inside your working directory with the details of your changes, the migration filename, compilation results, and any warnings.
8. Send a completion message to your parent conversation ID 744ad993-7877-41e9-925f-575cb8954dbc when complete.

Do not touch `hvacCalculations.ts` under any circumstances (it is strictly tenant-agnostic).

## 2026-05-30T19:10:29Z
**Context**: Database Schema & RLS Implementation (Milestone 1)
**Content**: Our parent agent has notified us of a critical requirement from `ORIGINAL_REQUEST.md` (Requirement R1.3): The `admin_audit_log` table must NOT be tenant-agnostic. It MUST be tenant-aware. We need to add the `tenant_id` column to `admin_audit_log` so that super_admins can audit operations relative to specific tenants.
**Action**: Please ensure that your migration script design does the following:
1. Includes `admin_audit_log` as a Tenant-Aware table in the migration SQL file `20260530220000_tenant_schema_setup.sql`.
2. Alters `admin_audit_log` to include `tenant_id uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES public.tenants(id) ON DELETE CASCADE`.
3. Creates a foreign key index `idx_admin_audit_log_tenant_id` on the `tenant_id` column.
4. Applies the Golden Triad rule to `admin_audit_log`: Grants access to `authenticated`/`service_role`, enables RLS, and drops/recreates its RLS policies (`admin_audit_log_select_v2`, `admin_audit_log_insert_v2`, etc.) to check `tenant_id = jwt_tenant_id()`.
Please confirm receipt of this instruction and that it is integrated into your draft.

