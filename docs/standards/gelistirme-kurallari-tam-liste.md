# Geliştirme Kuralları — 31 Madde (tam liste) — v1.0

> **DAĞITILDI (REC-503, 2026-09-30):** 31 kuralın her biri ilgili rolün kartına (`docs/roller/<ROL>.md`, `## Kurallar`)
> yazıldı; hangi kuralın hangi karta gittiği `scripts/belge/rol-karti-uret.cjs` içindeki `KURALLAR` tablosundadır ve
> `INV-ROL-1` sayım testi (kaynakta 31 = kartlarda 31, başlıklar bu dosyayla birebir) hiçbir kuralın düşmediğini ölçer.
> Bu dosya artık geçici değildir: kuralların **gerekçeli tam metni ve kaynağı** olarak kalır (kartlar bir cümlelik özet
> taşır). Bu listeye kural eklenir ya da başlığı değişirse üretici tablosu da güncellenmeden test kırmızı verir.
> Liste `CONTEXT.md` §14'ten (2026-06-12 tarihli, NotebookLM üretimi) aynen alındı; kural metinleri **elle
> değiştirilmedi**; bayat olabilecek yerler aşağıdaki tabloda işaretli.
>
> **Ne yönetir:** Geliştirme kurallarının gerekçeli tam listesi. Çekirdek 14 kural `CLAUDE.md`'dedir (her oturumda
> yüklenir); bu liste ondan geniştir.
> **Sahibi:** HARİTA oturumu (REC-400); dağıtım REC-503 (REC-426 altı).
> **Son doğrulama:** 2026-09-29 — yalnız şu ölçüldü: (a) her kuralın `CLAUDE.md`'de karşılığı olup olmadığı, (b) 9 ve
> 23 numaralı kuralların dayandığı yapıların varlığı (`useCategoryGateway`, `useAdminTable` kancaları; `public/llms.txt`).
> Diğer kuralların koda uyumu **ölçülmedi**; kural metni "bugün de böyle" iddiası değildir.
> **Kayıt:** REC-400 (H3). **Kaynak:** `docs/archive/CONTEXT-2026-08-17.md` §14.

## Hangi kural nerede

| Kural | Konu | `CLAUDE.md`'de karşılığı |
|---|---|---|
| 1 | No-Plan-No-Code | Mutlak Kural 1 (aynı metin, 2026-08-15 eki dahil) |
| 2 | Tip güvenliği | Mutlak Kural 3 |
| 3 | RLS-First | Teknoloji yığını satırı ("RLS-first") + Mutlak Kural 12 |
| 4, 5, 6, 8 | Monoton durum · audit trail · HMAC · replay guard | Mutlak Kural 11 |
| 7 | i18n-ready | Mutlak Kural 7 |
| 9 | MVVM & Gateway | **Yalnız burada.** Kodda geçerli (Gateway kancaları var) |
| 10, 12 | Design token · `focus-visible` | Mutlak Kural 8 |
| 11 | `content-auto` | Mutlak Kural 10 |
| 13 | Typography `prose` | **Yalnız burada** (`.claude/skills/typography` da anıyor) |
| 14 | Suspense sınırı | Mutlak Kural 5 (daha yeni ve daha keskin hâli) |
| 15, 28 | `unstable_cache` anahtarları (`lang`, `tenantId`) | Mutlak Kural 12 |
| 16 | On-demand ISR + webhook | Kural olarak yok; SSOT `rendering-cache-standard.md` §3 (Doküman Haritası'nda) |
| 17 | SEO / sitemap hreflang | **Yalnız burada** (`i18n-conventions` skill'i de anıyor) |
| 18 | Edge Functions dil izolasyonu | **Yalnız burada** |
| 19, 20 | 3D gölge · CSP CDN | Mutlak Kural 9 |
| 21 | React Compiler / `useMemo` sınırı | **Yalnız burada** ("geçiş aşamasında — uyarı") |
| 22 | `React.cache()` | Mutlak Kural 6 |
| 23 | `llms.txt` | **Yalnız burada.** `public/llms.txt` VAR |
| 24, 25, 26 | Tenant izolasyonu · Edge middleware · `app_metadata` | Mutlak Kural 12 |
| 27 | Feature flag / RSC hibriti | **Yalnız burada** (`rendering-cache-standard.md` da anıyor) |
| 29, 30, 31 | Tenant-aware iletişim · storage RLS · süper yönetici pivotu | **Yalnız burada.** Faz 2 PARK'ta; tasarım kuralı, kodda ölçülmedi |

## Kurallar (CONTEXT.md §14, aynen)

1. **No-Plan-No-Code:** Değişiklik yapmadan önce plan oluştur ve onay al. *(2026-08-15 eki: plan ayrıca **kendisini hangi cetvelin yönettiğini** söylemeli — ya `docs/standards/` altından bir dosya adı, ya açıkça "cetvel yok". "Cetvel yok" geçerli bir cevap ama bedava değil; o zaman iş cetveli yazmayı da kapsar. SSOT: `CLAUDE.md` kural 1.)*
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
14. **Suspense Sınırı:** *(2026-08-15: madde başlığındaki "PPR (Kısmi Ön Oluşturma)" ibaresi kaldırıldı — `next.config.mjs`'te `experimental.ppr` yok; anlatılan mekanizma SSG + Suspense streaming'dir. Kuralın kendisi aynen geçerli.)* Kategori ve ürün arama sayfaları gibi filtreleme barındıran sayfalarda, `useSearchParams` hook'unu veya arama parametrelerini kullanan hiçbir bileşen "çıplak" bırakılamaz. "SSR Zehirlenmesini" engellemek ve ana sayfa kabuğunun SSG ile statik üretilmesini garanti etmek için, bu bileşenler istisnasız olarak `<Suspense fallback={<Skeleton />}>` ile sarmalanmalıdır.
15. **unstable_cache İzole Edilmesi (Cache Collision Guard):** Next.js App Router üzerinde sunucu tarafı veri önbellekleme (`unstable_cache`) kullanıldığında (örneğin `getCachedHomeData` içinde), önbellek sızıntılarını ve diller arası veri karışmasını engellemek için ikinci parametre olan `cache_keys` dizisine kullanıcının aktif dil kodu (`lang`) zorunlu olarak eklenmelidir (Örn: `['home-page-data', lang]`).
16. **On-Demand ISR ve Webhook Senkronizasyonu:** Stok yönetimi veya ürün güncellemeleri sonrasındaki statik önbellek gecikmelerini engellemek için; **statik vitrin sayfasında görünen HER tablonun** (bugün: `products`, `categories`, `inventory_movements`, `product_families`, `product_prices`) hem **DB tetiği** hem de `src/app/api/webhook/supabase/route.ts` içinde **handler dalı** olmalıdır — biri eksikse veri değişir, sayfa değişmez. İşlemler, x-webhook-secret (HMAC) doğrulaması geçtikten sonra `revalidatePath` veya `revalidateTag` ile Next.js önbelleğini anında temizlemelidir. Doğrulama fonksiyonu eksik yapılandırmada **fail-closed** olmalıdır (secret tanımsızsa istek reddedilir). Güncel tablo listesinin ve tazeleme sözleşmesinin SSOT'u `docs/standards/rendering-cache-standard.md` §3; kapılar `INV-RENDER-2` ve `INV-WEBHOOK-1`.
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
