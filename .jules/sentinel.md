## 2025-05-24 - Missing RBAC in admin-update-order Edge Function
**Vulnerability:** The `admin-update-order` Supabase Edge Function relied on a hardcoded static `x-admin-key` header to authenticate and authorize admin actions, which is insecure and lacks auditability.
**Learning:** This existed likely as an early shortcut before proper Supabase Auth was integrated into Edge Functions. Admin endpoints need strict Role-Based Access Control tied to individual user identities, not shared secrets.
**Prevention:** For secure Supabase Edge Functions (admin endpoints), avoid relying on static custom headers (e.g., `x-admin-key`). Instead, enforce RBAC by extracting the `Authorization` header, verifying the user with `auth.getUser()`, and checking `user_profiles.role` using a `SUPABASE_SERVICE_ROLE_KEY` scoped client.

## 2024-05-24 - Signature bypass in Custom JWT Parser
**Vulnerability:** Found `parseJwt` functions in `iyzico-refund` and `refund-order-mock` edge functions that locally base64-decoded the JWT to extract the `sub` claim without cryptographic signature verification, allowing token forgery and unauthorized identity spoofing.
**Learning:** Developers sometimes implement local, simple JWT decoding to "save" an API call, severely misunderstanding the security necessity of verifying the signature to ensure authenticity.
**Prevention:** In Supabase Edge Functions, never manually decode JWTs for identity verification. Always use the built-in `auth.getUser()` method or perform a secure `fetch` call to `${supabaseUrl}/auth/v1/user` by passing the provided token.
