---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\data\preload.ts
skeleton_hash: d7582c0d3f648efe
entity_hashes:
  func:preloadCategory: 5c31b78ecaccbf15
  func:preloadProduct: ffb09955ca2af5e6
  overview: 4f8c5f040d941a01
generated_at: 2026-06-06T21:55:38Z
---

## Genel Bakış
Bu modül, kullanıcı navigasyonunu hızlandırmak için ürünler ve kategoriler gibi temel verileri tarayıcı tarafında önceden yüklemekle sorumludur. Fonksiyonlar, veri alma süreçlerini tetikleyerek olası sonraki sayfa geçişlerinde yüklenme gecikmesini azaltır.

## Fonksiyon Grupları
### Önbellekleme Tetikleyicileri
Bu grup, belirli bir slug ile gelen istekleri işleyerek ilgili verilerin tarayıcı önbelleğine alınmasını sağlar. Fonksiyonlar doğrudan veri döndürmez, sadece yükleme işlemini başlatır.
- preloadProduct, preloadCategory

---



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

### [N1_NASIL] AST Pointer: src/lib/data/preload.ts::getCachedProductBySlug
- **params**: (`slug: string`)
- **ic_degiskenler**:
  _(değişken yok — doğrudan return ile çağrı iletilir)_
- **Dönüş**: `getProductBySlug(slug)`ReturnType — slug ile ürün servisi sonucu (Promise); `void` ile sarılmış olarak kullanılır

---

### [N2_NASIL] AST Pointer: src/lib/data/preload.ts::getCachedCategoryData
- **params**: (`slug: string`)
- **ic_degiskenler**:
  - `data` — Supabase `categories` tablosundan `.single()` ile dönen satır verisi; alanları `id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, marketing_title, menu_label, metadata, translation_key, authority_content` olarak select edilir
  - `error` — Supabase sorgusunda oluşabilecek hata nesnesi; `null` ise sorgu başarılı demektir
- **Dönüş**: `mapDatabaseCategoryToDomain(...)` çağrısının dönüşü (domain kategori nesnesi) veya `null` (hata/veri yoksa)

---

### [N3_NASIL] AST Pointer: src/lib/data/preload.ts::preloadProduct
- **params**: (`slug: string`)
- **ic_degiskenler**:
  _(değişken yok — doğrudan `getCachedProductBySlug` çağrısı yapılır)_
- **Dönüş**: yok (`void` — fonksiyon sonucu kasıtlı olarak atılır; sadece yan etki/cache warming amaçlıdır)

---

### [N4_NASIL] AST Pointer: src/lib/data/preload.ts::preloadCategory
- **params**: (`slug: string`)
- **ic_degiskenler**:
  _(değişken yok — doğrudan `getCachedCategoryData` çağrısı yapılır)_
- **Dönüş**: yok (`void` — fonksiyon sonucu kasıtlı olarak atılır; sadece yan etki/cache warming amaçlıdır)

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