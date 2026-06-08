---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CartPage.tsx
skeleton_hash: ca71369579fe42a0
entity_hashes:
  func:CartPage: 47b501309afc6903
  overview: 388900e6d926d87f
  style_tokens: 0ec1062a71699875
generated_at: 2026-06-08T10:10:58Z
---

## Genel Bakış
CartPage, VentHub HVAC projesinin alışveriş sepeti sayfasını render eden tek bir React bileşenidir. Kullanıcıların sepetteki ürünleri görmesini, miktar değiştirmesini ve sipariş sürecine geçmesini sağlayan arayüzü sunar. Bileşen, bağımlılıklarını iç hook'lar veya global state yönetimi ile sağlar ve doğrudan prop almaz.

## Fonksiyon Grupları
### Ana Sayfa Görünümü Bileşeni
Modülün tek fonksiyonu olan CartPage, sepet sayfasının tüm görünümünü, veri gösterimini ve kullanıcı etkileşimlerini yöneten kök React bileşenidir.
- CartPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi (source code) paylaşılmadığından, yalnızca fonksiyon imzasından çıkarılabilecek minimum aksiyomlar tanımlanmıştır.

[Aksiyom 1]: Eğer `CartPage` bileşeninin props aracılığıyla veri alması gerekseydi, fonksiyon imzasında parametre tanımı olurdu; ancak `CartPage()` imzası parametresizdir — bu durum, bileşenin tüm veri ihtiyacını prop'lar dışında (global state, hook, context vb.) karşılaması gerektiğini ima eder.

---

## FONKSİYON DETAYLARI

### CartPage

**Ne yapar**: Sepet sayfasını görüntüleyen React bileşenidir. Kullanıcıların alışveriş sepetlerini görüntülemesini ve yönetmesini sağlayan ana sayfa görünümüdür.

**Nasıl yapar**: Bu bileşen, React functional component olarak tanımlanmıştır. Kaynak dosya yolundan (src/views/CartPage.tsx) anlaşılacağı üzere, uygulamanın "views" katmanında yer alan ve.sepetime ait sayfa görünümünü render eden bir bileşendir.

**Parametreler**:
Bu bileşen için belgelenmiş parametre bulunmamaktadır.

**Dönüş**: 
- React.FC — React Functional Component türünde bir bileşen döndürür. Sepet sayfasının tüm görünüm yapısını içeren JSX elementini render eder.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/CartPage.tsx::CartPage
- **params**: (parametre yok)
- **ic_degiskenler**: 
  - `items` — useCart hook'undan gelen sepet öğeleri dizisi, sepetteki ürünleri temsil eder
  - `updateQuantity` — useCart hook'undan gelen, ürün miktarını güncellemek için fonksiyon
  - `removeFromCart` — useCart hook'undan gelen, sepetten ürün kaldırmak için fonksiyon
  - `clearCart` — useCart hook'undan gelen, sepeti tamamen temizlemek için fonksiyon
  - `getCartTotal` — useCart hook'undan gelen, sepet toplamını hesaplayan fonksiyon
  - `getCartCount` — useCart hook'undan gelen, sepet öğe sayısını döndüren fonksiyon
  - `t` — useI18n hook'undan gelen, çeviri fonksiyonu
  - `lang` — useI18n hook'undan gelen, mevcut dil kodu
- **Dönüş**: JSX elementi (React.FC)

### [N2_NASIL] AST Pointer: src/views/CartPage.tsx::renderCartItem (anonim map callback)
- **params**: (item — sepet öğesini temsil eden nesne)
- **ic_degiskenler**: 
  (Değişken bildirimi yok, sadece parametre ve JSX döndürülüyor)
- **Dönüş**: JSX elementi (React element)

---

## NODE ID STANDARD

  file: src\views\CartPage.tsx
  function: src\views\CartPage.tsx::CartPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartPage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-air-blue`, `bg-gradient-to-br`, `bg-light-gray`, `bg-primary-navy`, `bg-white`, `border-2`, `border-light-gray`, `border-primary-navy`, `from-air-blue`, `hover:bg-light-gray`, `hover:bg-primary-navy`, `hover:bg-secondary-blue`, `hover:text-primary-navy`, `hover:text-red-500`, `hover:text-white`
- **Layout:** `block`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `from-air-blue`, `gap-8`, `grid`, `grid-cols-1`, `h-20`, `h-24`, `inline-flex`, `items-center`, `items-start`, `justify-between`
- **Varyant/Responsive:** `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `font-bold`, `font-medium`, `font-semibold`, `lg:px-8`, `mb-1`, `mb-2`, `mb-4`, `mb-6`, `mb-8`, `mr-2`, `mt-3`, `mt-4`, `mt-6`, `mx-auto`