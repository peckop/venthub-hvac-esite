---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\QuickViewModal.tsx
skeleton_hash: ce72e8e540ec5f73
entity_hashes:
  func:QuickViewModal: debc62013d59b5ee
  func:handleAdd: 552a96581034d630
  overview: 04dc44e28dbfa658
  style_tokens: a0d16d1087294b08
generated_at: 2026-06-19T20:47:39Z
---

## Genel Bakış
QuickViewModal, ürünlerin hızlı önizleme penceresini sunan ve kullanıcıların bu ürünleri doğrudan sepete eklemesine olanak tanıyan bir React bileşenidir. Bileşen, modal'ın açılıp kapanmasını ve ürünle ilgili temel eylemleri yönetir.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Ürün bilgilerini ve arayüzünü barındıran modal penceresini oluşturan ve görünürlük durumunu (açık/kapalı) kontrol eden ana React bileşenidir.
- QuickViewModal

### Sepete Ekleme İşleyicisi
Kullanıcının "Sepete Ekle" gibi bir eylemini tetikleyen, ürün bilgisini işleyip sepete ekleyen mantığı yöneten olay işleyicisidir.
- handleAdd

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React modal bileşeni olup ürün önizleme ve sepete ekleme işlevselliği sağlar.

[Aksiyom 1]: Eğer `product` prop'u null veya undefined olarak geçirilirse, modal bileşeni görüntülenecek ürün verisine sahip olamaz ve içerik alanı boş veya hata durumunda kalır.

[Aksiyom 2]: Eğer `open` prop'u boolean değer olarak sağlanmazsa (örn. undefined), modal'ın başlangıç görünürlük durumu belirsizleşir ve bileşenin open/close mantığı tutarsız çalışır.

[Aksiyom 3]: Eğer `onClose` callback fonksiyonu sağlanmazsa, kullanıcı modal'ı kapatmaya çalıştığında tetiklenecek bir mekanizma olmaz ve modal açık kalır.

[Aksiyom 4]: Eğer `product` prop'u bir nesne ise, bu nesnenin sepete ekleme işlemi için gerekli alanları (örn. ürün ID, fiyat) içerdiği varsayılır — aksi takdirde `handleAdd` fonksiyonu tamamlanamaz.

[Aksiyom 5]: Eğer `handleAdd` fonksiyonu çağrılmadan önce `product` prop'u değiştirilmiş veya geçersizleşmişse, sepete ekleme işlemi yanlış ürün verisiyle gerçekleşir.

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
- import: ../i18n/format::formatCurrency
- import: @/types/ui-models::type { Product }
- import: lucide-react::Eye
- import: lucide-react::ShoppingCart
- import: lucide-react::X
- import: next/link::Link
- import: react::React

---

## INTERFACES

### QuickViewModalProps
- `product: Product | null`
- `open: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/QuickViewModal.tsx::QuickViewModal
- **params**: (`{ product, open, onClose }` — React component props: product nesnesi, modal durumu, kapatma fonksiyonu)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan gelen çeviri fonksiyonu, UI metinlerini çevirir
  - `lang` — useI18n hook'undan gelen dil kodu, para formatlamada kullanılır
  - `addToCart` — useCart hook'undan gelen ürün sepete ekleme fonksiyonu
  - `Routes` — useLocalizedRoutes hook'undan gelen lokalize rota oluşturucu nesne
  - `price` — product.price'ı Number tipine çevirerek sayısal fiyat değeri
- **Dönüş**: `React.ReactNode` (JSX element veya null)

### [N2_NASIL] AST Pointer: src/components/QuickViewModal.tsx::handleAdd
- **params**: ()
- **ic_degiskenler**:
  - `product` — outer scope'dan gelen ürün nesnesi (closure tarafından yakalanır)
  - `onClose` — outer scope'dan gelen kapatma fonksiyonu (closure tarafından yakalanır)
  - `addToCart` — outer scope'dan gelen sepete ekleme fonksiyonu (closure tarafından yakalanır)
- **Dönüş**: yok (addToCart ve onClose fonksiyonlarını çağırarak yan etki oluşturur)

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
- **Varyant/Responsive:** `focus-visible:`, `hover:`, `sm:` önekleri
- **Yardımcı Sınıflar:** `aspect-square`, `focus-visible:outline-none`, `focus-visible:ring-2`, `focus-visible:ring-offset-2`, `focus-visible:ring-primary-navy`, `font-bold`, `font-semibold`, `inset-0`, `mb-1`, `mb-2`, `mb-4`, `mb-6`, `mr-2`, `mt-auto`, `px-4`