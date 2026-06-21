# VentHub Ürün Veritabanı Şeması Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** Ürün ekosisteminin (`products`, `categories`, `product_images`,
> `product_prices`, `price_lists` ve bağlı tablolar) **nasıl yapılandırılması gerektiğinin
> cetveli** + şemanın bugünkü **canlı röntgeni.** Her ajan, her oturumda buna bakar; aradaki
> açığı ölçer ve kapatır.
>
> **Neden var?** 2026-06-21 derin Supabase röntgeninde ürün şemasının enterprise/SaaS
> seviyesinden **çok uzak** olduğu kanıtlanmıştır (Enterprise Olgunluk: 2.7/10). Bu cetvel,
> açığı "bilinmeyen" olmaktan çıkarıp **izlenebilir tespit → karar → iş** zincirine alır.
>
> **Kaynaklar:** Supabase canlı DB (tnofewwkwlyjsqgwjjga) · Supabase MCP Advisor (güvenlik + performans) ·
> `pricing-standard.md` · `catalog-ingestion-standard.md` · `admin-standard.md`
>
> **Yaşayan doküman** — bulgu kapatıldıkça ✅ yapılır; yeni bulgu eklendikçe büyür.

---

## 0. Röntgen özeti — 2026-06-21 (canlı DB: 388 ürün)

| Ölçüt | Sonuç |
|---|---|
| Toplam ürün | 388 |
| Toplam kategori | 25 (2 seviye: 7 ana + 18 alt) |
| Marka dağılımı | Vortice 169 · AVenS 83 · Nicotra Gebhardt 55 · Casals 54 · Danfoss 17 · SLIMROOF 10 |
| `product_prices` | **0 satır** (tamamen boş) |
| `product_images` | 29 görsel → 15 ürün (373 ürün görselsiz) |
| `product_authorities` | **0 satır** (hayalet tablo) |
| `price_lists` | 3 kayıt |
| Enterprise Olgunluk Skoru | **2.7 / 10** |

---

## 1. Tespit tablosu — Ciddiyet × Kategori

Her tespit benzersiz bir `PS-XXX` kodu alır. Ajanlar iş yaparken bu kodu referans verir.

### 1.1 🚨 KRİTİK — Patlamaya hazır sorunlar

| Kod | Tespit | Kanıt | Etki | Karar gerekli mi? |
|---|---|---|---|---|
| **PS-001** | `products`, `categories`, `product_images`, `product_authorities` tablolarında **`tenant_id` kolonu YOK** | `SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='tenant_id'` → 0 row | Multi-tenant SaaS'ta bir tenant diğerinin ürünlerini görür/değiştirir. Sipariş/sepet/fiyat tabloları izolasyonlu → hat **ürün katmanında kırılıyor** | ✅ Migration yazılmalı |
| **PS-002** | `products` tablosunda **`updated_at` trigger'ı YOK** | `SELECT tgname FROM pg_trigger WHERE tgrelid='products'::regclass AND tgname LIKE '%updated_at%'` → 0 row. Diğer tüm tablolarda var | Ürün güncellemesi zaman damgası almıyor → cache invalidation, sitemap `lastmod`, incremental sync, audit hep yanlış | Hayır — doğrudan ekle |
| **PS-003** | `set_user_admin_role(uuid, text)` fonksiyonu herhangi bir `authenticated` kullanıcı tarafından çağrılabilir (SECURITY DEFINER + EXECUTE TO PUBLIC) | Supabase Security Advisor WARN | Herhangi bir login olmuş kullanıcı kendine `super_admin` rolü atayabilir → **tam yetki ihlali** | Hayır — doğrudan kısıtla |
| **PS-004** | `adjust_stock()` ve `set_stock()` fonksiyonları kısıtlamasız (SECURITY DEFINER + EXECUTE TO PUBLIC) | Supabase Security Advisor WARN (4 overload) | Herkes stok değiştirebilir → envanter tutarsızlığı | Hayır — EXECUTE REVOKE + rol kontrolü |
| **PS-005** | `inventory_movements` → `products` FK ilişkisi **CASCADE DELETE** | `pg_trigger` analizi: `RI_FKey_cascade_del` | Ürün silinince stok hareket geçmişi geri dönüşsüz yok olur → muhasebe denetim kaybı | Hayır — CASCADE → RESTRICT |
| **PS-006** | `description` alanının **%95'i sahte** — ürün adı + " - Smart category mapping" kopyası | `SELECT description FROM products ORDER BY random() LIMIT 8` → 6/8 tanesi `{ürün_adı} - Smart category mapping` | SEO duplicate content cezası, müşteri deneyimi sıfır, "description dolu" varsayımı yanıltıcı | Hayır — temizle veya null'a al |

### 1.2 🔴 YÜKSEK — Enterprise blocker

| Kod | Tespit | Kanıt | Etki | Karar gerekli mi? |
|---|---|---|---|---|
| **PS-010** | `currency` kolonu hiçbir yerde yok (`products`, `product_prices`) | Kolon sorgulama → 0 | Çok para birimli fiyat hesabı yapılamaz, alış fiyatı (€) ile satış (₺) birimsiz karışır | ✅ `pricing-standard.md §10` kararı bekliyor |
| **PS-011** | `purchase_price` 388/388 ürünün **tamamında boş** | `count(purchase_price)` → 0 | Maliyet-artı fiyat motoru (pricing-standard §1 Katman 1) çalışamaz → 177 ürün fiyatsız kalıyor | Hayır — Faz B ile doldurulacak |
| **PS-012** | Soft delete (`deleted_at`) mekanizması **yok** — hard delete | `SELECT column_name ... 'deleted_at'` → false | Silinen ürünün geçmişi yok olur; yasal/muhasebe zorunluluğu ihlali; CASCADE ile sipariş öğeleri de silinebilir | ✅ Mimari karar: soft delete mi, archive tablosu mu? |
| **PS-013** | Enterprise B2B için **10 temel kolon** eksik: `weight`, `barcode`/`gtin`, `mpn`, `tax_rate`, `country_of_origin`, `min_order_qty`, `lead_time_days`, `hsn_code`, `is_taxable` | `SELECT EXISTS(... column_name='weight')` → hepsi false | Kargo hesabı, marketplace entegrasyonu, gümrük, ürün bazlı KDV, B2B MOQ hiçbiri yapılamaz | ✅ Hangisi şimdi, hangisi ileride? |
| **PS-014** | **10 destekleyici tablo** tamamen eksik: `product_variants`, `product_tags`, `product_reviews`, `product_related`, `product_bundles`, `product_attributes`, `product_history`, `product_translations`, `brands`, `suppliers` | `SELECT EXISTS(... table_name=X)` → hepsi false | Varyant/etiket/yorum/ilişkili ürün/çeviri/marka normalize/tedarikçi yönetimi yapılamaz | ✅ Yol haritası kararı |
| **PS-015** | `products.price` vs `product_prices` **ikili fiyat mekanizması** | `product_prices` 0 row; `products.price` 219 dolu, 169 sıfır. `pricing.service.ts` ikisini de okumaya çalışıyor | Fiyat kaynağı belirsiz, kod karmaşası, tutarsız müşteri deneyimi | ✅ `pricing-standard.md` kararı bekliyor |
| **PS-016** | i18n altyapısı **sıfır** — `product_translations` tablosu yok, `description` tek alan, dil bilgisi yok | Tablo + kolon sorgulamaları | Çok-dilli siteye geçişte tüm ürün içeriğinin yeniden yazılması gerekecek | ✅ Mimari karar: JSONB çeviri mi, ayrı tablo mu? |

### 1.3 🟠 ORTA — Kalite ve performans

| Kod | Tespit | Kanıt | Etki |
|---|---|---|---|
| **PS-020** | `products` ve `categories` RLS policy'leri **tenant filtresi içermiyor** — `qual: true` (herkese açık SELECT) | `pg_policies` sorgulaması | Şu an tek tenant, sorun patlamıyor; SaaS'ta güvenlik açığı |
| **PS-021** | 6 tabloda RLS enabled ama **policy yok**: `category_mapping_rules`, `client_errors`, `order_email_events`, `payment_transactions`, `rate_limits`, `shipping_idempotency` | Supabase Security Advisor INFO | Bu tablolara anon/authenticated erişimi tamamen kapalı (servis rolü hariç). Kasıtlıysa sorun yok, değilse erişim kırık |
| **PS-022** | `product_images` vs `products.image_url` **ikili görsel sistemi** | 6 üründe `image_url` dolu (hepsi aynı placeholder: `/images/vortice_lineo_futuristic.png`), 15 üründe `product_images` galerisi var, senkron değil | Frontend'in hangi kaynağı render ettiği belirsiz; bakım karmaşası |
| **PS-023** | SEO alanları **%93.5 boş** — 363/388 üründe `meta_title` ve `meta_description` NULL | `count(meta_title)` → 25 | Google indexlemede düşük performans, 363 ürün SEO'suz |
| **PS-024** | **46 kullanılmayan index** (Supabase Performance Advisor) | Advisor çıktısı: çoğunluğu `*_tenant_id` indexleri + FK indexleri | Gereksiz yazma overhead, disk kullanımı. **NOT:** `tenant_id` indexleri tenant izolasyonu eklenince gerekli olacak — silmeyin |
| **PS-025** | Duplicate `updated_at` trigger'ları: `venthub_orders` ve `venthub_order_items`'da iki ayrı trigger aynı işi yapıyor | `pg_trigger` sorgulaması | Her UPDATE'de `updated_at` iki kez set ediliyor → gereksiz overhead |
| **PS-026** | `site_settings`: `INSERT` için 2 permissive policy (`authenticated` rolünde) | Supabase Performance Advisor WARN | Her INSERT'te iki policy değerlendirilir → performans kaybı |
| **PS-027** | Leaked Password Protection **kapalı** | Supabase Security Advisor WARN | HaveIBeenPwned sızıntı kontrolü devre dışı |
| **PS-028** | `model_code` sadece 54/388 (%14) üründe dolu | `count(model_code)` → 54 | Katalog-DB köprüsü (loader) çoğu üründe çalışamaz |
| **PS-029** | `supplier_name` 388/388 ürünün **tamamında boş** | `count(supplier_name)` → 0 | Tedarikçi bazlı filtreleme/raporlama yapılamaz |
| **PS-030** | `brand` serbest metin alanı — `brands` normalize tablosu yok | 6 farklı marka string'i | Büyük/küçük harf tutarsızlığı riski ("VORTICE" vs "Vortice") |
| **PS-031** | `slug` nullable — 1 ürün slug'sız | `count(CASE WHEN slug IS NULL)` → 1 | Bu ürün sitede erişilemez |
| **PS-032** | `product_authorities` tablosu **0 satır** — hayalet | `count(*)` → 0. RLS policy'si bozuk (auth.uid() 123 kez iç içe geçmiş) | Dead weight; policy copy-paste hatası |
| **PS-033** | Fosil kolonlar: `airflow_capacity` (2/388), `noise_level` (2/388), `pressure_rating` (0/388) | Sayım sorguları | `technical_specs` JSONB ile çakışıyor; fosil denormalizasyon |
| **PS-034** | `technical_specs` JSONB key yapısı **tutarsız** — 30+ farklı key, marka bazlı farklılaşıyor | `jsonb_object_keys` dağılımı: `dimensions` 333, `weight_kg` 31, `noise_level_db_a` 24 | Filtreleme/karşılaştırma tablosu için standart key seti tanımlanmalı |
| **PS-035** | 1 ürün **standart dışı SKU**: `65002` (prefix'siz) | `sku NOT LIKE 'AVE-%' AND sku NOT LIKE 'VRT-%'` → `Vortice VORT KRYO-POLAR EVO 11` | Loader eşleştirme problemi |

---

## 2. Veri doluluk panosu (canlı referans)

| Alan | Dolu | Boş | Oran | Yorum |
|---|---|---|---|---|
| `name` | 388 | 0 | %100 | ✅ |
| `brand` | 388 | 0 | %100 | ✅ (ama normalize değil) |
| `sku` | 388 | 0 | %100 | ✅ UNIQUE, 1 standart-dışı |
| `category_id` | 388 | 0 | %100 | ✅ |
| `subcategory_id` | 289 | 99 | %74 | ⚠️ 99 ürün alt kategorisiz |
| `description` | 388 | 0 | %100 | 🔴 **ALDATMACI** — %95'i sahte (PS-006) |
| `technical_specs` | 359 | 29 | %93 | ✅ JSONB object, tutarlı tip |
| `slug` | 387 | 1 | %99.7 | ⚠️ 1 NULL (PS-031) |
| `price > 0` | 219 | 169 | %56 | 🔴 169 fiyatsız |
| `model_code` | 54 | 334 | %14 | 🔴 Loader köprüsü eksik (PS-028) |
| `purchase_price` | 0 | 388 | %0 | 🔴 Tamamen boş (PS-011) |
| `image_url` | 6 | 382 | %2 | 🔴 6 tanesi de aynı placeholder |
| `supplier_name` | 0 | 388 | %0 | 🔴 Tamamen boş (PS-029) |
| `meta_title` | 25 | 363 | %6 | 🔴 SEO boş (PS-023) |
| `meta_description` | 25 | 363 | %6 | 🔴 SEO boş (PS-023) |
| `airflow_capacity` | 2 | 386 | %0.5 | Fosil (PS-033) |
| `noise_level` | 2 | 386 | %0.5 | Fosil (PS-033) |
| `pressure_rating` | 0 | 388 | %0 | Fosil (PS-033) |
| `warehouse_location` | — | — | — | Ölçülmedi |
| `stock_qty` | — | — | — | Tümü 0 (stok yönetimi henüz aktif değil) |

---

## 3. Şema hedefi — `products` tablosu OLMASI GEREKEN

Aşağıdaki tablo, mevcut kolonlar + eklenmesi gereken kolonları birlikte gösterir.

| Kolon | Tip | Nullable | Default | Mevcut mi? | Notlar |
|---|---|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() | ✅ | PK |
| `tenant_id` | uuid | NO | (default tenant) | ❌ PS-001 | FK → tenants, RLS filtresi |
| `name` | text | NO | — | ✅ | |
| `brand` | text | NO | — | ✅ | → İleride `brand_id` FK olmalı (PS-030) |
| `sku` | text | NO | — | ✅ | UNIQUE |
| `model_code` | text | YES | — | ✅ | MPN köprüsü |
| `slug` | text | **NO** | — | ✅ (ama nullable) | NOT NULL yapılmalı (PS-031) |
| `category_id` | uuid | YES | — | ✅ | FK → categories |
| `subcategory_id` | uuid | YES | — | ✅ | FK → categories |
| `status` | text | NO | 'active' | ✅ | CHECK: active/inactive/out_of_stock |
| `description` | text | YES | — | ✅ | Temizlenmeli (PS-006) |
| `technical_specs` | jsonb | YES | — | ✅ | Key standardizasyonu gerekli (PS-034) |
| `price` | numeric(10,2) | NO | 0.00 | ✅ | → İleride kaldırılacak (PS-015) |
| `purchase_price` | numeric(12,2) | YES | — | ✅ | € alış fiyatı hedefi |
| `purchase_currency` | text | YES | 'EUR' | ❌ PS-010 | pricing-standard §10 |
| `image_url` | text | YES | — | ✅ | → İleride kaldırılacak (PS-022) |
| `stock_qty` | int | YES | 0 | ✅ | |
| `weight_kg` | numeric(8,3) | YES | — | ❌ PS-013 | Kargo + marketplace |
| `tax_rate` | numeric(5,2) | YES | 20.00 | ❌ PS-013 | Ürün bazlı KDV |
| `country_of_origin` | text | YES | 'IT' | ❌ PS-013 | Gümrük + fatura |
| `barcode` | text | YES | — | ❌ PS-013 | EAN/GTIN |
| `min_order_qty` | int | YES | 1 | ❌ PS-013 | B2B MOQ |
| `lead_time_days` | int | YES | — | ❌ PS-013 | Tedarik süresi |
| `is_featured` | bool | NO | false | ✅ | |
| `is_taxable` | bool | NO | true | ❌ PS-013 | |
| `is_category_manual` | bool | YES | false | ✅ | |
| `deleted_at` | timestamptz | YES | — | ❌ PS-012 | Soft delete |
| `meta_title` | text | YES | — | ✅ | |
| `meta_description` | text | YES | — | ✅ | |
| `supplier_name` | text | YES | — | ✅ | → İleride `supplier_id` FK olmalı |
| `warehouse_location` | text | YES | — | ✅ | |
| `low_stock_threshold` | int | YES | 10 | ✅ | |
| `low_stock_override` | bool | NO | false | ✅ | |
| `created_at` | timestamptz | NO | now() | ✅ | |
| `updated_at` | timestamptz | NO | now() | ✅ | ⚠️ Kolon var ama **trigger YOK** (PS-002) |

**Fosil kolonlar (kaldırma adayı):**
- `airflow_capacity` — `technical_specs`'te zaten var (PS-033)
- `noise_level` — `technical_specs`'te zaten var (PS-033)
- `pressure_rating` — `technical_specs`'te zaten var (PS-033)

---

## 4. FK ilişkileri + silme davranışı — OLMASI GEREKEN

| FK Kaynağı → Hedef | Mevcut Davranış | Olması Gereken | Neden |
|---|---|---|---|
| `product_images` → `products` | CASCADE | CASCADE | ✅ Ürün silinince görseller de silinsin |
| `product_prices` → `products` | CASCADE | CASCADE | ✅ Fiyat satırları da silinsin (soft delete ile birlikte sorun olmaz) |
| `inventory_movements` → `products` | **CASCADE** | **RESTRICT** | 🔴 PS-005: Stok geçmişi asla silinmemeli |
| `venthub_order_items` → `products` | RESTRICT | RESTRICT | ✅ Sipariş varsa ürün silinemez |
| `project_items` → `products` | CASCADE | SET NULL | ⚠️ Proje öğeleri korunsun |
| `wizard_selections` → `products` | SET NULL | SET NULL | ✅ |
| `cart_items` → `products` | — | RESTRICT veya SET NULL | Sepette olan ürün silinmesin |

---

## 5. RLS policy hedefi — ürün ekosistemi

### 5.1 `products` (PS-001, PS-020 düzeltmesi)

| Operasyon | Rol | Kural |
|---|---|---|
| SELECT | `anon`, `authenticated` | `tenant_id = jwt_tenant_id()` + `status = 'active'` (vitrin) |
| SELECT (admin) | `authenticated` (admin/moderator) | `tenant_id = jwt_tenant_id()` (tüm status) |
| INSERT | `authenticated` (admin/moderator) | `tenant_id = jwt_tenant_id()` |
| UPDATE | `authenticated` (admin/moderator) | `tenant_id = jwt_tenant_id()` (USING + WITH CHECK) |
| DELETE | `authenticated` (admin) | `tenant_id = jwt_tenant_id()` |
| ALL | `service_role` | `true` |

### 5.2 Aynı desen: `categories`, `product_images`, `product_authorities`
Tenant filtresi eklendikten sonra aynı rol-bazlı erişim deseni uygulanır.

---

## 6. Trigger hedefi — `products`

| Trigger | Fonksiyon | Var mı? |
|---|---|---|
| `tr_products_updated_at` | `set_updated_at()` BEFORE UPDATE | ❌ **YOK — PS-002** |
| `on_products_change` | `handle_supabase_webhook()` AFTER INSERT/UPDATE/DELETE | ✅ |
| `tr_product_auto_category` | `tr_auto_categorize_trigger()` AFTER INSERT/UPDATE | ✅ |

---

## 7. Index hedefi — `products`

| Index | Mevcut mi? | Notlar |
|---|---|---|
| `products_pkey` (id) | ✅ | |
| `products_sku_key` (sku) UNIQUE | ✅ | |
| `uq_products_slug_lower` (lower(slug)) UNIQUE | ✅ | |
| `idx_products_slug` (slug) | ✅ | Slug UNIQUE zaten var, bu gereksiz olabilir |
| `idx_products_category_id` | ✅ | |
| `idx_products_subcategory_id` | ✅ | |
| `idx_products_featured` (is_featured) WHERE active | ✅ | |
| `idx_products_brand_trgm` (brand gin_trgm_ops) | ✅ | Fuzzy arama |
| `idx_products_name_trgm` (name gin_trgm_ops) | ✅ | Fuzzy arama |
| `idx_products_tenant_id` (tenant_id) | ❌ | PS-001 ile birlikte eklenecek |
| `idx_products_status` (status) | ❌ | Vitrin sorguları için faydalı |
| `idx_products_model_code` (model_code) | ❌ | Loader eşleştirme için |
| `idx_products_technical_specs` (technical_specs) GIN | ❌ | Spec filtreleme için (opsiyonel) |

---

## 8. SECURITY DEFINER fonksiyonları — düzeltme hedefi

| Fonksiyon | Mevcut Durum | Hedef |
|---|---|---|
| `set_user_admin_role(uuid, text)` | 🔴 Herkes çağırabilir | REVOKE EXECUTE FROM authenticated; sadece super_admin çağırabilmeli |
| `adjust_stock(...)` × 2 overload | ⚠️ Herkes çağırabilir | REVOKE EXECUTE FROM authenticated; fonksiyon içi `is_user_admin()` + `is_staff_user()` kontrolü |
| `set_stock(...)` × 2 overload | ⚠️ Herkes çağırabilir | Aynı |
| `admin_list_users()` | ⚠️ Herkes çağırabilir | REVOKE EXECUTE; admin-only |
| `admin_list_all_users()` | ⚠️ Kontrol edilmeli | REVOKE EXECUTE; super_admin-only |

---

## 9. `technical_specs` JSONB key standardı (hedef)

Mevcut dağılım analizi + HVAC sektör gereksinimleri doğrultusunda standart key seti:

### 9.1 Zorunlu key'ler (her üründe olmalı)

| Key | Tip | Örnek | Mevcut doluluk |
|---|---|---|---|
| `dimensions` | string | "280×280×157 mm" | 333/359 |
| `weight_kg` | number | 2.5 | 31/359 |
| `voltage_v` | number | 230 | 31/359 |
| `frequency_hz` | number | 50 | 31/359 |

### 9.2 Kategori bazlı key'ler (ilgili ürünlerde)

| Key | Tip | Geçerli Kategoriler | Mevcut doluluk |
|---|---|---|---|
| `airflow_m3h` | number | Fan, HRV, Hava Perdesi | — (hesaplanmalı) |
| `noise_level_db_a` | number | Tümü | 24/359 |
| `max_static_pressure_pa` | number | Kanal fanları | 24/359 |
| `connection_diameter` | string | Kanal fanları | 333/359 |
| `ip_rating` | string | Tümü | 24/359 |
| `motor_type` | string | Fan | 24/359 |
| `design_type` | string | Konut fanları | 333/359 |

> **Kural:** `technical_specs` key'leri `snake_case`, birim suffix'li (örn. `_kg`, `_mm`, `_db_a`, `_pa`, `_m3h`, `_w`, `_v`, `_hz`). Yeni key eklemeden önce bu listeye bakılır.

---

## 10. Destekleyici tablolar — yol haritası

| Tablo | Öncelik | Ne Zaman | Bağımlı Bulgu |
|---|---|---|---|
| `product_translations` | 🔴 Yüksek | i18n başlamadan ÖNCE | PS-016 |
| `brands` | 🟠 Orta | Marka normalizasyonuyla | PS-030 |
| `suppliers` | 🟠 Orta | Tedarikçi modülüyle | PS-029 |
| `product_history` | 🟠 Orta | Audit güçlendirmeyle | PS-002, PS-012 |
| `product_tags` | 🟡 Düşük | Filtreleme/arama genişletme | — |
| `product_attributes` | 🟡 Düşük | Spec filtreleme UI | PS-034 |
| `product_variants` | 🟡 Düşük | Varyant desteği gerektiğinde | — |
| `product_reviews` | 🟡 Düşük | Yorum modülüyle | — |
| `product_related` | 🟡 Düşük | Cross-sell/up-sell ile | — |
| `product_bundles` | 🟡 Düşük | Set ürün desteğiyle | — |

---

## 11. İlişki / SSOT

- **Fiyat mekanizması detayı →** `docs/standards/pricing-standard.md` (Katman 1-2-3, currency, marj motoru)
- **Katalog veri hattı →** `docs/standards/catalog-ingestion-standard.md` (PDF→CSV→DB akışı)
- **CSV format kontratı →** `docs/standards/csv-import-export-standard.md`
- **Kategori taksonomisi →** `docs/standards/category-taxonomy-standard.md`
- **Admin paneli kuralları →** `docs/standards/admin-standard.md` (K1-K5, CRUD, yetki)
- **Master plan (orkestrasyon) →** `docs/plans/catalog-commerce-pipeline-master-2026-06-20.md`
- **Supabase güvenlik →** `docs/reference/supabase/row-level-security.md`

---

> 2026-06-21 · v1.0 · Canlı DB röntgeniyle oluşturuldu. Bulgu kapatıldıkça güncellenir.
