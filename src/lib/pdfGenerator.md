---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\pdfGenerator.ts
skeleton_hash: 9e2fd322899caedc
entity_hashes:
  func:arrayBufferToBase64: ac0cb07b30bf5c01
  func:generateProductDatasheet: ad0f52b2a314b0b1
  overview: 7a89820d056cfb36
generated_at: 2026-06-06T21:55:49Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformu için profesyonel ürün veri sayfası (datasheet) PDF'leri üretmek üzere tasarlanmıştır. Ürün detayları, çok dilli çeviri desteği ve isteğe bağlı ürün görselleriyle özelleştirilmiş kullanıma hazır dokümanlar oluşturur. PDF oluşturma sürecinde ihtiyaç duyulan yardımcı veri dönüşüm işlemlerini de bünyesinde barındırır.

## Fonksiyon Grupları
### Ana PDF Üretim Süreci
Gelen ürün verileri, destekleyici parametreler ve isteğe bağlı entegrasyonlar kullanarak tam işlevli, özelleştirilmiş bir ürün veri sayfası PDF'i oluşturur. Bu süreç, çok dilli uyumluluk ve görsel ekleme özelliklerini destekler.
- generateProductDatasheet

### Yardımcı Veri Dönüşüm Fonksiyonları
PDF içine entegre edilecek ikili verileri (örneğin ürün görselleri) doküman yapısına uygun formata dönüştürerek, ana üretim sürecinin ihtiyaç duyduğu veri hazırlığı işlemlerini yerine getirir.
- arrayBufferToBase64

---

## AXIOMS – Mimari Varsayımlar
Bu modül, PDF üretimi için girdi verilerinin ve bağımlılıkların belirli koşullar altında var olmasını gerektirir.

[Aksiyom 1]: Eğer `product` parametresi (`Product` tipinde) `null` veya `undefined` olarak geçilirse, `generateProductDatasheet` fonksiyonu PDF oluşturamaz.
[Aksiyom 2]: Eğer `translateKey` parametresi `undefined` olarak geçilir ve PDF içinde yerel metin alanları mevcutsa, bu alanlar boş veya hatalı görüntülenebilir.
[Aksiyom 3]: Eğer `lang` parametresi desteklenmeyen bir dil kodu olarak geçilirse veya `translateKey` bu dil için çeviri sağlayamazsa, PDF içindeki metinler eksik veya tutarsız olur.
[Aksiyom 4]: Eğer `imageUrl` geçerli bir resim URL’si olarak sağlanmamışsa (örneğin `undefined` veya bozuk bir URL), PDF’de ürün görseli bölümü boş kalır veya görsel hata resmi ile değiştirilir.
[Aksiyom 5]: `arrayBufferToBase64` fonksiyonu, `buffer` parametresinin geçerli bir `ArrayBuffer` içermesini gerektirir; aksi halde Base64 dönüşümü başarısız olur veya geçersiz bir string üretir.
[Aksiyom 6]: PDF üretim süreci, fonksiyonun çağrıldığı ortamda uygun bir PDF kütüphanesinin (örneğin `jsPDF`, `pdf-lib`) veya ortamın `ArrayBuffer` ve Base64 dönüşüm desteklerinin mevcut olmasını gerektirir.
[Aksiyom 7]: Fonksiyonun dışarıya aktardığı `generateProductDatasheet` fonksiyonu, içeriği olan bir `PDFDocument` nesnesi veya ArrayBuffer döndürür; eğer iç PDF kütüphanesi kullanılamıyorsa fonksiyon başarısızlık ile sonuçlanabilir.

---

## FONKSİYON DETAYLARI

### generateProductDatasheet
**Ne yapar**: Premium tasarım standartlarında ve Türkçe karakter desteğiyle HVAC ürünü için özel ürün veri sayfası (datasheet) PDF'i üreten ana PDF üretim servisidir. İstenen dil ve özelleştirmelere uygun olarak son kullanıcıya yönelik profesyonel ürün dokümanı oluşturur.
**Nasıl yapar**: Asenkron iş akışıyla çalışarak sağlanan tüm parametreleri PDF şablonuna entegre eder, Türkçe karakterlerin sorunsuz görüntülenmesi için gerekli font yapılandırmasını devreye alır. Opsiyonel olarak sunulan çeviri fonksiyonu ve dil kodu ile dokümanı yerelleştirir, ürün görselini de şablona ekleyerek tamamlanmış PDF'i üretir.
**Parametreler**:
- product: Product — PDF dokümanına dönüştürülecek HVAC ürününün tüm metinsel ve teknik verilerini barındıran Product tipinde nesne, ürünün adı, markası, teknik özellikleri gibi tüm temel bilgileri içerir
- imageUrl?: string — Ürün veri sayfasında kullanılacak ürün görselinin erişim adresini tutan opsiyonel string değeri, belirtilmediği durumda şablonda tanımlı varsayılan görsel kullanılır
- translateKey?: (key: string) => string — Metin anahtarlarını istenen dile çevirmek için kullanılan, opsiyonel olarak sunulan çeviri fonksiyonu, tüm sabit metinlerin yerelleştirilmesini sağlar
- lang: string — Ürün veri sayfasının üretileceği dilin ISO kodunu belirten zorunlu string değeri, dokümanın hangi dilde oluşturulacağını tanımlar
**Dönüş**: Promise<void> — PDF üretim sürecinin asenkron olarak yönetildiğini gösteren boş döndüren bir vaat, yalnızca işlemin başarıyla tamamlandığını veya hatalı durumda hatayı fırlatarak süreci sonlandırır, herhangi bir ek değer döndürmez

### arrayBufferToBase64
**Ne yapar**: Ham binary ArrayBuffer verisini Base64 metin formatına dönüştüren yardımcı utility fonksiyonudur. PDF üretim sürecinde görseller gibi binary dosya verilerinin PDF şablonuna sorunsuz bir şekilde gömülmesini sağlar.
**Nasıl yapar**: Gelen ArrayBuffer verisini önce Uint8Array tipine dönüştürerek tüm baytları tek bir stringde birleştirir, ardından tarayıcının yerleşik btoa fonksiyonunu kullanarak bu stringi Base64 kodlu formatına çevirir.
**Parametreler**:
- buffer: ArrayBuffer — Base64 formatına dönüştürülecek olan ham binary veriyi içeren ArrayBuffer nesnesi, genellikle ürün görseli gibi PDF'e gömülecek dosya içeriklerini barındırır
**Dönüş**: string — Dönüştürülen Base64 kodlu metin değeri, bu değer doğrudan veri URI'si olarak veya PDF içerisine gömülmek üzere kullanılabilir

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/pdfGenerator.ts::generateProductDatasheet
- **params**: `(product: Product, imageUrl?: string, translateKey?: (key: string) => string, lang: string = 'tr')`
- **ic_degiskenler**:
  - `doc` — jsPDF instance; A4 boyutunda portrait orientasyonlu PDF belge nesnesi
  - `fontResponse` — fetch ile Regular Roboto fontunun CDN yanıt nesnesi
  - `fontBuffer` — Regular fontun ArrayBuffer verisi
  - `fontBase64` — Regular fontun Base64 string karşılığı (VFS'e eklenecek)
  - `fontBoldResponse` — fetch ile Bold Roboto fontunun CDN yanıt nesnesi
  - `fontBoldBuffer` — Bold fontun ArrayBuffer verisi
  - `fontBoldBase64` — Bold fontun Base64 string karşılığı (VFS'e eklenecek)
  - `pageWidth` — `doc.internal.pageSize.getWidth()` ile elde edilen sayfa genişliği (mm)
  - `pageHeight` — `doc.internal.pageSize.getHeight()` ile elde edilen sayfa yüksekliği (mm)
  - `margin` — sayfa kenar boşluğu sabit değeri (15mm)
  - `drawHeader` — closure; her sayfanın üst bölümüne turuncu şerit, lacivert arka plan, logo, marka adı ve başlık çizen fonksiyon
  - `title` — `lang` değerine göre `'TEKNİK ÜRÜN FÖYÜ'` veya `'TECHNICAL DATASHEET'` başlık metni
  - `drawFooter` — closure; `(pageNum: number, totalPages: number)` alır, sayfa alt bilgisine çizgi, slogan, SITE_URL ve sayfa numarası yazar
  - `footerText` — `lang` değerine göre alt bilgi sloganı
  - `pageText` — `lang` değerine göre sayfa numarası gösterim metni (`Sayfa X / Y` veya `Page X / Y`)
  - `currentY` — sayfa üzerinde dikey yazma imlecinin mevcut Y koordinatı; içeriğin alta doğru akmasını sağlar
  - `splitTitle` — `product.name`'in sayfa genişliğine sığacak şekilde bölünmüş satır dizisi
  - `brandModelText` — marka ve model kodu birleşik gösterim metni
  - `contentWidth` — sayfa genişliğinden kenar boşluklarının çıkarılmış hali
  - `imageSize` — ürün görselinin genişlik ve yüksekliği (70mm kare)
  - `renderDescriptionFallback` — closure; görsel yoksa veya yüklenemezse ürün açıklamasını tam genişlikte metin olarak çizer
  - `base64Img` — `getBase64ImageFromUrl` ile elde edilen görselin Base64 karşılığı
  - `descText` — `product.description`'den satır sonu karakterlerinin temizlenmiş hali
  - `splitDesc` (görsel yanında) — açıklamanın görselin yanına sığacak genişlikte bölünmüş satır dizisi
  - `tableData` — teknik özellikler tablosunun `[label, value]` çiftlerinden oluşan 2D dizisi
  - `label` — `translateKey` varsa çevrilmiş, yoksa orijinal teknik özellik anahtarı
  - `valText` — teknik özellik değerinin string karşılığı (`null`/`undefined` ise `'-'`)
  - `getPagesFn` — `Reflect.get(doc.internal, 'getNumberOfPages')` ile elde edilen toplam sayfa sayısını döndüren fonksiyon referansı
  - `totalPages` — PDF belgesinin toplam sayfa sayısı
  - `cleanName` — `product.name`'den özel karakterlerin temizlenmiş ve 30 karakterle sınırlandırılmış dosya adı parçası
- **Dönüş**: `Promise<void>` — PDF dosyası `doc.save()` ile indirilir; dönüş değeri yoktur, yan etki olarak dosya kaydeder

---

### [N2_NASIL] AST Pointer: src/lib/pdfGenerator.ts::arrayBufferToBase64
- **params**: `(buffer: ArrayBuffer)`
- **ic_degiskenler**:
  - `binary` — byte'ların char code karşılıklarının birleştirildiği accumulator string
  - `bytes` — `buffer`'ın `Uint8Array` görünümü; byte'lara indeks erişimi sağlar
  - `len` — `bytes.byteLength`; döngüdeki toplam byte sayısı
- **Dönüş**: `string` — Base64 formatında encode edilmiş string; tarayıcı ortamında `window.btoa`, Node ortamında `globalThis.btoa` kullanılır

---

## NODE ID STANDARD

  file: src\lib\pdfGenerator.ts
  function: src\lib\pdfGenerator.ts::generateProductDatasheet
  function: src\lib\pdfGenerator.ts::arrayBufferToBase64

---

## DISA AKTARILANLAR (EXPORTS)
  export: arrayBufferToBase64
  export: generateProductDatasheet