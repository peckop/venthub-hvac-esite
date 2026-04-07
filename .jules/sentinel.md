## 2024-05-24 - [Security Headers]
**Vulnerability:** Next.js projesinde default güvenlik başlıklarının (HSTS, X-Frame-Options, vb.) olmaması, uygulamanın Clickjacking, DNS sızıntısı ve MIME type sniffing gibi saldırılara potansiyel olarak maruz kalmasına neden oluyor. Ayrıca `next.config.mjs` de görsel (image) domainlerinin `**` şeklinde açık bırakılması bir SSRF potansiyeli yaratıyor.
**Learning:** Next.js projelerinde varsayılan konfigürasyonda herhangi bir güvenlik başlığı atanmaz. Iyzico gibi dış kaynakları kullanan sayfalarda güvenlik başlıklarını çok katı tutmak Iframe içeriklerini bozabileceği için CSP (Content Security Policy) yerine şimdilik Defense-in-Depth kapsamında temel 5 başlık (X-DNS-Prefetch-Control, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) tercih edilmiştir.
**Prevention:** Yeni Next.js uygulamaları kurulduğunda veya major bir version upgrade'inde standart Security Header tanımlarının her zaman `async headers()` içine eklenmesi gereklidir.

## 2024-11-09 - [CRITICAL] Authentication Bypass in Admin Edge Functions
**Vulnerability:** Found `admin-order-inspect` edge function directly invoking an admin RPC via `SUPABASE_SERVICE_ROLE_KEY` without extracting the `Authorization` header and validating `auth.getUser()`, allowing unauthenticated actors to read private orders.
**Learning:** Edge functions are fully detached from Next.js middleware and Supabase RLS policies if they use the `SERVICE_ROLE_KEY`. Relying on Edge Functions to be "obscure" is dangerous.
**Prevention:** Always construct a user-scoped Supabase client (using `createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })`), explicitly call `auth.getUser()`, and query the `user_profiles` table to enforce RBAC before executing any privileged `SERVICE_ROLE_KEY` logic.
## 2024-05-18 - Supabase Edge Functions Missing Auth Checks
**Vulnerability:** Found multiple Supabase Edge Functions (`admin-orders-latest`, `admin-update-shipping`, `admin-iyzico-reconcile`) completely lacking Authentication and Role-Based Access Control (RBAC), exposing PII and administrative actions to unauthenticated users.
**Learning:** Developers assumed that because a function is an "admin" function and uses `SUPABASE_SERVICE_ROLE_KEY` to interact with the database, it is protected. However, the Edge Function itself is publicly accessible over HTTPS unless explicit checks are implemented against `req.headers.get('Authorization')` and user role validation via `auth/v1/user`.
**Prevention:** Establish a standard authorization wrapper or middleware for all Edge Functions that require admin access. Avoid using raw `Deno.serve` without an auth guard in `supabase/functions/admin-*`.

## 2024-11-20 - [XSS] AuthorityRenderer XSS
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability was reported in `src/components/authority/AuthorityRenderer.tsx` using `dangerouslySetInnerHTML={{ __html: rtBlock.content.html }}`.
**Learning:** During investigation, it was discovered that the vulnerability had already been resolved using `DOMPurify.sanitize(rtBlock.content.html)` with the `isomorphic-dompurify` package.
**Prevention:** Continue strictly enforcing the use of `isomorphic-dompurify` for all dynamic HTML rendering via `dangerouslySetInnerHTML`.
