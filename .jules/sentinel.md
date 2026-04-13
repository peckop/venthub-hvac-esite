## 2025-05-24 - Missing RBAC in admin-update-order Edge Function
**Vulnerability:** The `admin-update-order` Supabase Edge Function relied on a hardcoded static `x-admin-key` header to authenticate and authorize admin actions, which is insecure and lacks auditability.
**Learning:** This existed likely as an early shortcut before proper Supabase Auth was integrated into Edge Functions. Admin endpoints need strict Role-Based Access Control tied to individual user identities, not shared secrets.
**Prevention:** For secure Supabase Edge Functions (admin endpoints), avoid relying on static custom headers (e.g., `x-admin-key`). Instead, enforce RBAC by extracting the `Authorization` header, verifying the user with `auth.getUser()`, and checking `user_profiles.role` using a `SUPABASE_SERVICE_ROLE_KEY` scoped client.
## YYYY-MM-DD - Insecure JWT parsing in Supabase Edge Functions
**Vulnerability:** Edge Functions like `iyzico-refund` were manually parsing JWTs using `atob` and `JSON.parse` to extract the `sub` (user ID) instead of validating the signature securely via `auth.getUser()`.
**Learning:** This existed because of missing strict checks. Without signature validation, anyone could forge a JWT with an arbitrary `sub` to spoof an admin or another user.
**Prevention:** In Supabase Edge Functions, never manually parse or base64 decode JWTs to extract user identity (`sub`). Always use `supabase.auth.getUser()` or a direct `fetch` to `${supabaseUrl}/auth/v1/user` passing the `Authorization` header to securely validate the token and extract the user ID.
## 2025-05-24 - Insecure JWT parsing in refund-order-mock Edge Function
**Vulnerability:** The `refund-order-mock` Edge Function was manually base64-decoding the JWT using `atob` and extracting the `sub` to determine user identity without validating the signature or expiration.
**Learning:** This existed because of missing strict checks. Without signature validation, anyone could forge a token and impersonate any user, including an admin.
**Prevention:** In Supabase Edge Functions, never manually parse or base64 decode JWTs to extract user identity (`sub`). Always use `supabase.auth.getUser()` passing the `Authorization` header to securely validate the token and extract the user ID.
