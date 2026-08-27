---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\venthub-wt-t131\src\views\CategoryPage.tsx
skeleton_hash: 33363a002d7b3ab0
entity_hashes:
  func:CategoryPage: b9c874f6f0ad842f
  overview: e1bc718689213f84
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:08:56Z
---

## Genel Bakış

CategoryPage modülü, bir kategoriye ait ürün ailelerinin listelendiği sayfa bileşenini tanımlar. Bileşen, sunucu tarafından sağlanan başlangıç verilerini (kategori bilgisi, aile listesi, alt kategoriler ve sayfalama bilgileri) alır ve kullanıcıya görüntüler.

## Fonksiyon Grupları

### Sayfa Bileşeni

Kategori sayfasının tamamını render etmekten sorumludur. Gelen `initialCategory`, `families`, `total`, `page`, `pageSize` ve `initialSubCategories` props değerlerini kullanarak kategori detaylarını, ürün ailelerini ve sayfalama bilgisini kullanıcıya sunar.

- CategoryPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Gerekçe:** Fonksiyon gövdesi sağlanmadığından, yalnızca imzadan (`CategoryPage({ initialCategory, families, total, page, pageSize, initialSubCategories })`) aksiyom üretilemez. Mimari varsayımlar, fonksiyon gövdesindeki mantıksal dallanmalar, hata kontrolü, eşik değerleri ve veri akışı üzerinden çıkarılır; imzadaki parametre adları ve tipleri ise yalnızca bilgi amaçlıdır ve davranışsal bir hüküm içermez.

---

## FONKSİYON DETAYLARI

### CategoryPage
**Ne yapar**: Dinamik Kategori Sayfası'nın giriş noktası olan bir React fonksiyonel bileşenidir. Bileşen, kategori sayfasının tüm mantık ve sunum işlevlerini merkezi bir yapı olan Unified Category Shell (CategoryMasterView) bileşenine delege eder. Kendisi bir sarmalayıcı (wrapper) olarak çalışır ve gelen verileri bu merkezi bileşene aktarır.

**Nasıl yapar**: Bileşen, aldığı altı parametreyi destructuring yöntemiyle ayırır ve bu verileri doğrudan CategoryMasterView bileşenine aktararak tüm iş mantığını ve görsel sunumu ona devreder. Docstring'te yer alan `@page` ve `@description` dekoratörleri, bu bileşenin bir sayfa seviyesinde giriş noktası olduğunu ve dinamik kategori sayfası olarak tanımlandığını belirtir. Bileşenin kendisi herhangi bir iş mantığı içermez; yalnızca veri aktarım ve yönlendirme görevi üstlenir.

**Parametreler**:
- initialCategory: bilinmiyor — Bileşenin aldığı props nesnesinden destructuring ile çıkarılan parametre; docstring'te tip bilgisi verilmemiştir.
- families: bilinmiyor — Bileşenin aldığı props nesnesinden destructuring ile çıkarılan parametre; docstring'te tip bilgisi verilmemiştir.
- total: bilinmiyor — Bileşenin aldığı props nesnesinden destructuring ile çıkarılan parametre; docstring'te tip bilgisi verilmemiştir.
- page: bilinmiyor — Bileşenin aldığı props nesnesinden destructuring ile çıkarılan parametre; docstring'te tip bilgisi verilmemiştir.
- pageSize: bilinmiyor — Bileşenin aldığı props nesnesinden destructuring ile çıkarılan parametre; docstring'te tip bilgisi verilmemiştir.
- initialSubCategories: bilinmiyor — Bileşenin aldığı props nesnesinden destructuring ile çıkarılan parametre; docstring'te tip bilgisi verilmemiştir.

**Dönüş**: `React.FC<CategoryPageProps>` — React fonksiyonel bileşeni döndürür. `CategoryPageProps` arayüzü, bu bileşenin kabul ettiği props yapısını tanımlar; ancak bu arayüzün ayrıntıları verilen kaynakta yer almamaktadır.

---

## İTHALATLAR (IMPORTS)
- import: ../lib/type-converters::type { DomainCategory }
- import: ../types/ui-models::type { FamilyListItem }
- import: ./CategoryMasterView::CategoryMasterView
- import: react::React

---

## INTERFACES

### CategoryPageProps
- `initialCategory?: DomainCategory | null`
- `families?: FamilyListItem[]`
- `total?: number`
- `page?: number`
- `pageSize?: number`
- `initialSubCategories?: DomainCategory[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: CategoryPage.tsx::CategoryPage
- **params**:
  - `initialCategory` — DomainCategory tipinde; sayfanın görüntülediği ana kategori nesnesi
  - `families` — FamilyListItem tipinde dizi; kategoriye ait aile listesi
  - `total` — number; toplam kayıt sayısı (sayfalama bilgisi)
  - `page` — number; mevcut sayfa numarası (sayfalama bilgisi)
  - `pageSize` — number; sayfa başına gösterilecek kayıt sayısı (sayfalama bilgisi)
  - `initialSubCategories` — alt kategori verisi; tip bilgisi verilmemiş
- **ic_degiskenler**: yok — fonksiyon gövdesinde hiçbir iç değişken tanımlanmamış; tüm parametreler doğrudan `CategoryMasterView` bileşenine prop olarak aktarılır
- **Dönüş**: JSX element (`CategoryMasterView` bileşeni); tüm props birebir geçirilerek render edilir

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