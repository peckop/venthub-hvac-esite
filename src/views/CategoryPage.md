---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CategoryPage.tsx
skeleton_hash: d6a1aef6630b0f1d
entity_hashes:
  func:CategoryPage: 58a326ade322bfe1
  overview: 4a1165b4bde9da1a
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:39:56Z
---

## Genel Bakış
CategoryPage modülü, Venthub HVAC platformunda dinamik kategori sayfalarının görüntülenmesinden sorumlu bir React view bileşenidir. Kategori, alt kategori ve ürün verilerini üst bileşenden alarak sayfanın temel yapısını oluşturur ve tüm iş mantığı ile sunum süreçlerini CategoryMasterView bileşenine devrederek sayfayı render eder.

## Fonksiyon Grupları
### Kategori Sayfası Görünümü
Modülün tek bileşeni olarak kategori sayfasının dışa açılan giriş noktasıdır. Başlangıç verilerini (kategori bilgisi, ürünler, alt kategoriler) üst bileşenden alır, doğrular ve Unified Category Shell yapısıyla sayfanın tamamını oluşturma sorumluluğunu CategoryMasterView bileşenine aktarır.
- CategoryPage

---

## AXIOMS – Mimari Varsayımlar
Bu bir React view bileşeni olup, fonksiyon gövdesi verilmediğinden yalnızca fonksiyon imzasından çıkarılabilen minimum mimari varsayımlar tanımlanmıştır.

[Aksiyom 1]: Eğer parent bileşen `initialCategory` prop'u sağlamazsa, bileşen undefined değerle çalışır ve beklenmeyen davranış oluşur (hiçbir default değer tanımlı değildir).

[Aksiyom 2]: Eğer parent bileşen `initialProducts` prop'u sağlamazsa, bileşen undefined değerle çalışır ve ürün listesi oluşturulamaz (hiçbir default değer tanımlı değildir).

[Aksiyom 3]: Eğer parent bileşen `initialSubCategories` prop'u sağlamazsa, bileşen undefined değerle çalışır ve alt kategori listesi oluşturulamaz (hiçbir default değer tanımlı değildir).

[Aksiyom 4]: Eğer `initialCategory`, `initialProducts` veya `initialSubCategories` geçerli bir React prop'undan (obje/liste) farklı bir tipte gelirse, bileşen içeriği doğru şekilde render edilemez.

[Aksiyom 5]: Eğer bileşen içeriği sunmak için这三个 prop'un iç yapı alanlarına (örn: `initialCategory.name`, `initialProducts[].id` gibi) erişiyorsa ve bu alanlar mevcut değilse, runtime hatası oluşur.

**Not:** Fonksiyon gövdesi verilmediğinden, bileşenin hangi alt alanlara eriştiği ve hangi iç mantığı uyguladığı **bilinmiyor** olup, yalnızca imzada belirtilen üç prop'un varlığının zorunluluğu belirlenebilmiştir.

---

## FONKSİYON DETAYLARI

### CategoryPage

**Ne yapar**: Dinamik kategori sayfasının giriş noktası olarak görev yapan React bileşenidir. Kullanıcılar bir kategoriye tıkladığında bu bileşen yüklenerek ilgili kategorinin ürünlerini ve alt kategorilerini görüntüler.

**Nasıl yapar**: Bu bileşen bir "Controller" veya "Entry Point" mantığıyla çalışır. Kendisi doğrudan UI render etmez; bunun yerine tüm iş mantığını ve sunum katmanını Unified Category Shell (CategoryMasterView) bileşenine delege eder. Bu sayede sorumluluklar ayrışmış ve bileşen yeniden kullanılabilir hale gelmiştir.

**Parametreler**:
- `initialCategory` — Kategorinin başlangıç verisi. Sayfa yüklendiğinde görüntülenecek kategori bilgisini içerir
- `initialProducts` — Başlangıç ürün listesi. İlgili kategorideki ürünlerin önceden yüklenmiş halini tutar
- `initialSubCategories` — Başlangıç alt kategorileri. Kategori hiyerarşisindeki alt kategorilerin verisini barındırır

**Dönüş**: `React.FC<CategoryPageProps>` — CategoryPageProps tipinde tanımlı props'ları kabul eden fonksiyonel bir React bileşeni döndürür.

---

## INTERFACES

### CategoryPageProps
- `initialCategory?: DomainCategory | null`
- `initialProducts?: DomainProduct[]`
- `initialSubCategories?: DomainCategory[]`

---

## NODE ID STANDARD

  file: src\views\CategoryPage.tsx
  function: src\views\CategoryPage.tsx::CategoryPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryPage
  export: CategoryPageProps

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)