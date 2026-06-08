---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\pdfGenerator.ts
skeleton_hash: d6cf907668b941a8
entity_hashes:
  func:arrayBufferToBase64: ac0cb07b30bf5c01
  func:generateProductDatasheet: eac5e07d950d7a2e
  overview: 8f2e14b413976ba5
generated_at: 2026-06-08T10:09:33Z
---

## Genel Bakış
Bu modül, VentHub HVAC sistemi için ürün teknik spesifikasyonlarını ve bilgilerini içeren profesyonel PDF belgeleri oluşturmakla sorumludur. Modül, ürün verilerini, çok dilli metin çevirilerini ve opsiyonel görselleri bir araya getirerek dinamik ve kullanıma hazır dokümanlar üretir.

## Fonksiyon Grupları
### Ana PDF Üretim Süreci
Bu grup, bir ürünün tüm bilgilerini ve ilişkili parametreleri alarak son kullanıcıya sunulacak tek sayfalık (veya çok sayfalık) bir PDF dokümanını oluşturma işlemini yönetir.
- generateProductDatasheet

### Yardımcı Veri Dönüşüm Fonksiyonları
Bu grup, PDF içeriğine yerleştirilecek olan ikili (binary) formatındaki verileri (örneğin, görseller) Base64 kodlamasına dönüştürerek ana sürecin kullanabileceği hale getiren yardımcı araçları içerir.
- arrayBufferToBase64

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ürün veri sayfası PDF'i oluşturma ve ArrayBuffer'ı Base64'e dönüştürme amacıyla tasarlanmıştır. Aşağıdaki mimari varsayımlar fonksiyon imzalarından türetilmiştir.

**[Aksiyom 1 - Zorunlu Dil Belirteci]:**
Eğer `lang` parametresi `generateProductDatasheet` çağrısında sağlanmazsa, PDF oluşturma süreci başarısız olur. `lang` parametresi default değere sahip değildir ve zorunludur.

**[Aksiyom 2 - Ürün Verisi Zorunluluğu]:**
Eğer `product` parametresi `generateProductDatasheet` çağrısında geçilmezse veya geçersiz bir `Product` nesnesi ise, PDF oluşturma başarısız olur.

**[Aksiyom 3 - Çeviri Fonksiyonunun Opsiyonelliği]:**
Eğer `translateKey` parametresi sağlanmazsa, modül çok dilli çeviri desteği olmadan çalışır; PDF içeriği varsayılan/çevrilmemiş metinlerle oluşturulur.

**[Aksiyom 4 - Görsel URL'sinin Opsiyonelliği]:**
Eğer `imageUrl` parametresi sağlanmazsa, PDF ürün görseli içermeyen bir formatta üretilir; görsel bölümü atlanır.

**[Aksiyom 5 - ArrayBuffer Geçerliliği]:**
Eğer `arrayBufferToBase64` fonksiyonuna geçilen `buffer` parametresi geçerli bir `ArrayBuffer` instance'ı değilse, Base64 dönüşümü başarısız olur veya tanımsız sonuç üretir.

**[Aksiyom 6 - Ürün Tipi Bağımlılığı]:**
Eğer `Product` tipi modülün çalıştığı bağlamda tanımlı değilse veya beklenen alanları içermiyorsa, `generateProductDatasheet` fonksiyonu beklenmeyen hata ile karşılaşır. `Product` yapısının minimum gerekli alanları bilinmiyor (fonksiyon gövdesinden çıkarılamaz).

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
- **params**: (product: Product, imageUrl?: string, translateKey?: (key: string) => string, lang: string)
- **ic_degiskenler**:
  - `doc` — jsPDF instance, PDF belgesi oluşturmak ve düzenlemek için kullanılır
  - `fontName` — Yüklenecek fontun adı, varsayılan olarak 'helvetica', başarırsa 'Roboto' olur
  - `pageWidth` — Sayfa genişliği (mm cinsinden)
  - `pageHeight` — Sayfa yüksekliği (mm cinsinden)
  - `margin` — Sayfa kenar boşluğu (mm cinsinden)
  - `drawHeader` — Header çizimini yapan iç içe fonksiyon
  - `drawFooter` — Footer çizimini yapan iç içe fonksiyon
  - `currentY` — Mevcut dikey konum (sayfa içindeki Y ekseni)
  - `splitTitle` — Ürün adının satırlara bölünmüş hali
  - `brandModelText` — Marka ve model kodu metni
  - `contentWidth` — İçerik genişliği (sayfa genişliği eksi kenar boşlukları)
  - `imageSize` — Ürün görselinin boyutu (mm)
  - `renderDescriptionFallback` — Görsel yoksa açıklamayı çizmek için iç içe fonksiyon
  - `tableData` — Teknik özellikler tablosu verisi (string[][] dizisi)
  - `getPagesFn` — Toplam sayfa sayısını almak için fonksiyon
  - `totalPages` — Toplam sayfa sayısı
  - `cleanName` — Ürün adının temizlenmiş hali (dosya adı için)
- **Dönüş**: Promise<void> (PDF dosyasını indirir, dönüş değeri yok)

### [N2_NASIL] AST Pointer: src/lib/pdfGenerator.ts::generateProductDatasheet::drawHeader
- **params**: (yok)
- **ic_degiskenler**:
  - `title` — Sayfa başlığı, dile göre 'TEKNİK ÜRÜN FÖYÜ' veya 'TECHNICAL DATASHEET'
- **Dönüş**: void (yan etki: doc üzerine header çizer)

### [N3_NASIL] AST Pointer: src/lib/pdfGenerator.ts::generateProductDatasheet::drawFooter
- **params**: (pageNum: number, totalPages: number)
- **ic_degiskenler**:
  - `footerText` — Footer metni, dile göre oluşturulur
  - `pageText` — Sayfa numarası metni, dile göre oluşturulur
- **Dönüş**: void (yan etki: doc üzerine footer çizer)

### [N4_NASIL] AST Pointer: src/lib/pdfGenerator.ts::generateProductDatasheet::renderDescriptionFallback
- **params**: (yok)
- **ic_degiskenler**:
  - `splitDesc` — Ürün açıklamasının satırlara bölünmüş hali
- **Dönüş**: void (yan etki: doc üzerine açıklama metni çizer)

### [N5_NASIL] AST Pointer: src/lib/pdfGenerator.ts::generateProductDatasheet::tableData.forEach callback
- **params**: ([key, value])
- **ic_degiskenler**:
  - `label` — Özelliğin etiketi, translateKey fonksiyonu varsa çevrilir
  - `valText` — Özelliğin değeri, string'e dönüştürülmüş hali
- **Dönüş**: void (yan etki: tableData dizisine satır ekler)

### [N6_NASIL] AST Pointer: src/lib/pdfGenerator.ts::arrayBufferToBase64
- **params**: (buffer: ArrayBuffer)
- **ic_degiskenler**:
  - `binary` — ArrayBuffer'ın binary string karşılığı
  - `bytes` — ArrayBuffer'ın Uint8Array görünümü
  - `len` — Byte dizisinin uzunluğu
  - `i` — Döngü sayacı
- **Dönüş**: string (Base64 encoded string)

---

## NODE ID STANDARD

  file: src\lib\pdfGenerator.ts
  function: src\lib\pdfGenerator.ts::generateProductDatasheet
  function: src\lib\pdfGenerator.ts::arrayBufferToBase64

---

## DISA AKTARILANLAR (EXPORTS)
  export: arrayBufferToBase64
  export: generateProductDatasheet