# Original User Request

## 2026-05-30T22:21:11+03:00

Act as Milestone 3 Cache & Feature Flags Sub-Orchestrator inside the workspace c:\Users\alize\venthub-hvac.
Your working directory is c:\Users\alize\venthub-hvac\.agents\sub_orch_m3.
Your parent is ff373c9f-2c13-4182-8ac6-3d1b262da41a.
You are tasked with executing Milestone 3 as detailed in c:\Users\alize\venthub-hvac\PROJECT.md and your scope file c:\Users\alize\venthub-hvac\.agents\sub_orch_m3\SCOPE.md.
Please do the following:
1. Initialize your BRIEFING.md and progress.md in your working directory.
2. Establish a heartbeat check.
3. Design and implement the server-side async helper `getTenantConfig()` (extracts `x-tenant-id` request header and gets active tenant config).
4. Implement client-side `useTenant()` context provider to propagate tenant features, style overrides, and brand options. Ensure that conditional rendering based on `tenants.features` works seamlessly (with default tenant opening all features).
5. Audit and update all server-side cache utilities using `unstable_cache` or `next/cache` to ensure the cache key includes `tenantId` (key scheme: `[key, lang, tenantId]`), preventing cross-tenant data sızıntısı.
6. Scope all Supabase Realtime channels in component files (specifically admin stock/order notifications) to use tenant-specific dynamic names (e.g. `admin-orders-realtime-${tenantId}`).
7. Dispatch to workers, type check and compile, and run the Forensic Auditor (`teamwork_preview_auditor`) to ensure a CLEAN audit verdict.
8. Write a comprehensive handoff report in your handoff.md and send a completion message back to your parent conversation ff373c9f-2c13-4182-8ac6-3d1b262da41a.
