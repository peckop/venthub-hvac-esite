---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\QuickViewModal.tsx
skeleton_hash: 5894fff46064d856
entity_hashes:
  func:QuickViewModal: debc62013d59b5ee
  func:handleAdd: 552a96581034d630
  overview: 42118afde1c67a0d
  style_tokens: a2ee6e23d34d3389
generated_at: 2026-08-15T06:31:59Z
---

## Genel Bakış
QuickViewModal, ürünlerin kısa önizleme penceresini sunan bir React bileşenidir. Kullanıcının ürün detaylarını hızlıca görüntülemesini ve ürünü doğrudan sepete eklemesini sağlar. Modal'ın görünürlüğü ve temel eylemler bu bileşen içinde merkezi olarak yönetilir.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Ürün bilgilerini, görsellerini ve arayüzünü barındıran modal penceresini oluşturan ana React bileşenidir. Dışarıdan gelen open, product ve onClose durumlarına göre modal'ın açılıp kapanmasını kontrol eder.

- QuickViewModal

### Sepete Ekleme İşleyicisi
Kullanıcının "Sepete Ekle" tıklamasını yakalayan ve ilgili ürün bilgisini işleyerek sepete ekleme mantığını gerçekleştiren olay işleyicisidir.

- handleAdd

---

## AXIOMS – Mimari Varsayımlar

Bu bileşen, ürünlerin hızlı önizleme penceresini açan ve doğrudan sepete ekleme imkânı sunan bir React modal bileşenidir.

[Aksiyom 1]: Eğer `product` prop'u sağlanmazsa, bileşen gösterilecek ürün bilgisi olmadığından Sepete Ekleme işlevi çalışamaz ve render edilen içerik anlamsız olur.

[Aksiyom 2]: Eğer `open` prop'u boolean değer olarak sağlanmazsa, modal'ın açılıp kapanma davranışı tanımsız olur.

[Aksiyom 3]: Eğer `onClose` callback'i sağlanmazsa, kullanıcı modal'ı kapatamaz; bileşenin kapanma mekanizması çalışmaz.

[Aksiyom 4]: `handleAdd` fonksiyonu parametresizdir; dolayısıyla `product` bilgisine closure (üst kapsam) üzerinden erişim gerektirir. Eğer `handleAdd` doğru kapsamda (bileşen içinde) çağrılmazsa, sepete ekleme işlemi başarısız olur.

[Aksiyom 5]: Eğer `product` nesnesi Sepete Ekleme işlemi için gerekli alanları (örn. ürün ID, fiyat vb.) içermiyorsa, sepete ekleme başarısız olur.

---

## FONKSİYON DETAYLARI

### QuickViewModal
**Ne yapar**: Bu bileşen, kullanıcıya seçili bir ürünün hızlı bir önizlemesini sunan bir modal penceresi oluşturur ve yönetir. Ürün detaylarını görüntülemek için kullanılan arayüz katmanıdır.
**Nasıl yapar**: `product`, `open` ve `onClose` özelliklerini (props) alarak modalın görünürlüğünü ve içeriğini kontrol eder. React bileşeni olarak, `open` durumuna göre modalı ekrana çizer ve kapatma işlemi için `onClose` metodunu tetikler.
**Parametreler**:
- product: object — Modal içinde gösterilecek olan ürünün verilerini ve özelliklerini içerir.
- open: boolean — Modal penceresinin açık olup olmadığını belirten durum değişkenidir.
- onClose: function — Modalın kapatılması gerektiğinde çalıştırılan geri çağırma (callback) fonksiyonudur.
**Dönüş**: React.FC<QuickViewModalProps> — QuickViewModal arayüzünü temsil eden bir React bileşeni döner.

### handleAdd
**Ne yapar**: Bu fonksiyon, modal içinde görüntülenen ürünü sepete veya listeye ekleme işlemini başlatır ve yönetir. Kullanıcının ekleme butonuna tıklamasıyla tetiklenen etkileşimdir.
**Nasıl yapar**: Mevcut ürün verisi üzerinde gerekli işlemleri gerçekleştirerek ürünü sisteme ekler. İçerik detayları kaynak kodunda belirtilmemiştir ancak genel olarak ekleme mantığını uygular.
**Parametreler**:
- Hiçbir parametre almaz.
**Dönüş**: void veya bilinmiyor — Herhangi bir değer döndürmez veya dönüş tipi belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: ../hooks/useCartHook::useCart
- import: ../hooks/useLocalizedRoutes::useLocalizedRoutes
- import: ../i18n/I18nProvider::useI18n
- import: ./ProductCard::type { StorefrontProduct }
- import: lucide-react::Eye
- import: lucide-react::ShoppingCart
- import: lucide-react::X
- import: next/link::Link
- import: react::React

---

## INTERFACES

### QuickViewModalProps
- `product: StorefrontProduct | null`
- `open: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: QuickViewModal.tsx::QuickViewModal
- **params**: (`{ product, open, onClose }`)
- **ic_degiskenler**: her değişken için "isim — ne işe yarar" formatında
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, UI metinlerini çevirmek için kullanılır
  - `addToCart` — useCart hook'undan gelen, ürünleri sepete ekleyen fonksiyon
  - `Routes` — useLocalizedRoutes hook'undan gelen, lokalize rotaları oluşturan nesne
  - `displayPrice` — `product.displayPrice`'dan gelen fiyat değeri, null ise fiyat gösterilmez
  - `quoteMode` — fiyatın null veya 0'dan küçük/eşit olup olmadığını belirleyen boolean, quote modunu aktif eder
  - `handleAdd` — sepete ekleme işlemi yapan inner fonksiyon, quoteMode'da işlevsiz
- **Dönüş**: `React.FC<QuickViewModalProps>` (JSX elementi veya `null`)

### [N2_NASIL] AST Pointer: QuickViewModal.tsx::handleAdd
- **params**: (yok)
- **ic_degiskenler**: her değişken için "isim — ne işe yarar" formatında
  - `quoteMode` — outer scope'tan erişilen quote modu değişkeni, true ise fonksiyon erken döner
  - `addToCart` — outer scope'tan erişilen sepete ekleme fonksiyonu
  - `product` — outer scope'tan erişilen ürün nesnesi, addToCart'a parametre olarak gönderilir
  - `onClose` — outer scope'tan erişilen kapatma fonksiyonu, ekleme sonrası modalı kapatmak için çağrılır
- **Dönüş**: yok (side effect: addToCart çağrısı ve onClose çağrısı)

---

## NODE ID STANDARD

  file: src\components\QuickViewModal.tsx
  function: src\components\QuickViewModal.tsx::QuickViewModal
  function: src\components\QuickViewModal.tsx::handleAdd

---

## DISA AKTARILANLAR (EXPORTS)
  export: QuickViewModal

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-black/40`, `bg-gradient-to-br`, `bg-primary-navy`, `bg-white`, `border-2`, `border-b`, `border-light-gray`, `border-primary-navy`, `from-air-blue`, `hover:bg-light-gray`, `hover:bg-primary-navy`, `hover:bg-secondary-blue`, `hover:text-white`, `text-2xl`, `text-6xl`
- **Layout:** `fixed`, `flex`, `flex-1`, `flex-col`, `from-air-blue`, `gap-2`, `gap-4`, `grid`, `grid-cols-1`, `inline-flex`, `items-center`, `justify-between`, `justify-center`, `line-clamp-2`, `line-clamp-4`
- **Varyant/Responsive:** `disabled:`, `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `aspect-square`, `disabled:cursor-not-allowed`, `disabled:opacity-50`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-semibold`, `inset-0`, `mb-1`, `mb-2`, `mb-4`, `mb-6`, `mr-2`