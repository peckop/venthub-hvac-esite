---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx
skeleton_hash: 38d8482f76de1dcf
entity_hashes:
  func:AddToCartToast: 581f14d900d31bb4
  overview: 9eae019706928365
  style_tokens: 7c669d9ccd4d6a62
generated_at: 2026-05-28T22:35:29Z
---

## Genel Bakış
Bu modül, bir ürünün sepete eklenmesi sonrasında kullanıcıya kısa süreli bir bildirim (toast) göstermekle sorumlu olan tek bir React fonksiyonel bileşenini içerir. Bileşen, bildirimin görünür hale gelmesini, belirli bir süre sonra otomatik kaybolmasını ve kullanıcıya sepeti görüntüleme veya bildirimi kapatma gibi aksiyonlar sunmasını yönetir.

## Fonksiyon Grupları
### Toast Bileşeni Tanımı ve Davranışı
Bu grup, sepete ekleme bildiriminin tüm yaşam döngüsünü ve kullanıcı etkileşimlerini yöneten ana (ve tek) bileşeni barındırır. Bileşen, olaylarla tetiklenir, zamanlayıcı ile kapanır ve çeviri metinlerini kullanır.
- AddToCartToast

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz bir React fonksiyonel bileşenidir. Fonksiyon imzasında herhangi bir parametre tanımlı değildir.

[Aksiyom 1]: Eğer React Runtime (JSX/TSX çalışma ortamı) yoksa, bileşen render edilemez ve çalışma zamanı hatası oluşur.

[Aksiyom 2]: Eğer bileşen bir React Component Tree içerisine yerleştirilmemişse, DOM'da herhangi bir toast bildirimi görüntülenemez.

[Aksiyom 3]: Eğer bileşen bağımsız olarak çağrılacaksa (parametre almadığından), gerekli tüm durum (state) ve mantık (logic) kendi içinde veya React Context/hooks aracılığıyla sağlanmalıdır.

---

**Not:** Fonksiyon imzası `AddToCartToast()` olarak verilmiş olup herhangi bir parametre veya default değer içermemektedir. Bu nedenle, bileşenin iç mantığına (state yönetimi, event handling, timer mekanizması vb.) ilişkin varsayımlar fonksiyon gövdesi analiz edilmeden çıkarılamaz.

---

## FONKSİYON DETAYLARI

### AddToCartToast
**Ne yapar**: Sepete ekleme işlemi sonrası kullanıcıya gösterilen bir bildirim (toast) bileşenini oluşturur. Bu bildirim, kullanıcının sepete bir ürün eklediğini görsel olarak onaylar.
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanmıştır ve muhtemelen bir UI kütüphanesinden (örneğin, Chakra UI, Material UI) toast mekanizmasını kullanarak bildirim mesajını ve stilini yönetir. İçerisinde sepete eklenen ürünle ilgili kısa bir bilgi veya başarılı ekleme mesajı barındırabilir.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: React.FC — Sepete ekleme bildirimini temsil eden bir React fonksiyonel bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/AddToCartToast.tsx::AddToCartToast
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; bileşen içi metinleri çevirir
  - `visible` — `React.useState<boolean>(false)` state'i; toast bildiriminin görünürlüğünü tutar
  - `product` — `React.useState<Product | null>(null)` state'i; sepete eklenen ürün verisini tutar
  - `hideTimer` — `React.useRef<number | null>(null)` ref'i; otomatik kapatma timeout ID'sini saklar
  - `onAdded` — useEffect içinde tanımlı arrow callback; CustomEvent dinleyicisi, ürün verisini alıp state'leri günceller ve 5 sn sonra gizler
  - `detail` — `(e as CustomEvent).detail as { product?: Product }` CustomEvent payload'u; sepete eklenen ürün bilgisini içerir
- **Dönüş**: `React.FC` — JSX (toast bildirim UI'ı) veya `null` (görünür değilse)

### [N2_NASIL] AST Pointer: src/components/AddToCartToast.tsx::useEffect callback (initializer)
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onAdded` — event handler callback; `detail.product` varsa `setProduct`, `setVisible(true)` çağırır, mevcut timeout'u temizler, 5000ms'lik yeni timeout ayarlar
  - `detail` — `(e as CustomEvent).detail as { product?: Product }` CustomEvent payload'u
- **Dönüş**: cleanup fonksiyonu — `window.removeEventListener` ile `onAdded` kaldırır, `hideTimer.current` varsa timeout'u temizler

### [N3_NASIL] AST Pointer: src/components/AddToCartToast.tsx::onAdded (inner callback)
- **params**: `(e: Event)` — pencereden gelen custom event nesnesi
- **ic_degiskenler**:
  - `detail` — `(e as CustomEvent).detail as { product?: Product }` CustomEvent payload'u; `product` alanını opsiyonel olarak içerir
- **Dönüş**: yok (void) — `setProduct`, `setVisible`, `window.setTimeout` ile yan etki olarak state ve zamanlayıcıları günceller

### [N4_NASIL] AST Pointer: src/components/AddToCartToast.tsx::cleanup (inner arrow)
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (void) — `window.removeEventListener` ile `onAdded` kaldırır, `hideTimer.current` varsa `window.clearTimeout` ile zamanlayıcıyı temizler

---

## NODE ID STANDARD

  file: src\components\AddToCartToast.tsx
  function: src\components\AddToCartToast.tsx::AddToCartToast

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddToCartToast

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-success-green/10`, `bg-white`, `border-light-gray`, `border-primary-navy`, `hover:bg-primary-navy`, `hover:bg-secondary-blue`, `hover:text-industrial-gray`, `hover:text-white`, `text-center`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-success-green`
- **Layout:** `bottom-3`, `fixed`, `flex`, `flex-1`, `gap-2`, `gap-3`, `grid`, `grid-cols-1`, `inline-flex`, `items-center`, `items-start`, `justify-center`, `max-w-92vw`, `md:bottom-6`, `md:gap-3`
- **Varyant/Responsive:** `hover:`, `md:` önekleri
- **Yardımcı Sınıflar:** `animate-slide-up`, `border`, `font-medium`, `font-semibold`, `inset-x-3`, `md:inset-auto`, `md:pb-4`, `md:px-4`, `md:py-2`, `mt-2`, `pb-3`, `pt-0`, `px-3`, `py-3`, `ring-1`