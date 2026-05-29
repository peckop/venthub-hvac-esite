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
| **İş Modeli** | B2B/B2C karma satış platformu |
| **Hedef Kitle** | Makine mühendisleri, mimarlar, müteahhitler, tesisat firmaları, son kullanıcılar |
| **Diller** | Türkçe (birincil), İngilizce |
| **Canlı Ortam** | Vercel (frontend), Supabase (backend + DB) |

---

## 2. Vizyon ve Fark

VentHub, sıradan bir e-ticaret sitesi değildir. HVAC sektörüne özel **"Mühendislik & Satış Platformu"** olarak kurgulanmıştır:

- **3D Ürün Görselleştirme:** React Three Fiber ile GLB/GLTF modeller (Jet Fan, HRV, Kanal Tipi Fan, Susturucu)
- **Mühendislik Hesaplayıcıları:** ASHRAE/EN standartlarında hava perdesi, kanal basıncı, HRV ve jet fan hesaplama
- **İhtiyaç Sihirbazı (Needs Wizard):** Kapı ölçüsü, rüzgar, trafik yoğunluğu girerek uygun ürün eşleştirme
- **Bilgi Merkezi (Knowledge Hub):** HVAC konularında teknik makaleler ve rehberler
- **Premium Admin Paneli:** ERP benzeri sipariş/stok/iade/kargo/denetim yönetimi

---

## 3. Teknoloji Yığını

### Frontend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js | 15 | App Router, SSR/SSG |
| React | 19 | UI bileşenler |
| TypeScript | 5.x | Tip güvenliği |
| Tailwind CSS | 4.x | Styling, Dynamic Theme Ready (.light/.dark runtime CSS variables) |
| React Three Fiber | - | 3D görselleştirme |
| Framer Motion | - | Animasyonlar |
| Sonner | - | Toast bildirimleri |
| @tailwindcss/typography | 0.5.x | prose sınıfları ile yasal ve teknik bilgi sayfalarının Bringhurst tipografi standardına getirilmesi |

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
| Tablolar | 26 |
| RLS Politikaları | 108 |
| RPC Fonksiyonları | 51 |
| İndeksler | 26 |

### Dış Entegrasyonlar
| Servis | Kullanım |
|--------|----------|
| İyzico | Ödeme altyapısı (3D Secure) |
| Resend | Transactional e-posta (sipariş onay, kargo, teslimat) |
| Twilio | WhatsApp/SMS bildirimleri (stok uyarıları) |
| Sentry | Hata izleme ve raporlama |
| Vercel | CI/CD ve hosting |

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
│   ├── functions/              # Edge Functions (28 fonksiyon)
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
│   ├── venthub_hvac_master.md  # Frontend master MD (432 dosya)
│   ├── supabase_functions_master.md # Backend master MD (28 dosya)
│   └── database_schema_master.md   # DB şema master MD
├── .agent/                     # AI ajan konfigürasyonu
│   ├── skills/                 # AI yetenekleri (SKILL.md)
│   ├── workflows/              # AI iş akışları
│   └── rules/                  # AI kuralları
└── .cc_docs.yaml               # Corpus Callosum doc pipeline config
```

---

## 5. Veritabanı Ana Tabloları

| Tablo | Amaç |
|-------|------|
| `venthub_orders` | Siparişler (durum, tutar, müşteri, kargo) |
| `venthub_returns` | İade talepleri ve süreç yönetimi |
| `products` | Ürün kataloğu (SKU, fiyat, stok, teknik özellikler) |
| `cart_items` | Sepet verileri |
| `user_profiles` | Kullanıcı profilleri (rol, isim, telefon) |
| `inventory_movements` | Stok giriş/çıkış hareketleri |
| `price_lists` | B2B fiyat listeleri |
| `wizard_selections` | İhtiyaç sihirbazı kullanıcı seçimleri |
| `admin_audit_log` | Admin işlem denetim kaydı |
| `shipping_webhook_events` | Kargo webhook audit log |
| `returns_webhook_events` | İade webhook audit log |
| `order_email_events` | E-posta gönderim audit log |
| `categories` | Ürün kategorileri (hiyerarşik) |
| `addresses` | Kullanıcı adresleri |
| `invoice_profiles` | Fatura profilleri (bireysel/kurumsal) |
| `coupons` | İndirim kuponları |

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

| Rol | Yetki |
|-----|-------|
| `customer` | Ürün görüntüleme, sepet, sipariş, hesap yönetimi |
| `admin` | Sipariş yönetimi, stok, kargo, iade işlemleri |
| `superadmin` | Tüm admin + kullanıcı yönetimi, ayarlar, kupon, audit log |

RBAC `user_profiles.role` alanı + `useRole()` hook + Edge Function auth middleware ile uygulanır. 108 RLS politikası veritabanı seviyesinde güvenliği sağlar.

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

## 11. 3D Ürün Modelleri

React Three Fiber ile geliştirilen interaktif 3D modeller:
- **JetFanModel** — Jet fan ekipmanı
- **HRVModel** — Isı geri kazanım cihazı
- **SilentChannelFanModel** — Sessiz kanal tipi fan
- **Silencer** — Susturucu parçası

Performans stratejisi: **Click-to-Load** (lazy loading ile ilk yükleme maliyeti sıfır).

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

Proje, **Corpus Callosum (cc)** pipeline ile otonom dokümantasyon üretir:

| Komut | İşlev |
|-------|-------|
| `cc doc all` | Frontend kaynak → MD üretimi |
| `cc doc batch --batch-dir supabase/functions` | Edge Function → MD üretimi |
| `cc doc schema` | DB şema → MD üretimi |
| `cc doc tree --nlm-sync --force-sync` | Master birleştirme + NLM upload |

**NotebookLM Digital Twin:** Tüm master MD'ler NLM'e yüklenerek proje hafızası oluşturulur. Notebook ID: `2aa4fc16-acf6-47c6-90a8-c02fe5bb28f8`
- **Otonom Oturum Yönetimi:** Dokümantasyon eşitlemeleri sırasında oluşabilecek `Authentication expired` hataları, kullanıcı müdahalesi gerekmeksizin otonom olarak `nlm login` + `refresh_auth` mekanizması ile sessizce çözülür.
- **Supabase Edge Functions Mühürü:** Güncel mimaride yer alan 26 adet Edge Function'ın (`cc doc batch`) dokümanlarının senkronizasyon sırasında NotebookLM'e tam ve eksiksiz aktarılması zorunludur. Bu durum tüm mikroservislerin otonom denetimini garanti eder.
- **Orion CLI Granüler Dökümantasyon Standardı:** Dökümantasyon motoru, tüm modüller için `entity_hashes` tabanlı parça değişimi takibi yapar ve `AST POINTERS` standardına uygun olarak iç değişkenleri (`ic_degiskenler`, `params`, `dönüşler`) en ince kılcal damarına kadar detaylandırır.
- **Xiaomi mimoV2 Premium Token Planı ve Paralel İşçi (Workers) Standardı:** Projemiz, **Xiaomi mimoV2 Premium Token** (mimo-v2.5) planına abonedir. Bu sayede dakikalık token ve istek hız sınırları (TPM/RPM limits) son derece yüksektir. Gelecek tüm oturumlarda ve dokümantasyon güncellemelerinde Orion CLI komutları (özellikle `orion doc all` veya `orion doc changed`) doğrudan **`--workers 20`** (20 paralel işçi) parametresi ile çalıştırılmalı, böylece bekleme süreleri en aza indirilmelidir.

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

---

## 15. Geliştirici Oturumu & Sohbet Yönetimi (Session Shortcuts)

Bu projede kullanılan Antigravity CLI (`agy.exe`) konuşmalarını isimlendirmek ve yönetmek için Windows PowerShell Profilinde (`$PROFILE`) bir sistem entegrasyonu kurulmuştur:

- **Erişim & Yönetim:** Geliştiricinin terminalindeki `$PROFILE` dosyasında `$AGY_SESSIONS` adında sıralı bir hashtable bulunmaktadır.
- **Komutlar:** 
  - `agy-list` — Kayıtlı tüm kısa isimli konuşmaları tablo halinde listeler.
  - `go <isim>` — Belirtilen isme ait konuşmayı doğrudan açar (Örn: `go font`, `go i18n`).
- **AI Ajanları İçin Talimat:** Kullanıcı sizden yeni bir konuşma ID'sini listeye eklemenizi, silmenizi veya ismini güncellemenizi isterse; doğrudan kullanıcının `$PROFILE` dosyasını (`C:\Users\alize\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`) okuyun, `$AGY_SESSIONS` hashtable'ını güncelleyin ve yazın. Kullanıcıya işlem sonrası `. $PROFILE` yazarak terminalini yenilemesini hatırlatın.

---

*Son güncelleme: 2026-05-29*


