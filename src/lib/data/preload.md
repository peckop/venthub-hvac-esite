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
generated_at: 2026-06-07T12:06:28Z
---

## Genel Bakış
Bu modül, kullanıcı navigasyonunu hızlandırmak için ürünler ve kategoriler gibi temel verileri tarayıcı tarafında önceden yüklemekle sorumludur. Fonksiyonlar, veri alma süreçlerini tetikleyerek olası sonraki sayfa geçişlerinde yüklenme gecikmesini azaltır.

## Fonksiyon Grupları
### Önbellekleme Tetikleyicileri
Bu grup, belirli bir slug ile gelen istekleri işleyerek ilgili verilerin tarayıcı önbelleğine alınmasını sağlar. Fonksiyonlar doğrudan veri döndürmez, sadece yükleme işlemini başlatır.
- preloadProduct, preloadCategory

---

## AXIOMS – Mimari Varsayımlar

Bu modül, tarayıcı tarafında veri önbellekleme tetikleyicileri içerir. Aşağıdaki varsayımlar, fonksiyon imzalarından ve modül yapısından türetilmiştir.

[Aksiyom 1]: Eğer `preloadProduct` fonksiyonu çağrıldığında `slug` parametresi geçerli bir ürün tanımlayıcısı değilse, ilgili ürün verisi önbelleğe alınamaz ve potansiyel navigasyonda veri yükleme gecikmesi yaşanır.

[Aksiyom 2]: Eğer `preloadCategory` fonksiyonu çağrıldığında `slug` parametresi geçerli bir kategori tanımlayıcısı değilse, ilgili kategori verisi önbelleğe alınamaz ve potansiyel navigasyonda veri yükleme gecikmesi yaşanır.

[Aksiyom 3]: Bu modülün doğru çalışması için, `getCachedProductBySlug` ve `getCachedCategoryData` fonksiyonlarının var olması ve çağrılabilir durumda olması gerekir; aksi takdirde önbellekleme tetikleme işlemleri başarısız olur.

[Aksiyom 4]: Bu modüldeki fonksiyonlar sadece yükleme işlemini tetikler, doğrudan veri dönmez; eğer tetikleme mekanizması başarısız olursa, sonraki sayfa geçişlerinde veriler önbellekten alınamaz ve tam yükleme gecikmesi yaşanır.

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
  return getProductBySlug(supabase, slug)
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