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
