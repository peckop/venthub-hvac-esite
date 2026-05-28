---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\CartToast.tsx
skeleton_hash: eb3942a6caa35ebc
entity_hashes:
  func:CartToast: a2ae301e9df08eee
  overview: 8dcc105f56ed9e74
  style_tokens: c52e4aa86d11fa3f
generated_at: 2026-05-28T22:35:44Z
---

## Genel Bakış
(Sentez hatası)

---

## AXIOMS – Mimari Varsayımlar
(Sentez hatası)

---

## FONKSİYON DETAYLARI

### CartToast
**Ne yapar**: Sepete ürün eklenmesi gibi işlemler sonrası kullanıcıya kısa süreli bir bildirim (toast) gösteren React bileşenidir. Görünürlük durumuna ve ürün bilgisine bağlı olarak ekranda geçici bir kutu içerisinde bilgi sunar.
**Nasıl yapar**: `isVisible` prop’u `true` olduğunda toast kutusunu render eder ve `product` nesnesindeki ürün adı, fiyat gibi alanları görüntüler. Kullanıcı toast üzerindeki kapatma butonuna tıkladığında veya belirli bir süre sonra `onClose` fonksiyonunu çağırarak bileşenin gizlenmesini sağlar. Bileşen, görünmez olduğunda herhangi bir çıktı üretmez.
**Parametreler**:
- isVisible: `boolean` — Toast’un görünür olup olmadığını belirler. `true` iken toast ekranda gösterilir.
- product: `any` — Toast içinde gösterilecek ürün bilgilerini içeren nesne (örneğin ürün adı, fiyatı, resim URL’si).
- onClose: `function` — Toast kapatıldığında çağrılacak geri çağrı fonksiyonu. Genellikle toast’un görünmez olmasını sağlamak için kullanılır.
**Dönüş**: `React.FC<CartToastProps>` — Fonksiyonel bir React bileşeni olduğu için bir JSX elementi döndürür; `CartToastProps` tipindeki prop’ları alır. Bileşen tipi `React.FC` olarak tanımlanmıştır.

---

## INTERFACES

### CartToastProps
- `isVisible: boolean`
- `product: Product | null`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\CartToast.tsx::CartToast
- **params**: (isVisible, product, onClose)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook tarafından döndürülen çeviri fonksiyonu, metinleri yerelleştirmek için kullanılır.
  - `lang` — `useI18n()` hook tarafından döndürülen geçerli dil kodu, para birimi formatlamada kullanılır.
  - `showChoiceModal` — `useState(false)` ile tanımlanan boolean durum, seçim modalının gösterilip gösterilmeyeceğini kontrol eder.
  - `setShowChoiceModal` — `showChoiceModal` durumunu güncellemek için kullanılan set fonksiyonu.
  - `timer` (ilk `useEffect` içinde) — `setTimeout` tarafından döndürülen zamanlayıcı kimliği, efekt temizleme fonksiyonunda `clearTimeout` ile iptal edilir.
  - `timer` (ikinci `useEffect` içinde) — aynı amaçla ikinci efekt içinde tanımlanan zamanlayıcı kimliği.
  - `handleContinueShopping` — `onClose` ve `setShowChoiceModal(false)` çağırarak modalı kapatan ve dış kapatma fonksiyonunu tetikleyen olay işleyicisi.
  - `handleGoToCart` — `onClose` ve `setShowChoiceModal(false)` çağırarak modalı kapatan, ardından `Link` bileşeni aracılığıyla yönlendirme yapılmasını sağlayan olay işleyicisi.
- **Dönüş**: React element (JSX) – toast ve isteğe bağlı seçim modalını render eder; `null` dönebilir (`!isVisible || !product` durumunda).

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
- **Renkler:** `bg-black`, `bg-light-gray`, `bg-opacity-50`, `bg-primary-navy`, `bg-success-green/10`, `bg-white`, `border-2`, `border-primary-navy`, `border-success-green`, `hover:bg-primary-navy`, `hover:bg-secondary-blue`, `hover:text-industrial-gray`, `hover:text-white`, `text-center`, `text-industrial-gray`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-shrink-0`, `items-center`, `items-start`, `justify-center`, `max-w-md`, `max-w-sm`, `min-w-0`, `p-2`, `p-3`, `p-4`, `p-6`, `right-4`
- **Varyant/Responsive:** `focus-visible:`, `hover:` önekleri
- **Yardımcı Sınıflar:** `animate-bounce-in`, `animate-slide-up`, `border`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy`, `font-medium`, `font-semibold`, `inset-0`, `mb-4`, `mb-6`, `ml-auto`, `mt-0.5`, `mt-4`