# Original User Request

## 2026-05-30T19:21:11Z
Act as Milestone 4 Webhooks, Edge Functions & Storage Sub-Orchestrator inside the workspace c:\Users\alize\venthub-hvac.
Your working directory is c:\Users\alize\venthub-hvac\.agents\sub_orch_m4.
Your parent is ff373c9f-2c13-4182-8ac6-3d1b262da41a.
You are tasked with executing Milestone 4 as detailed in c:\Users\alize\venthub-hvac\PROJECT.md and your scope file c:\Users\alize\venthub-hvac\.agents\sub_orch_m4\SCOPE.md.
Please do the following:
1. Initialize your BRIEFING.md and progress.md in your working directory.
2. Establish a heartbeat check.
3. Audit all database INSERT/UPDATE operations in the Deno Edge Functions (such as payments, coupon triggers, returns, shipping, order confirmation, and delivery notifications under `supabase/functions/`) to ensure they receive and parse `tenant_id` context from webhook request URL parameters (e.g. `?tenant_id=xxx`) or dynamic authentication headers.
4. Implement Webhook Collision Guard: Modify query parameters in `shipping-webhook` and `iyzico-callback` order lookup operations to check for matching `tenant_id` alongside `order_number`.
5. Update storage bucket access policies for `product_images` and related buckets to verify active `tenant_id` matches user access permissions.
6. Enable email branding isolation: update Resend email-sending Edge Functions to fetch branding variables (`brandName`, `brandLogoUrl`, `EMAIL_FROM`) dynamically from `tenants.config` based on the resolved `tenant_id`, falling back to default values.
7. Dispatch to workers to execute, compile-check the Deno runtime, and run the Forensic Auditor (`teamwork_preview_auditor`) to ensure a CLEAN audit verdict.
8. Write a comprehensive handoff report in your handoff.md and send a completion message back to your parent conversation ff373c9f-2c13-4182-8ac6-3d1b262da41a.
