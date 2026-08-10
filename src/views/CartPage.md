---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\CartPage.tsx
skeleton_hash: eba64aa94f0699af
entity_hashes:
  func:CartPage: 47b501309afc6903
  overview: b9847bc86b863737
  style_tokens: 0ec1062a71699875
generated_at: 2026-06-19T20:50:25Z
---

## Genel Bakış
CartPage, VentHub HVAC projesinin alışveriş sepeti sayfasını render eden tek bir React bileşenidir. Kullanıcıların sepetteki ürünleri görüntülemesini, miktar değiştirmesini ve sipariş sürecine geçmesini sağlayan arayüzü sunar. Bileşen, bağımlılıklarını iç hook'lar veya global state yönetimi ile sağlar ve doğrudan prop almaz.

## Fonksiyon Grupları
### Ana Sayfa Görünümü
Modülün tek bileşeni olan CartPage, sepet sayfasının tüm görünümünü, veri gösterimini ve kullanıcı etkileşimlerini yöneten kök React bileşenidir.
- CartPage

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

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

## İTHALATLAR (IMPORTS)
- import: ../components/HVACIcons::BrandIcon
- import: ../components/SecurityRibbon::SecurityRibbon
- import: ../hooks/useCartHook::useCart
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ../i18n/format::formatCurrency
- import: lucide-react::ArrowLeft
- import: lucide-react::Minus
- import: lucide-react::Plus
- import: lucide-react::ShoppingBag
- import: lucide-react::Trash2
- import: next/link::Link
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/CartPage.tsx::CartPage
- **params**: ()
- **ic_degiskenler**:
  - `items` — sepet içindeki ürün listesi, useCart hook'undan gelir; boşsa boş sepet UI'ı, doluysa ürün listesi render edilir
  - `updateQuantity` — sepetteki bir ürünün miktarını güncelleyen fonksiyon; artırma/azaltma butonlarında çağrılır
  - `removeFromCart` — sepetten belirli bir ürünü kaldıran fonksiyon; sil butonunda çağrılır
  - `clearCart` — tüm sepeti boşaltan fonksiyon; "sepeti temizle" butonunda çağrılır
  - `getCartTotal` — sepetin toplam tutarını döndüren fonksiyon; sipariş özeti bölümünde ve KDV hesaplamada kullanılır
  - `getCartCount` — sepetteki toplam ürün sayısını döndüren fonksiyon; başlık altındaki sayacı gösterir
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu; tüm UI metinleri için kullanılır (ör. `t('cart.title')`, `t('cart.emptyTitle')`, `t('cart.checkout')` vb.)
  - `lang` — useI18n hook'undan gelen mevcut dil kodu; formatCurrency fonksiyonuna para birimi formatı için aktarılır
  - `Routes` — useLocalizedRoutes hook'undan gelen lokalize rota üreteci; `Routes.home()`, `Routes.product(slug)`, `Routes.checkout()` çağrılır
- **Dönüş**: JSX (React element) — sepet boşsa boş sepet ekranı, doluysa ürün listesi + sipariş özeti ekranı

---

### [N2_NASIL] AST Pointer: src/views/CartPage.tsx::CartPage::mapCallback
- **params**: `item` — items dizisi içindeki tek bir sepet kalemi nesnesi, map iterasyonu sırasında her ürün için çağrılır
- **ic_degiskenler**:
  - (explicit değişken yok; `item` parametresinin özellikleri doğrudan kullanılır: `item.id`, `item.product.brand`, `item.product.slug`, `item.product.name`, `item.product.sku`, `item.unitPrice`, `item.product.price`, `item.quantity`, `item.product.id`)
- **Dönüş**: JSX (React element) — tek bir sepet kaleminin kart görünümü (görsel, bilgi, miktar kontrolleri, sil butonu)

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