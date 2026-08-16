---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\views\CartPage.tsx
skeleton_hash: 846e3c07a9e30be3
entity_hashes:
  func:CartPage: 47b501309afc6903
  overview: 6afbfcbb29c27c31
  style_tokens: 089647e604d32b73
generated_at: 2026-08-16T10:23:00Z
---

## Genel Bakış
CartPage, alışveriş sayfası görünümünü sunan tek bileşenli bir React modülüdür. Bu bileşen,.sepetteki ürünlerin listelenmesi, miktar yönetimi ve sipariş süreci için gerekli arayüz ve etkileşimleri sağlar.

## Fonksiyon Grupları
### Ana Sayfa Görünümü
Modülün tek ve merkezi bileşeni olan CartPage, sepet sayfasının tüm arayüz yapısını, veri akışını ve kullanıcı etkileşimlerini yöneten kök React bileşenidir.
- CartPage

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz bir React bileşenidir; dış veri bağımlılıkları fonksiyon imzasından türetilememektedir.

**[Aksiyom 1]:** Eğer CartPage bileşeni çağrıldığında erişilmesi gereken external state (global store, context provider vb.) mevcut değilse, bileşen çalışırken runtime hatası oluşur veya boş/sepet verisi olmayan bir sayfa render edilir.

**[Aksiyom 2]:** Eğer CartPage, React bileşen ağacında uygun provider'lar (context, store provider vb.) ile sarılmamışsa, bileşen içindeki hook çağrıları (varsa useContext, useStore vb.) başarısız olur ve uygulama çöker.

**[Aksiyom 3]:** Fonksiyon imzası `CartPage() -> React.FC` biçimindedir ve parametre almaz; dolayısıyla bileşen, sepetteki verileri props aracılığıyla değil, internal hook'lar veya global state üzerinden almak zorundadır — bu bağımlılığın hangi mekanizma ile sağlandığı bilinmiyor.

---

> **Not:** Fonksiyon gövdesi paylaşılmadığı için, bileşenin hangi hook'ları kullandığı, hangi context'e bağlandığı veya hangi state management çözümünü tercih ettiği hakkında kesin aksiyom üretilememektedir. Yukarıdaki varsayımlar, yalnızca fonksiyon imzasının (parametresiz çağrı, React.FC dönüşü) yapısal analizinden türetilmiştir.

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
- import: ../components/quotes/QuoteRequestButton::QuoteRequestButton
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

### [N1_NASIL] AST Pointer: `src/views/CartPage.tsx`::CartPage
- **params**: (yok — React fonksiyon bileşeni, parametre almaz)
- **ic_degiskenler**:
  - `items` — `useCart()` hook'undan gelen sepet öğesi dizisi; her öğe `id`, `product`, `unitPrice`, `quantity` içerir
  - `updateQuantity` — `useCart()` hook'undan gelen; bir ürünün miktarını artıran/azaltan fonksiyon; `updateQuantity(productId, newQty)` çağrılır
  - `removeFromCart` — `useCart()` hook'undan gelen; sepetten bir ürünü tamamen çıkaran fonksiyon; `removeFromCart(productId)` çağrılır
  - `clearCart` — `useCart()` hook'undan gelen; sepeti tamamen boşaltan fonksiyon; `clearCart()` çağrılır
  - `getCartTotal` — `useCart()` hook'undan gelen; sepetteki fiyatlı kalemlerin toplamını döndüren fonksiyon; `getCartTotal()` çağrılır
  - `getCartCount` — `useCart()` hook'undan gelen; sepetteki toplam ürün sayısını döndüren fonksiyon; `getCartCount()` çağrılır
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; `t('cart.emptyTitle')`, `t('cart.countLabel', { count })` vb. çağrımlarla metinler alınır
  - `lang` — `useI18n()` hook'undan gelen geçerli dil kodu; `formatCurrency`'ye para birimi biçimlendirme için geçilir
  - `Routes` — `useLocalizedRoutes()` hook'undan gelen lokalize rota üretici nesne; `Routes.home()`, `Routes.product(slug)`, `Routes.checkout()` methodları kullanılır
  - `hasUnpricedItems` — boolean; `items.some(...)` ile hesaplanır, `unitPrice` number olmayan veya `Finite` olmayan kalem varsa `true` olur; fiyat teklifi bekleyen kalem olup olmadığını belirler, sepet özetinde uyarı ve checkout engelleme mantığını kontrol eder
- **Dönüş**: JSX — boş sepet durumunda alışverişe başlama ekranı, dolu sepet durumunda ürün listesi + sipariş özeti + ödeme butonu döner

---

### [N2_NASIL] AST Pointer: `src/views/CartPage.tsx`::CartPage → items.map callback
- **params**: `item` — sepet dizisindeki tek bir öğe nesnesi; `item.id`, `item.product` (brand, name, sku, slug, id içerir), `item.unitPrice`, `item.quantity` alanlarına erişilir
- **ic_degiskenler**:
  - `unitPrice` — number veya null; `item.unitPrice` bir `number` ve `Number.isFinite` ise o değer, aksi halde `null`; fiyat çözülemeyen kalemde "Teklif Alın" gösterilmesini, fiyat olan kalemlerde ise TL tutarın yazılmasını sağlar
- **Dönüş**: JSX — tek bir sepet kalem kartı; ürün görseli (`BrandIcon`), ürün bilgisi (isim, marka, SKU, fiyat/teklif), miktar artır/azalt butonları (`Minus`, `Plus`), sil butonu (`Trash2`) döner

---

### [N3_NASIL] AST Pointer: `src/views/CartPage.tsx`::CartPage → QuoteRequestButton items prop map callback
- **params**: `item` — `items` dizisinden filtrelenmiş, fiyatı olmayan sepet öğesi; `item.product.id`, `item.product.name`, `item.quantity` alanları kullanılır
- **ic_degiskenler**: (yok — doğrudan obje literal döndürür)
- **Dönüş**: `{ productId: item.product.id, productName: item.product.name, qty: item.quantity }` — `QuoteRequestButton` bileşenine传递 edilecek teklif talebi kalemi nesnesi

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
- **Layout:** `block`, `flex`, `flex-1`, `flex-col`, `flex-shrink-0`, `from-air-blue`, `gap-2`, `gap-8`, `grid`, `grid-cols-1`, `h-20`, `h-24`, `inline-flex`, `items-center`, `items-start`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `lg:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `border`, `cursor-not-allowed`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-primary-navy/50`, `font-bold`, `font-medium`, `font-semibold`, `lg:px-8`, `mb-1`, `mb-2`, `mb-4`, `mb-6`, `mb-8`, `mr-2`