# VentHub HVAC — Project Context

> [!CAUTION]
> **Bu dosyanın genel içeriği NotebookLM tarafından oluşturulur ve güncellenir.**
> LLM'ler bu dosyayı kafalarına göre yeniden yazmamalı veya iyileştirme adı altında müdahale etmemelidir.
> Önemli notlar ve ilaveler eklenebilir, ancak genel içerik revizyonu NLM üzerinden yapılır.

> Bu belge, VentHub HVAC projesine ilk kez dahil olan bir geliştiricinin veya AI ajanının projeyi uçtan uca anlaması için hazırlanmış tek kapsamlı referans noktasıdır.

---

## 1. Proje Kimliği

| Alan | Değer |
|------|-------|
| **Proje Adı** | VentHub HVAC |
| **Domain** | İklimlendirme & Havalandırma (HVAC) E-Ticaret |
| **İş Modeli** | HVAC sektörüne özel Multi-Tenant SaaS E-Ticaret Platformu (Shopify modeli) |
| **Mevcut Durum** | Faz 1 (SaaS Foundation) tamamlandı ve uzak veritabanına uygulandı. Faz 2 (White-Label) aşamasına hazır. |
| **Hedef Kitle** | Makine mühendisleri, mimarlar, müteahhitler, tesisat firmaları, son kullanıcılar |
| **Diller** | Türkçe (birincil), İngilizce |
| **Canlı Ortam** | Vercel (frontend), Supabase (backend + DB) |

---

## 2. Vizyon ve Fark

VentHub, sıradan bir e-ticaret sitesi değildir. HVAC sektörüne özel **"Mühendislik & Satış Platformu"** olarak kurgulanmış ve **multi-tenant SaaS platformuna** dönüştürülmektedir:

- **3D Ürün Görselleştirme:** React Three Fiber ile GLB/GLTF modeller (Jet Fan, HRV, Kanal Tipi Fan, Susturucu)
- **Mühendislik Hesaplayıcıları:** ASHRAE/EN standartlarında hava perdesi, kanal basıncı, HRV ve jet fan hesaplama
- **İhtiyaç Sihirbazı (Needs Wizard):** Kapı ölçüsü, rüzgar, trafik yoğunluğu girerek uygun ürün eşleştirme
- **Bilgi Merkezi (Knowledge Hub):** HVAC konularında teknik makaleler ve rehberler
- **Premium Admin Paneli:** ERP benzeri sipariş/stok/iade/kargo/denetim yönetimi

### SaaS Dönüşüm Yol Haritası (4 Faz)

| Faz | Amaç | Durum |
|-----|------|-------|
| **Faz 1: Foundation** | Mevcut VentHub "default tenant" olur, yeni tenant eklenebilir hale gelir | 🏆 BİTTİ (Remote Deployed) |
| **Faz 2: White-Label** | Her tenant kendi markasıyla görünür (CSS token override, logo, renk) | 📋 Planlandı |
| **Faz 3: Tenant Admin + Billing** | Tenant kendi işini yönetsin, subscription/billing sistemi | 📋 Planlandı |
| **Faz 4: Marketplace + Plugin** | Çoklu satıcı, komisyon, plugin mimarisi | 📋 Uzun vade |

> ⚠️ **Gerçek-zemin:** Faz 1 *altyapısı* (tenant tabloları, çoğu tabloda `tenant_id`) uygulandı; ama tenant
> **izolasyonu ENFORCE EDİLMİYOR** — `tenantResolver` hardcoded fallback'e düşüyor, 3 tablo `tenant_id`'siz.
> "🏆 BİTTİ" = altyapı kuruldu, izolasyon değil. Gerçek multi-tenant → blueprint **R4** onarımı (bkz.
> `docs/audits/dealer-data-ground-truth-2026-06-11.md`).
>
> Detaylı plan: `docs/plans/venthub_saas_master_roadmap.md` · Faz 1 prompt: `docs/plans/venthub_saas_faz1_prompt.md`

---

## 3. Teknoloji Yığını

### Frontend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js | 15.5.18 | App Router, SSR/SSG, PPR (Kısmi Ön Oluşturma) |

> ⚠️ **Not (2026-08-15, elle eklendi — üretilmiş metne dokunulmadı):** yukarıdaki satırdaki **PPR
> GERÇEKTE KULLANILMIYOR.** `next.config.mjs`'te `experimental.ppr` yok; olan şey SSG + Suspense
> streaming'dir. Aynı düzeltme §14 madde 14 için de geçerlidir: oradaki Suspense kuralı geçerli,
> "PPR" adlandırması yanlış. Render/önbellek SSOT'u artık `docs/standards/rendering-cache-standard.md`.
| React | 19.0.0 | UI bileşenler, React Compiler |
| TypeScript | 5.7.2 | Tip güvenliği (strict mode, `any` yasak) |
| Tailwind CSS | 3.4.16 | Styling, Dynamic Theme Ready (.light/.dark runtime CSS variables) |
| React Three Fiber | 9.5.0 | 3D görselleştirme (Three.js 0.183.2) |
| Framer Motion | 11.13.1 | Animasyonlar |
| Sonner | 2.0.7 | Toast bildirimleri |
| Recharts | 2.14.1 | Admin dashboard grafikleri |
| Vitest | 4.1.3 | Test altyapısı (Testing Library + axe-core a11y) |
| @tailwindcss/typography | 0.5.19 | prose sınıfları ile yasal ve teknik bilgi sayfalarının Bringhurst tipografi standardına getirilmesi |

### Backend
| Teknoloji | Kullanım |
|-----------|----------|
| Supabase Edge Functions | Deno/TypeScript mikroservisler |
| Supabase Auth | Kimlik doğrulama (email + OAuth) |
| Supabase Realtime | WebSocket ile anlık bildirimler |
| Supabase Storage | Dosya/görsel depolama |

### Veritabanı
| Özellik | Detay |
|---------|-------|
| Motor | PostgreSQL (Supabase hosted) |
| Güncel topoloji | Tablo / RLS politika / fonksiyon / indeks **sayıları için daima `docs/database_schema_master.md`** (otomatik üretilir — elle sayı yazma, drift eder) |
| Çoklu kiracı | tenant-scoped RLS aktif (bkz. §14 SaaS kuralları) |
| Helper'lar | `jwt_tenant_id()`, metadata/profile sync RPC'leri |

### Dış Entegrasyonlar
| Servis | Kullanım |
|--------|----------|
| İyzico | Ödeme altyapısı (3D Secure) |
| Resend | Transactional e-posta (sipariş onay, kargo, teslimat) |
| Twilio | WhatsApp/SMS bildirimleri (stok uyarıları) |
| Sentry | Hata izleme ve raporlama |
| Vercel | CI/CD ve hosting |

### Supabase İstemci Fabrikaları & DI (Dependency Injection)

Eski singleton bağımlılıklar kaldırılarak üçlü istemci yapısına geçilmiştir:

| İstemci Türü | Dosya | Kullanım |
|-------------|-------|----------|
| **Browser Client** | `src/lib/supabase/client.ts` | İstemci bileşenlerinde singleton, `createBrowserClient` |
| **Server Client** | `src/lib/supabase/server.ts` | Her HTTP isteğine özel (per-request), `createServerClient` + `cookies()` |
| **Static Client** | `src/lib/supabase/static.ts` | SSG sınırlarında çerez erişimi gerektirmeyen durumlar, `persistSession: false` |

Tüm servis fonksiyonları ilk parametre olarak `supabase: SupabaseClient<Database>` bağımlılığını zorunlu tutar (DI). Modül düzeyinde statik istemci importları kaldırılmıştır.

---

## 4. Proje Yapısı

```
venthub-hvac/
├── src/
│   ├── app/                    # Next.js App Router sayfaları
│   │   ├── admin/              # Admin panel rotaları
│   │   ├── account/            # Kullanıcı hesap rotaları
│   │   ├── calculators/        # Mühendislik hesaplayıcı rotaları
│   │   └── ...                 # Diğer public rotalar
│   ├── components/             # Yeniden kullanılabilir UI bileşenleri
│   │   ├── admin/              # Admin panel bileşenleri
│   │   ├── category/           # Kategori ve ürün listeleme
│   │   ├── checkout/           # Ödeme akışı bileşenleri
│   │   ├── products/           # Ürün detay + 3D modeller
│   │   │   └── 3d/             # Three.js 3D model bileşenleri
│   │   ├── layout/             # Header, Footer, Navigation
│   │   └── ui/                 # Primitif UI bileşenleri (Button, Card, Modal...)
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # Çoklu dil desteği (TR/EN sözlükler)
│   ├── lib/                    # İş mantığı servisleri
│   │   └── services/           # API servis katmanı (cart, product, address...)
│   ├── types/                  # TypeScript tip tanımları
│   ├── utils/                  # Yardımcı fonksiyonlar
│   └── views/                  # Sayfa bileşenleri (page views)
│       ├── admin/              # Admin sayfa görünümleri
│       ├── account/            # Hesap sayfa görünümleri
│       ├── calculators/        # Hesaplayıcı sayfa görünümleri
│       ├── category/           # Kategori görünüm modları
│       ├── checkout/           # Checkout adımları
│       ├── knowledge/          # Bilgi merkezi sayfaları
│       ├── legal/              # Hukuki sayfalar (KVKK, gizlilik...)
│       └── support/            # Destek sayfaları (SSS, iade, kargo...)
├── supabase/
│   ├── functions/              # Edge Functions (~30 fonksiyon, _shared dahil)
│   │   ├── _shared/            # Paylaşılan modüller (notify, sentry, rate_limit)
│   │   ├── iyzico-payment/     # Ödeme başlatma
│   │   ├── iyzico-callback/    # Ödeme callback
│   │   ├── iyzico-refund/      # İade/iade
│   │   ├── shipping-webhook/   # Kargo durumu webhook
│   │   ├── returns-webhook/    # İade kargo webhook
│   │   ├── order-confirmation/ # Sipariş onay e-postası
│   │   ├── delivery-notification/ # Teslimat bildirimi
│   │   └── ...                 # Diğer fonksiyonlar
│   └── migrations/             # PostgreSQL migration dosyaları
├── docs/                       # Üretilmiş dokümantasyon
│   ├── venthub_hvac_master.md  # Frontend master MD (930+ dosya)
│   ├── supabase_functions_master.md # Backend master MD (~30 fonksiyon, _shared dahil)
│   └── database_schema_master.md   # DB şema master MD
├── .agent/                     # AI ajan konfigürasyonu
│   ├── skills/                 # AI yetenekleri (SKILL.md)
│   ├── workflows/              # AI iş akışları
│   └── rules/                  # AI kuralları
└── .cc_docs.yaml               # Corpus Callosum doc pipeline config
```

---

## 5. Veritabanı Ana Tabloları

Tam tablo/kolon/constraint/RLS listesi **otomatik üretilir → `docs/database_schema_master.md`** (elle liste tutma, drift eder). Domain çekirdeği, kabaca:

- **Ticaret:** `venthub_orders`, `venthub_returns`, `order_refund_events`, `products`, `categories`, `cart_items`, `coupons`, `price_lists`
- **Kullanıcı/B2B:** `user_profiles` (org_id, tenant_id), `addresses`, `invoice_profiles`, `organizations`, `product_prices`, `user_projects`
- **Operasyon/denetim:** `inventory_movements`, `admin_audit_log`, `*_webhook_events`, `order_email_events`, `wizard_selections`
- **SaaS:** `tenants` (subdomain, tema, feature flags, marka)

---

## 6. Kritik İş Akışları

### 6.1 Ödeme Akışı (Checkout → İyzico → Sipariş)
```
Kullanıcı → CheckoutPage → buildPaymentRequest() → iyzico-payment Edge Function
  → İyzico 3D Secure → iyzico-callback Edge Function
  → venthub_orders.status = 'paid'
  → process_order_stock_reduction (PostgreSQL RPC)
  → order-confirmation e-posta (Resend)
```

### 6.2 Kargo Webhook Akışı
```
Kargo Firması → shipping-webhook Edge Function
  → HMAC doğrulama + replay guard
  → normalizePayload() (çoklu kargo formatı)
  → Monoton durum kontrolü: pending → paid → shipped → delivered
  → venthub_orders güncelleme
  → delivered ise → delivery-notification e-posta
```

### 6.3 İade Akışı
```
Müşteri/Admin → iade talebi → venthub_returns.status = 'requested'
Kargo → returns-webhook → HMAC doğrulama
  → Monoton: requested → approved → in_transit → received → refunded
  → received ise → return-status-notification e-posta
  → Stok geri yükleme (orderStatusService)
```

### 6.4 Stok Yönetimi
```
Sipariş onayı → process_order_stock_reduction (atomik RPC)
İade teslim → stok geri yükleme (orderStatusService)
Manuel ayar → inventory_movements + admin_audit_log
Düşük stok → stock-alert → WhatsApp/SMS bildirim (Twilio)
```

---

## 7. Rol Bazlı Erişim (RBAC)

Geçerli roller — **canlı `user_profiles.role` CHECK kısıtı**: `super_admin`, `admin`, `warehouse`, `sales`, `viewer`, `user`.

> ⚠️ `moderator` / `editor` / `support` / `customer` DB'de **geçersizdir** (CHECK reddeder). Rol → izin matrisi `src/lib/rbac.ts` (SSOT); güncel RLS topolojisi `docs/database_schema_master.md`.

RBAC `user_profiles.role` + `useRole()` hook + Edge Function auth middleware ile uygulanır; RLS politikaları DB seviyesinde sızdırmazlığı sağlar. SaaS yetki kararları **`app_metadata`** üzerinden (bkz. §14).

---

## 8. i18n (Çoklu Dil) ve Yerelleştirme Mimarisi

*   **Sub-path Routing:** Uygulama Next.js App Router üzerinde `/[lang]/` klasör hiyerarşisiyle çalışır. Dil tespiti ve URL yönlendirmeleri `src/middleware.ts` üzerinden sunucu tarafında (Server-side) yapılır.
*   **Proxy Hook (Routes):** React bileşenlerinde URL oluştururken manuel dil kodu eklemek yasaktır. Rotalar, aktif dili otomatik algılayıp enjekte eden `useLocalizedRoutes` hook'u üzerinden (Örn: `Routes.category('jet-fan')` -> `/tr/category/jet-fan`) çağrılmalıdır.
*   **Sözlükler (SSOT):** `src/i18n/dictionaries/tr.ts` ve `en.ts`. Bileşenlerde erişim `I18nProvider` ve `useI18n()` hook'u ile sağlanır.
*   **Dinamik DB Çevirileri:** Veritabanı tablolarında (`categories`, `products`) çeviri için ayrı ilişkisel tablolar kullanılmaz. Tip güvenli **JSONB** (`metadata->>lang`) formatı benimsenmiştir. Dönüşümler `src/lib/type-converters.ts` üzerinden yapılır.

---

## 9. Admin Paneli Özellikleri

| Sayfa | Özellik |
|-------|---------|
| Dashboard | KPI kartları, satış grafiği, düşük stok alarmı |
| Siparişler | Kanban board (sürükle-bırak), tablo görünümü |
| Envanter | Stok yönetimi, CSV import, QR etiket yazdırma |
| Kargo/Lojistik | Kargo takip, webhook event log |
| İadeler | İade süreç yönetimi, durum takibi |
| Ürünler | Ürün CRUD, kategori yönetimi |
| Kuponlar | İndirim kuponu oluşturma/yönetimi |
| Kullanıcılar | Rol atama, kullanıcı yönetimi |
| Ayarlar | Sistem konfigürasyonu |
| Audit Log | Tüm admin işlem geçmişi |
| Hatalar | Client-side hata izleme (Sentry entegre) |
| Realtime | WebSocket ile anlık sipariş/stok bildirimleri |

---

## 10. Mühendislik Hesaplayıcıları

| Hesaplayıcı | Standart | Modül |
|-------------|----------|-------|
| Hava Perdesi | EN/ASHRAE | `hvacCalculations.ts::calculateAirCurtain` |
| Kanal Basıncı | ASHRAE | `hvacCalculations.ts::calculateDuct` |
| HRV (Isı Geri Kazanım) | EN 308 | `hvacCalculations.ts::calculateHRV` |
| Jet Fan | EN 12101 | `hvacCalculations.ts::calculateJetFan` |

---

## 11. 3D Ürün Modelleri & Performans Stratejisi

React Three Fiber (`@react-three/fiber` 9.5.0) ve `@react-three/drei` ile geliştirilen interaktif 3D modeller:
- **JetFanModel** — Jet fan ekipmanı
- **HRVModel** — Isı geri kazanım cihazı
- **SilentChannelFanModel** — Sessiz kanal tipi fan
- **Silencer** — Susturucu parçası

### 3D Mimari Kurallar
| Kural | Detay |
|-------|-------|
| **Render Stratejisi** | Click-to-Load (lazy loading ile ilk yükleme maliyeti sıfır) |
| **Media Authority** | `ThreeDAuthority` bileşeni üzerinden GLB/GLTF formatında metadata ve hotspot tanımlarıyla sahneye entegrasyon |
| **Gölge Motoru** | `PCFSoftShadowMap` kullanımı ❌ YASAK — gölge haritalama `'percentage'` olmalı |
| **CSP İzinleri** | `next.config.mjs` → `connect-src` → `raw.githubusercontent.com` ve `raw.githack.com` kalıcı whitelist |
| **Ekosistem Kısıtı** | Saf Three.js DOM manipülasyonu yasak — yalnızca R3F + Drei ekosistemi |
| **Viewport Optimizasyonu** | Below-the-fold 3D canvas alanları `.content-auto` (`content-visibility: auto`) ile sarmalanmalı |

---

## 12. Ortam Değişkenleri (Env)

### Zorunlu
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase proje URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (Edge Functions)

### Ödeme
- `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` — İyzico API kimlik bilgileri

### Bildirimler
- `RESEND_API_KEY` — E-posta servisi
- `EMAIL_FROM` — Gönderici adresi
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` — SMS/WhatsApp
- `TWILIO_WHATSAPP_NUMBER` / `TWILIO_PHONE_NUMBER`

### Kargo
- `SHIPPING_WEBHOOK_SECRET` — HMAC-SHA256 imza doğrulama
- `RETURNS_WEBHOOK_SECRET` — İade webhook imza doğrulama

### Opsiyonel
- `EMAIL_TEST_MODE` / `EMAIL_TEST_TO` — Test modu
- `BRAND_NAME` / `BRAND_PRIMARY_COLOR` / `BRAND_LOGO_URL` — Marka
- `ALLOWED_ORIGINS` — CORS whitelist
- `SENTRY_DSN` — Hata izleme

---

## 13. Dokümantasyon Altyapısı

Proje, **orion** pipeline ile kaynak koddan otonom `.md` üretir; master'lar **NotebookLM dijital ikizine** yüklenir (proje hafızası). Notebook ID: `235043eb-970f-4a52-9f39-1d02b2621e9c`.

- **Komutlar & tam akış** → `.claude/skills/notebooklm-sync/` yeteneği (`orion doc all | batch | schema | tree`). (Eski `cc doc` alias'ı hâlâ çalışır ama `orion` kullan.)
- **Sync modeli — MILESTONE/MANUEL (her commit'te DEĞİL):** LLM-güdümlü; sırayla **auth-tazele** (`.agent/scripts/nlm-headless-refresh.ps1`, penceresiz ~15sn) → `orion doc tree --nlm-sync --force-sync` → `notebook_query` ile **DOĞRULA**. Mekanik auto-sync auth düşünce sessizce başarısız olduğu için kaldırıldı; **post-commit hook artık yereldir** (NLM'e dokunmaz). Bkz. memory `nlm-sync-milestone-model`.
- **Üretilen vs küratörlü:** kök master'lar (`*_master.md`, `system_tree.md`) elle düzenlenmez (pipeline ezer); küratörlü dokümanlar `docs/` alt klasörlerinde — harita: **`docs/README.md`**.

---

## 14. Geliştirme Kuralları

1. **No-Plan-No-Code:** Değişiklik yapmadan önce plan oluştur ve onay al
2. **Tip Güvenliği:** `any` kullanımı yasak, strict TypeScript
3. **RLS-First:** Her tablo mutlaka RLS politikası ile korunmalı
4. **Monoton Durum:** Sipariş/iade durumları sadece ileri gidebilir, geri dönüş engellenir
5. **Audit Trail:** Admin işlemleri `admin_audit_log` tablosuna kaydedilir
6. **HMAC Doğrulama:** Webhook endpoint'leri HMAC-SHA256 ile korunur
7. **i18n-Ready:** Tüm kullanıcıya görünen metinler sözlük dosyalarından gelir
8. **Webhook Replay Guard:** Tüm webhook'lar (iade/kargo) HMAC doğrulamasına ek olarak zaman damgası (`x-timestamp`) veya idempotency koruması içermelidir (Tekrar oynatma saldırılarına karşı)
9. **MVVM & Gateway Prensibi:** UI bileşenleri ham veri çekme (fetch/supabase) mantığından izole edilmeli; veri akışları Gateway hook'larına soyutlanmalıdır
10. **Design Token ve Strict Linter Standardı:** Frontend katmanında arbitrary (bracket içi serbest stil, örn: `w-[92vw]`, `duration-[2000ms]`) stil kullanımı tamamen yasaktır. Proje, `eslint-plugin-tailwindcss` tarafından `tailwindcss/no-arbitrary-value: error` seviyesinde strict olarak korunur. Spacing, elevation shadow, timing, blur ve z-index değerleri `src/design-system/tokens.js` (SSOT) üzerinden yönetilmelidir. Renk tanımlamalarında HEX yerine CSS Custom Property (HSL) token'ları kullanılmalı, çift `:root` tanımlamaları elenmeli ve çalışma zamanı (runtime) tema değişkenleri korunmalıdır.
11. **content-auto Render Performans Standardı:** Sayfa dışı (below-the-fold) ağır veri tabloları, Kanban panoları veya 3D canvas gibi yoğun bileşenlerde viewport dışı render yükünü sıfırlamak ve LCP/FID performansını korumak amacıyla `.content-auto` (content-visibility: auto) utility sınıfı zorunlu olarak kullanılmalıdır.
12. **focus-visible Klavye Erişilebilirlik Standardı:** Proje genelinde erişilebilirlik (A11y) uyumunu en üst seviyede tutmak için, tüm interaktif elemanlarda (button, a, input, select, textarea) fare tıklamalarında beliren halkaları engellemek ama klavye sekmelerinde premium odak çizgilerini korumak amacıyla `focus:` yerine **`focus-visible:`** state seçicileri kullanılmalıdır.
13. **Typography prose Standartları:** Yasal sözleşme sayfaları veya bilgi merkezi Hub/Topic teknik makale sayfaları gibi metin yoğunluklu arayüzlerin tamamında, Bringhurst tipografi standardına (Premium UI) tam uyum sağlamak amacıyla `prose dark:prose-invert max-w-prose` sınıfları standart okuma sarmalayıcısı olarak kullanılmalıdır.
14. **PPR (Kısmi Ön Oluşturma) ve Suspense Sınırı:** Kategori ve ürün arama sayfaları gibi filtreleme barındıran sayfalarda, `useSearchParams` hook'unu veya arama parametrelerini kullanan hiçbir bileşen "çıplak" bırakılamaz. "SSR Zehirlenmesini" engellemek ve ana sayfa kabuğunun SSG ile statik üretilmesini garanti etmek için, bu bileşenler istisnasız olarak `<Suspense fallback={<Skeleton />}>` ile sarmalanmalıdır.
15. **unstable_cache İzole Edilmesi (Cache Collision Guard):** Next.js App Router üzerinde sunucu tarafı veri önbellekleme (`unstable_cache`) kullanıldığında (örneğin `getCachedHomeData` içinde), önbellek sızıntılarını ve diller arası veri karışmasını engellemek için ikinci parametre olan `cache_keys` dizisine kullanıcının aktif dil kodu (`lang`) zorunlu olarak eklenmelidir (Örn: `['home-page-data', lang]`).
16. **On-Demand ISR ve Webhook Senkronizasyonu:** Stok yönetimi veya ürün güncellemeleri sonrasındaki statik önbellek gecikmelerini engellemek için; `products`, `categories` ve `inventory_movements` tablolarındaki tüm değişiklikler `src/app/api/webhook/supabase/route.ts` tarafından dinlenmelidir. İşlemler, x-webhook-secret (HMAC) doğrulaması geçtikten sonra `revalidatePath` veya `revalidateTag` ile Next.js önbelleğini anında temizlemelidir.
17. **SEO ve Sitemap Hreflang Standartları:** Arama motoru örümcekleri (Googlebot vb.) için HTML ve `sitemap.ts` üretilirken istemci tarafı (Client) hook'lar (`useLocalizedRoutes` gibi) kullanılamaz. Dinamik rotalarda (`generateStaticParams` and `sitemap.ts`), her bir kategori ve ürün URL'i için saf TypeScript kullanılarak Türkçe ve İngilizce varyasyonlar `alternates: { languages: { tr: '...', en: '...' } }` (Hreflang) nesneleri şeklinde zorunlu olarak sunulmalıdır.
18. **Edge Functions & Mikroservis Standartları (Contextual Locale İzolasyonu):** Supabase Edge Functions (`order-confirmation`, `delivery-notification` vb.) istemcinin (tarayıcının) hangi dilde olduğunu doğrudan bilemez. Bu nedenle sipariş oluşturma süreçlerinde kullanıcının aktif dil tercihi (lang) veritabanına (`user_locale` veya metadata olarak) kaydedilmelidir. E-posta şablonları oluşturulurken ürün adları (JSONB) bu `locale` bilgisine göre süzülüp müşteriye kendi dilinde gönderilmelidir ("Black-box" ihlali koruması).
19. **3D Canvas Render ve Gölge Standartları:** React Three Fiber (`<Canvas>`) ve Drei kütüphaneleri kullanılarak oluşturulan 3D model sahnelerinde (ör. `Product3DViewer`, `ThreeDAuthority`, `OrbitalProductsShowcase`), `PCFSoftShadowMap` deprecation (kullanımdan kaldırma) uyarılarını ve performans darboğazlarını önlemek amacıyla, gölge haritalama türü kesinlikle `'percentage'` olarak ayarlanmalıdır.
20. **CSP (İçerik Güvenlik Politikası) ve 3D CDN İzinleri:** `@react-three/drei` kütüphanesinin ve GLB/GLTF 3D nesnelerinin dış kaynaklardan güvenle yüklenebilmesi için `next.config.mjs` dosyası içindeki CSP `connect-src` yönergesine `raw.githubusercontent.com` ve `raw.githack.com` adresleri kalıcı olarak beyaz listeye (whitelist) eklenmiş olmalıdır. Bu kuralı esnetmek veya kaldırmak, 3D modellerin (CORS/CSP ihlali nedeniyle) sessizce çökmesine neden olacağından kesinlikle yasaktır.
21. **React 19 Compiler ve useMemo/useCallback Sınırlandırması [GEÇİŞ AŞAMASINDA - WARNING]:** React 19 Compiler performansı arka planda otomatik optimize ettiği için, yeni yazılacak basit arayüz bileşenlerinde manuel `useMemo` ve `useCallback` kullanımı kısıtlanmalıdır (Gereksiz teknik borç oluşumunu önlemek için). Ancak veri işleme/yönetim merkezleri (Gateway viewmodel'ları ve Context Provider'lar) asenkron veri karmaşalarından ötürü bu kuraldan muaf tutulmalıdır.
22. **Supabase ORM Tekilleştirme (React cache) [GEÇİŞ AŞAMASINDA - STRICT]:** Server Components (RSC) ağacında render döngüsü esnasında birden fazla kez çağrılma ihtimali olan tüm bağımsız Supabase ORM sorguları, mükerrer veritabanı sorgusu maliyetlerini (Waterfall) önlemek amacıyla kesinlikle ve istisnasız `React.cache()` fonksiyonu ile tekilleştirilmelidir.
23. **AI Botları ve Ajanlar için llms.txt Standardı [GEÇİŞ AŞAMASINDA - STRICT]:** Projenin tüm mimari yapısını, geliştirme standartlarını ve kurallarını tek bir bağlamda (single-context) özetleyen standartlaştırılmış `/llms.txt` dosyası kök dizinde (veya public klasöründe) sunulmalıdır. Bu sayede projeye dahil olan yeni AI ajanlarının onboarding süresi sıfıra indirilir ve bağlam sızıntıları önlenir.
24. **Tenant Data İzolasyonu (SaaS):** Çoklu kiracı (multi-tenant) yapısında veritabanı okuma/yazma, Edge Function API işlemleri ve Supabase Realtime WebSocket kanalları (örn: `admin-orders-realtime-${tenantId}`) kesinlikle tenant-scoped (kiracıya izole) olmak zorundadır. Data Bleeding kabul edilemez bir güvenlik felaketidir.
25. **Middleware Strict Edge Kısıtı (SaaS):** `src/middleware.ts` Edge Runtime'da çalıştığı için Supabase Client ile doğrudan veritabanı sorgusu atılması KESİNLİKLE YASAKTIR. Tenant resolution için Vercel Edge Config, statik map veya `x-tenant-id` request header kullanılmalıdır. URL rewrite yapılmamalı — `detectLocale` offset koruması bozulur.
26. **JWT app_metadata Zorunluluğu (SaaS):** Güvenlik politikalarında ve Edge işlevlerinde JWT yetkilendirme kararları `raw_user_meta_data` üzerinden verilemez (kullanıcı tarafından düzenlenebilir). Rol ve tenant izolasyonu kesinlikle `app_metadata` üzerinden yapılmalıdır.
27. **Feature Flags ve RSC Hibrit Mimarisi (SaaS):** Next.js 15 ve React 19 RSC mimarisinde Server Component'lar içinde `useTenant` gibi client hook'ları KULLANILAMAZ. Feature flag ve tenant verisi okumaları için Server Component'larda `getTenantConfig()` asenkron fonksiyonu, Client Component'larda `useTenant()` hook'u kullanılmalıdır.
28. **Cache Key Tenant İzolasyonu (SaaS):** `unstable_cache` ve `revalidateTag` mekanizmalarında Data Bleeding'i önlemek adına anahtarlara kesinlikle `tenantId` dahil edilmelidir (Örn: `['key', lang, tenantId]`). ISR webhook'ları da tenant-aware olmalıdır.
29. **Tenant-Aware İletişim (SaaS):** SaaS White-Label yapısı gereği; e-posta şablonlarına basılacak logo ve şirket unvanı global `.env` değişkenlerinden KULLANILAMAZ. Tüm iletişim işlemleri, işlemin yapıldığı `tenant_id` bağlamındaki `tenants.config` JSONB objesinden çekilen marka verileriyle (brandName, emailFrom) özelleştirilmelidir.
30. **Storage Bucket İzolasyon Politikaları (SaaS):** `product_images` ve diğer tenant-specific storage bucket'larındaki erişimler, klasör veya yol tabanlı RLS politikaları ile kiracı özelinde sızdırmaz hale getirilmelidir (`storage.objects` üzerinde `tenant_id = jwt_tenant_id()` kontrolü).
31. **Çapraz Kiracı super_admin Yetkilendirmesi (SaaS):** Çapraz kiracı erişimi (Cross-Tenant) gerektiren `super_admin` rolleri için 1-N FK yerine pivot tablo mimarisi (ör. `tenant_users`) tasarlanmalıdır.

---

## 15. AI Skill (Yetenek) Ekosistemi

Projede **29 adet uzmanlaşmış otonom yetenek** (`.agent/skills/`) aktiftir. Her yetenek, sıkı bir oluşturma ve optimizasyon protokolü ile yönetilir.

### Yetenek Kategorileri
| Kategori | Kapsam |
|----------|--------|
| **orchestration** | Multi-agent takım yönetimi, görev dağılımı, iş akışı yönlendirmeleri |
| **intelligence** | Proje hafızası, NotebookLM dijital ikiz senkronizasyonu, araştırma/okuma görevleri |
| **guards** | Kod standartları, TypeScript tip güvenliği, i18n JSONB kuralları, tasarım token korkulukları |
| **audit** | L1-L12 kalite kapıları, performans ve güvenlik denetimleri |
| **utils** | Yardımcı araçlar, Git commit formatlamaları, CLI betik yöneticileri |

### Yetenek Yönetim Protokolü
- **Skills CLI:** Mevcut ekosistemdeki yetenekleri keşfetmek veya yeni yetenek eklemek için `npx skills` paket yöneticisi
- **Otonom Açıklama Optimizasyonu:** `skills-creator` → 12/8 Train/Test Split kuralı ile açıklama doğruluğu %100'e optimize edilir
- **Çakışma Yönetimi:** `python .agent/scripts/skills-evaluator.py` kalite kapısı — Jaccard benzerlik eşiği %60
- **Derleme:** `.agent/plugins/venthub-core/manifest.yaml` + `docs/venthub_skills_master.md` SSOT güncellemesi

---

## 16. Geliştirici Oturumu & Sohbet Yönetimi (Session Shortcuts)

Bu projede kullanılan Antigravity CLI (`agy.exe`) konuşmalarını isimlendirmek ve yönetmek için Windows PowerShell Profilinde (`$PROFILE`) bir sistem entegrasyonu kurulmuştur:

- **Erişim & Yönetim:** Geliştiricinin terminalindeki `$PROFILE` dosyasında `$AGY_SESSIONS` adında sıralı bir hashtable bulunmaktadır.
- **Komutlar:** 
  - `agy-list` — Kayıtlı tüm kısa isimli konuşmaları tablo halinde listeler.
  - `go <isim>` — Belirtilen isme ait konuşmayı doğrudan açar (Örn: `go font`, `go i18n`).
- **AI Ajanları İçin Talimat:** Kullanıcı sizden yeni bir konuşma ID'sini listeye eklemenizi, silmenizi veya ismini güncellemenizi isterse; doğrudan kullanıcının `$PROFILE` dosyasını (`C:\Users\alize\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`) okuyun, `$AGY_SESSIONS` hashtable'ını güncelleyin ve yazın. Kullanıcıya işlem sonrası `. $PROFILE` yazarak terminalini yenilemesini hatırlatın.

---

*Son güncelleme: 2026-06-12 (twin-denetimli sadeleştirme: bayat sayılar→pointer, RBAC rolleri canlıya hizalandı, sync modeli güncellendi)*


