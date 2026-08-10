---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\pdfAssets.ts
skeleton_hash: 36cb34f8803d1e9d
entity_hashes:
  func:getAbsoluteAssetUrl: 96c03e7f744b3527
  func:getBase64ImageFromUrl: ca8a45fdefa4e7ed
  overview: 4faa1d63c142f598
generated_at: 2026-06-19T20:48:09Z
---

## Genel Bakış
VentHub HVAC projesinde PDF belgeleri oluşturulurken ihtiyaç duyulan görsel ve medya asset'lerinin yönetilmesinden sorumludur. Modül, göreli yolları mutlak URL'lere çevirerek ve görselleri PDF uyumlu base64 formatına dönüştürerek içerik hazırlama sürecini kolaylaştırır.

## Fonksiyon Grupları
### URL ve Asset Normalizasyonu
Belirtilen göreli veya kısmi yolları, PDF belgelerinin doğru kaynaklara erişebilmesi için tam ve mutlak URL formatına dönüştürür.
- getAbsoluteAssetUrl

### Görsel Dönüştürme
Harici URL adreslerindeki görselleri PDF içeriklerine doğrudan gömülebilecek base64 kodlu formatına dönüştürerek format uyumsuzluklarını engeller.
- getBase64ImageFromUrl

---

## AXIOMS – Mimari Varsayımlar
Bu modül, PDF belgeleri için medya varlıklarını getirip dönüştürürken temel girdilerin varlığına ve internet erişimine bağımlıdır.

[Aksiyom 1]: Eğer `getAbsoluteAssetUrl` fonksiyonuna geçilen `path` parametresi geçerli bir dosya yolu veya URL parçası değilse, fonksiyon geçerli bir mutlak URL döndüremez.
[Aksiyom 2]: Eğer `getBase64ImageFromUrl` fonksiyonuna geçilen `imageUrl` parametresi geçerli bir URL değilse veya o URL'deki görsel sunucu tarafından erişilemez durumdaysa (404, 5xx hatası, timeout), fonksiyon hata fırlatır veya geçerli bir Base64 dizesi döndüremez.
[Aksiyom 3]: Eğer `getBase64ImageFromUrl` fonksiyonu başarıyla çalışırsa, döndürülen Base64 dizesi bir PDF sayfasına doğrudan gömülmeye uygun format (ör. data URI scheme) içermelidir; aksi takdirde PDF oluşturulan dosya bozulur.
[Aksiyom 4]: Eğer `PDF_FONTS` veya `PDF_COLORS` sabitleri modül tarafından kullanılıyorsa (ör. fonksiyon gövdesinde referans veriliyorsa), bu nesnelerin gerekli yapıda ve erişilebilir olması gerekir;否则, fonksiyonlar beklenen işlevselliği gösteremez.

---

## FONKSİYON DETAYLARI

### getAbsoluteAssetUrl
**Ne yapar**: Bu fonksiyon, verilen göreceli bir dosya yolunu, uygulamanın çalıştığı taraftan (tarayıcı veya sunucu) bağımsız olarak, geçerli bir mutlak URL dizesine dönüştürür. Temel amacını, PDF oluşturma süreçlerinde veya varlık referanslarında dinamik ve kesin URL'ler üretmek olarak tanımlayabiliriz.

**Nasıl yapar**: Fonksiyon首先, tarayıcı ortamında (client-side) çalışıp çalışmadığını kontrol eder. Eğer pencere nesnesi ve konum özelliği mevcutsa, tarayıcının mevcut kök URL'sini (`window.location.origin`) temel olarak kullanır. Aksi takdirde, derleme zamanında tanımlı statik bir `SITE_URL` sabitini temel olarak alır. Ardından, verilen göreceli `path` parametresini bu temel URL ile birleştirerek, standart bir URL nesnesi oluşturur ve bunu bir dizeye dönüştürerek geri döner.

**Parametreler**:
- `path`: string — Mutlak URL'ye dönüştürülecek olan göreceli dosya yolu veya kaynak belirteci (örn: `"/assets/logo.png"` veya `"images/chart.pdf"`).

**Dönüş**: string — Verilen yolun, belirli bir kök URL ile birleştirilmesiyle elde edilen tam ve geçerli mutlak URL dizesi.

### getBase64ImageFromUrl
**Ne yapar**: Bir görsel URL'sini PDF içerisine gömülmek üzere Base64 formatlı stringe dönüştürür. Kaynak görsel WEBP, PNG gibi herhangi bir raster formatta olsa bile çıktıyı %100 PDF ile uyumlu JPEG formatında sunar. Tüm kaynak formatları tek bir standarta getirerek PDF oluşturma sürecinde oluşabilecek uyumsuzlukların önüne geçer.
**Nasıl yapar**: Canvas API kullanarak kaynak URL'den alınan görseli bir canvas elementine yükler, ardından canvas üzerinden standart JPEG formatında dışa aktarım gerçekleştirir. Bu yöntemle kaynak görselin orijinal formatından bağımsız olarak her zaman PDF ile sorunsuz çalışan bir JPEG çıktısı elde edilir.
**Parametreler**:
- name: imageUrl, type: string — Base64 kodlu stringe dönüştürülecek hedef görselin tam, erişilebilir URL adresi. Görselin yüklenmesi ve işlenmesi bu adres üzerinden gerçekleştirilir.
**Dönüş**: Promise<string> — İşlem başarılı şekilde tamamlandığında PDF uyumlu JPEG formatındaki Base64 kodlu stringini çözümleyen, işlem sırasında oluşan herhangi bir hatada reddeden bir asenkron promise nesnesi döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../config/siteUrl::SITE_URL

---

## SABİTLER
- **PDF_FONTS** (object) — `{
    Roboto: {
        regular: '/fonts/Roboto-Regular.ttf',
        bold...`
- **PDF_COLORS** (object) — `{
    primary: [27, 43, 75],     // Navy #1B2B4B
    secondary: [59, 130, 2...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/pdfAssets.ts::getAbsoluteAssetUrl
- **params**: `path: string` — URL yolunu temsil eder
- **ic_degiskenler**:
  - `base` — Tarayıcı ortamındaysa `window.location.origin`, değilse `SITE_URL` kullanılarak hesaplanan temel URL
- **Dönüş**: `string` — path ve base birleştirilerek oluşturulmuş tam URL

---

## NODE ID STANDARD

  file: src\lib\pdfAssets.ts
  function: src\lib\pdfAssets.ts::getAbsoluteAssetUrl
  function: src\lib\pdfAssets.ts::getBase64ImageFromUrl

---

## DISA AKTARILANLAR (EXPORTS)
  export: PDF_COLORS
  export: PDF_FONTS
  export: getAbsoluteAssetUrl
  export: getBase64ImageFromUrl