---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\pdfGenerator.ts
skeleton_hash: 459843494b89b28a
entity_hashes:
  func:arrayBufferToBase64: ac0cb07b30bf5c01
  func:generateProductDatasheet: eac5e07d950d7a2e
  overview: 936f502efa6fe32b
generated_at: 2026-06-07T15:51:57Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformu için özelleştirilmiş ürün veri sayfası (PDF) oluşturmayı sağlar. Ürün bilgilerini, çok dilli çeviri desteğini ve isteğe bağlı görselleri entegre ederek profesyonel dokümanlar üretir. Modül, PDF oluşturma sürecinde gerekli olan yardımcı veri dönüşüm işlemlerini de yönetir.

## Fonksiyon Grupları
### Ana PDF Üretim Süreci
Ürün detaylarını, çeviri anahtarlarını ve görsel URL'sini alarak tam bir PDF dokümanı üretir. Bu süreç, çok dilli metin desteği ve görsel entegrasyonu dahil olmak üzere tüm hazırlık adımlarını yönetir.
- generateProductDatasheet

### Yardımcı Veri Dönüşüm Fonksiyonları
PDF'e eklenecek ikili (binary) verileri, doküman yapısının anlayabileceği temel formata (base64) dönüştürerek ana sürecin kullanımına hazırlar.
- arrayBufferToBase64

---

## AXIOMS – Mimari Varsayımlar

Bu modül için geçerli mimari varsayımlar aşağıdadır.

[Aksiyom 1]: Eğer `generateProductDatasheet` fonksiyonuna geçerli bir `product` (Product tipi) nesnesi verilmemişse, PDF üretimi başarısız olur veya geçersiz çıktı oluşur.

[Aksiyom 2]: Eğer `generateProductDatasheet` fonksiyonuna `lang` parametresi sağlanmamışsa, fonksiyon çağrısı başarısız olur (parametre zorunludur, default değeri yoktur).

[Aksiyom 3]: Eğer `imageUrl` parametresi verilmemişse, PDF içeriğinde ürün görseli olmadan oluşturulur.

[Aksiyom 4]: Eğer `translateKey` parametresi verilmemişse, PDF içeriğinde çeviri desteksiz (ham anahtar değerleriyle) oluşturulur.

[Aksiyom 5]: Eğer `arrayBufferToBase64` fonksiyonuna geçerli bir `ArrayBuffer` nesnesi verilmemişse, Base64 dönüşümü başarısız olur.

[Aksiyom 6]: Eğer `lang` değeri uygulama tarafından desteklenmeyen bir dil kodu ise, PDF içeriğinde çeviri hataları veya eksik çeviriler oluşur (davranış bilinmiyor — desteklenen dil listesi modül içinde tanımlı değildir).

[Aksiyom 7]: Eğer `Product` nesnesi beklenen alanları (alan yapısı bilinmiyor) içermiyorsa, PDF üretimi sırasında hata oluşur.

---

## FONKSİYON DETAYLARI

### generateProductDatasheet
**Ne yapar**: Bu fonksiyon, bir `Product` nesnesi alarak premium tasarımlı ve Türkçe karakter destekli teknik bir ürün föyü (PDF) üretir ve tarayıcıda otomatik olarak indirir.

**Nasıl yapar**: Fonksiyon, jsPDF kütüphanesi ile A4 boyutunda bir PDF dokümanı oluşturur. Öncelikle Roboto fontunu (normal ve bold) uzak sunucudan Base64 formatına dönüştürerek dokümana ekler; başarısız olursa varsayılan Helvetica fontuna geri döner. Ardından sayfanın üst kısmına marka logosu ve başlığını, alt kısmına ise sayfa numarası ve telif bilgisini çizer. Ürün adı, markası, model kodu, varsa görseli ve açıklaması sayfaya yerleştirilir. Ürünün `technical_specs` özelliği varsa, bu özellikler şık bir tablo formatında listelenir. Fonksiyon, iç içe tanımlı `drawHeader` ve `drawFooter` yardımcı fonksiyonlarını kullanarak her sayfada tutarlı bir tasarım sağlar. Son olarak, dosyayı temiz bir isimlendirme ile PDF olarak kaydeder ve indirme işlemini tetikler.

**Parametreler**:
- `product`: Product — Teknik bilgileri ve içeriği PDF'e dönüştürülecek olan ürün nesnesi. `name`, `brand`, `sku`, `model_code`, `description` ve `technical_specs` gibi alanları bekler.
- `imageUrl?`: string — Ürüne ait görselin URL adresi. Sağlanırsa, PDF'e ürün görseli olarak eklenir. Sağlanmazsa veya görsel yüklenemezse, sadece ürün açıklaması metni olarak gösterilir.
- `translateKey?`: (key: string) => string — Teknik özellikler tablosunda kullanılacak özellik anahtarlarının (örn: `power_consumption`) tercüme edilmiş versiyonlarını döndüren bir fonksiyon. Sağlanmazsa, ham anahtar isimleri kullanılır.
- `lang`: string — PDF içeriğinin ve arayüz metinlerinin (başlıklar, butonlar vb.) hangi dilde olacağını belirler. Varsayılan değeri `'tr'`'dir. `'tr'` için Türkçe, diğer değerler için İngilizce metinler kullanılır.

**Dönüş**: Promise<void> — Fonksiyon asenkron bir operasyon yürütür ve herhangi bir değer döndürmez. Görevinin sonucu olarak tarayıcıda bir PDF dosyası indirme penceresi açılır.

### arrayBufferToBase64
**Ne yapar**: Ham binary ArrayBuffer verisini Base64 metin formatına dönüştüren yardımcı utility fonksiyonudur. PDF üretim sürecinde görseller gibi binary dosya verilerinin PDF şablonuna sorunsuz bir şekilde gömülmesini sağlar.
**Nasıl yapar**: Gelen ArrayBuffer verisini önce Uint8Array tipine dönüştürerek tüm baytları tek bir stringde birleştirir, ardından tarayıcının yerleşik btoa fonksiyonunu kullanarak bu stringi Base64 kodlu formatına çevirir.
**Parametreler**:
- buffer: ArrayBuffer — Base64 formatına dönüştürülecek olan ham binary veriyi içeren ArrayBuffer nesnesi, genellikle ürün görseli gibi PDF'e gömülecek dosya içeriklerini barındırır
**Dönüş**: string — Dönüştürülen Base64 kodlu metin değeri, bu değer doğrudan veri URI'si olarak veya PDF içerisine gömülmek üzere kullanılabilir

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/pdfGenerator.ts::generateProductDatasheet
- **params**: `product: Product, imageUrl?: string, translateKey?: (key: string) => string, lang: string = 'tr'`
- **ic_degiskenler**: 
  - `doc` — jsPDF PDF belge nesnesi, tüm çizim ve ekleme işlemleri bu nesne üzerinden yapılır
  - `fontName` — mevcut font adı, başlangıçta 'helvetica', Roboto başarırsa 'Roboto' olur
  - `fontResponse` — fetch ile Roboto Regular font dosyasının HTTP response nesnesi
  - `fontBuffer` — Regular fontun ArrayBuffer verisi, arrayBufferToBase64'e gönderilir
  - `fontBase64` — Regular fontun base64 string'e çevrilmiş hali
  - `fontBoldResponse` — fetch ile Roboto Bold font dosyasının HTTP response nesnesi
  - `fontBoldBuffer` — Bold fontun ArrayBuffer verisi
  - `fontBoldBase64` — Bold fontun base64 string'e çevrilmiş hali
  - `pageWidth` — PDF sayfasının genişliği (mm cinsinden)
  - `pageHeight` — PDF sayfasının yüksekliği (mm cinsinden)
  - `margin` — sayfa kenar boşlukları (15mm)
  - `drawHeader` — üst bilgi (logo, başlık, referans no) çizen inner fonksiyon
  - `drawFooter` — alt bilgi (sayfa numarası, site URL) çizen inner fonksiyon
  - `currentY` — dikey çizim pozisyonunu takip eden sayaç, içerik ilerledikçe artırılır
  - `splitTitle` — ürün adının sayfa genişliğine sığacak şekilde bölünmüş hali (dizi)
  - `brandModelText` — marka ve model kodunu içeren localized metin stringi
  - `contentWidth` — içerik alanının genişliği (sayfa genişliği - 2×margin)
  - `imageSize` — ürün görselinin boyutu (70mm×70mm)
  - `renderDescriptionFallback` — görsel yoksa açıklama metnini çizen inner fonksiyon
  - `tableData` — teknik özellikler tablosunun satırlarını tutan dizi, her satır [label, value] formatında
  - `getPagesFn` — Reflect.get ile elde edilen toplam sayfa sayısını döndüren fonksiyon
  - `totalPages` — PDF'deki toplam sayfa sayısı
  - `cleanName` — ürün adından özel karakterlerin temizlenmiş ve kısaltılmış hali (dosya adı için)
- **Dönüş**: `Promise<void>` (PDF dosyasını kaydeder, değer döndürmez)

### [N2_NASIL] AST Pointer: src/lib/pdfGenerator.ts::arrayBufferToBase64
- **params**: `buffer: ArrayBuffer`
- **ic_degiskenler**: 
  - `binary` — ArrayBuffer'ın string temsili, her byte charFromCode ile eklenir
  - `bytes` — ArrayBuffer'ın Uint8Array görünümü, byte'lara tek tek erişim için
  - `len` — byte dizisinin toplam uzunluğu (byteLength)
- **Dönüş**: `string` (base64 encoded veri)

---

## NODE ID STANDARD

  file: src\lib\pdfGenerator.ts
  function: src\lib\pdfGenerator.ts::generateProductDatasheet
  function: src\lib\pdfGenerator.ts::arrayBufferToBase64

---

## DISA AKTARILANLAR (EXPORTS)
  export: arrayBufferToBase64
  export: generateProductDatasheet