---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\QuickViewModal.tsx
skeleton_hash: fc9d7ff94e251f3f
entity_hashes:
  func:QuickViewModal: debc62013d59b5ee
  func:handleAdd: 552a96581034d630
  overview: c04ebac1db5bee8d
  style_tokens: a0d16d1087294b08
generated_at: 2026-06-08T10:08:35Z
---

## Genel Bakış
QuickViewModal, ürünlerin hızlı önizlemesini sunan ve kullanıcıların ürünleri doğrudan sepete eklemesine olanak tanıyan bir modal bileşenidir. Bileşen, modal penceresinin görünürlüğünü ve kullanıcı etkileşimlerini yönetir.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Ürün bilgilerini içeren modal penceresini oluşturan ve open/close durumunu kontrol eden ana arayüz bileşenidir.
- QuickViewModal

### Ürün Eylem Yönetimi
Kullanıcı arayüzünden tetiklenen, sepete ekleme gibi somut eylemleri işleyen yardımcı fonksiyonlardır.
- handleAdd

---

## AXIOMS – Mimari Varsayımlar
Bu modül, bir React bileşeni olup, belirli prop'ların ve bağımlılıkların varlığını gerektirir. Bu koşullar sağlanmadığında bileşen düzgün çalışamaz veya hata verir.

[Aksiyom 1]: Eğer `QuickViewModal` bileşenine `product` prop'u geçilmezse veya geçilen değer `null`/`undefined` veya geçersiz bir nesne ise, modal içeriği (örn: ürün adı, fiyatı) düzgün oluşturulamaz ve bileşen render hataları veya eksik veri ile karşılaşır.

[Aksiyom 2]: Eğer `QuickViewModal` bileşenine `open` prop'u geçilmezse (veya `boolean` bir değer almayan bir değer geçilirse), modal'ın açılıp kapanacağı başlangıç durumu belirsizleşir ve bileşenin render mantığı hatalı çalışabilir (örn: modal hiç açılmayabilir veya her zaman açık kalabilir).

[Aksiyom 3]: Eğer `QuickViewModal` bileşenine `onClose` prop'u geçilmezse veya geçilen değer bir fonksiyon (`Function`) değilse, modal'ı kapatmaya yönelik herhangi bir kullanıcı eylemi (örn: kapatma butonuna basma, backdrop'a tıklama) bileşenin iç mantığında işlenemez ve bileşen hata verir.

[Aksiyom 4]: Eğer `handleAdd` fonksiyonu tetiklendiğinde, bileşenin dahili durumunda veya üst bileşeninde (`product`'ı tutan) ürün bilgisi (`product` prop'undan gelen) geçerli bir `id` içermiyorsa, sepete ekleme işlemi (muhtemelen bir API çağrısı ile) başarısız olur veya eksik veriyle gerçekleştirilir.

[Aksiyom 5]: Eğer React veya bileşenin kullandığı UI framework/kütüphanesi (örn: Modal, Button) ortamda mevcut değilse, bileşen hiç oluşturulamaz ve uygulama hata verir.

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

## INTERFACES

### QuickViewModalProps
- `product: Product | null`
- `open: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: QuickViewModal.tsx::QuickViewModal
- **params**: `{ product, open, onClose }` — destructured obje parametreleri: `product` (Product tipinde ürün nesnesi), `open` (boolean, modalin açık olup olmadığı), `onClose` (modalin kapatılma callback fonksiyonu)
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan dönen çeviri fonksiyonu; `t('quickView.title')`, `t('quickView.close')` gibi anahtarlarla UI metinlerini çevirir
  - `lang` — `useI18n()` hook'undan dönen dil kodu string'i; `formatCurrency` çağrısına passed olarak para birimi formatlamada kullanılır
  - `addToCart` — `useCart()` hook'undan dönen sepete ürün ekleme fonksiyonu; `handleAdd` içinde `addToCart(product)` olarak çağrılır
  - `price` — `Number(product.price)` ifadesinden türetilen number tipinde fiyat değeri; `formatCurrency(price, lang, ...)` çağrısına passed olarak kullanılır
  - `handleAd` — parametre almayan arrow function; `addToCart(product)` çağrısı yapar ardından `onClose()` ile modali kapatır
- **Dönüş**: JSX — `return null` (open veya product falsy ise) veya dialog HTML'i (jsx element ağacı)

### [N2_NASIL] AST Pointer: QuickViewModal.tsx::handleAdd
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — sadece dış kapsam değişkenleri kullanılır: `addToCart`, `product`, `onClose`)
- **Dönüş**: yok (undefined) — `addToCart(product)` ile ürünü sepete ekler, `onClose()` ile modalı kapatır; dönüş değeri döndürmez, yalnızca yan etki üretir

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