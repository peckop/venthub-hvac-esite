---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\CartToast.tsx
skeleton_hash: eb3942a6caa35ebc
generated_at: 2026-05-23T21:57:16Z
---

## Genel Bakış
CartToast, alışveriş sepetine eklenen ürün hakkında kullanıcıya kısa bir bildirim gösteren bir React bileşenidir. Görünürlüğü, ürün bilgileri ve kapatma işlevi props üzerinden kontrol edilir.

## Fonksiyon Grupları
### Bildirim Gösterimi
Kullanıcıya sepetteki ürün hakkında bilgilendirme mesajı sunar ve kapatma işlemini yönetir.
- CartToast

---

## AXIOMS – Mimari Varsayımlar
Bu modül için aşağıdaki varsayımlar geçerlidir.

[Aksiyom 1]: Eğer `isVisible` prop'ı boolean türünde değilse, bileşenin görünürlük durumu beklenmedik şekilde değerlendirilir ve UI beklenen şekilde gösterilemeyebilir.  
[Aksiyom 2]: Eğer `product` prop'ı `null` veya `undefined` ise, ürün bilgileri render edilemeyecek ve bileşen boş veya hatalı içerik gösterebilir.  
[Aksiyom 3]: Eğer `onClose` prop'ı bir fonksiyon değilse, kapatma eylemi tetiklendiğinde çalışma zamanı hatası (örneğin “onClose is not a function”) oluşur.

---

## FONKSIYON DETAYLARI

### CartToast
**Ne yapar**: CartToast, alışveriş sepeti ile ilgili bir bildirim (toast) gösteren bir React bileşenidir. Kullanıcıya ürün ekleme veya çıkarma gibi işlemlerin sonucunu kısa bir süre içinde sunar.  
**Nasıl yapar**: `isVisible` prop'una göre koşullu olarak render edilir; `true` olduğunda ürün bilgilerini içeren bir kutucuk gösterilir. Kullanıcı bildirimi kapatmak istediğinde `onClose` fonksiyonu çağrılır ve bileşen görünürlüğü kapatılır.  
**Parametreler**:  
- isVisible: boolean — Bileşenin ekranda görünür olup olmadığını belirler.  
- product: object — Gösterilecek ürünün verilerini içerir (örneğin isim, fiyat, resim gibi alanlar).  
- onClose: function — Kullanıcı kapatma işlemi gerçekleştirdiğinde çalıştırılacak geri çağırım fonksiyonudur.  
**Dönüş**: React.FC<CartToastProps> — Bir React fonksiyon bileşeni olarak JSX döndürür; bu JSX, koşullu renderleme sonucunda toast öğesini veya null değerini içerir.

---

## INTERFACES

### CartToastProps
- `isVisible: boolean`
- `product: Product | null`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/CartToast.tsx::CartToast
- **params**: isVisible, product, onClose
- **ic_degiskenler**:
  - `t` — çeviri fonksiyonu, useI18n hook'undan dönen, arayüz metinlerini dil bazlı olarak alır
  - `lang` — aktif dil kodu (örn. "en", "tr"), useI18n hook'undan döner, formatCurrency ve çevirilerde kullanılır
  - `showChoiceModal` — seçim modallarının görünürlüğünü kontrol eden boolean state
  - `setShowChoiceModal` — showChoiceModal state'ini güncelleyen setter fonksiyonu
  - `timer` — setTimeout tarafından dönen kimlik tutucu; modal gösterimi/gizleme gecikmesini yönetir ve useEffect temizleme fonksiyonunda clearTimeout ile iptal edilir
  - `handleContinueShopping` — "Alışverişe Devam" butonuna tıklandığında çağrılır; showChoiceModal'ı false yapar ve onClose ile toast'u kapatır
  - `handleGoToCart` — "Sepete Git" butonuna tıklandığında çağrılır; showChoiceModal'ı false yapar, onClose ile toast'u kapatır ve Link bileşeni üzerinden navigasyon sağlar
- **Dönüş**: JSX.Element (React.FC<CartToastProps>) – component'in render ettiği JSX döner (koşullu olarak null veya toast/modal yapısı)

---

## NODE ID STANDARD

  file: src\components\CartToast.tsx
  function: src\components\CartToast.tsx::CartToast

---

## DISA AKTARILANLAR (EXPORTS)
  export: CartToast

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black`, `bg-light-gray`, `bg-opacity-50`, `bg-primary-navy`, `bg-success-green/10`, `bg-white`, `border-2`, `border-primary-navy`, `border-success-green`, `text-center`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-steel-gray`, `text-success-green`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-shrink-0`, `items-center`, `items-start`, `justify-center`, `max-w-md`, `max-w-sm`, `min-w-0`, `p-2`, `p-3`, `p-4`, `p-6`, `right-4`
- **Responsive:** (yok)
