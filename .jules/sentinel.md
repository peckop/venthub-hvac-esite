## 2024-05-24 - [Security Headers]
**Vulnerability:** Next.js projesinde default güvenlik başlıklarının (HSTS, X-Frame-Options, vb.) olmaması, uygulamanın Clickjacking, DNS sızıntısı ve MIME type sniffing gibi saldırılara potansiyel olarak maruz kalmasına neden oluyor. Ayrıca `next.config.mjs` de görsel (image) domainlerinin `**` şeklinde açık bırakılması bir SSRF potansiyeli yaratıyor.
**Learning:** Next.js projelerinde varsayılan konfigürasyonda herhangi bir güvenlik başlığı atanmaz. Iyzico gibi dış kaynakları kullanan sayfalarda güvenlik başlıklarını çok katı tutmak Iframe içeriklerini bozabileceği için CSP (Content Security Policy) yerine şimdilik Defense-in-Depth kapsamında temel 5 başlık (X-DNS-Prefetch-Control, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) tercih edilmiştir.
**Prevention:** Yeni Next.js uygulamaları kurulduğunda veya major bir version upgrade'inde standart Security Header tanımlarının her zaman `async headers()` içine eklenmesi gereklidir.

## 2024-03-16 - [Medium] Reverse Tabnabbing (Missing rel="noopener noreferrer")
**Vulnerability:** Several `<a>` and `<Link>` elements with `target="_blank"` were missing the `rel="noopener noreferrer"` attribute.
**Learning:** This exposes the application to Reverse Tabnabbing attacks, where the newly opened tab can access the original window's `window.opener` object, potentially allowing a malicious site to redirect the original tab to a phishing page.
**Prevention:** Always add `rel="noopener noreferrer"` to external links that open in a new tab (`target="_blank"`).
