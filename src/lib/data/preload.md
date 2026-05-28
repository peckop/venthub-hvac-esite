---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\data\preload.ts
skeleton_hash: de26798c54572da7
entity_hashes:
  func:preloadCategory: 5c31b78ecaccbf15
  func:preloadProduct: ffb09955ca2af5e6
  overview: fbf5026e6d49d8ba
generated_at: 2026-05-28T22:38:03Z
---

## Genel Bakış
(Sentez hatası)

---

## AXIOMS – Mimari Varsayımlar
(Sentez hatası)

---

## FONKSİYON DETAYLARI

### preloadProduct
**Ne yapar**: Belirli bir ürünün verilerini, potansiyel bir kullanıcı navigasyonu için önceden yükler (preload eder).
**Nasıl yapar**: Fonksiyon, gelen `slug` parametresini kullanarak `getCachedProductBySlug` fonksiyonunu çağırır. Çağrının sonucu `void` ile atıldığı için, mevcut durumda返回值 doğrudan kullanılmaz; temel amaç, tarayıcıda o ürüne ait verilerin önbelleğe alınmasını tetiklemektir.
**Parametreler**:
- slug: string — Yüklenmek istenen ürünün benzersiz, URL-dostu tanımlayıcısı (friendly identifier).
**Dönüş**: void

### preloadCategory
**Ne yapar**: Belirli bir kategoriye ait verileri, olası bir sonraki sayfa yüklemesi için tarayıcı tarafında önceden yükler.
**Nasıl yapar**: Fonksiyon, verilen `slug` parametresiyle `getCachedCategoryData` fonksiyonunu çağırır. Bu çağrı, ilgili kategori verilerinin istemci tarafında önbelleğe alınmasını veya hazırlanmasını sağlar, böylece kullanıcı o kategori sayfasına geçiş yaptığında veriler hemen kullanılabilir olur.
**Parametreler**:
- slug: string — Yüklenmek istenen kategorinin URL yapısındaki benzersiz tanımlayıcısı.
**Dönüş**: void

---

## SABİTLER
- **getCachedProductBySlug** (call) — `cache(async (slug: string) => {
  return getProductBySlug(slug)
})`
- **getCachedCategoryData** (call) — `cache(async (slug: string) => {
  const { data, error } = await supabase
    ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/lib/data/preload.ts`::`<anonymous_product_fetcher>`
- **params**: `slug` — string, ürün slug'ı
- **ic_degiskenler**: (yok)
- **Dönüş**: `getProductBySlug(slug)` return değeri — `getProductBySlug` API çağrısıyla elde edilen ürün verisi

### [N2_NASIL] AST Pointer: `src/lib/data/preload.ts`::`<anonymous_category_fetcher>`
- **params**: `slug` — string, kategori slug'ı
- **ic_degiskenler**:
  - `data` — Supabase'den dönen kategori satır verisi (destructure: `{ data, error }`); `categories` tablosundan select ile alınan tüm alanları içerir (`id`, `name`, `parent_id`, `slug`, `is_active`, `sort_order`, `level`, `image_url`, `seo_title`, `seo_desc`, `created_at`, `updated_at`, `description`, `display_mode`, `is_featured`, `marketing_title`, `menu_label`, `metadata`, `translation_key`, `authority_content`)
  - `error` — Supabase `.single()` sorgusundan dönen hata nesnesi; sorgu başarısızsa dolu olur
- **Dönüş**: `mapDatabaseCategoryToDomain(...)` return değeri (domain Category nesnesi) veya `null` (hata/boş veri durumunda)

### [N3_NASIL] AST Pointer: `src/lib/data/preload.ts`::`preloadProduct`
- **params**: `slug` — string, ön yüklenecek ürünün slug'ı
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (`void`) — `getCachedProductBySlug(slug)` çağrısının sonucu `void` ile atılarak yan etki olarak çalıştırılır; dönüş değeri kasıtlı olarak yutulur

### [N4_NASIL] AST Pointer: `src/lib/data/preload.ts`::`preloadCategory`
- **params**: `slug` — string, ön yüklenecek kategorinin slug'ı
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (`void`) — `getCachedCategoryData(slug)` çağrısının sonucu `void` ile atılarak yan etki olarak çalıştırılır; dönüş değeri kasıtlı olarak yutulur

---

## NODE ID STANDARD

  file: src\lib\data\preload.ts
  function: src\lib\data\preload.ts::preloadProduct
  function: src\lib\data\preload.ts::preloadCategory

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCachedCategoryData
  export: getCachedProductBySlug
  export: preloadCategory
  export: preloadProduct