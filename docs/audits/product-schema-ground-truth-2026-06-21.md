# Ürün Veritabanı Şeması Denetimi — Doğrulanmış Gerçek Zemin (2026-06-21)

> **Bu dosya nedir?** Ürün ekosisteminin (`products`, `categories`, `product_images`,
> `product_prices`, `price_lists` + bağlı tablolar) **kanıtlı zemini.** 3 kaynaktan okundu
> (Supabase canlı DB · Supabase MCP Advisor güvenlik+performans · `pg_trigger`/`pg_proc` sorguları),
> **çapraz-eşleştirildi.** Çelişkide **canlı DB kazanır.**
> Bu, tahmin değil; her olgu kaynaklı + sorguyla kanıtlanmış.
>
> **Doğrulama lejantı:** ✅ canlı DB sorgusuyla teyit · ⚠️ Supabase Advisor uyarısı · 🔍 pg_catalog sorgusu

İnceleme alanı: `public` şemasında ürün merkezli tablolar · Canlı DB: 388 ürün

---

## 0. MANŞET: Ürün katmanı "dışı dolu, içi boş" — enterprise seviyesinden uzak

Sandığımızdan **daha fazlası kurulmuş** (RLS, FK'ler, indexler, tetikleyiciler hepsi yerinde) — **ama yapısal
omurga eksikleri çok.** Tam da `dealer-data-ground-truth` raporundaki "dışı premium, içi boş" durumu, bu sefer
**ürün şemasında**, kanıtıyla. "Description %100 dolu" varsayımı sahte çıktı (PS-006); "multi-tenant izolasyonu var"
varsayımı kırık çıktı (PS-001); "updated_at çalışıyor" varsayımı yanlış çıktı (PS-002).

---

## 1. NE VAR (doğrulandı — beklediğimden sağlam)

| Varlık | Durum (canlı DB) |
|---|---|
| `products` | ✅ **388 satır**, tümü `active`, 0 orphan FK, 0 duplicate SKU, 0 duplicate name |
| `categories` | ✅ **25 satır** (7 ana + 18 alt), hiyerarşi tutarlı, `translation_key` var |
| `product_images` | ✅ tablo var, **29 görsel** → 15 ürün, `alt` alanı %100 dolu, `sort_order` var |
| `product_prices` | ✅ tablo var, yapısal olarak **seed-ready** (UNIQUE(product_id, price_list_id, valid_from) + 3 CASCADE FK) |
| `price_lists` | ✅ **3 satır** (dealer / corporate / individual) |
| `product_authorities` | ✅ tablo var, şeması tanımlı (expert_name, content, badge_text, rating) |
| RLS | ✅ tüm 38 public tabloda **enabled** |
| Indexler | ✅ `products`'ta 9 index (brand_trgm, name_trgm, slug, category_id, subcategory_id, featured) |
| Views | ✅ 5/5 view `security_invoker = true` |
| Numeric precision | ✅ `price` numeric(10,2), `purchase_price` numeric(12,2) — tutarlı |
| FK bütünlüğü | ✅ Tüm `category_id`/`subcategory_id` geçerli, orphan yok |
| `subcategory.parent_id = category_id` | ✅ 289 eşleştirilmiş alt kategori, hiçbirinde parent-child uyumsuzluğu yok |
| SKU formatı | ✅ 387/388 standart prefixli (AVE- veya VRT-), 0 invalid karakter |
| `technical_specs` tipi | ✅ 359/359 dolu kaydın hepsi `jsonb object` tipinde |

---

## 2. NE BOZUK / EKSİK (doğrulandı — neden "enterprise" değil)

### 2.1 Tenant İzolasyonu Kırık

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **PS-001** | `products`, `categories`, `product_images`, `product_authorities` tablolarında `tenant_id` **yok** | ✅ `information_schema.columns` → 0 row | Sipariş/sepet/fiyat tabloları tenant-izolasyonlu → hat **ürün katmanında kırılıyor.** SaaS'ta bir tenant diğerinin ürünlerini görür. `dealer-data-ground-truth §2.8` ile aynı sorun, artık 4 tablo daha. |
| **PS-020** | `products` ve `categories` RLS policy'leri `qual: true` — herkese açık SELECT, tenant filtresi yok | ✅ `pg_policies` sorgusu | Şu an tek tenant, sorun patlamıyor; çok-tenant'ta güvenlik açığı |

### 2.2 Trigger / Audit Eksiklikleri

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **PS-002** | `products` tablosunda `updated_at` trigger'ı **YOK** | 🔍 `pg_trigger WHERE tgrelid='products'::regclass AND tgname LIKE '%updated_at%'` → 0 row. `venthub_orders`, `cart_items`, `price_lists`, `shopping_carts` hepsinde var — sadece **products** eksik | Ürün güncellemesi zaman damgası almıyor → cache invalidation, sitemap `lastmod`, incremental sync, admin "son güncelleme" hepsi yanlış |
| **PS-025** | `venthub_orders` ve `venthub_order_items`'da **iki ayrı** updated_at trigger (duplicate) | 🔍 `update_venthub_orders_updated_at` + `venthub_orders_updated_at` aynı tabloda | Her UPDATE'de `updated_at` iki kez set ediliyor |

### 2.3 Güvenlik Fonksiyonları

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **PS-003** | `set_user_admin_role(uuid, text)` SECURITY DEFINER + herhangi bir `authenticated` kullanıcı çağırabilir | ⚠️ Supabase Security Advisor WARN | Herkes kendine `super_admin` rolü atayabilir → **tam yetki ihlali** |
| **PS-004** | `adjust_stock()` ×2 + `set_stock()` ×2 + `admin_list_users()` kısıtlamasız SECURITY DEFINER | ⚠️ Supabase Security Advisor WARN (5 fonksiyon) | Herkes stok değiştirebilir, tüm kullanıcı listesini alabilir |
| **PS-021** | 6 tabloda RLS enabled ama **policy yok**: `category_mapping_rules`, `client_errors`, `order_email_events`, `payment_transactions`, `rate_limits`, `shipping_idempotency` | ⚠️ Supabase Security Advisor INFO | Servis rolü hariç erişim tamamen kapalı. Kasıtlıysa sorun yok, değilse erişim kırık |
| **PS-027** | Leaked Password Protection kapalı | ⚠️ Supabase Security Advisor WARN | HaveIBeenPwned sızıntı kontrolü devre dışı |

### 2.4 Veri Kalitesi — "Dolu ama Sahte"

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **PS-006** | `description` alanı **%95 sahte** — ürün adı + " - Smart category mapping" kopyası | ✅ `SELECT description FROM products ORDER BY random() LIMIT 8` → 6/8 tanesi `{ad} - Smart category mapping`. Ort. uzunluk 77 karakter, gerçek açıklama sadece ~15-20 üründe (Lineo serisi) | SEO duplicate content cezası, müşteri deneyimi sıfır. **"Description %100 dolu" varsayımı yanıltıcı** — bu otomatik kategori trigger'ının yan etkisi |
| **PS-011** | `purchase_price` 388/388 ürünün tamamında **boş** | ✅ `count(purchase_price IS NOT NULL)` → 0 | Maliyet-artı fiyat motoru (`pricing-standard` §1 Katman 1) çalışamaz |
| **PS-023** | SEO alanları **%93.5 boş** — 363/388 üründe `meta_title`/`meta_description` NULL | ✅ `count(meta_title)` → 25 | Sadece VRT- prefixli pilot ürünlerde dolu |
| **PS-028** | `model_code` sadece 54/388 (%14) üründe dolu | ✅ sayım sorgusu | Katalog-DB köprüsü (loader) çoğu üründe çalışamaz |
| **PS-029** | `supplier_name` 388/388'de tamamen boş | ✅ `count(supplier_name)` → 0 | Kolon hiç kullanılmamış |
| **PS-031** | `slug` nullable — 1 ürün slug'sız | ✅ `count(CASE WHEN slug IS NULL)` → 1 | Bu ürün sitede erişilemez |
| **PS-035** | 1 ürün standart dışı SKU: `65002` (prefix'siz) | ✅ `Vortice VORT KRYO-POLAR EVO 11` | Loader eşleştirme problemi |

### 2.5 Şema Eksiklikleri

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **PS-010** | `currency` kolonu hiçbir yerde yok | ✅ kolon sorgulaması → 0 | `pricing-standard §10` gereği: alış (€) ile satış (₺) birimsiz karışır |
| **PS-012** | Soft delete (`deleted_at`) mekanizması yok | ✅ `column_name='deleted_at'` → false | Silinen ürün geri dönüşsüz yok olur; yasal/muhasebe zorunluluğu riski |
| **PS-013** | Enterprise B2B için 10 temel kolon eksik: `weight`, `barcode`/`gtin`, `mpn`, `tax_rate`, `country_of_origin`, `min_order_qty`, `lead_time_days`, `hsn_code`, `is_taxable` | ✅ hepsi false | Kargo hesabı, marketplace enteg., gümrük, KDV hiçbiri yapılamaz |
| **PS-014** | 10 destekleyici tablo eksik: `product_variants`, `product_tags`, `product_reviews`, `product_related`, `product_bundles`, `product_attributes`, `product_history`, `product_translations`, `brands`, `suppliers` | ✅ hepsi false | Varyant/etiket/yorum/çeviri/marka normalize/tedarikçi yönetimi yapılamaz |
| **PS-015** | `products.price` vs `product_prices` ikili fiyat mekanizması | ✅ `product_prices` 0 row; `products.price` 219 dolu, 169 sıfır | Fiyat kaynağı belirsiz, `pricing-standard` ile çelişen durum |
| **PS-016** | i18n altyapısı sıfır — `product_translations` tablosu yok, `description` tek alan, dil bilgisi yok | ✅ tablo + kolon sorgulamaları | `i18n-localization-standard` hedefinden çok uzak |
| **PS-022** | `product_images` vs `products.image_url` ikili görsel sistemi | ✅ 6 üründe `image_url` dolu (aynı placeholder), 15 üründe galeri var, senkron değil | Frontend'in hangi kaynağı render ettiği belirsiz |

### 2.6 FK + CASCADE Riskleri

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **PS-005** | `inventory_movements` → `products` FK ilişkisi **CASCADE DELETE** | 🔍 `pg_trigger` → `RI_FKey_cascade_del` | Ürün silinince stok hareket geçmişi geri dönüşsüz yok olur → muhasebe denetim kaybı |

### 2.7 Kategori-Ürün İlişki Yapısı

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **PS-036** | `categories.level` kolonu tutarsız — **2 alt-kategori `level=0`** olarak kayıtlı: "Ex-Proof (ATEX) Fanlar" ve "Sığınak Havalandırma Sistemleri" (`parent_id` = Industrial Ventilation ama `level=0`) | ✅ `SELECT name, level, parent_id FROM categories WHERE parent_id IS NOT NULL AND level = 0` → 2 row | `level` kolonuna güvenen sorgu (admin, sitemap, breadcrumb) bu ikisini **üst kategori sanır.** Frontend `!c.parent_id` ile ayırdığı için şu an patlamamış — ama `level` kolonuna bağlanan herhangi bir yeni kod **yanlış sonuç verir** |
| **PS-037** | `categories.parent_id` → `categories.id` FK ilişkisi **CASCADE DELETE** | ✅ `referential_constraints` → `delete_rule = 'CASCADE'`. Aynı zamanda `products.category_id` → `categories.id` = **SET NULL** | Üst kategori silinirse tüm alt-kategoriler **otomatik silinir** → `products.category_id` SET NULL olur → ürünler **kategorisiz kalır**, sitede görünmez olur. Ör. "Industrial Ventilation" silinirse 7 alt-kategori + 195 ürün etkilenir. Enterprise'da **RESTRICT** olmalı |
| **PS-038** | Ürün-kategori ilişkisi **sabit 2-seviye modele kilitli** — `products.category_id` (üst) + `products.subcategory_id` (alt) iki ayrı FK kolon. `categories` tablosu recursive self-referencing FK'ya sahip ama ürünler bunu **kullanamıyor** | ✅ `max_depth` = 1 (recursive CTE). Frontend hardcoded: `!c.parent_id` / `c.parent_id === parentId` ayrımı 20+ dosyada. URL: `/category/[slug]/[subSlug]` — 2 seviye route | 3\. seviye kategori eklenemez (ör. "Industrial > Radyal > Yüksek Basınç"). 1 ürün birden fazla kategoride olamaz (cross-listing yok). Ölçekleme için hem DB modeli hem frontend hem URL yeniden yazılmalı |
| **PS-039** | Ürün URL'sinde **kategori yolu kayboluyor** — kategori sayfasından ürüne geçişte URL yapısı kopuyor | ✅ Canlı site ekran görüntüsü: Kategori = `/tr/category/residential-ventilation/banyo-ve-tuvalet-fanlari` → Ürün = `/tr/products/vortice-me-100-4-ll-giallo-yellow-gold`. Breadcrumb kategoriyi gösteriyor ama URL yansıtmıyor | SEO: Google kategori→ürün hiyerarşisini URL'den okuyamıyor, ürün "yetim" görünüyor. Breadcrumb ile URL uyumsuz. Kullanıcı ürün linkini paylaşırsa kaynak kategori bilinmez. Analytics: kategori bazlı funnel analizi yapılamaz |

### 2.8 Performans

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **PS-024** | 46 kullanılmayan index | ⚠️ Supabase Performance Advisor | Çoğu `*_tenant_id` — tenant izolasyonu gelince gerekli olacak, **silmeyin** |
| **PS-026** | `site_settings` INSERT için 2 permissive policy | ⚠️ Supabase Performance Advisor | Her INSERT'te iki policy değerlendirilir |
| **PS-030** | `brand` serbest metin — `brands` tablosu yok | ✅ 6 farklı string | Büyük/küçük harf tutarsızlığı riski |
| **PS-032** | `product_authorities` tablosu **0 satır** — hayalet | ✅ `count(*)` → 0 | Dead weight |
| **PS-033** | Fosil kolonlar: `airflow_capacity` (2/388), `noise_level` (2/388), `pressure_rating` (0/388) | ✅ sayım sorguları | `technical_specs` JSONB ile çakışıyor |
| **PS-034** | `technical_specs` JSONB key yapısı tutarsız — 30+ farklı key | ✅ `jsonb_object_keys` dağılımı | Filtreleme/karşılaştırma tablosu standardize değil |

---

## 3. DRIFT — Mevcut dokümanlar vs gerçek

| Doküman | Ne diyor | Gerçek (canlı DB) |
|---|---|---|
| `database_schema_master.md` | Şema listesi var | ✅ Tablo yapısı doğru **ama** eksik kolonlar (yeni eklenenleri kapsamıyor olabilir) |
| `pricing-standard.md` §10 | "`currency` kolonu gerekli" | ❌ Kolon yok (PS-010) |
| `pricing-standard.md` §1 | "Fiyat TÜRETİLİR, elle yazılmaz" | ❌ `products.price` elle yazılmış, motor yok (PS-015) |
| `i18n-localization-standard.md` | Çok dilli destek hedefi | ❌ `product_translations` yok (PS-016) |
| `admin-standard.md` K4 | "Her değişiklik iz bırakır" | ❌ `products`'ta `updated_at` trigger bile yok (PS-002) |
| `catalog-ingestion-standard.md` §1 | "Köprü = model kodu" | ⚠️ `model_code` %14 dolu (PS-028) |
| `dealer-data-ground-truth` §2.8 | "3 tablo `tenant_id` taşımıyor" | 🔴 Artık **4 ürün tablosu daha** aynı durumda (PS-001) |

---

## 4. BUNUN ANLAMI — ilgili standartlara ne bildirir

Bu tespit raporu **yeni standart yazmaz**, mevcut standartların ürün şemasına uygulanmasındaki açığı kanıtlar:

| Mevcut Standart | Bu raporun ona söylediği |
|---|---|
| `pricing-standard.md` | Fiyat motoru (§1-§10) için gereken DB altyapısı **henüz yok** — currency kolonu, purchase_price verisi, product_prices içeriği hep boş. Motor inşa edilemez. |
| `admin-standard.md` | K4 (audit trail) ürün tablosunda **kırık** — updated_at trigger yok. K3 (yetki kapısı) SECURITY DEFINER fonksiyonlarında delinmiş. |
| `catalog-ingestion-standard.md` | Kademe-2 loader'ın bağlanacağı köprü (`model_code`) %86 eksik. Loader çalışsa bile 334 ürünü eşleştiremez. |
| `i18n-localization-standard.md` | Ürün katmanında çeviri altyapısı sıfır. Description bile tek dil, tek alan. |
| `category-taxonomy-standard.md` | Kategori yapısı **kısmen sağlam** — hiyerarşi FK'ları tutarlı ama `level` kolonu 2 alt-kategoride bozuk (PS-036), parent FK CASCADE DELETE tehlikeli (PS-037), 2-seviye model enterprise ölçeklemeyi engelliyor (PS-038), `tenant_id` eksik. |
| `dealer-module-blueprint.md` | Bayi fiyatlandırma hattı product_prices üzerinden çalışacaktı ama tablo 0 satır. Aynı zemin sorunu. |

---

## 5. Veri doluluk panosu (canlı referans — 2026-06-21)

| Alan | Dolu | Boş | Oran | Yorum |
|---|---|---|---|---|
| `name` | 388 | 0 | %100 | ✅ |
| `brand` | 388 | 0 | %100 | ✅ (normalize değil) |
| `sku` | 388 | 0 | %100 | ✅ UNIQUE, 1 standart-dışı |
| `category_id` | 388 | 0 | %100 | ✅ |
| `subcategory_id` | 289 | 99 | %74 | ⚠️ |
| `description` | 388 | 0 | %100 | 🔴 **SAHTE** — %95'i trigger kopyası |
| `technical_specs` | 359 | 29 | %93 | ✅ |
| `slug` | 387 | 1 | %99.7 | ⚠️ 1 NULL |
| `price > 0` | 219 | 169 | %56 | 🔴 |
| `model_code` | 54 | 334 | %14 | 🔴 |
| `purchase_price` | 0 | 388 | %0 | 🔴 |
| `image_url` | 6 | 382 | %2 | 🔴 (hepsi aynı placeholder) |
| `supplier_name` | 0 | 388 | %0 | 🔴 |
| `meta_title` | 25 | 363 | %6 | 🔴 |
| `meta_description` | 25 | 363 | %6 | 🔴 |

---

## 6. Provenance

Supabase canlı DB (tnofewwkwlyjsqgwjjga) · Supabase MCP `get_advisors` (security + performance) ·
`execute_sql` 28+ sorgu · `pg_trigger`/`pg_proc`/`pg_policies`/`information_schema` · Mevcut standartlarla
çapraz-eşleştirme + canlı site ekran görüntüleri. PS-001→PS-039 kodlu **39 bulgu**, hepsi sorgu veya görsel kanıtlı.
İlgili: `pricing-standard.md`, `admin-standard.md`, `catalog-ingestion-standard.md`, `i18n-localization-standard.md`,
`category-taxonomy-standard.md`, `dealer-data-ground-truth-2026-06-11.md`.
