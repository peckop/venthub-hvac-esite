---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx
skeleton_hash: 38d8482f76de1dcf
entity_hashes:
  func:AddToCartToast: 581f14d900d31bb4
  overview: 1552c020db2333e5
  style_tokens: de89d51e5d28158c
generated_at: 2026-05-27T09:49:37Z
---

## Genel Bakış
Bu modül, kullanıcı bir ürünü sepete eklediğinde ekranda kısa süreli bir bildirim (toast) gösteren tek bir React fonksiyonel bileşeninden oluşur. Bileşen, bildirimin görünürlüğünü, otomatik kapanmasını ve kullanıcının sepeti görüntüleme ya da kapatma gibi aksiyonlar almasını sağlar.

## Fonksiyon Grupları
### Toast Görüntüleme ve Yönetim
Bildirimin açılıp kapanması, zamanlayıcı ile otomatik kapanma, çeviri metinlerinin kullanımı ve özel olay (CustomEvent) ile tetiklenme gibi tüm toast mantığını kapsar.
- AddToCartToast

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx::AddToCartToast
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — `useI18n` hook'undan dönen, uluslararasılaştırma metinlerine erişim sağlayan bir fonksiyon.
  - `visible` — Sepete ekleme bildiriminin görünür olup olmadığını kontrol eden bir boolean state değişkeni.
  - `setVisible` — `visible` state değişkenini güncelleyen setter fonksiyonu.
  - `product` — Sepete eklenen ürünün bilgilerini (Product tipi) tutan state değişkeni. Başlangıçta `null`'dır.
  - `setProduct` — `product` state değişkenini güncelleyen setter fonksiyonu.
  - `hideTimer` — Bildirimi otomatik olarak gizlemek için kullanılan `setTimeout` zamanlayıcısının referansını tutan bir ref objesi.
  - `onAdded` — `EVENT` dinleyicisi tarafından çağrılan olay işleyici fonksiyonu. Sepete ürün eklendiğinde tetiklenir.
  - `e` — `onAdded` fonksiyonuna parametre olarak gelen olay objesi.
  - `detail` — `e` olay objesinin `detail` özelliğinden çıkarılan, eklenen ürün bilgilerini içeren obje.
- **Dönüş**: `visible` veya `product` `null` ise `null` döner, aksi takdirde React elementi (JSX) döner.

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx::useEffect_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `onAdded` — `EVENT` dinleyicisi tarafından çağrılan olay işleyici fonksiyonu. Sepete ürün eklendiğinde tetiklenir.
  - `e` — `onAdded` fonksiyonuna parametre olarak gelen olay objesi.
  - `detail` — `e` olay objesinin `detail` özelliğinden çıkarılan, eklenen ürün bilgilerini içeren obje.
- **Dönüş**: Temizleme fonksiyonu döner.

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx::onAdded
- **params**:
  - `e` — `CustomEvent` tipinde, sepete ürün ekleme olayını temsil eden olay objesi.
- **ic_degiskenler**:
  - `detail` — `e` olay objesinin `detail` özelliğinden çıkarılan, eklenen ürün bilgilerini içeren obje. `product` özelliği opsiyoneldir.
- **Dönüş**: yok (state güncellemeleri ve zamanlayıcı ayarlaması yapar).

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx::cleanup_function
- **params**: (parametre yok)
- **ic_degiskenler**: yok
- **Dönüş**: yok (olay dinleyicisini kaldırır ve zamanlayıcıyı temizler).

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
- **Renkler:** `bg-primary-navy`, `bg-success-green/10`, `bg-white`, `border-light-gray`, `border-primary-navy`, `text-center`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-success-green`, `text-white`, `text-xs`
- **Layout:** `bottom-3`, `fixed`, `flex`, `flex-1`, `gap-2`, `gap-3`, `grid`, `grid-cols-1`, `inline-flex`, `items-center`, `items-start`, `justify-center`, `max-w-92vw`, `md:bottom-6`, `md:gap-3`
- **Responsive:** `md:` prefix kullanımları