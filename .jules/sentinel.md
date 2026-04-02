## 2024-05-24 - [Security Headers]
**Vulnerability:** Next.js projesinde default güvenlik başlıklarının (HSTS, X-Frame-Options, vb.) olmaması, uygulamanın Clickjacking, DNS sızıntısı ve MIME type sniffing gibi saldırılara potansiyel olarak maruz kalmasına neden oluyor. Ayrıca `next.config.mjs` de görsel (image) domainlerinin `**` şeklinde açık bırakılması bir SSRF potansiyeli yaratıyor.
**Learning:** Next.js projelerinde varsayılan konfigürasyonda herhangi bir güvenlik başlığı atanmaz. Iyzico gibi dış kaynakları kullanan sayfalarda güvenlik başlıklarını çok katı tutmak Iframe içeriklerini bozabileceği için CSP (Content Security Policy) yerine şimdilik Defense-in-Depth kapsamında temel 5 başlık (X-DNS-Prefetch-Control, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) tercih edilmiştir.
**Prevention:** Yeni Next.js uygulamaları kurulduğunda veya major bir version upgrade'inde standart Security Header tanımlarının her zaman `async headers()` içine eklenmesi gereklidir.

## 2024-11-09 - [CRITICAL] Authentication Bypass in Admin Edge Functions
**Vulnerability:** Found `admin-order-inspect` edge function directly invoking an admin RPC via `SUPABASE_SERVICE_ROLE_KEY` without extracting the `Authorization` header and validating `auth.getUser()`, allowing unauthenticated actors to read private orders.
**Learning:** Edge functions are fully detached from Next.js middleware and Supabase RLS policies if they use the `SERVICE_ROLE_KEY`. Relying on Edge Functions to be "obscure" is dangerous.
**Prevention:** Always construct a user-scoped Supabase client (using `createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })`), explicitly call `auth.getUser()`, and query the `user_profiles` table to enforce RBAC before executing any privileged `SERVICE_ROLE_KEY` logic.

## 2024-05-20 - [HIGH] Fix XSS vulnerability in AuthorityRenderer
**Vulnerability:** Found unescaped user-controlled HTML (`rtBlock.content.html`) being passed directly into `dangerouslySetInnerHTML` in the `AuthorityRenderer.tsx` component.
**Learning:** The `dangerouslySetInnerHTML` React prop is inherently risky. If any rich text HTML content from a CMS or external source isn't sanitized correctly prior to rendering, an attacker could potentially inject malicious JavaScript (XSS).
**Prevention:** In Next.js environments, use `isomorphic-dompurify` to safely sanitize the injected HTML on both the server and client (`dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}`).
