---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\ProductsPage.tsx
skeleton_hash: 40ef96baa6f0d234
entity_hashes:
  func:ProductsPage: 6bc2b4f1a097b21a
  overview: d5a8d0a1df0adbe7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:40:28Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesindeki ürünlerin listelendiği ve keşfedildiği ana sayfanın React arayüzünü yönetir. Dışarıdan başlatma kategorileri alarak sayfanın yapısını ve temel iş akışını oluşturur. Kullanıcıya tüm ürünleri sunan arayüzün giriş noktası olarak hizmet verir.

## Fonksiyon Grupları
### Ana Ürünler Sayfası Giriş Bileşeni
Ürünler sayfasının tek ve merkezi yöneticisi olarak, dışarıdan gelen başlangıç verilerini kullanarak tüm sayfa işlevselliğini başlatır ve arayüzün temelini oluşturur.
- ProductsPage

---



---

## FONKSİYON DETAYLARI

### ProductsPage

**Ne yapar**: ProductsPage, "Ürünleri Keşfet" sayfasının giriş noktasıdır. Bu bileşen, SSR (Sunucu Tarafı Rendering) sırasında sunucudan gelen kategorileri alıp ProductsDiscoveryView bileşenine aktaran bir wrapper (sarmalayıcı) görevi görür. Sayfanın temel yapı taşını oluşturur ve veri akışının başlangıç noktasını temsil eder.

**Nasıl yapar**: Fonksiyon, sunucu tarafında önceden yüklenmiş olan `initialCategories` verisini alır ve bu veriyi alt bileşeni olan ProductsDiscoveryView'a prop olarak iletir. Böylece istemci tarafında kategorilerin yeniden yüklenmesine gerek kalmaz ve sayfa yükleme süresi optimize edilir. SSR ile hydrate sürecinin düzgün çalışmasını sağlar.

**Parametreler**:
- `initialCategories` — SSR sürecinde sunucu tarafından hazırlanmış kategori verilerini içerir. Bu veriler ProductsDiscoveryView bileşenine aktarılarak sayfanın ilk durumunun oluşturulmasını sağlar.

**Dönüş**: `React.FC<ProductsPageProps>` tipinde bir React fonksiyonel bileşeni döndürür. Bileşen, ProductsPageProps arayüzünde tanımlanan özellikler dahilinde çalışır ve React fragment veya JSX elementi olarak ProductsDiscoveryView'ı render eder.

---

## INTERFACES

### ProductsPageProps
- `initialCategories?: DomainCategory[]`

---

## NODE ID STANDARD

  file: src\views\ProductsPage.tsx
  function: src\views\ProductsPage.tsx::ProductsPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductsPage

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