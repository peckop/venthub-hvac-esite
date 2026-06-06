---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx
skeleton_hash: 9a8701d25a4ae6cf
entity_hashes:
  func:AddToCartToast: 581f14d900d31bb4
  overview: 4631aecdd4e1b7b7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-06T21:54:24Z
---

## Genel Bakış
Bu modül, kullanıcı sepete bir ürün eklediğinde kısa süreli bir bildirim (toast) gösteren tek bir React bileşenini içerir. Bileşen, bildirimin zamanlamasını, otomatik kaybolmasını ve kapatma eylemini kendi içinde yönetir.

## Fonksiyon Grupları
### Sepete Ekleme Bildirimi
Modül, sepete ekleme işlemi sonrasında kullanıcıya kısa süreli bir bildirim gösteren ana (ve tek) bileşeni tanımlar.
- AddToCartToast

---



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
- **params**: (yok)
- **ic_degiskenler**:
  (dış scope'ta doğrudan değişken yok — tüm mantık `useEffect` içinde)
- **Dönüş**: `null` — Saf controller bileşeni, DOM döndürmez; sadece event listener yönetimi yapar

---

### [N2_NASIL] AST Pointer: src/components/AddToCartToast.tsx::useEffect_callback
- **params**: (yok)
- **ic_degiskenler**:
  - `onAdded` — `cart-item-added` custom event'i geldiğinde çağrılan event handler fonksiyonu; ürün detayını extracted edip Sonner toast'unu tetikler
- **Dönüş**: Temizlik fonksiyonu `() => { window.removeEventListener(EVENT, onAdded as EventListener) }` — component unmount'ta listener'ı kaldırır

---

### [N3_NASIL] AST Pointer: src/components/AddToCartToast.tsx::onAdded
- **params**: `e: Event` — `window` üzerinde tetiklenen DOM Event nesnesi
- **ic_degiskenler**:
  - `customEvent` — `e`'nin `CustomEvent<{ product?: Product }>` tipine cast edilmiş hali; TypeScript'te `detail` alanına tip güvenli erişim sağlar
  - `detail` — `customEvent.detail` üzerinden erişilen event payload'u; `{ product?: Product }` yapısındadır
  - `product` — `detail.product` varsa çıkarılan `Product` nesnesi; toast içeriğine ve benzersiz ID oluşturmaya kullanılır
- **Dönüş**: yok (void) — Yan etki olarak `toast.custom(...)` çağrısı yapar

---

### [N4_NASIL] AST Pointer: src/components/AddToCartToast.tsx::toast_custom_render
- **params**: `id` — Sonner toast motoru tarafından atanan benzersiz toast ID'si; `toast.dismiss(id)` ile kapatma işleminde kullanılır
- **ic_degiskenler**:
  - `product` — closure'dan gelen `Product` nesnesi; `AddToCartToastContent` bileşenine prop olarak iletilir
- **Dönüş**: `<AddToCartToastContent product={product} onClose={() => toast.dismiss(id)} />` JSX elemanı

---

### [N5_NASIL] AST Pointer: src/components/AddToCartToast.tsx::onClose_callback
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `toast.dismiss(id)` çağırarak ilgili toast'u kapatır; `id` parent scope'taki toast render fonksiyonundan closure ile gelir

---

### [N6_NASIL] AST Pointer: src/components/AddToCartToast.tsx::cleanup_effect
- **params**: (yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok (void) — `window`'dan `EVENT` topic'indeki `onAdded` listener'ını `removeEventListener` ile kaldırır; bellek sızıntısını engeller

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
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)