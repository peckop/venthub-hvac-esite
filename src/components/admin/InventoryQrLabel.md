---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\InventoryQrLabel.tsx
skeleton_hash: bcf16d561ce2cb90
entity_hashes:
  func:printQrLabel: 1e2155968c16ad3a
  overview: 24734b9ad0c44486
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T08:03:46Z
---

## Genel Bakış
Bu modül, envanter kalemlerine ait QR kod etiketlerinin yazdırılmasını sağlayan tek bir asenkron fonksiyon içerir. Yazdırma işlemi başlatıldığında UI durumunu günceller ve kullanıcıya bildirim gösterir. Modül, yazdırma sürecinin hazırlık, tetikleme ve durum yönetimi aşamalarını tek bir işlevde birleştirir.

## Fonksiyon Grupları
### QR Etiket Yazdırma
Envanter ürününe ait QR etiketinin yazdırma işlemini gerçekleştirir ve yazdırma durumunu UI üzerinde yönetir.
- printQrLabel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, fonksiyon gövdesinden türetilen aksiyom üretilememektedir.

İmzadan çıkarılabilecek bilgiler (aksiyom niteliğinde değildir):

- `printQrLabel` fonksiyonu asenkron (`async`) olarak tanımlanmıştır.
- Fonksiyon üç parametre alır: `r` (QrLabelProps), `setPrintingQr` (boolean alan callback), `texts` (QrLabelTexts).
- `setPrintingQr` parametresi, UI üzerinde yazdırma durumunu güncellemek için bir callback fonksiyonu bekler.

Fonksiyon gövdesi sağlanırsa aksiyomlar üretilebilir.

---

## FONKSİYON DETAYLARI

### printQrLabel
**Ne yapar**: QR etiketi yazdırma işlemini başlatan asenkron bir fonksiyondur. Fonksiyonun docstring'i verilmediği için görevi hakkında kesin bir bilgi bulunmamaktadır; ancak parametre yapısından bir QR etiketinin yazdırılması sürecini tetiklediği anlaşılmaktadır.

**Nasıl yapar**: Fonksiyon `async` olarak tanımlanmıştır, bu da yazdırma işleminin asenkron bir süreç (örneğin bir yazdırma servisi çağrısı, dosya oluşturma veya tarayıcı yazdırma API'si) içerdiğini gösterir. `setPrintingQr` parametresi aracılığıyla yazdırma durumunu dışarıya bildiren bir durum güncellemesi yaptığı anlaşılmaktadır. Fonksiyonun iç mantığı hakkında kaynakta başka bilgi bulunmamaktadır.

**Parametreler**:
- `r`: `QrLabelProps` — QR etiketinin içeriğini ve yapılandırmasını tanımlayan özellik nesnesi. Tip tanımı `QrLabelProps` olarak belirtilmiştir.
- `setPrintingQr`: `(v: boolean) => void` — Yazdırma durumunu güncellemek için kullanılan callback fonksiyon. Parametre olarak bir boolean değer alır ve void döner. Yazdırma işlemi başlarken ve tamamlandığında durumu bildirmek için kullanıldığı anlaşılmaktadır.
- `texts`: `QrLabelTexts` — QR etiketinde kullanılacak metinleri içeren nesne. Tip tanımı `QrLabelTexts` olarak belirtilmiştir.

**Dönüş**: Fonksiyonun dönüş tipi hakkında kaynakta kesin bir bilgi bulunmamaktadır. `async` fonksiyonlar varsayılan olarak `Promise` döndürür, ancak bu fonksiyonun spesifik dönüş değeri belirtilmemiştir.

---

## İTHALATLAR (IMPORTS)
- import: sonner::toast

---

## INTERFACES

### QrLabelProps
- `product_id: string`
- `name: string`
- `warehouse_location?: string | null`
- `physical_stock: number`

### QrLabelTexts
Yazdırma belgesi ayrı bir iframe belgesidir — React ağacının dışında olduğu için `useI18n()` oraya ulaşmaz. Metinler çağıran taraftan ÇÖZÜLMÜŞ geçirilir (CLAUDE.md kural 7: kullanıcıya görünen metin sözlükten gelir).
- `documentTitle: string`
- `skuLabel: string`
- `shelfLabel: string`
- `stockLine: string`
- `qrAlt: string`
- `failed: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/InventoryQrLabel.tsx::printQrLabel
- **params**:
  - `r` — QrLabelProps tipinde, QR etiketi için gerekli ürün verilerini içerir
  - `setPrintingQr` — (v: boolean) => void tipinde, baskı durumunu güncelleyen state setter fonksiyonu
  - `texts` — QrLabelTexts tipinde, UI metinlerini/çevirilerini içeren nesne
- **ic_degiskenler**:
  - `url` — `https://api.qrserver.com/v1/create-qr-code/` API'sine gönderilen QR kodu oluşturma URL'si; `r.product_id` değeri `encodeURIComponent` ile kodlanarak `data` parametresine eklenir
  - `iframe` — `document.createElement('iframe')` ile oluşturulan gizli iframe DOM elementi; `style.display = 'none'` ile görünmez yapılır ve `document.body.appendChild` ile sayfaya eklenir
  - `safeName` — `r.name` değerinden türetilen XSS güvenli ürün adı; boşsa `''` kullanılır, `<` ve `>` karakterleri HTML entity'lerine dönüştürülür
  - `safeSku` — `r.product_id`'nin ilk 8 karakteri, `.toUpperCase()` ile büyük harfe çevrilmiş ve `<`/`>` escape edilmiş stok kodu
  - `safeLoc` — `r.warehouse_location` değerinden türetilen XSS güvenli depo konumu; yoksa `'-'` kullanılır, `<` ve `>` escape edilir
  - `htmlContent` — Tam HTML belgesi string'i; CSS stilleri (Inter fontu, kart düzeni, baskı medya sorgusu), QR görseli (`<img src="${url}" onload="window.print();">`), ürün adı, SKU, raf konumu ve stok bilgisi içerir
  - `doc` — `iframe.contentWindow?.document` ile erişilen iframe'in document nesnesi; varsa `doc.open()`, `doc.write(htmlContent)`, `doc.close()` çağrılarıyla HTML içeriği iframe'e yazılır
  - `setTimeout` callback'i — 5000ms gecikmeyle `iframe.parentNode.removeChild(iframe)` çağırarak iframe'i DOM'dan temizler
- **Dönüş**: yok (void) — yan etki olarak gizli iframe içinde QR etiketi HTML'i oluşturulur, QR görseli yüklendiğinde `window.print()` ile baskı penceresi açılır, hata durumunda `toast.error(texts.failed)` ile bildirim gösterilir, `finally` bloğunda `setPrintingQr(false)` ile baskı durumu sıfırlanır

---

## NODE ID STANDARD

  file: src\components\admin\InventoryQrLabel.tsx
  function: src\components\admin\InventoryQrLabel.tsx::printQrLabel

---

## DISA AKTARILANLAR (EXPORTS)
  export: QrLabelTexts
  export: printQrLabel

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)