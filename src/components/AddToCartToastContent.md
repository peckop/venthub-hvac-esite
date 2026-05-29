---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\AddToCartToastContent.tsx
skeleton_hash: 3bb5e51857b7e687
entity_hashes:
  func:AddToCartToastContent: da3886a1d2990a31
  overview: d0439d8a27460edb
  style_tokens: 5ac0b676517c4959
generated_at: 2026-05-29T19:59:05Z
---

## Genel Bakış
Bu modül, bir ürün sepete eklendiğinde kullanıcıya gösterilen toast bildiriminin içeriğini render eden tek bir React fonksiyonel bileşenini içerir. Bileşen, ürün bilgilerini ve bildirimi kapatma işlevini prop olarak alarak minimal ve odaklı bir arayüz sunar.

## Fonksiyon Grupları
### Toast İçeriği Bileşeni
Sepete ekleme işleminin ardından gösterilen bildirim içeriğini ve etkileşimlerini yöneten ana UI bileşeni.
- AddToCartToastContent

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aksiyon üretilemedi. Nedeni: Fonksiyon gövdesine erişim olmadığından, modülün doğru çalışması için **zorunlu olan koşullar** güvenilir biçimde çıkarılamamaktadır. Yalnızca fonksiyon imzasından (parametrelerin varlığı) şu zayıf aksiyom üretilebilir:

[Aksiyom 1]: Eğer `product` parametresi verilmezse (undefined/null), modülün render süreci hata ile karşılaşır veya beklenmeyen davranış gösterir.
[Aksiyom 2]: Eğer `onClose` parametresi bir fonksiyon değilse, Toast kapatma işlemi (kullanıcı etkileşimi veya zamanlayıcı sonrası) çalışamaz; bileşen kapanmaz.

**Not:** Daha güçlü aksiyomlar (örn. `product.name`, `product.price` gibi alanların varlığı zorunluluğu, bileşenin hangi durumlarda render edildiği, Toast gösterim süresi koşulları vb.) yalnızca fonksiyon gövdesi analiz edilerek üretilebilir. Mevcut bilgiyle uydurma yapılmamıştır.

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

### [N1_NASIL] AST Pointer: src/components/AddToCartToastContent.tsx::AddToCartToastContent
- **params**: `{ product, onClose }` — product: Sepete eklenen ürün nesnesi, onClose: Toast kapatma fonksiyonu
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu, `cartToast.added`, `common.close`, `cartToast.continue`, `cartToast.goToCart`, `cartToast.autoClose` gibi metinleri çevirir
- **Dönüş**: JSX element (React bileşeni) — Sepete ekleme başarılı toast'unu gösteren React bileşeni. Product bilgisini ve onClose fonksiyonunu kullanarak toast içeriğini render eder. Çeviri metinlerini `t` fonksiyonu ile alır. `product.name` ürün adını gösterir. Kullanıcı "X" butonuna, "Alışverişe Devam Et" butonuna veya "Sepete Git" linkine tıklayarak toast'u kapatır.

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