## 2026-05-30T19:22:01Z

Analyze Deno Edge Functions in supabase/functions/ (specifically shipping-webhook, iyzico-callback, and other payment/shipping/orders/returns/coupon functions).
1. Identify all database INSERT/UPDATE operations and check if they currently parse tenant_id from URL query string ?tenant_id=xxx or auth headers.
2. Examine order lookups in shipping-webhook and iyzico-callback to see if they query by order_number without checking tenant_id.
3. Recommend a precise fix strategy for modifying these files to ensure correct tenant scoping.
Write your findings to c:\Users\alize\venthub-hvac\.agents\explorer_m4_1\analysis.md and complete your handoff report.
