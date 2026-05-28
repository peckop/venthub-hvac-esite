---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\pdfGenerator.ts
skeleton_hash: f96114bf98ce13c8
entity_hashes:
  func:arrayBufferToBase64: ac0cb07b30bf5c01
  func:generateProductDatasheet: ad0f52b2a314b0b1
  overview: 21e435fcd4d46430
generated_at: 2026-05-28T22:37:58Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformu için profesyonel ürün veri sayfası (datasheet) PDF'leri üretmek üzere tasarlanmıştır. Ürün detayları, çok dilli çeviri desteği ve isteğe bağlı ürün görselleriyle özelleştirilmiş kullanıma hazır dokümanlar oluşturur, PDF oluşturma sürecinde ihtiyaç duyulan tüm yardımcı veri dönüşüm işlemlerini de bünyesinde barındırır.

## Fonksiyon Grupları
### Ana PDF Üretim Süreci
Gelen ürün verileri, destekleyici parametreler ve isteğe bağlı entegrasyonlar kullanarak tam işlevli özelleştirilmiş ürün veri sayfası PDF'i oluşturur, çok dilli uyumluluk ve görsel ekleme özelliklerini destekler.
- generateProductDatasheet

### Yardımcı Veri Dönüşüm Fonksiyonları
PDF içine entegre edilecek ikili verileri (örneğin ürün görselleri) doküman yapısına uygun formata dönüştürerek ana üretim sürecinin ihtiyaç duyduğu veri hazırlığı işlemlerini yerine getirir.
- arrayBufferToBase64

---

## AXIOMS – Mimari Varsayımlar
Bu PDF üretim modülü, ürün veri sayfası oluşturulması ve ham binary verinin Base64 formatına dönüştürülmesi işlevlerini yerine getirir, tüm fonksiyonlarının doğru çalışması için girdi tiplerinin tanımlı olması ve çalışma ortamının gerekli bağımlılıkları desteklemesi zorunludur.

[Aksiyom 1]: Eğer generateProductDatasheet fonksiyonuna zorunlu parametre olarak geçirilen `product` nesnesinin Product tipi ile uyumlu, tüm gerekli alanlara sahip bir nesne olarak sağlanması yoksa, eksik veya hatalı ürün bilgileriyle PDF üretilir ya da fonksiyon çalışmadan hata verir.
[Aksiyom 2]: Eğer generateProductDatasheet fonksiyonunun zorunlu `lang` parametresinin geçerli bir string dil kodu olarak sağlanması yoksa, aktifse çeviri mekanizması çalışmaz, PDF içindeki metinler istenen dilde görüntülenemez.
[Aksiyom 3]: Eğer opsiyonel olarak sağlanan `translateKey` çeviri fonksiyonunun, girdi olarak aldığı string anahtarını hedef dile çeviren işlevsel bir fonksiyon olmaması yoksa, PDF içindeki tüm metinler çevrilmeden ham anahtar değerleri olarak görünür.
[Aksiyom 4]: Eğer opsiyonel olarak sağlanan `imageUrl` adresinden erişilebilir bir görsel dosyasının varlığı yoksa, PDF veri sayfasına ürün görseli eklenemez, görsel için ayrılan alan boş kalır.
[Aksiyom 5]: Eğer arrayBufferToBase64 fonksiyonuna geçirilen `buffer` parametresinin geçerli bir ArrayBuffer nesnesi olarak sağlanması yoksa, Base64 dönüşümü başarısız olur, hata fırlatılır veya geçersiz bir Base64 stringi üretilir.
[Aksiyom 6]: Eğer çalışma zamanı ortamının modülün PDF üretimi ve binary dönüşüm işlemleri için gereken tüm harici bağımlılıkları ve yerel API'leri desteklemesi yoksa, modülün hiçbir fonksiyonu beklenen çıktıyı üretemez, tüm süreçler başarısız olur.

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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\pdfGenerator.ts::generateProductDatasheet
- **params**: product: Product, imageUrl?: string, translateKey?: (key: string) => string, lang: string
- **ic_degiskenler**:
  - `doc` — jsPDF kütüphanesinden oluşturulan A4 portre formatlı PDF belgesi nesnesi
  - `fontResponse` — Roboto normal font dosyasını çekmek için yapılan fetch isteğinin cevabı
  - `fontBuffer` — normal font dosyasının ArrayBuffer formatındaki ham verisi
  - `fontBase64` — normal font dosyasının base64 kodlanmış string hali
  - `fontBoldResponse` — Roboto bold font dosyasını çekmek için yapılan fetch isteğinin cevabı
  - `fontBoldBuffer` — bold font dosyasının ArrayBuffer formatındaki ham verisi
  - `fontBoldBase64` — bold font dosyasının base64 kodlanmış string hali
  - `error` — font yükleme işlemi sırasında yakalanan hata nesnesi
  - `pageWidth` — PDF sayfasının mm cinsinden toplam genişliği
  - `pageHeight` — PDF sayfasının mm cinsinden toplam yüksekliği
  - `margin` — PDF içeriği için tanımlanan kenar boşluğu değeri (mm)
  - `drawHeader` — her PDF sayfasının üst bilgisini (logo, başlık, referans kodu) çizen iç fonksiyon
  - `drawFooter` — her PDF sayfasının alt bilgisini (site URL'si, sayfa numarası) çizen iç fonksiyon
  - `currentY` — PDF üzerinde içeriğin çizileceği mevcut dikey konumu takip eden değişken
  - `splitTitle` — ürün isminin sayfa genişliğine sığması için satırlara bölünmüş metin dizisi
  - `brandModelText` — ürün marka ve model kodunu içeren, dile göre uyarlanmış metin
  - `contentWidth` — kenar boşlukları çıkarıldıktan sonra kalan içerik alanı genişliği
  - `imageSize` — PDF'e eklenecek ürün görselinin kare boyutu (mm)
  - `renderDescriptionFallback` — ürün görseli yüklenemediğinde açıklamayı tam genişlikte çizen iç fonksiyon
  - `base64Img` — ürün görselinin base64 kodlanmış string hali
  - `e` — görseli PDF'e eklerken yakalanan hata nesnesi
  - `tableData` — teknik özellikler tablosunun gövdesini oluşturan 2 boyutlu string dizisi
  - `key` — teknik özellikler nesnesinin döngüde işlenen anahtarı
  - `value` — teknik özellikler nesnesinin döngüde işlenen değer alanı
  - `label` - translateKey fonksiyonu ile dile göre çevrilmiş teknik özellik etiketi
  - `valText` — teknik özellik değerinin string formatına dönüştürülmüş, boş durumda '-' olarak ayarlanmış hali
  - `getPagesFn` — jsPDF belgesinin iç nesnesinden alınan toplam sayfa sayısını döndüren fonksiyon
  - `totalPages` — PDF belgesinin toplam sayfa sayısı
  - `i` — tüm sayfalar üzerinde döngü kuran sayaç değişkeni
  - `cleanName` — PDF dosya adı için özel karakterlerden arındırılmış, kısaltılmış ürün ismi
- **Dönüş**: Promise<void> (işlem sonunda PDF dosyasını kaydeder, asenkron olarak void döndürür)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\lib\pdfGenerator.ts::arrayBufferToBase64
- **params**: buffer: ArrayBuffer
- **ic_degiskenler**:
  - `binary` — ArrayBuffer'dan okunan byte verilerini string olarak biriktiren değişken
  - `bytes` — Giriş ArrayBuffer'ından oluşturulan Uint8Array tipinde byte dizisi
  - `len` — byte dizisinin toplam uzunluğu
  - `i` — byte dizisi üzerinde döngü kuran sayaç değişkeni
- **Dönüş**: string (giriş ArrayBuffer'ının base64 kodlanmış string halini döndürür)

---

## NODE ID STANDARD

  file: src\lib\pdfGenerator.ts
  function: src\lib\pdfGenerator.ts::generateProductDatasheet
  function: src\lib\pdfGenerator.ts::arrayBufferToBase64

---

## DISA AKTARILANLAR (EXPORTS)
  export: arrayBufferToBase64
  export: generateProductDatasheet