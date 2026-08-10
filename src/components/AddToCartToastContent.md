---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\AddToCartToastContent.tsx
skeleton_hash: 852817141636c428
entity_hashes:
  func:AddToCartToastContent: da3886a1d2990a31
  overview: a72a624e0dfb150e
  style_tokens: 5ac0b676517c4959
generated_at: 2026-06-19T20:46:47Z
---

## Genel Bakış
Bu modül, bir ürün sepete eklendiğinde kullanıcıya kısa süreli bildirim gösteren tek bir React bileşeninden oluşur. Ürünün temel bilgilerini sunar ve bildirimi kapatma olanağı sağlayarak kullanıcı deneyimini tamamlar.

## Fonksiyon Grupları
### Toast Bildirim İçeriği
Sepete ekleme işlemi sonrasında geçici olarak gösterilen bildirim penceresinin içeriğini ve kapatma etkileşimini yöneten UI bileşeni.
- AddToCartToastContent

---

## AXIOMS – Mimari Varsayımlar

Bu modül, sepete ekleme işleminin ardından kısa süreli bildirim (toast) içeriğini render eden bir React bileşenidir. Aşağıdaki varsayımlar **fonksiyon imzasından** türetilmiştir.

[Aksiyom 1]: Eğer `product` prop'u sağlanmazsa, bileşen sepetteki ürün bilgilerini gösteremez ve render edeceği içerik bilinmez.

[Aksiyom 2]: Eğer `onClose` prop'u sağlanmazsa, kullanıcı bildirimi kapatamaz ve toast bileşeninin kapanma tetikleme mekanizması çalışmaz.

[Aksiyom 3]: Eğer `onClose` çağrıldığında bileşenin mounted durumu değiştiyse (örn. parent bileşen koşullu render ediyorsa), React geçerlilik uyarıları (warning) oluşur.

[Aksiyom 4]: Eğer `product` prop'u `undefined` veya `null` olarak verilirse, bileşen içinde product objesinin alanlarına erişim `TypeError` ile sonuçlanabilir.

[Aksiyom 5]: Eğer bileşen bir `toast` veya `snackbar` konteynırının çocuğu olarak kullanılmıyorsa, bileşenin ekranda görünür hale gelmesi için gerekli UI bağlamı (konteynır, pozisyonlama, animasyon) eksik olur.

---

## FONKSİYON DETAYLARI

### AddToCartToastContent
**Ne yapar**: Sepete ürün ekleme işleminin ardından kullanıcıya bilgilendirme olarak gösterilen bir toast bildirim bileşenini oluşturur. Ürünün temel bilgilerini ve bildirimi kapatma butonunu içerir.

**Nasıl yapar**: `product` prop'undan alınan ürün adı, fiyatı ve resmi gibi verileri kullanarak bir JSX yapısı döndürür. Bildirim mesajını dinamik olarak oluşturur. `onClose` fonksiyonu, kullanıcı bildirimi kapatmak istediğinde çağrılır ve.toast'ın kaybolmasını tetikler.

**Parametreler**:
- `product`: `Product` — Sepete eklenen ürünün tüm verilerini içeren nesne. Adı, fiyatı ve görsel URL'i gibi bilgileri barındırır.
- `onClose`: `() => void` — Toast bildiriminin kapatılması istendiğinde çağrılacak fonksiyon. Bu fonksiyon, bileşenin üst düzeydeki durumunu (örn. `isVisible`) değiştirerek bildirimin kaybolmasını sağlar.

**Dönüş**: `React.FC<AddToCartToastContentProps>` — Bu bileşen, `AddToCartToastContentProps` arayüzüne uygun prop'ları alan ve JSX (React Element) döndüren bir React fonksiyonel bileşenidir.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: @/types/ui-models::type { Product }
- import: next/link::Link
- import: react::React

---

## INTERFACES

### AddToCartToastContentProps
- `product: Product`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: AddToCartToastContent.tsx::AddToCartToastContent
- **params**: `{ product, onClose }`
- **ic_degiskenler**: 
  - `t` — useI18n hook'unun sagladigi ceviri fonksiyonu, JSX icindeki tum metinleri lokalize eder (ornegin `t('cartToast.added')`).
  - `Routes` — useLocalizedRoutes hook'unun dondurlu rotalar nesnesi, Link bileşeninde `Routes.cart()` ile sepet sayfasinin URL'sini uretir.
- **Dönüş**: `{product.name}` ve `onClose` callback'ini iceren, sepete urun eklendigini bildiren bir React bileşeni (JSX). Bilesen, iki buton ve bir Link iceren bir toast bildirim UI'yi render eder.

---

## NODE ID STANDARD

  file: src\components\AddToCartToastContent.tsx
  function: src\components\AddToCartToastContent.tsx::AddToCartToastContent

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddToCartToastContent

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-success-green/10`, `bg-white`, `border-light-gray`, `border-primary-navy`, `hover:bg-primary-navy`, `hover:bg-secondary-blue`, `hover:text-industrial-gray`, `hover:text-white`, `text-base`, `text-center`, `text-industrial-gray`, `text-lg`, `text-primary-navy`, `text-sm`
- **Layout:** `flex`, `flex-1`, `gap-2`, `gap-3`, `grid`, `grid-cols-1`, `inline-flex`, `items-center`, `items-start`, `justify-center`, `max-w-92vw`, `md:gap-3`, `md:grid-cols-2`, `md:p-4`, `md:w-360px`
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `animate-slide-up`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-medium`, `font-semibold`, `leading-none`, `leading-snug`, `md:pb-4`, `md:px-4`, `md:py-2`, `mt-0.5`