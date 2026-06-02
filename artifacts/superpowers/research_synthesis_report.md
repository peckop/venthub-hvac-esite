# Çoklu Ajan Araştırma Sentez Raporu (Research Synthesis Report)

Bu rapor, VentHub HVAC SaaS projesine özel alt temsilcilerin (subagents) ve yeteneklerin (skills) tasarımı için yürütülen Çoklu Ajan Araştırma sürecinin bulgularını ve sentezini içerir. Araştırma kapsamında; 5 GitHub deposu (ECC, claude-code-templates, mattpocock/skills, awesome-skills, superpowers), 3 NotebookLM Dijital İkizi (Agent Skills, Antigravity, VentHub Proje Hafızası) ve yerel VentHub kod tabanı taranmıştır.

---

## 1. Ajan ve Yetenek (Skill) Standardı & Tasarım İlkeleri

Araştırma sonucunda, modern AI kodlama ajanları için yetenek tanımlarının (`SKILL.md`) şu standartlara uyması gerektiği tespit edilmiştir:
1. **Dizin Yapısı:** Yetenekler, kendi klasörleri içinde bir `SKILL.md` (manifest ve temel kurallar), `references/` (ağır dokümantasyonlar) ve `scripts/` (otomasyon scriptleri) olarak ayrılmalıdır.
2. **YAML Frontmatter:** `name`, `description` (tetikleme kurallarıyla "Use when..."), `version`, `allowed-tools` ve `user-invocable` alanları ajanların yeteneği otonom keşfetmesi için zorunludur.
3. **Progressive Disclosure (Aşamalı Bilgi Sunumu):** Ajanın bağlam penceresini (context window) şişirmemek için `SKILL.md` dosyaları 100 satır civarında tutulmalı; detaylı veri tabloları ve örnek kodlar `references/` altındaki dosyalardan sadece ihtiyaç anında okunmalıdır.
4. **SADD (Subagent-Driven Development):** Ana ajanın plan yapıp, her bir spesifik görevi (TDD, RLS testi, WebGL optimizasyonu) geçici, izole bağlama sahip alt temsilcilere delege etmesi hatasız kod üretimini garanti eder.

---

## 2. VentHub SaaS Mimarisi ve Teknik Bulgular

### A. Çoklu Kiracı (Multi-Tenant) ve RLS Güvenliği
- **Golden Triad Mühürü:** Her yeni tablo (1) Explicit yetkilendirmelere (`GRANT`), (2) Row Level Security aktivasyonuna (`ALTER TABLE ENABLE ROW LEVEL SECURITY`) ve (3) Tenant bazlı politikalara tabi olmalıdır.
- **`jwt_tenant_id()` Optimizasyonu:** RLS politikalarında kiracı UUID'si `jwt_tenant_id()` RPC fonksiyonuyla JWT claim'lerinden (`app_metadata.tenant_id`) çekilir.
- **Sonsuz Döngü (Recursion) Koruması:** `user_profiles` tablosuna erişen RLS politikalarında sonsuz döngüyü önlemek için `is_admin_user()` fonksiyonu rol sorgulamalarını veritabanından önce JWT metadata claim'lerinden kontrol etmelidir.
- **GraphQL Kısıtlaması:** `@graphql({"disabled": true})` tablo yorumlarıyla hassas tablolar (audit log, profiles) şemadan gizlenmelidir.

### B. 3D WebGL / React Three Fiber (R3F)
- **Shadow Standardı:** Üçüncü parti kütüphanelerin çökmesini ve `PCFSoftShadowMap` deprecation uyarılarını önlemek için Canvas üzerinde `shadows="percentage"` kullanılmalı ve gölge harita boyutu 2048 piksel olarak ayarlanmalıdır.
- **CSP & CDN Güvenliği:** GLB/GLTF modellerinin dış CDN'lerden sorunsuz yüklenmesi için `next.config.mjs` içindeki CSP `connect-src` ve `img-src` yönergelerinde `raw.githubusercontent.com` ve `raw.githack.com` adresleri beyaz listeye alınmalıdır.
- **PPR (Kısmi Ön Oluşturma):** Arama parametreleri veya client-side hook'lar barındıran 3D sahneler ve filtreler "SSR Zehirlenmesini" engellemek için `<Suspense>` sınırları içine alınmalıdır.

### C. Webhook ve Edge Functions Entegrasyonları
- **HMAC İmza Doğrulama:** Stripe/iyzico/Cal.com gibi API webhook'larında, harici NPM bağımlılıkları yerine SubtleCrypto Web API kullanılarak HMAC-SHA256 doğrulaması yapılmalıdır.
- **Replay Protection (Zaman Damgası Koruması):** Webhook isteklerinde `x-timestamp` değeri okunarak, sunucu saatiyle arasındaki farkın 5 dakikayı (`300000 ms`) aşması durumunda istek reddedilmelidir.
- **Monoton Durum Yönetimi:** Sipariş durumlarının (pending -> confirmed -> shipped -> delivered) geriye gitmesini engellemek için statik bir `RANK` hiyerarşi nesnesi üzerinden durum sıralaması korunmalıdır.

### D. Caching & Tasarım Sistemi Standartları
- **`unstable_cache` İzolasyonu:** Next.js veri önbelleğinde sızıntıları önlemek amacıyla, cache anahtarlarına `lang` ve `tenantId` parametreleri dinamik olarak enjekte edilmelidir (`['home-data', lang, tenantId]`).
- **Tailwind 4 Linter:** Arbitrary bracket stilleri (`w-[92vw]`, `z-[9999]`) ESLint seviyesinde yasaklanmalı, tüm Spacing/Z-Index değerleri `src/design-system/tokens.js` dosyasından okunmalıdır. Renkler white-label uyumu için HSL CSS değişkeni olmalıdır.

---

## 3. VentHub'a Özel 5 Alt Temsilci (Subagent) Tasarımı

Araştırma bulgularına dayanarak VentHub HVAC projesi için aşağıdaki 5 subagent tanımlanmıştır:

### 1. `rls_security_auditor` (Tenant Security & Database RLS Auditor)
*   **Açıklama:** Veritabanı şema değişikliklerini, RLS politikalarını ve kiracı izolasyon sızdırmazlığını denetler.
*   **Araç Grubu:** Read, Write, Bash, Supabase MCP (advisors, migrations)
*   **Görevi:** "Golden Triad" kuralını işletmek, RLS recursion kontrolü yapmak, storage path'lerini UUID ile izole etmek, `app_metadata` dışı `raw_user_meta_data` sorgularını engellemek.

### 2. `r3f_3d_rendering_expert` (WebGL & 3D Visualizer Specialist)
*   **Açıklama:** Three.js, React Three Fiber (R3F) ve Drei sahnelerinin performans ve shadow konfigürasyonlarını denetler.
*   **Araç Grubu:** Read, Write
*   **Görevi:** Shadows="percentage" uyumunu denetlemek, CDN/CSP whitelist kurallarını doğrulamak, WebGL hata sınırlarını (`ErrorBoundary`) kontrol etmek, Suspense sarmalamalarını doğrulamak.

### 3. `hvac_calculation_engineer` (HVAC Math & Standards Validator)
*   **Açıklama:** Hava perdesi, kanal basıncı, HRV ve jet fan hesaplayıcılarındaki fizik formüllerini ve EN/ASHRAE standartlarını denetler.
*   **Araç Grubu:** Read, Write
*   **Görevi:** `src/utils/hvacCalculations.ts` dosyasındaki Darcy-Weisbach, zemin hava hızı sönümlemesi ve ACH/Thrust hesaplamalarının fiziksel standartlarla (NFPA 88A, ISO 27327-1 vb.) uyumunu doğrulamak.

### 4. `webhook_integration_auditor` (Webhook, Payment & Deno Edge Function Auditor)
*   **Açıklama:** Edge Functions webhook altyapısını, iyzico ödeme akışını ve SMS/Email entegrasyon güvenliklerini denetler.
*   **Araç Grubu:** Read, Write, Bash
*   **Görevi:** HMAC-SHA256 SubtleCrypto doğrulamalarını incelemek, 5 dakikalık timestamp replay-guard kontrolü yapmak, durum monotonluğunu (`RANK` objesiyle) denetlemek, event ID deduplication kontrolünü sağlamak.

### 5. `performance_token_architect` (Next.js 15, Caching & Design System Guard)
*   **Açıklama:** Next.js 15 App Router, unstable_cache izolasyonu ve tailwind strict linter kuralları ile tasarım token uyumluluğunu denetler.
*   **Araç Grubu:** Read, Write, Bash
*   **Görevi:** ESLint `no-arbitrary-value` kontrolü, `unstable_cache` composite key yapısı, below-the-fold listelerde `.content-auto` ve klavye erişilebilirliği için `focus-visible` kullanımını doğrulamak.
