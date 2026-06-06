---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\AddToCartToastContent.tsx
skeleton_hash: 1092697f9ffe5af8
entity_hashes:
  func:AddToCartToastContent: da3886a1d2990a31
  overview: e02dd238d7a8dbce
  style_tokens: 5ac0b676517c4959
generated_at: 2026-06-06T21:54:15Z
---

## Genel Bakış
Bu modül, bir ürün sepete eklendiğinde kullanıcıya kısa süreli bir bildirim (toast) gösteren tek bir React bileşenini tanımlar. Bileşen,_sepetteki ürünün temel bilgilerini sunar ve bildirimi kapatma olanağı sağlayarak kullanıcı deneyimini tamamlar.

## Fonksiyon Grupları
### Toast Bildirim İçeriği
Sepete ekleme işlemi sonrasında kullanıcılara bilgilendirme amaçlı gösterilen geçici bildirim penceresinin içeriğini ve etkileşimlerini yöneten UI bileşeni.
- AddToCartToastContent

---

## AXIOMS – Mimari Varsayımlar

Bu modül, sepete ekleme bildiriminin içeriğini render eden React fonksiyonel bileşenidir. Aşağıdaki varsayımlar **fonksiyon imzasından** çıkarılmıştır; fonksiyon gövdesine erişim olmadığından gövde bazlı aksiyomlar üretilememiştir.

---

**[Aksiyom 1]**: Eğer `product` prop'u sağlanmazsa, bileşen sepetteki ürün bilgisini gösteremez ve render ettiği toast içeriği eksik veya hatalı olur.

**[Aksiyom 2]**: Eğer `onClose` callback fonksiyonu sağlanmazsa, bileşen bildirimi kapatma eylemini tetikleyemez ve kullanıcı toast'ı manüel olarak kapatamaz.

**[Aksiyom 3]**: Eğer `product` nesnesi beklenen alanları (örn: ürün adı, fiyatı, görseli — bilinmiyor) içermiyorsa, bileşen bu alanları render ederken hata veya boş alan oluşur.

---

> **Not:** Fonksiyon gövdesine erişim olmadığından, bileşenin hangi UI kütüphanesini kullandığı, hangi alt bileşenleri render ettiği veya hangi stillendirme mantığını uyguladığı bilinmemektedir. Daha kapsamlı aksiyomlar için fonksiyon gövdesine ihtiyaç vardır.

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

## INTERFACES

### AddToCartToastContentProps
- `product: Product`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: components/AddToCartToastContent.tsx::AddToCartToastContent
- **params**: `product`, `onClose`
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu, bileşen içindeki metinleri uluslararasılaştırmak için kullanılır
- **Dönüş**: React.FC<AddToCartToastContentProps> (JSX ile toast içeriği döndürür)

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