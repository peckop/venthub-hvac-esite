## 2026-05-30T19:24:43Z
You are tasked with executing the Milestone 4 implementations. You must implement the following four sub-milestones based on the detailed analysis reports of our codebase Explorers:

1. READ ANALYSIS REPORTS:
   - Explorer 1 (Webhooks/DB): c:\Users\alize\venthub-hvac\.agents\explorer_m4_1\analysis.md
   - Explorer 2 (Storage): c:\Users\alize\venthub-hvac\.agents\explorer_m4_2\analysis.md
   - Explorer 3 (Email Branding): c:\Users\alize\venthub-hvac\.agents\explorer_m4_3\analysis.md

2. DATABASE SCHEMA SETUP (Email Config columns):
   - Create a new migration file under `supabase/migrations/` that adds `config` (JSONB), `theme_config` (JSONB), and `features` (JSONB) columns to the `public.tenants` table with `NOT NULL DEFAULT '{}'::jsonb`.
   - Seed the default tenant 'd3b07384-d113-495f-a558-8c38634e0000' with:
     brand_name: 'VentHub', brand_logo_url: 'https://venthub-hvac-esite.vercel.app/images/logo.png', brand_primary_color: '#2563eb', email_from: 'VentHub <onboarding@resend.dev>'

3. WEBHOOK COLLISION GUARD & EDGE FUNCTIONS AUDIT:
   - In `supabase/functions/shipping-webhook/index.ts` and `supabase/functions/iyzico-callback/index.ts`, parse `tenant_id` from the URL parameters or JWT.
   - Restrict all order lookups to match both the order number/ID AND the resolved `tenant_id` to prevent cross-tenant collisions.
   - Inject `tenant_id` into all database INSERT/UPDATE operations within Deno Edge Functions (such as `iyzico-payment/index.ts`, `admin-create-coupon/index.ts`, `admin-update-order/index.ts`, `admin-update-shipping/index.ts`, `returns-webhook/index.ts`, etc.) to prevent NOT NULL constraint errors and guarantee RLS isolation.

4. STORAGE ISOLATION POLICIES:
   - Create a new migration under `supabase/migrations/` to implement Path-Based Tenant Isolation on `storage.objects` table for the `product-images` bucket.
   - Drop the insecure policies: `product_images_read_public`, `product_images_insert_authenticated`, `product_images_insert_admin`, `product_images_update_admin`, `product_images_delete_admin`.
   - Recreate them to verify that the file path prefix (verified as a valid UUID via regex `name ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/'`) matches the user's `public.jwt_tenant_id()` and check user roles inside `public.user_profiles` under that active `tenant_id`.

5. EMAIL BRANDING ISOLATION:
   - Create a Deno shared helper file `supabase/functions/_shared/tenant_config.ts` (with `resolveTenantId` and `getTenantBranding`) supporting fallback to environment variables and hardcoded values.
   - Update `order-confirmation/index.ts`, `delivery-notification/index.ts`, `shipping-notification/index.ts`, `return-status-notification/index.ts`, and `notification-service/index.ts` to dynamically fetch branding parameters based on the active `tenant_id`.

6. VERIFICATION:
   - Compile-check or type-check your Deno functions to ensure they contain no runtime syntax or TypeScript errors.
   - Provide command outputs showing successful compilation/tests.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please write your progress and final handoff report in c:\Users\alize\venthub-hvac\.agents\worker_m4\handoff.md.
