---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\lib\pdfAssets.ts
skeleton_hash: 0e67e10ed979d169
entity_hashes:
  func:getBase64ImageFromUrl: ca8a45fdefa4e7ed
  overview: a2c0eb56c4ef334b
generated_at: 2026-05-28T22:38:13Z
---

## Genel Bakış
VentHub HVAC projesinin src/lib dizininde yer alan pdfAssets.ts modülü, PDF belgeleri oluşturulurken ihtiyaç duyulan görsel ve medya asset'lerini yönetmek için geliştirilmiştir. Modül mevcutta harici kaynaklardaki görselleri PDF içeriklerinde kullanılabilecek standart formata dönüştürme işlevini yerine getirir.

## Fonksiyon Grupları
### Görsel Getirme ve Dönüştürme İşlevleri
Bu grup, harici URL'lerde barındırılan görsellere erişip, PDF belgelerine doğrudan gömülmeye uygun base64 kodlu formatına dönüştürme sorumluluğunu taşır.
- getBase64ImageFromUrl

---



---

## FONKSİYON DETAYLARI

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

## NODE ID STANDARD

  file: src\lib\pdfAssets.ts
  function: src\lib\pdfAssets.ts::getBase64ImageFromUrl

---

## DISA AKTARILANLAR (EXPORTS)
  export: PDF_COLORS
  export: PDF_FONTS
  export: getBase64ImageFromUrl