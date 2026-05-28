---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\QuickViewModal.tsx
skeleton_hash: dede96518b31d438
entity_hashes:
  func:QuickViewModal: debc62013d59b5ee
  func:handleAdd: 552a96581034d630
  overview: 3c7154223e99d479
  style_tokens: a0d16d1087294b08
generated_at: 2026-05-28T22:36:55Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinde ürünlerin hızlı önizlemesini sağlamak için kullanılan bir React modal bileşenidir. Bileşen, ürün verilerini alır, modal'ın açık/kapalı durumunu yönetir ve ürün ile ilgili kullanıcı eylemlerini işler.

## Fonksiyon Grupları
### Modal Bileşeni
Ana UI bileşeni olup, ürün detaylarını modal olarak görüntülemekten ve görünürlük durumunu yönetmekten sorumludur. Kullanıcıya hızlı ürün önizleme deneyimi sunar.
- QuickViewModal

### Kullanıcı Etkileşim Yöneticileri
Kullanıcı etkileşimlerini yakalayan ve ilgili işlemleri tetikleyen yardımcı fonksiyonlardır. Ürün ekleme gibi eylemleri yönetir.
- handleAdd

---

## AXIOMS – Mimari Varsayımlar
Bu modülün çalışması için aşağıdaki varsayımlar gerekli.

[Aksiyom 1]: Eğer `product` prop'u tanımlı değilse, `QuickViewModal` component'i render ederken product özelliklerine erişim hatası olur.  
[Aksiyom 2]: Eğer `open` prop'u boolean değilse, modalın görünürlüğü kontrolü beklenen şekilde çalışmayabilir.  
[Aksiyom 3]: Eğer `onClose` prop'u bir fonksiyon değilse, `onClose` çağrıldığında çalışma zamanı hatası olur.  
[Aksiyom 4]: Eğer `handleAdd` fonksiyonu çağrılırken `product` prop'u tanımlı değilse, ürün ekleme işlemi beklenen şekilde gerçekleşmeyebilir.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\QuickViewModal.tsx::QuickViewModal
- **params**: product, open, onClose
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, tüm UI metinlerini yerel dile çevirmek için kullanılır
  - `lang` — useI18n hook'undan alınan aktif dil kodu, ürün fiyatını formatlamak için kullanılır
  - `addToCart` — useCart hook'undan alınan sepete ürün ekleme fonksiyonu, handleAdd işlevinde çağrılır
  - `price` — product.price değerinden number tipine dönüştürülmüş ürün fiyatı, para formatlama işleminde kullanılır
  - `handleAdd` — modal içindeki sepete ekleme butonunun tıklama olayını yöneten iç fonksiyon
- **Dönüş**: null (open veya product değerleri geçersizse) veya React JSX elementi (hızlı görünüm modal arayüzü)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\QuickViewModal.tsx::handleAdd
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `addToCart` — üst kapsamdan erişilen sepete ekleme fonksiyonu, modalda gösterilen ürünü sepete eklemek için çağrılır
  - `product` — üst kapsamdan erişilen modalda görüntülenen ürün nesnesi, addToCart fonksiyonuna parametre olarak iletilir
  - `onClose` — üst kapsamdan erişilen modalı kapatma callback fonksiyonu, sepete ekleme işlemi sonrası modalı kapatmak için çağrılır
- **Dönüş**: yok

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