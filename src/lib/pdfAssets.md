---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\pdfAssets.ts
skeleton_hash: 0e67e10ed979d169
generated_at: 2026-05-23T22:31:23Z
---

## Genel Bakış
VentHub HVAC projesinin src/lib dizininde yer alan pdfAssets.ts modülü, PDF belgeleri oluşturulurken ihtiyaç duyulan görsel ve medya asset'lerini yönetmek için geliştirilmiştir. Modül mevcutta harici kaynaklardaki görselleri PDF içeriklerinde kullanılabilecek standart formata dönüştürme işlevini yerine getirir.

## Fonksiyon Grupları
### Görsel Getirme ve Dönüştürme İşlevleri
Bu grup, harici URL'lerde barındırılan görsellere erişip, PDF belgelerine doğrudan gömülmeye uygun base64 kodlu formatına dönüştürme sorumluluğunu taşır.
- getBase64ImageFromUrl

---

## AXIOMS – Mimari Varsayımlar
Bu modül, PDF üretim süreçleri için gerekli font ve renk varlıklarını saklamak, harici URL'lerden alınan görüntüleri PDF'e gömülmek üzere base64 formatına dönüştürmek üzere tasarlanmıştır; doğru çalışması için aşağıdaki koşulların varlığı zorunludur.

[Aksiyom 1]: Eğer modül sabiti olarak tanımlanan PDF_FONTS nesnesi geçerli, PDF işleyiciler tarafından desteklenen font tanımları içermiyorsa, PDF üretim süreçleri font yükleme hatası alır, oluşturulan PDF'ler metin içeriklerini doğru görüntüleyemez.
[Aksiyom 2]: Eğer modül sabiti olarak tanımlanan PDF_COLORS nesnesi geçerli renk kodları içermiyorsa, PDF üretim süreçleri renk atama hatası alır, oluşturulan PDF içeriklerinde renkler beklenen şekilde görünmez.
[Aksiyom 3]: Eğer getBase64ImageFromUrl fonksiyonuna iletilen imageUrl parametresi geçerli bir URL formatında değilse, fonksiyon görüntü kaynağına erişemez, base64 dönüşümü gerçekleştirilemez, ilgili görüntü PDF içine gömülemez.
[Aksiyom 4]: Eğer imageUrl ile işaretlenen görüntü kaynağına modülün çalıştığı ortamdan erişim sağlanamıyorsa (ağ hatası, kaynak kaldırılması vb.), görüntü base64 formatına dönüştürülemez, PDF içine eklenemez.
[Aksiyom 5]: Eğer imageUrl ile işaretlenen kaynak PDF tarafından desteklenmeyen bir görüntü formatında ise, görüntü başarılı bir şekilde base64'e dönüştürülse bile PDF içinde kırık/boş bir öğe olarak görüntülenir.
[Aksiyom 6]: Eğer görüntü kaynağı, modülün çalıştığı ortamdan gelen kaynak taleplerine izin vermiyorsa (CORS politikası, erişim yetkileri vb.), getBase64ImageFromUrl fonksiyonu görüntüyü çekemez, dönüşüm işlemi başarısız olur.

---

## FONKSIYON DETAYLARI

### getBase64ImageFromUrl
**Ne yapar**: Bir görsel URL'sini PDF içerisine gömülmek üzere Base64 formatlı stringe dönüştürür. Kaynak görsel WEBP, PNG gibi herhangi bir raster formatta olsa bile çıktıyı %100 PDF ile uyumlu JPEG formatında sunar. Tüm kaynak formatları tek bir standarta getirerek PDF oluşturma sürecinde oluşabilecek uyumsuzlukların önüne geçer.
**Nasıl yapar**: Canvas API kullanarak kaynak URL'den alınan görseli bir canvas elementine yükler, ardından canvas üzerinden standart JPEG formatında dışa aktarım gerçekleştirir. Bu yöntemle kaynak görselin orijinal formatından bağımsız olarak her zaman PDF ile sorunsuz çalışan bir JPEG çıktısı elde edilir.
**Parametreler**:
- name: imageUrl, type: string — Base64 kodlu stringe dönüştürülecek hedef görselin tam, erişilebilir URL adresi. Görselin yüklenmesi ve işlenmesi bu adres üzerinden gerçekleştirilir.
**Dönüş**: Promise<string> — İşlem başarılı şekilde tamamlandığında PDF uyumlu JPEG formatındaki Base64 kodlu stringini çözümleyen, işlem sırasında oluşan herhangi bir hatada reddeden bir asenkron promise nesnesi döndürür.

---

## SABİTLER
- **PDF_FONTS** (object) — `{
    Roboto: {
        regular: 'https://cdnjs.cloudflare.com/ajax/libs/pd...`
- **PDF_COLORS** (object) — `{
    primary: [27, 43, 75],     // Navy #1B2B4B
    secondary: [59, 130, 2...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/lib/pdfAssets.ts::getBase64ImageFromUrl
- **params**: [imageUrl: string]
- **ic_degiskenler**:
  - `response` — `fetch` çağrısından dönen HTTP yanıt nesnesi, istenen resmin verisini içerir
  - `blob` — yanıttan çıkarılan binary blob nesnesi, resmin ham verisini taşır
  - `objectUrl` — blob için oluşturulan geçici bellek URL'si, resmi DOM Image nesnesine yüklemek için kullanılır
  - `error` — try bloğunda oluşan tüm hataları yakalayan hata nesnesi
- **Dönüş**: Promise<string>

### [N2_NASIL] AST Pointer: src/lib/pdfAssets.ts::anonymous Promise executor callback
- **params**: [resolve: (value: string) => void, reject: (error: Error) => void]
- **ic_degiskenler**:
  - `img` — Yeni oluşturulan DOM Image nesnesi, geçici URL'deki resmi yüklemek için kullanılır
  - `objectUrl` — üst kapsamdan gelen blob'a ait geçici URL
- **Dönüş**: yok

### [N3_NASIL] AST Pointer: src/lib/pdfAssets.ts::anonymous img.onload callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `canvas` — Oluşturulan HTML Canvas nesnesi, resim üzerine çizim ve arka plan ekleme işlemleri için kullanılır
  - `canvas.width` — Canvas genişliği, yüklenen resmin genişliğiyle eşitlenir
  - `canvas.height` — Canvas yüksekliği, yüklenen resmin yüksekliğiyle eşitlenir
  - `ctx` — Canvas'ın 2D çizim bağlamı, tüm çizim işlemlerini gerçekleştirmek için kullanılır
  - `dataURL` — Canvas'tan çıkarılan base64 kodlu JPEG verisi, son dönüş değeri olarak promise'i resolve etmek için kullanılır
  - `objectUrl` — Üst kapsamdan gelen geçici URL, işlem bittikten sonra bellek sızıntısını önlemek için serbest bırakılır
- **Dönüş**: yok

### [N4_NASIL] AST Pointer: src/lib/pdfAssets.ts::anonymous img.onerror callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `objectUrl` — Üst kapsamdan gelen geçici URL, resim yükleme hatası durumunda serbest bırakılır
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\lib\pdfAssets.ts
  function: src\lib\pdfAssets.ts::getBase64ImageFromUrl

---

## DISA AKTARILANLAR (EXPORTS)
  export: PDF_COLORS
  export: PDF_FONTS
  export: getBase64ImageFromUrl