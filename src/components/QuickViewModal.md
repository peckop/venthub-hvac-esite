---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\QuickViewModal.tsx
skeleton_hash: dede96518b31d438
generated_at: 2026-05-23T22:26:55Z
---

## Genel Bakış
Bu modül, kullanıcıların ana sayfadan ayrılmadan seçtikleri ürünlerin detaylarını görüntüleyebilmesini sağlayan React tabanlı bir hızlı görünüm modal bileşeni sunar. Ürün verisi, modalın açık/kapalı durumu ve kapatma aksiyonu gibi temel parametreleri alarak dinamik içerik oluşturur, kullanıcının ürünle ilgili hızlı aksiyonlar almasına olanak tanır.

## Fonksiyon Grupları
### Ana Modal Bileşeni
Modülün temel işlevini üstlenen, modalı ekrana getiren ve temel yaşam döngüsünü yöneten ana bileşendir. Gerekli tüm giriş parametrelerini alarak modalın görünürlüğünü ve içeriğini tam olarak kontrol eder.
- QuickViewModal

### Kullanıcı Etkileşimi Yönetimi
Modal üzerindeki kullanıcı aksiyonlarını yöneten yardımcı fonksiyondur, ürünle ilgili sepete ekleme gibi kullanıcı işlemlerini gerçekleştirmek için kullanılır.
- handleAdd

---

## AXIOMS – Mimari Varsayımlar
Bu modül, seçilen ürünün hızlı inceleme modalını doğru şekilde görüntülemek ve kullanıcı etkileşimlerini yönetmek için kendisine iletilen tüm prop'ların geçerli formatta olmasını ve dahili işlevlerinin bağımlılıklarının erişilebilir olmasını varsayar.

[Aksiyom 1]: Eğer prop olarak iletilen product nesnesi yoksa, modal içinde görüntülenecek ürün bilgileri oluşturulamaz, çalışma zamanı hatası oluşur veya içerik boş görüntülenir.
[Aksiyom 2]: Eğer modalın görünürlük durumunu kontrol eden open boolean değeri iletilmezse, modalın ne zaman açılıp kapanacağı yönetilemez, kullanıcı ürünün hızlı görünümünü asla açamaz veya açılan modalı asla kapatamaz.
[Aksiyom 3]: Eğer modalı kapatma sorumluluğunu üstlenen onClose fonksiyonu iletilmezse, kullanıcı açılan modalı kapatamaz, uygulama akışı tamamen kesilir.
[Aksiyom 4]: Eğer dahili handleAdd() fonksiyonunun çağırdığı ürün ekleme işleminin bağımlılığı (üst bileşenden alınan ekleme işlevi veya ilgili servis) erişilebilir değilse, modal üzerinden ürün ekleme işlemi hiçbir şekilde gerçekleştirilemez.

---

## FONKSIYON DETAYLARI

### QuickViewModal
**Ne yapar**: VentHub HVAC platformunda kullanıcıların mevcut sayfadan ayrılmadan seçili ürünün tüm detaylarını görüntülemesini sağlayan React modal bileşenidir. Ürün kartları üzerinden hızlı erişim için tasarlanmış olup, kullanıcı deneyimini kesintiye uğratmadan ürün incelemesi imkanı sunar.
**Nasıl yapar**: Tanımlandığı QuickViewModalProps tipli prop'ları alarak modalın tüm yaşam döngüsünü yönetir. Açık durumu prop ile belirlenen modal, true değeri aldığında ekran ortasında render edilir, içeriğine gelen ürün verisini yerleştirir. Kullanıcı kapatma eylemi yaptığında kendisine iletilen onClose geri çağırımını tetikleyerek modalın ana bileşen tarafından kapatılmasını sağlar.
**Parametreler**:
- product: Nesne — Hızlı görünümü gösterilecek HVAC ürününün tüm detaylarını (isim, fiyat, teknik özellikler vb.) içeren veri nesnesi
- open: boolean — Modalın ekranda görünür olup olmadığını belirten mantıksal değer, true olması halinde modal ekrana gelir
- onClose: () => void — Kullanıcı modalı kapatmak istediğinde tetiklenen, ana bileşende modalın açık durumunu güncelleyen geri çağırım fonksiyonu
**Dönüş**: React.FC<QuickViewModalProps> tipinde bir React bileşeni olarak, ekranda render edilecek modal penceresini içeren JSX elemanı döndürür.

### handleAdd
**Ne yapar**: QuickViewModal bileşeni içinde kullanılan, kullanıcının görüntülediği ürünü sepete veya ilgili listeye eklemesini sağlayan tıklama işleyici fonksiyonudur. Modal içindeki ekle butonuna tıklanması sonrası tüm ekleme süreçlerini yönetir.
**Nasıl yapar**: Bileşen içinde erişilebildiği ürün verisini kullanarak platformun ilgili state veya merkezi depolama yapısına ürünü ekler, ekleme işlemi sonrası gerekirse kullanıcıya bildirim gönderme gibi yan etkileri tetikler. Herhangi bir harici parametre almadan sadece bileşen içindeki erişilebilir verilerle çalışır.
**Parametreler**: Herhangi bir parametre almaz.
**Dönüş**: Tanımlanmış bir dönüş tipi yoktur, yalnızca yan etki yaratan bir işleyici olarak çalışır, herhangi bir değer döndürmez.

---

## INTERFACES

### QuickViewModalProps
- `product: Product | null`
- `open: boolean`
- `onClose: () => void`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/QuickViewModal.tsx::QuickViewModal
- **params**: (product, open, onClose)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, arayüz metinlerini lokalleştirmek için kullanılır
  - `lang` — useI18n hook'undan alınan mevcut aktif dil kodu, para birimi formatlamasında kullanılır
  - `addToCart` — useCart hook'undan alınan sepete ürün ekleme fonksiyonu
  - `product.price` — gelen ürün nesnesinden alınan ham fiyat değeri
  - `price` — product.price değerini sayıya dönüştürerek oluşturulan kullanılabilir fiyat değişkeni
  - `product.name` — ürün nesnesinden alınan ürün ismi
  - `product.brand` — ürün nesnesinden alınan ürün markası
  - `product.sku` — ürün nesnesinden alınan ürün stok takip kodu
  - `product.description` — ürün nesnesinden alınan ürün açıklaması
  - `product.slug` — ürün detay sayfası için benzersiz url parçası
  - `handleAdd` — sepete ekleme ve modal kapatma işlemini yöneten yerleşik callback fonksiyonu
  - `formatCurrency` — fiyat değerini kullanıcının diline uygun para birimi formatında biçimlendiren yardımcı fonksiyon
  - `Routes.product` — ürün detay sayfasının route'unu oluşturmak için kullanılan rota yardımcısı
  - `t('quickView.title')` — hızlı görünüm modal başlığı için çevrilmiş metin
  - `t('quickView.close')` — modal kapatma butonu etiketi için çevrilmiş metin
  - `t('quickView.descFallback')` — ürün açıklaması yoksa gösterilecek yedek açıklama metni
  - `t('quickView.addToCart')` — sepete ekle butonu metni için çevrilmiş değer
  - `t('quickView.viewProduct')` — ürün detayına git butonu metni için çevrilmiş değer
- **Dönüş**: `open` veya `product` koşulu sağlanmazsa null, modal aktifse React JSX elementi

### [N2_NASIL] AST Pointer: src/components/QuickViewModal.tsx::handleAdd
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `addToCart` — sepete ürün eklemek için kullanılan üst kapsamdaki sepete ekleme fonksiyonu
  - `product` — modalda görüntülenen ürün nesnesi, addToCart fonksiyonuna parametre olarak gönderilir
  - `onClose` — modalı kapatmak için parent componentten gelen callback fonksiyonu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\components\QuickViewModal.tsx
  function: src\components\QuickViewModal.tsx::QuickViewModal
  function: src\components\QuickViewModal.tsx::handleAdd

---

## DISA AKTARILANLAR (EXPORTS)
  export: QuickViewModal