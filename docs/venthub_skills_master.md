# VentHub Enterprise Agent Skills Master

This document compiles the core operational skills, guardrails, and validation protocols used by autonomous agents in the VentHub HVAC enterprise project.

---

## 1. VentHub Global Röntgen & Review Skill

### 🚨 YASAK (HALLUCINATION MÜHRÜ)
> [!CAUTION]
> **ZİHİNSEL TARAMA VE TAHMİN YASAKTIR!**
> Kullanıcı sizden bu skill'i kullanarak inceleme yapmanızı (röntgen, analiz) istediğinde; kafanızdan dosyaların bağlamını düşünüp *"Kodlar temiz görünüyor, sızıntı yok"* demek **kesinlikle yasaktır.** 
> Hiçbir denetim (röntgen) komut çalıştırılmadan ve somut log kanıtı elde edilmeden geçerli sayılamaz.

### 🎯 Çalışma Mantığı ve Zorunlu JSON Formu
Bu Röntgen skill'inin amacı, size tavsiye vermek değil, sizi fiziksel olarak kanıt toplamaya zorlamaktır. `venthub-global-rontgen` komutu geldiğinde **TÜM İŞLEMLERİ BIRAKIP** aşağıdaki adımları ŞU SIRAYLA uygulayacaksınız:

#### 1. Şablonu Kopyala (rontgen-template.json)
İlk adım olarak, `.agent/skills/venthub-global-rontgen/rontgen-template.json` dosyasını bir taslak (scratch) olarak kopyalayın (veya okuyun). Göreviniz bu JSON'ı **terminal komutlarının birebir sonuçlarıyla** doldurmaktır. 

#### 2. Radarları Çalıştır (Mekanik Tetikleyiciler)
JSON içindeki maddeleri kafanızdan değil, `run_command` üzerinden şu komutları sırayla göndererek doldurun:
- **Lint:** `npm run lint` veya `pnpm run lint`
- **Compiler:** `npx tsc --noEmit`
- **Build:** `npm run build`

#### 3. [ZORUNLU] Post-Scan Audit Checklist (Yorumlama ve Çapraz Doğrulama)
> [!CAUTION]
> **YALNIZCA SCRIPT'E GÜVENMEK YASAKTIR!** Yukarıdaki `.py` scriptleri veya derleyiciler 0 hata (PASS) verebilir. Ancak kod mimari olarak delik deşik olabilir. Her röntgen/Mr taramasının ardından şu "Cross-Check" (Yorumlama) aşamasını manuel olarak yapmalısın:

**A. Zorunlu Grep Taramaları (`grep_search` aracıyla):**
- `getProductBySlugOrId` (Sadece legacy katmanda kalmalı, UI/View katmanında BLOCKED sebebidir. Yerine sadece getProductBySlug kullanılmalı.)
- `href="/category` veya `` `/category/` `` (SSOT delinmesidir, `Routes.category` kullanılmalıdır)
- `href="/products` veya `` `/products/` `` (SSOT delinmesidir, `Routes.product` kullanılmalıdır)
- `slug || id` benzeri fallback'ler.

**B. Kritik Dosya Gözden Geçirmesi (`view_file` ile okuyun):**
- `src/utils/routes.ts` (SSOT'in merkezi burası olmalı)
- `src/middleware.ts` (Edge runtime, JWT vs.)
- `src/app/products/[slug]/page.tsx`
- `src/app/category/[categorySlug]/page.tsx`

**C. Çapraz Doğrulama Soruları (Cevaplanmadan JSON kapatılamaz):**
- `middleware.ts` içindeki login path ile `routes.ts` içerisindeki login path eşleşiyor mu?
- Ürün route'ları kesinlikle ve sadece **slug-only** mi davranıyor?
- `<script type="application/ld+json">` içerisindeki product url sadece slug mı üretiyor?

#### 4. Çıktı Üret (Zorunlu JSON Kanıtı)
Tüm komutları ve **Post-Scan Audit Check** (Çapraz Doğrulama) aşamasını tamamladıktan sonra kullanıcıya "Her şey temiz" demek yerine, doldurduğunuz (ve komut sonuçlarını kanıt olarak içeren) **JSON formatını bir Artifact olarak üreterek** sunun.

**Eğer bir komut Exit Code 1 verirse VEYA Cross-Check'te hardcoded SSOT sızıntısı yakalanırsa:**
Bu json objesindeki `"status"` kısmını `FAIL` yapın, `"evidence"` kısmına kanıtı anında yazın ve `overall_ship_status`'u `BLOCKED` yapın. Sorunları kendi inisiyatifinizle gizlemeyin veya "Önemsiz" diye atlamayın!

### 📋 Ekstra Denetim İpuçları (JSON'ı Doldururken Rehber Al)
Komutlarla tarama yaparken radarınızın özellikle şunları yakaladığından emin olun:
1. **[Yeni Kural] SEO ve JSON-LD UUID Sızıntıları:** Artık `<script type="application/ld+json">` içinde `prod.slug || prod.id` mantığı yasaktır! Yalnızca slug kullanılabilir. Ayrıca arama motoru örümceklerinin SEO yapısal verilerini izole görmesini önlemek için her üretilen nesneye `isPartOf: { "@id": "${SITE_URL}/#website" }` şeklinde bir **Canonical URI Düğümü** (Knowledge Graph kuralı) eklenmesi zorunludur.
2. **[Yeni Kural] JWT ile Middleware:** Edge Runtime veritabanı yorgunluğunu sevmez. Rol kontrolü JWT Claims (`user_metadata.role`) üzerinden yapılmalıdır. DB fetch'i görürsen raporla!
3. **Hardcoded String Yasağı:** `Routes.product(slug)` veya `Routes.category(slug)` gibi kütüphane fonksiyonları varken UI'da `href="/category/{slug}"` yazan her kod BLOCKED nedenidir.
4. **Hydration ve CLS:** Görsellerin (img) boyutu/genişliği boş bırakılamaz. Dinamik veri beklenirken iskelet (Skeleton) yoksa raporla.
5. **Type Any Yasaktır:** Tip esnemelerine tolerans gösterilemez.

### 🏎️ FERRARİ X-RAY STANDARTLARI (KURUMSAR E-TİCARET KATI KURALLARI)
Kullanıcı "Röntgeni Çek" veya "Enterprise düzeyde değerlendir" dediğinde aşağıdaki 3 "Piston ve Şase" kuralını kesinlikle denetim JSON'una dahil et:
- **CSS ve Animasyon Yamaları:** Performansı katleden `framer-motion` kütüphanesi sızıntıları aranmalı. İşe yaramayan veya yavaşlatan animasyonların Vanilla CSS veya Tailwind tabanlı olduğundan emin olunmalı. Gelişigüzel yazılmış karmaşık inline `style={{}}` kodları mimari zaafiyettir, tespit et!
- **State Yönetimi ve "use client" Darboğazı:** E-ticaretin omurgası Server-Side Rendering (SSR) olmalıdır. Bir `layout.tsx` veya koskoca bir `Page` wrapper'ı sırf ufacık bir buton için `"use client"` yapılmışsa, o dosya BLOCKED sebebidir. State'ler yaprak (en alt) izolasyonda tutulmalıdır.
- **Slug ve Rota Disiplini:** Hardcoded `href` içeren her bağlantı, SEO zayıflığıdır. Tüm rotasyonlar `Link` bileşeni üzerinden merkeze bağlı olarak yapılmış mı denetle.

---
**Özet Kural:** 
Sisteme yalan söyleyemezsin. Gözle baktığın hiçbir şeye `PASS` verme, yalnızca `run_command`, `grep_search` verilerine ve terminal loglarına güven!
6. **CORS Wildcard:** Auth endpoint'lerde Access-Control-Allow-Origin: * varsa → BLOCKED.
7. **service_role Sızıntısı:** NEXT_PUBLIC_ prefix'i ile service_role anahtarı kullanılıyorsa → BLOCKED.
8. **Hreflang Kontrolü:** /tr and /en sayfalar varsa hreflang self-referencing ve reciprocal olmalı.
9. **Veri Bütünlüğü:** UI'da "NaN", "undefined", "[object Object]" kalıntısı → WARNING.
10. **Stripe İdempotency:** checkout.sessions.create çağrılarında idempotencyKey yoksa → BLOCKED.

### 🛠️ Next.js 15, PPR, Webhook ve Supabase İleri Seviye Röntgen Kuralları (Enrichment v3)
11. **Dinamik PPR ve Suspense Sınırı:** `useSearchParams` hook'u kullanan client bileşenleri (filtreler, arama kutusu vb.), SSR zehirlenmesini engellemek için `<Suspense fallback={<Skeleton />}>` sarmalayıcısına sahip olmalıdır.
12. **Webhook HMAC Doğrulaması:** `/api/webhook/supabase` ve kargo/ödeme webhook uç noktalarında `hmacValid` veya signature hash doğrulaması aranmalıdır.
13. **Alternates Language Sitemap SEO alternates:** `sitemap.ts` üzerinde Türkçe/İngilizce alternatifleri (`alternates: { languages: { tr: '...', en: '...' } }`) bulunmalıdır.
14. **Supabase Altın Üçlü Zinciri:** Migration SQL scriptlerinde `GRANT`, `ENABLE ROW LEVEL SECURITY` ve `CREATE POLICY` zincirinin sırayla uygulandığı denetlenmelidir. `user_metadata` yerine `app_metadata` kullanılmalıdır.
15. **`unstable_cache` Dil İzolasyonu (Cache Collision Guard):** `unstable_cache` kullanımlarında `cache_keys` dizisi içinde `lang` veya `locale` parametresinin dinamik olarak geçildiği denetlenmelidir.
16. **Edge Functions "Black-Box" İzolasyon Taraması:** Sipariş/bildirim Edge Function dosyalarında, veritabanından `user_locale` okumasının yapıldığı ve e-postaların bu dile göre süzüldüğü teyit edilmelidir.
17. **Middleware Offset Koruması:** `src/middleware.ts` içinde salt `segments[0]` kullanımını engelleyerek dil segmentini offset'leyen gelişmiş rota analizi denetlenmelidir.

---

## 2. VentHub Enterprise Audit Skill (v1.1)

> **Amaç:** Proje lideri "10/10 — teslime hazır" demeden önce çalıştırılan bütünleşik denetim motoru. Röntgen'in üst versiyonudur. Her katman terminal kanıtına dayanır. Tahmin, varsayım veya zihinsel tarama yasaktır.

### Nerede Duruyoruz? (Denetim Hiyerarşisi)
```
┌──────────────────────────────────────────────────────────────┐
│  Röntgen              → Her commit öncesi      (30sn)       │
│  "Kırık var mı?"        lint + tsc + build + SSOT           │
│  ├──────────────────────────────────────────────────────────┤
│  Enterprise Audit     → Teslim öncesi          (10-15dk)    │
│  "Müşteriye teslim      11 katman: kod + güvenlik + yasal   │
│   edilebilir mi?"        + ops + performans + erişilebilirlik│
│                          + teknik borç                       │
└──────────────────────────────────────────────────────────────┘
```

### 12 Katmanlı Kurumsal Yapı

#### L1 — Teknik Kalite (Build & Code)
- TypeScript: `pnpm exec tsc --noEmit` (STRICT)
- ESLint: `pnpm run lint` (STRICT)
- Birim Testler: `pnpm test -- --run` (STRICT)
- Build: `pnpm run build` (STRICT)
- Lockfile: `pnpm install --frozen-lockfile` (STRICT)
- Bundle Boyutu: Chunk > 500KB (WARNING)

#### L2 — Güvenlik (OWASP + Supabase)
- CVE Tarama (`pnpm audit`) (STRICT)
- Hardcoded Secret (i18n/test hariç) (STRICT)
- Security Headers (HSTS, CSP, nosniff) (STRICT)
- Console.log hassas veri sızıntısı (WARNING)
- Rate Limiting varlığı (WARNING)
- Şifre Güç Kuralı varlığı (STRICT)
- CORS Wildcard auth endpoint'lerde (STRICT)
- service_role client bundle sızıntısı (STRICT)

#### L3 — Yasal Uyumluluk (KVKK / GDPR)
- KVKK Hesap Silme (deleteUser) (STRICT)
- Cookie Consent (STRICT)
- Yasal Sayfalar (kvkk/gizlilik/cerez) (STRICT)
- LICENSE dosyası (WARNING)
- GPL Riski (WARNING)

#### L4 — Operasyonel Hazırlık (DevOps)
- /api/health endpoint (STRICT)
- Monitoring (Sentry) (STRICT)
- CI Pipeline (.github/workflows) (STRICT)
- .env.example (STRICT)
- Dockerfile (WARNING)
- SECURITY.md (WARNING)

#### L5 — Veri & Veritabanı (Golden Triad)
- RLS (tüm tablolar) (STRICT)
- Supabase Security Advisors (WARNING)
- Input Validation (Zod/Yup) (WARNING)
- İndekslenmemiş FK sütunları (WARNING)
- Column GRANT SELECT uyuşmazlığı (STRICT)
- Views `security_invoker = true` (STRICT)

#### L6 — Dokümantasyon
- README (200+ satır) (WARNING)
- CHANGELOG (WARNING)
- CONTRIBUTING.md (WARNING)

#### L7 — Ürün Tamamlığı
- Kritik Rotalar (/products, /cart, /checkout, /auth, /admin) (STRICT)
- E2E Testler (WARNING)
- Sitemap & Robots (STRICT)
- Error Boundary (WARNING)
- Hardcoded Ödeme Geçidi Yasağı (Checkout Orchestrator strategy pattern zorunludur) (STRICT)

#### L8 — Performans & Core Web Vitals
- Image Optimization (`<img>` → `<Image>`) (WARNING)
- Client Boundary (layout/page sızıntısı) (WARNING)
- Lighthouse (Perf>=60, A11y>=80, BP>=80, SEO>=80) (STRICT)
- Skeleton Coverage (WARNING)
- LCP < 2.5s (STRICT)
- INP < 200ms (STRICT)
- CLS < 0.1 (STRICT)

#### L9 — Erişilebilirlik (WCAG 2.1 AA)
- ARIA Kullanımı (WARNING)
- Alt Text (WARNING)
- Keyboard Nav (WARNING)

#### L10 — Next.js 15 / React 19 Disiplini
- Async Params (await zorunlu) (STRICT)
- Route SSOT (hardcoded href yasak) (STRICT)
- i18n Leakage (WARNING)
- Framer Motion sızıntısı (WARNING)

#### L11 — Teknik Borç & Ölü Kod
- Dead Code (Knip): `pnpm run knip --reporter compact` (WARNING)
- Bundle Analyzer: `pnpm run analyze` (WARNING)
- Unused Dependencies: `pnpm run knip --include unlisted,unresolved` (WARNING)

#### L12 — Cache ve Önbellek Hijyeni (Yeni Katman)
- Edge-CDN seviyesinde önbelleklenen statik rotaların (`generateStaticParams`), webhook tetiklenmesiyle (`revalidatePath`/`revalidateTag`) eşzamanlı ve hatasız yıkıldığının (cache invalidation) denetlenmesi. (STRICT)

#### Karar Modeli
- READY: Tüm STRICT kontroller PASS
- CONDITIONAL: STRICT hepsi PASS ama WARNING var
- BLOCKED: Herhangi bir STRICT kontrol FAIL -> teslim yapılamaz

---

## 3. VentHub Unified Auditor Skill (v11.0 - Sentinel Edition)

Bu yetenek, projenin sadece "çalışmasını" değil, **"mimari açıdan kusursuz" kalmasını ve "kritik dosyaların kazara silinmemesini" sağlar**. Projedeki tüm otonom ajanlar bu skill'in kurallarına biat etmek zorundadır.

### 🚨 BÖLÜM 1: BÜTÜNLÜK KALKANI (Integrity Guard)
Klasörler/dosyalar "Kritik Varlık" (Protected) sınıfındadır ve ajanın "hafıza yanılsamalarına" karşı nihai koruma altındadır:
- `src/components/products/visual-models/` (3D Modeller ve Orbital Sistemler)
- `src/components/navigation/` (Kategori Carousel ve Akış Mimarı)
- `src/types/database.types.ts` (Veritabanı İskeleti)
- `.agent/`, `registry/` ve `.gemini/hooks/` dizinleri (Otonom Sinir Sistemi)

### 🚧 ZORUNLU EYLEM PROTOKOLLERİ (Hard Rules)
1. **Snapshot Zorunluluğu (Backup First):** Kritik dosyalardan birine dokunulacaksa, yedekle: `artifacts/backups/CURRENT_WORK/`
2. **Zaman Damgası Doğrulaması:** Kesinlikle `git log` üzerinden Commit Hash ve Tarih ile doğrulama yapılmalı.
3. **Yıkıcı Eylem Koruması:** Mimar'dan açık onay (`/override`) alınmadan yıkıcı eylem yapılamaz.

### 💎 BÖLÜM 2: MİMARİ KORKULUKLAR (Architectural Guardrails)
1. **Metrik Tuzağı Yasağı:** Hata sayılarını düşürmek için kodun bütünlüğü bozulamaz.
2. **Dörtlü Mühür Denetimi:** Her görev brainstorm, plan ve review teknik kanıtlarına sahip olmalıdır.
3. **PascalCase Zorunluluğu:** React bileşenleri her zaman büyük harfle başlamalıdır.

### 📐 BÖLÜM 3: TEKNİK TEFTİŞ KRİTERLERİ
1. **Next.js 15 & React 19:** params asenkron olmalı, useI18n hook'u kullanılmalı, hydration güvenliği.
2. **Tip Güvenliği:** `as any`, `@ts-ignore` KESİNLİKLE yasaktır.
3. **I18n ve Performans:** Türkçe hardcoded metinler i18n'e taşınmalı, console.log yasak, Three.js objeleri dispose edilmeli.

---

## 4. i18n Conventions Skill

Bu skill, VentHub'ın çok dilli (TR/EN) yapısını ve çeviri ekleme kurallarını tanımlar.

### Temel Prensipler
1. **Hardcoded string YASAK** — Tüm kullanıcıya görünen metinler i18n üzerinden gelmeli
2. **Türkçe öncelikli** — `tr.ts` ana sözlük, `en.ts` çeviri
3. **Hiyerarşik anahtarlar** — `section.subsection.key` formatı
4. **Proxy Hook Zorunluluğu:** Geliştiricilerin ve ajanların URL'leri elle birleştirmesi tamamen yasaktır. Rotalar kesinlikle `useLocalizedRoutes` hook'u üzerinden `Routes.category()` şeklinde çağrılmalıdır. Manuel string birleştirme (`/${lang}/...`) mimari ihlaldir.
5. **JSONB Veri Çevirisi Kuralı:** Veritabanı tablolarında (categories, products) çeviri için ayrı ilişkisel (relational) tablolar oluşturulması yasaktır. Dil verisi kesinlikle JSONB (`metadata->>lang`) formatında tutulmalıdır.

### Hreflang Kuralları (Uluslararası SEO)
VentHub `/tr` ve `/en` yolları kullandığı için hreflang düzgün uygulanmalıdır:
1. **Self-referencing zorunlu** — Her sayfa hreflang setinde kendini içermeli
2. **Reciprocal links** — A→B varsa B→A da olmalı
3. **ISO kodları** — `en-GB` ✅ | `en-UK` ❌
4. **x-default** — Dil seçici veya varsayılan locale'e yönlenmeli
5. **Hedef URL'ler** — Tümü 200 dönmeli, canonical ile eşleşmeli

---

## 5. Supabase Security Skill

Bu skill, VentHub'ın Supabase güvenlik standartlarını ve migration yazım kurallarını tanımlar.

### RLS (Row Level Security) Prensipleri
1. **Tüm tablolarda RLS AÇIK olmalı** (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
2. **Public tablolar için SELECT policy var** (ürünler, kategoriler)
3. **Yazma işlemleri (INSERT/UPDATE/DELETE) admin/service_role gerektirir**
4. **Kullanıcı verisi sadece kendi sahibine görünür** (`auth.uid() = user_id`)

### 🔑 Supabase 2026 Data API Güncellemesi: Altın Üçlü (Golden Triad) Kuralı
Supabase'in 2026 yılındaki Data API güvenlik güncellemesi uyarınca, `public` şemasında oluşturulan yeni tablolar artık otomatik olarak API rollerine (`anon`, `authenticated`, `service_role`) açık değildir.

Bir tablo oluşturulurken aşağıdaki üçlü yapı tek bir ünite olarak ele alınmalı ve sırayla uygulanmalıdır:
1. **Açık İzinler (GRANT):** API rollerinin tabloya erişebilmesi için yetkiler açıkça verilir.
2. **RLS Aktifleştirme (ENABLE RLS):** Satır bazlı güvenlik açılır.
3. **RLS Politikaları (CREATE POLICY):** Kimin hangi satırları görebileceği/değiştirebileceği kurallarla sınırlandırılır.

### 🔑 Webhook Güvenlik Standartları
- Tüm webhook endpoint'leri (`/api/webhook/supabase` ve Edge Functions) `x-webhook-secret` (HMAC-SHA256) başlığıyla korunmalı ve tekrar oynatma saldırılarına karşı `x-timestamp` kontrolünden geçirilmelidir.

### 🔑 Postgres View RLS Güvenliği (Security Invoker)
- Postgres view'larının RLS kurallarını bypass etmesini önlemek amacıyla, oluşturulan tüm veritabanı görünümlerinde `security_invoker = true` ayarının (Postgres 15+ `ALTER VIEW ... SET (security_invoker = on)`) kullanılması zorunludur. `SECURITY DEFINER` view'lar yetki sızıntısı yarattığından yasaktır.

### ⚠️ İleri Düzey Güvenlik Tuzakları
- **`user_metadata` YASAK** — JWT yetkilendirme kararlarında raw_user_meta_data kullanılamaz (kullanıcı tarafından düzenlenebilir). Her zaman `app_metadata` kullan.
- **UPDATE politikası: USING + WITH CHECK birlikte zorunlu** — `WITH CHECK` olmadan kullanıcı `user_id`'yi başka birine atayabilir.

---

## 6. VentHub Architecture Skill

Bu skill, VentHub projesinin dosya yapısını ve kod organizasyonunu tanımlar.

### Performans ve Render Standartları (90+ Puan Hedefi)
1. **Server Components (RSC) Önceliği:** Tüm ana sayfalar (`page.tsx`) varsayılan olarak Server Component olmalıdır. Veri çekme işlemleri sunucu tarafında yapılmalıdır. `'use client'` sadece uç bileşenlerde kullanılır.
2. **SSR ve Streaming (Suspense):** Ana rotalarda `ssr: false` kullanımı KESİNLİKLE yasaktır. Ağır veri yüklemeleri için `Suspense` ve `Skeleton` kullanılmalıdır.
3. **Client-Side Bağımlılıkları:** `window`, `document`, `localStorage` nesneleri sadece `useEffect` içinde veya dinamik kontrollerle kullanılmalıdır.
4. **Layout Shift (CLS) Koruması:** Resimlere (`<Image />`) mutlaka `width` ve `height` verilmelidir.
5. **Hibrit PPR (Partial Prerendering) Sınırları:** Arama, filtreleme gibi sayfalarda `useSearchParams` hook'unu kullanan tüm bileşenler kesinlikle ve istisnasız `<Suspense fallback={<Skeleton />}>` sınırı içerisine alınmalıdır.
6. **Adaptör (Adapter) Deseni ve Saf Metrik Motor Kuralı:** Uygulamanın çekirdek mühendislik hesaplamalarını barındıran `src/lib/hvacCalculations.ts` gibi saf (pure) fonksiyonların iç mantığına emperyal birim (CFM, Fahrenheit, in-wg vb.) dönüşümleri KESİNLİKLE eklenemez. Yabancı ölçü birimi gereksinimleri, UI katmanı ile iş mantığı katmanı arasına çekilecek bir `useEngineeringAdapter` gibi bir "Gateway" hook'u üzerinden (Adaptör Deseni ile) çözülmelidir.
