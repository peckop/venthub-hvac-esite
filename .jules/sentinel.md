## 2025-05-24 - Missing RBAC in admin-update-order Edge Function
**Vulnerability:** The `admin-update-order` Supabase Edge Function relied on a hardcoded static `x-admin-key` header to authenticate and authorize admin actions, which is insecure and lacks auditability.
**Learning:** This existed likely as an early shortcut before proper Supabase Auth was integrated into Edge Functions. Admin endpoints need strict Role-Based Access Control tied to individual user identities, not shared secrets.
**Prevention:** For secure Supabase Edge Functions (admin endpoints), avoid relying on static custom headers (e.g., `x-admin-key`). Instead, enforce RBAC by extracting the `Authorization` header, verifying the user with `auth.getUser()`, and checking `user_profiles.role` using a `SUPABASE_SERVICE_ROLE_KEY` scoped client.
## YYYY-MM-DD - Insecure JWT parsing in Supabase Edge Functions
**Vulnerability:** Edge Functions like `iyzico-refund` were manually parsing JWTs using `atob` and `JSON.parse` to extract the `sub` (user ID) instead of validating the signature securely via `auth.getUser()`.
**Learning:** This existed because of missing strict checks. Without signature validation, anyone could forge a JWT with an arbitrary `sub` to spoof an admin or another user.
**Prevention:** In Supabase Edge Functions, never manually parse or base64 decode JWTs to extract user identity (`sub`). Always use `supabase.auth.getUser()` or a direct `fetch` to `${supabaseUrl}/auth/v1/user` passing the `Authorization` header to securely validate the token and extract the user ID.
## 2025-05-25 - Mock refund bypass via unsigned JWT parsing
**Vulnerability:** The `refund-order-mock` Edge Function was manually base64-decoding the JWT token using a `parseJwt` function to extract the `sub` (actorUserId) to authorize mock refunds without validating the token signature.
**Learning:** This is a repeating pattern across multiple Edge Functions. The presence of `parseJwt` functions in multiple files indicates a systemic misunderstanding of secure token validation when bypassing standard auth flows.
**Prevention:** As previously recorded, never use manual JWT parsing (`atob`). Always use `createClient` with `global: { headers: { Authorization: authHeader } }` and call `auth.getUser()` to securely retrieve the user identity, even in "mock" endpoints that modify state.
## 2024-05-18 - Missing Authentication in Order Validate Endpoint
**Vulnerability:** IDOR (Insecure Direct Object Reference) and missing authentication in `supabase/functions/order-validate/index.ts`. The endpoint relied on the `userId` provided in the request body to validate carts and fetch `user_profiles`, bypassing standard token checks.
**Learning:** Edge Functions acting on behalf of a specific user must proactively verify the caller's identity via `auth.getUser()` using the `Authorization` header instead of relying entirely on the payload data, even if the primary operations are driven by a Service Role Key.
**Prevention:** Always extract `user.id` from `auth.getUser()` securely for sensitive operations rather than trusting request payloads. Ensure early return (401 Unauthorized) when authorization headers are missing.
## 2026-04-15 - Unprotected Cron Job Vulnerability
**Vulnerability:** The `order-housekeeping` Edge Function lacked any authentication or RBAC validation, allowing anyone to trigger database cleanup tasks unauthenticated.
**Learning:** Cron jobs and system tasks in Supabase Edge Functions must be protected either by checking the Service Role key in the Authorization header or by enforcing `auth.getUser()` and RBAC for manual admin execution. Without this, they are vulnerable to DoS attacks or unauthorized invocations.
**Prevention:** Always validate the `Authorization` header in cron endpoints to ensure the caller is either the system (Service Role key) or an authorized human (admin with valid token). Use a bypass pattern like `if (authHeader !== \`Bearer ${serviceRoleKey}\`)` to safely support both.

## 2025-02-27 - Added RBAC checks to notification-service Edge Function
**Vulnerability:** The notification-service Supabase Edge Function lacked authorization entirely. There was no checks for an `Authorization` header, meaning anyone could invoke the endpoint to send arbitrary WhatsApp, SMS, or Emails, resulting in abuse, phishing and Twilio/Resend cost spikes.
**Learning:** Supabase Edge Functions default to being open and executing securely within Deno. Any custom admin API endpoint needs explicit code handling the auth/JWT validation by fetching `user_profiles.role` or trusting the `SUPABASE_SERVICE_ROLE_KEY`.
**Prevention:** Make sure admin/internal endpoints (like `notification-service`) implement system bypass using `SUPABASE_SERVICE_ROLE_KEY` or enforce RBAC via `authClient.auth.getUser()`. Never assume a function is private just because it's undocumented.
## 2024-04-17 - Missing authorization checks in Edge Functions

**Learning:** System-invoked Supabase Edge functions (like cron jobs or webhook endpoints acting internally) must actively verify `req.headers.get('Authorization')` strictly matches `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`. Otherwise, they are vulnerable to unauthorized external invocations that could brute force system actions or leak information.
**Action:** Next time creating or auditing an edge function that is internal-only or cron-invoked, ensure to check for the Authorization header match before proceeding with operations.

## 2026-04-08 - Fixed Edge Function Auth Bypass and Initplan Vulnerability
**Learning:** System endpoints (e.g. `order-confirmation`, `stock-alert`) must not restrict callers *only* to `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` without fallback. If they do, they block legitimate admin callers using standard session tokens (which triggers 401s). The correct pattern is to check if the header matches the Service Role Key for system bypass, and if false, construct an auth client using `SUPABASE_ANON_KEY`, call `auth.getUser()`, and verify RBAC. Also, using `id = auth.uid()` in RLS policies breaks PostgreSQL initplan caching; it must always be wrapped as `id = (SELECT auth.uid())`.
**Action:** Always implement a system bypass fallback that verifies the caller via `auth.getUser()` and role lookup when designing webhook or cron edge functions. Also, always wrap `auth.uid()` in a sub-select when defining Row Level Security.
