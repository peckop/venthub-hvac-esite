---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\data\preload.ts
skeleton_hash: a55c7e077252a69f
entity_hashes:
  func:preloadCategory: 5c31b78ecaccbf15
  func:preloadProduct: ffb09955ca2af5e6
  overview: 429cab0c1f1eaff7
generated_at: 2026-06-08T10:09:33Z
---

## Genel Bakış
Bu modül, tarayıcı tarafında performans optimizasyonu sağlamak için temel veri varlıklarının (ürün ve kategoriler) önceden yüklenmesini tetikleme sorumluluğuna sahiptir. Fonksiyonlar, sayfa geçişleri sırasında verilerin zaten hazırlanmış olmasını sağlayarak kullanıcı deneyimini iyileştirir.

## Fonksiyon Grupları
### Veri Önbellekleme Tetikleyicileri
Bu grup, belirli bir varlık tanımlayıcısı (slug) ile çağrıldığında, ilgili veri setinin arka planda tarayıcı önbelleğine alınmasını başlatan fonksiyonları içerir. Fonksiyonlar doğrudan veri sağlamaz, yalnızca yükleme işlemini başlatarak sonraki navigasyonları hızlandırır.
- preloadProduct, preloadCategory

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ürünlerin ve kategorilerin tarayıcı tarafında önceden yüklenmesini sağlayan iki fonksiyondan oluşur. Aşağıdaki varsayımlar, fonksiyon imzaları ve modül sabitlerinden türetilmiştir.

[Aksiyom 1]: Eğer `preloadProduct` çağrısında `slug` parametresi verilmezse,fonksiyon doğru çalışamaz — çünkü `slug: string` zorunlu bir parametredir ve varsayılan bir değer tanımı yoktur.

[Aksiyom 2]: Eğer `preloadCategory` çağrısında `slug` parametresi verilmezse, fonksiyon doğru çalışamaz — çünkü `slug: string` zorunlu bir parametredir ve varsayılan bir değer tanımı yoktur.

[Aksiyom 3]: Eğer `getCachedProductBySlug` fonksiyonu modülde tanımlı olmasaydı, `preloadProduct`'ın önceden yükleme yaptığı verilerin sonradan erişilebilir olacağı bir mekanizma bulunmazdı — bu iki fonksiyon arasında dolaylı bir bağımlılık vardır.

[Aksiyom 4]: Eğer `getCachedCategoryData` fonksiyonu modülde tanımlı olmasaydı, `preloadCategory`'in önceden yükleme yaptığı verilerin sonradan erişilebilir olacağı bir mekanizma bulunmazdı — bu iki fonksiyon arasında dolaylı bir bağımlılık vardır.

[Aksiyom 5]: Eğer verilen `slug` değeri geçersiz veya var olmayan bir kaydı referans alıyorsa, bu durum fonksiyon imzasından anlaşılamaz — fonksiyon imzası slug'ın geçerliliğini zorlamaz, bu kontrolün önbellekleme katmanında (`getCachedProductBySlug` / `getCachedCategoryData`) veya veri sağlayıcıda yapılması beklenir.

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

### [N1_NASIL] AST Pointer: src/lib/data/preload.ts::preloadProduct
- **params**: `slug: string` — ön yüklenecek ürünün URL slug'ı
- **ic_degiskenler**:
  - (yok — doğrudan `void getCachedProductBySlug(slug)` çağrısı yapılır, ara değişken yoktur)
- **Dönüş**: yok (`void`) —fonksiyon bir değer döndürmez, yalnızca `getCachedProductBySlug` çağrısının yan etkisiyle (cache'e yazma) çalışır

### [N2_NASIL] AST Pointer: src/lib/data/preload.ts::preloadCategory
- **params**: `slug: string` — ön yüklenecek kategorinin URL slug'ı
- **ic_degiskenler**:
  - (yok — doğrudan `void getCachedCategoryData(slug)` çağrısı yapılır, ara değişken yoktur)
- **Dönüş**: yok (`void`) — fonksiyon bir değer döndürmez, yalnızca `getCachedCategoryData` çağrısının yan etkisiyle (cache'e yazma) çalışır

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