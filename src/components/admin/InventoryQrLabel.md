---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\admin\InventoryQrLabel.tsx
skeleton_hash: a4438aa3ffa6e79b
entity_hashes:
  func:printQrLabel: 1e2155968c16ad3a
  overview: 24734b9ad0c44486
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T13:09:58Z
---

## Genel Bakış
Bu modül, envanter kalemleri için QR kod etiketlerinin yazdırılmasını yöneten tek bir asenkron fonksiyon sunar. Yazdırma işlemi tetiklendiğinde, kullanıcı arayüzündeki yazdırma durumunu günceller ve sonner kütüphanesi aracılığıyla bildirim gösterir.

## Fonksiyon Grupları
### QR Etiket Yazdırma
Etiket yazdırma sürecinin tüm aşamalarını — hazırlık, yazdırma tetikleme ve durum yönetimi — tek bir asenkron işlevde gerçekleştirir.
- printQrLabel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için fonksiyon gövdesi verilmediğinden aksiyom üretilememektedir.

---

## FONKSİYON DETAYLARI

### printQrLabel
**Ne yapar**: Fonksiyonun kesin görevi kaynakta belirtilmemiştir. Adından ve parametre yapısından, bir QR etiketi yazdırma işlemi gerçekleştirdiği anlaşılmaktadır; ancak bu bir çıkarımdır ve fonksiyonun içeriği hakkında kesin bilgi mevcut değildir.

**Nasıl yapar**: Fonksiyonun iç mantığı hakkında kaynakta herhangi bir bilgi (docstring, gövde kodu) bulunmamaktadır. `async` olarak tanımlanmış olması, asenkron bir işlem (örneğin yazdırma API çağrısı, dosya oluşturma vb.) içerdiğini gösterir. `setPrintingQr` parametresi aracılığıyla yazdırma durumunu dışarıya bildiren bir mekanizma kullandığı anlaşılmaktadır.

**Parametreler**:
- `r`: `QrLabelProps` — QR etiketi için gerekli özellikleri taşıyan nesne. Yapısı hakkında detaylı bilgi kaynakta mevcut değildir.
- `setPrintingQr`: `(v: boolean) => void` — Yazdırma işleminin devam edip etmediğini dışarıya bildirmek için kullanılan state setter fonksiyonu. `true` ve `boolean` değerler alarak yazdırma durumunu günceller.
- `texts`: `QrLabelTexts` — QR etiketinde kullanılacak metinleri içeren nesne. Yapısı hakkında detaylı bilgi kaynakta mevcut değildir.

**Dönüş**: Kaynakta dönüş tipi açıkça belirtilmemiştir. Fonksiyon `async` olduğundan, dönüş değerinin bir `Promise` olması beklenir; ancak bu `Promise`'ın içindeki tip bilinmemektedir.

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
  - `r` — QrLabelProps tipinde, ürün bilgilerini içerir (product_id, name, warehouse_location alanlarına erişilir)
  - `setPrintingQr` — boolean parametre alan ve void döndüren fonksiyon, yazdırma durumunu günceller
  - `texts` — QrLabelTexts tipinde, UI metinlerini içerir (documentTitle, qrAlt, skuLabel, shelfLabel, stockLine, failed alanlarına erişilir)
- **ic_degiskenler**:
  - `url` — `r.product_id` kullanılarak oluşturulan QR kod API URL'si; `encodeURIComponent` ile kodlanmış product_id'yi 150x150 boyutunda QR kodu olarak almak için kullanılır
  - `iframe` — `document.createElement('iframe')` ile oluşturulan gizli iframe elementi; `style.display = 'none'` ile gizlenir ve `document.body.appendChild` ile DOM'a eklenir
  - `safeName` — `r.name`'den türetilen XSS korumalı ürün adı; boş string fallback ile gelir, `<` ve `>` karakterleri HTML entity'lere dönüştürülür
  - `safeSku` — `r.product_id`'nin ilk 8 karakterinden oluşan büyük harfli SKU kodu; `<` ve `>` karakterleri HTML entity'lere dönüştürülür
  - `safeLoc` — `r.warehouse_location`'dan türetilen XSS korumalı depo konumu; yoksa `'-'` kullanılır, `<` ve `>` karakterleri HTML entity'lere dönüştürülür
  - `htmlContent` — template literal ile oluşturulan tam HTML belgesi; QR görseli, ürün adı, SKU, konum ve stok bilgisini içeren yazdırılabilir kart düzeni, CSS stilleri ve `window.print()` onload tetikleyicisi barındırır
  - `doc` — `iframe.contentWindow?.document` erişimi; varsa `doc.open()`, `doc.write(htmlContent)`, `doc.close()` ile iframe içeriği yazılır
- **Dönüş**: yok (void) — yan etki olarak gizli iframe içinde QR kodlu etiket HTML'i oluşturulur, QR görseli yüklendiğinde `window.print()` tetiklenir, 5 saniye sonra iframe DOM'dan kaldırılır; hata durumunda `toast.error(texts.failed)` ile bildirim gösterilir; finally bloğunda `setPrintingQr(false)` çağrılır

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