# VentHub Ürün Veritabanı Şeması Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** "Ürün veritabanı şeması ve ilişkileri nasıl tasarlanmalıdır?" sorusunun **karar veren tek doğruluk kaynağı (SSOT).**
> Ürün ekosisteminin (product_families, products, categories, pricing, technical_specs) veritabanı şeması kuralları bu belgede tanımlanmıştır. Herhangi bir çelişki durumunda bu cetvel kazanır.
>
> **Dünya Referansları:** [Medusa.js v2](https://docs.medusajs.com), [Shopify Admin API](https://shopify.dev/docs/api/admin-graphql), [Saleor EAV](https://docs.saleor.io), [SAP Commerce (Hybris) Europe1](https://help.sap.com), [Odoo Pricelists](https://www.odoo.com/documentation/17.0/applications/sales/sales/products_prices/prices/pricing.html).

---

## 1. İlkeler (Aksiyomlar)

*   **Aksiyom 1: Aile-Varyant Ayrımı (Split-Model):** Basit veya varyasyonlu tüm ürünler parent-child ilişkisiyle modellenir. Parent genel özellikleri ve çevirileri tutarken, child envanter ve fiziksel özellikleri tutar. (Referans: Odoo `product.template` -> `product.product`, SAP `Product` -> `VariantProduct` [PS-014], [PS-040]).
*   **Aksiyom 2: Tenant İzolasyonu ve Sızdırmazlık:** SaaS modelinde her veri satırı ve Storage dosyası doğrulanabilir bir tenant kimliğine (`tenant_id`) bağlı olmalıdır. RLS politikaları, tenant sınırı dışına veri sızmasını veritabanı motoru düzeyinde engeller. (Referans: Citus Data Multi-Tenant Architecture [PS-001], [PS-020]).
*   **Aksiyom 3: Sıfır-EAV JSONB Yapısı:** Dinamik teknik özellikler (debi, basınç, voltaj vb.) için performans düşüren EAV (Entity-Attribute-Value) tabloları yerine, PostgreSQL'in native `jsonb_path_ops` indeksli JSONB alanı kullanılmalıdır. (Referans: Medusa v2 `metadata` JSONB [PS-033], [PS-034]).
*   **Aksiyom 4: JSONB i18n İzolasyonu (Aksiyom 5 Paritesi):** Çeviri verileri ilişkisel veritabanı JOIN maliyetlerinden kaçınmak için `i18n-localization-standard.md` Aksiyom 5'e uygun olarak JSONB nesneleri (`technical_specs.metadata->lang`) içinde saklanmalıdır. İlişkisel çeviri tabloları yasaktır. (Referans: Medusa v2 localized JSON [PS-016]).
*   **Aksiyom 5: SEO Link ve URL Kararlılığı:** Ürün URL yapısı kategorilerden ve varyant parametrelerinden bağımsız olarak düz (flat) ve değişmez olmalıdır. Arama motorları için varyantlar tek bir parent URL altında canonicalize edilmelidir. (Referans: Shopify Canonical URL [PS-039], [PS-043]).

---

## 2. Tablo Yapısı Kuralları

### 2.1 Ürün Ailesi (`product_families`) — Parent
Kataloğun temel şablonunu oluşturur. Varyasyonu olmayan ürünler dahil tüm sistem bu tabloda bir kayda sahip olmalıdır.
*   **Saklanan Alanlar:** `id` (UUID), `tenant_id`, `name`, `slug`, `brand_id` (normalizasyon zorunludur, serbest metin yasaktır [PS-030]), `description`, `is_description_manual` [PS-006], `created_at`, `updated_at`, `deleted_at`.
*   **Açıklama Kalite Kuralı (Description Quality - [PS-006]):** Ürün açıklamalarının (`description`) kategori trigger'larından veya statik şablonlardan otomatik üretilmiş sahte içerik (`"{product_name} - Smart category mapping"` gibi) barındırması kesinlikle yasaktır. Otomatik şablon üretimi kullanılacaksa, teknik parametreler (örn: `technical_specs` içinden debi vb.) dinamik olarak enjekte edilmeli ve her açıklama en az 50 karakter uzunluğunda olmalıdır.
*   **Manuel Kilit Mekanizması:** Tabloda `is_description_manual BOOLEAN DEFAULT false` kolonu bulunmalı, insan eliyle yapılan güncellemelerde bu alan `true` set edilerek otomatik şablon güncellemelerine karşı kilitlenmelidir.
*   **Sayfalama Sınırları (Pagination - [PS-040]):** Ürün listeleme ve arama API'lerinde sayfalama (pagination) düz varyant satırları (`products`) yerine strictly parent `product_families` üzerinden yapılmalıdır. Bu, frontend'deki seri gruplamalarında sayfa başına kart sayısının düzensizleşmesini (PS-040) ve kümülatif düzen kaymasını (CLS) engeller.

### 2.2 Ürün Varyantı (`products` / `product_variants`) — Child
Satışa konu olan somut SKU'dur. Stok ve lojistik bu tablodaki kayıtlarla yönetilir.
*   **Saklanan Alanlar:** `id` (UUID), `tenant_id`, `family_id` (FK -> `product_families`), `sku`, `model_code` [PS-028], `barcode`, `purchase_price` [PS-011], `purchase_currency` [PS-010], `status` (active, draft, archived), `technical_specs` (JSONB), `weight_kg`, `width_mm`, `height_mm`, `depth_mm` [PS-013].
*   **Over-fetching Önleme (Over-fetching - [PS-041]):** Liste sayfaları API response'larında varyantların tüm teknik detayları ve `technical_specs` JSONB kolonu çekilmemei (over-fetching engellenmeli), bu veriler yalnızca Ürün Detay Sayfası (PDP) seviyesinde lazy-load edilmelidir. Liste kartları için parent düzeyinde `min_price` ve `featured_image` gibi agregasyon verileri döndürülmelidir.
*   **Önbellek Sınırları (Cache Isolation - [PS-042]):** Sık değişen stok ve fiyat güncellemelerinin, statik ürün ailesi keşif önbelleğini (`products-discovery-${tenantId}`) çökertmesini (cache thrashing) engellemek için, yapısal ürün katalog verileri ile stok/fiyat verilerinin önbellek etiketleri (`variant-stock-${variantId}`) birbirinden izole edilmeli, stok hareketleri keşif önbelleğini tetiklememelidir.


### 2.3 Kategori Hiyerarşisi (`categories`)
Kategoriler sınırsız derinlikte hiyerarşiyi destekleyen rekürsif self-referential `parent_id` yapısında olmalıdır [PS-038].
*   **Silme Politikası:** Bir üst kategori silindiğinde alt kategorileri silinmemei (`ON DELETE RESTRICT` [PS-037]), ürünlerin kategori referansı boşa düşürülmemelidir.
*   **Seviye Kontrolü:** Kategori seviyeleri (`level`) parent-child zincirine göre veritabanı triggerı veya check constraint ile otomatik doğrulanmalıdır [PS-036].

### 2.4 Fiyat Listeleri (`product_prices` + `price_lists`)
`pricing-standard.md` ile uyumlu olarak fiyatlar doğrudan products tablosunda değil, segment ve miktar kırılımlarını destekleyen alt tablolarda tutulmalıdır [PS-015].
*   **İlişkiler:** `price_lists` (B2B tier, organizasyon eşleşmesi) -> `product_prices` (fiyat satırı).
*   **Alanlar:** `price_amount`, `currency` (ISO), `min_quantity` (kademeli B2B fiyatları için) [PS-015].

### 2.5 Ürün Görselleri (`product_images` & Storage)
Ürün görsel takibinde çift başlılık (hem products.image_url hem de product_images tablosunun kullanılması) yasaktır [PS-022].
*   Tüm görseller `product_images` tablosunda `(product_id, storage_path, sort_order)` ilişkisiyle tutulmalıdır.
*   Görsellerin fiziki dosyaları Supabase Storage üzerinde `product-images/[tenant_id]/[file_path]` path kuralına göre izole edilmelidir.

### 2.6 Teknik Özellikler (`technical_specs` JSONB)
HVAC parametreleri (debi, statik basınç vb.) JSONB formatında saklanır. 
*   **Bütünlük:** Her bir teknik anahtar (key) tip kontrolünden geçirilmeli, boş veya tutarsız anahtar adlandırmalarından (`air_flow` vs `airflow_capacity`) kaçınılmalıdır [PS-033], [PS-034].

---

## 3. Kolon Zorunlulukları

Her tablo için minimum zorunlu kolon setleri ve nullability kuralları:

| Tablo | Kolon | Tip | Özellik | Gerekçe |
| :--- | :--- | :--- | :--- | :--- |
| **Tüm Tablolar** | `tenant_id` | `uuid` | `NOT NULL`, `DEFAULT (SELECT public.jwt_tenant_id())` | SaaS izolasyon güvencesi [PS-001]. |
| **product_families** | `slug` | `text` | `NOT NULL`, `UNIQUE` | URL çözümü ve SEO stabilitesi [PS-031]. |
| **product_families** | `is_description_manual` | `boolean` | `NOT NULL`, `DEFAULT false` | Açıklama kalite trigger kilidi [PS-006]. |
| **products** | `sku` | `text` | `NOT NULL`, `UNIQUE`, `CHECK (sku ~ '^[A-Z0-9-]+$')` | Standartlaştırılmış B2B envanter kodu [PS-035]. |
| **products** | `purchase_price` | `numeric(12,4)`| `NOT NULL`, `DEFAULT 0.0000` | Cost-plus fiyat hesaplamasının doğruluğu [PS-011]. |
| **products** | `purchase_currency`| `varchar(3)` | `NOT NULL`, `DEFAULT 'TRY'` | Kur çevrimlerinin taban para birimi [PS-010]. |
| **categories** | `parent_id` | `uuid` | `NULLABLE`, `ON DELETE RESTRICT` | Ağaç yapısının bütünlüğü, yetim kategori oluşumunu engelleme [PS-037]. |

---

## 4. FK ve CASCADE Kuralları

İlişkisel bütünlük ve kazara veri kaybı risklerini (data loss) engellemek için şu kurallar geçerlidir:
*   **Denetim İzi Koruması:** `inventory_movements` tablosunun `product_id` ilişkisinde `ON DELETE CASCADE` kullanımı yasaktır [PS-005]. Ürün silindiğinde envanter hareket geçmişi silinmemeli, yerine `ON DELETE RESTRICT` veya yumuşak silme (soft delete) kullanılmalıdır.
*   **Katalog Güvenliği:** `categories.parent_id` ilişkisi `ON DELETE RESTRICT` olmalıdır [PS-037]. Bir kategori silinmeden önce alt kategorileri başka bir düğüme taşınmalı veya silinmelidir.
*   **Bayi ve Fiyat Güvenliği:** Fiyat listeleri (`price_lists`) silindiğinde tarihsel sipariş snaphot'ları etkilenmemeli, ödeme ve sipariş kayıtları kendi içlerinde donmuş fiyat snapshot'ları (`product_price_snapshot`) barındırmalıdır [PS-045].

---

## 5. Tenant İzolasyonu (SaaS)

*   **İndeksleme:** `tenant_id` kolonu üzerinde `B-Tree` indeks tanımlanması zorunludur.
*   **RLS Politika Şablonu:** Row Level Security (RLS) politikalarında helper fonksiyon çağrıları, her satır için fonksiyonun tekrar çalışmasını engellemek üzere bir scalar alt sorgu (scalar subquery / InitPlan) ile sarmalanmalıdır [PS-020].

```sql
-- Doğru RLS Politika Yapısı (InitPlan kullanan)
CREATE POLICY product_tenant_isolation_policy ON public.products
  FOR ALL
  TO authenticated
  USING (tenant_id = (SELECT public.jwt_tenant_id()));
```

---

## 6. i18n (Çok Dil)

*   **İlişkisel Tablo Yasaktır:** Çeviriler için `product_translations` gibi ek tablolar açılmayacaktır.
*   **JSONB i18n Deseni:** Ürün tanımı, pazarlama metinleri ve teknik özellikler dil anahtarlarına bölünmüş JSONB alanlarında tutulmalıdır.
```json
{
  "name": {
    "tr": "Punto Mex Aksiyel Fan",
    "en": "Punto Mex Axial Fan"
  },
  "technical_specs": {
    "airflow_capacity": {
      "value": 90,
      "unit": "m³/h"
    }
  }
}
```

---

## 7. SEO ve URL Yapısı

*   **Flat URL Yönlendirmesi:** Ürün sayfası URL'si kategori yollarını içermemeli, doğrudan `/products/[family-slug]` formatında olmalıdır. Bu, URL stabilitesini korur [PS-039].
*   **Canonical URL Kuralı:** Varyant sayfaları (Örn: `/products/punto-mex?size=100`) her zaman ana aile sayfasına (`/products/punto-mex`) canonical etiketi ile bağlanmalıdır [PS-043].
*   **JSON-LD Schema Yapısı:** Ürün detay sayfalarında `ProductGroup` structured data standardı uygulanmalıdır. JSON-LD içinde veritabanı UUID'leri sızdırılmamalı, public URI slug'ları kullanılmalı ve `"isPartOf": { "@id": "${site_url}/#website" }` ilişkisi bulunmalıdır.

---

## 8. Trigger ve Audit Kuralları

*   **Zaman Damgaları:** Ürünler (`products`) ve ürün aileleri (`product_families`) tablolarında `updated_at` kolonunu güncelleyen standard `BEFORE UPDATE` triggerı bulunması zorunludur [PS-002].
*   **Yumuşak Silme (Soft Delete):** Ürün silme işlemleri fiziki delete yerine `deleted_at timestamp` kolonu güncellenerek soft delete olarak yapılmalıdır [PS-012].
*   **Sitemap ve Keşif:** Sitemap üreticileri ve statik sayfa oluşturucular (SSG) sadece `deleted_at IS NULL` olan ve canonical ana sayfaları listeleyecek şekilde yapılandırılmalıdır [PS-043].

---

## 9. İndeksleme Stratejisi

*   **JSONB Sorgu İndeksi:** `technical_specs` kolonu üzerinde containment (`@>`) sorgularını hızlandırmak için standard GIN indeksi yerine %30-50 daha az yer kaplayan ve daha hızlı yazılan `jsonb_path_ops` GIN indeksi kurulmalıdır [PS-034].
```sql
CREATE INDEX idx_products_tech_specs_path ON public.products USING gin (technical_specs jsonb_path_ops);
```
*   **Metin Arama İndeksi:** Türkçe full-text search için JSONB cast içeren FTS indeksleri kurulmalı, ancak arama fonksiyonlarının döndürdüğü kolon listesi (Örn: `is_fuzzy_match`) ile TypeScript tipleri (`database.types.ts`) tam uyumlu olmalıdır.

---

## 10. Güvenlik

*   **SECURITY INVOKER Varsayımı:** RLS politikalarında ve kullanıcı sorgularında tetiklenen tüm yardımcı veritabanı fonksiyonları (örn: `jwt_tenant_id`), yetki yükseltme açıklarını (privilege escalation) engellemek için `SECURITY INVOKER` olarak tanımlanmalıdır [PS-003], [PS-004].
*   **Constraint Uyumsuzlukları:** Güvenlik rolleri veritabanı constraint kuralları ile 100% eşleşmelidir. Örneğin `user_profiles_role_check` tablosu `'super_admin'` (alt çizgili) kuralını korurken, yardımcı fonksiyonlar `'superadmin'` (alt çizgisiz) araması yapmamalıdır; bu durum admin yetkilendirmesini tamamen kilitler [PS-046].
*   **Edge Function CORS Standardizasyonu ([PS-044]):** Deno Edge Function'larda tekil dosyada çift CORS bildiriminden kaynaklanan syntax/derleme hatalarını (PS-044) ve kod tekrarlarını engellemek için, CORS tanımları `supabase/functions/_shared/cors.ts` altında merkezi bir middleware (`withCors` yüksek dereceli fonksiyonu) veya tekil `getCorsHeaders(req)` helper'ı ile yönetilmelidir. Her handler içinde yerel olarak `const cors = ...` veya `const corsHeaders = ...` redeklare edilmesi yasaktır.
*   **Storage Bucket İzolasyonu:** storage.objects RLS kuralları dosya yolunun ilk klasörünü regex ile UUID formatında doğrulamalı ve aktif tenant ile eşleştirmelidir.
```sql
CREATE POLICY storage_tenant_isolation ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND split_part(name, '/', 1)::uuid = (SELECT public.jwt_tenant_id()));
```

---

## 11. Referanslar

1.  **Medusa.js v2 Pricing & Attribute Architecture:** [medusajs.com/docs/modules/pricing](https://docs.medusajs.com) (Multi-currency PriceSets and Rule Engines).
2.  **Shopify Admin API Product/Variant Option Limits:** [shopify.dev/docs/api/admin-graphql/latest/queries/product](https://shopify.dev/docs/api/admin-graphql) (Standardization of selected options).
3.  **Saleor Typed Dynamic Attributes EAV Model:** [saleor.io/docs/developer/attributes](https://docs.saleor.io) (Django strict attributes structure).
4.  **SAP Commerce Cloud (Hybris) Europe1 Price Engine:** [help.sap.com/hybris-europe1-pricing](https://help.sap.com) (Specificity priority ladder and user price groups).
5.  **Odoo Pricelist Margin Formulas:** [odoo.com/documentation/applications/sales](https://www.odoo.com) (Cost-plus margin matrix calculation).
6.  **Google Search Central - Product Variants Guidelines:** [google.com/search/docs/appearance/structured-data/product-variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants) (Duplicate content mitigation).
7.  **Schema.org ProductGroup Standard Specs:** [schema.org/ProductGroup](https://schema.org/ProductGroup) (Parent-child variant markup structure).
8.  **Supabase Edge Functions CORS Documentation:** [supabase.com/docs/guides/functions/cors](https://supabase.com/docs/guides/functions/cors) (Centralized CORS handling and dynamic origin validation).

