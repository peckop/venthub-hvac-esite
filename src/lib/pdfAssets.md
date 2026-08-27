---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\ops-t165\src\lib\pdfAssets.ts
skeleton_hash: 9d97eb931a529aaf
entity_hashes:
  func:getAbsoluteAssetUrl: 96c03e7f744b3527
  func:getBase64ImageFromUrl: ca8a45fdefa4e7ed
  overview: 4faa1d63c142f598
generated_at: 2026-08-27T06:57:41Z
---

## Genel Bakış
Bu modül, PDF oluşturma sürecinde kullanılan görsel varlıkların (asset) yönetimiyle ilgilenir. Görsel yollarını mutlak URL'lere dönüştürme ve görselleri base64 formatına çevirme gibi temel yardımcı işlemleri sağlar.

## Fonksiyon Grupları

### URL Dönüştürme
Verilen bir görsel yolunu mutlak (absolute) bir URL'ye dönüştürerek, görselin doğru kaynaktan erişilebilir olmasını sağlar.
- getAbsoluteAssetUrl

### Görsel Base64 Dönüştürme
Bir görsel URL'sini asenkron olarak alıp, görselin base64 kodlanmış halini döndürür. Bu sayede görsel verisi doğrudan PDF içeriğine gömülebilir.
- getBase64ImageFromUrl

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### getAbsoluteAssetUrl
**Ne yapar**: Verilen bir yol (path) parametresini mutlak (absolute) bir URL'ye dönüştürür. PDF oluşturma işlemleri için kullanılan varlıkların ve sabitlerin doğru adreslerle erişilmesini sağlar.

**Nasıl yapar**: Öncelikle tarayıcı ortamında olup olmadığını kontrol eder. Eğer `window` nesnesi tanımlıysa ve `window.location` mevcutsa, temel URL olarak `window.location.origin` değerini kullanır. Aksi takdirde, sunucu tarafı ortamlarında kullanılmak üzere tanımlı olan `SITE_URL` sabitini temel olarak alır. Ardından JavaScript'in yerleşik `URL` sınıfının yapıcı metodunu kullanarak verilen `path` parametresini bu temel URL ile birleştirip tam bir URL oluşturur ve `toString()` metoduyla string olarak döndürür.

**Parametreler**:
- path: string — Mutlak URL'ye dönüştürülecek göreli yol (relative path) değeri.

**Dönüş**: string — Oluşturulan mutlak URL'nin string temsili.

### getBase64ImageFromUrl
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

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
- **params**: `path` (string) — mutlak URL'e dönüştürülecek göreli yol
- **ic_degiskenler**:
  - `base` — tarayıcı ortamında `window.location.origin` değeri; tarayıcı dışında `SITE_URL` sabiti kullanılır. URL çözümlemesinde temel adres olarak görev yapar.
- **Dönüş**: `string` — `new URL(path, base).toString()` ile üretilen mutlak URL

### [N2_NASIL] AST Pointer: src/lib/pdfAssets.ts::getBase64ImageFromUrl
- **params**: `imageUrl` (string) — base64'e dönüştürülecek görselin URL'i
- **ic_degiskenler**:
  - `response` — `fetch(imageUrl)` çağrısından dönen Response nesnesi
  - `blob` — `response.blob()` ile elde edilen ikili görsel verisi
  - `objectUrl` — `URL.createObjectURL(blob)` ile oluşturulan geçici blob URL'i; Image nesnesine atama yapılır, işlem bitince `URL.revokeObjectURL` ile iptal edilir
  - `img` — `new Image()` ile oluşturulan HTMLImageElement; `objectUrl` kaynağı atanır, yükleme tamamlanınca canvas'a çizim yapılır
  - `canvas` — `document.createElement('canvas')` ile oluşturulan HTMLCanvasElement; genişliği `img.width`, yüksekliği `img.height` olarak ayarlanır
  - `ctx` — `canvas.getContext('2d')` ile elde edilen CanvasRenderingContext2D; null ise hata fırlatılır
  - `dataURL` — `canvas.toDataURL('image/jpeg', 0.95)` ile üretilen JPEG formatında base64 data URL; kalite parametresi 0.95
  - `error` — `catch` bloğunda yakalanan hata nesnesi; `console.error` ile konsola yazdırılır
- **Dönüş**: `Promise<string>` — başarılı durumda JPEG base64 data URL (`dataURL`); `imageUrl` boşsa veya hata oluşursa boş string (`''`)

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