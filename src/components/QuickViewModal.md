---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\QuickViewModal.tsx
skeleton_hash: 00d87e64807a05c6
entity_hashes:
  func:QuickViewModal: debc62013d59b5ee
  func:handleAdd: 552a96581034d630
  overview: 8af2669fbee6ab56
  style_tokens: a0d16d1087294b08
generated_at: 2026-06-06T21:54:53Z
---

## Genel Bakış
QuickViewModal, ürünlerin hızlı önizlemesini sunan bir modal bileşenidir. Ürün detaylarını görüntüler ve kullanıcıların ürünleri sepete eklemesine olanak tanır. Bileşen, modal durumunu ve kullanıcı etkileşimlerini merkezi olarak yönetir.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Ürün bilgilerini modal penceresi içinde gösteren ve görünürlük durumunu kontrol eden ana UI bileşenidir.
- QuickViewModal

### Ürün Eylem Yönetimi
Kullanıcı tarafından tetiklenen ürün ekleme işlemi gibi etkileşimleri işleyen yardımcı fonksiyonlardır.
- handleAdd

---

## AXIOMS – Mimari Varsayımlar

Bu modül, props tabanlı çalışan bir React modal bileşenidir; temel varsayımları fonksiyon imzalarından türetilmiştir.

[Aksiyom 1]: Eğer `product` prop'u verilmezse veya geçerli bir ürün nesnesi içermiyorsa, modal bileşeni ürün bilgisi gösteremez ve render edilen içerik eksik veya hatalı olur.

[Aksiyom 2]: Eğer `open` prop'u verilmezse veya `false` değerindeyse, modal.visible durumu kapalıdır ve kullanıcıya modal penceresi gösterilmez.

[Aksiyom 3]: Eğer `onClose` prop'u verilmezse, kullanıcı modal'ı kapatmaya çalıştığında回调 fonksiyon tetiklenemez ve hata oluşur.

[Aksiyom 4]: `handleAdd()` fonksiyonu çağrıldığında, modal bileşeninin iç bağlamında geçerli bir `product` prop'unun mevcut olması gerekir; aksi takdirde eklenecek ürün bilinmediğinden işlem başarısız olur.

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
- **params**: `{ product, open, onClose }` — product: Product tipinde ürün nesnesi, open: boolean modalın açık olup olmadığını belirler, onClose: callback modalı kapatmak için çağrılır
- **ic_degiskenler**:
  - `t` — useI18n hook'undan dönen çeviri fonksiyonu, UI metinlerini uluslararası dil anahtarlarıyla çevirir (t('quickView.title'), t('quickView.addToCart') vb.)
  - `lang` — useI18n hook'undan dönen aktif dil kodu, formatCurrency'e aktarılarak para birimi formatlamada kullanılır
  - `addToCart` — useCart hook'undan dönen fonksiyon, verilen Product nesnesini sepete ekler
  - `price` — Number(product.price) ile product.price'ın number tipine dönüştürülmüş hali, formatCurrency fonksiyonuna argüman olarak geçilir
- **Dönüş**: `JSX.Element | null` — open veya product falsy ise null döner; aksi halde modal JSX yapısını (dialog, ürün bilgileri, Sepete Ekle ve Ürünü Gör butonları) döner

### [N2_NASIL] AST Pointer: QuickViewModal.tsx::handleAdd
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: yok — addToCart(product) ile ürünü sepete ekler, ardından onClose() ile modalı kapatır

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