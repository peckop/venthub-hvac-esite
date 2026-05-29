---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryQrLabel.tsx
skeleton_hash: ebe773dcc2c30493
entity_hashes:
  func:printQrLabel: 68158948d578d02a
  overview: ddf13ce18f5512aa
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-29T18:45:03Z
---

## Genel Bakış
Bu modül, envanter kalemleri için QR kod etiketlerinin yazdırılmasını yöneten tek bir odaklı işlev sunar. Kullanıcının yazdırma tetiklemesiyle asenkron olarak çalışan fonksiyon, yazdırma sürecinin UI üzerindeki durumunu (yazdırılıyor/yazdırıldı) kontrol eder.

## Fonksiyon Grupları
### QR Etiket Yazdırma
Etiket yazdırma sürecinin tüm aşamalarını — hazırlık, basıcıya gönderim ve durum yönetimi — tek bir işlevde kümeler.
- printQrLabel

---

## AXIOMS – Mimari Varsayımlar
Bu modül, QR etiket yaz

---

## FONKSİYON DETAYLARI

### printQrLabel
**Ne yapar**: QR etiketini yazdırma işlemini gerçekleştirir.  
**Nasıl yapar**: `QrLabelProps` türündeki `r` parametresinden etiket verisini alır ve `setPrintingQr` fonksiyonunu çağırarak yazdırma durumunu günceller.  
**Parametreler**:
- r: QrLabelProps — Yazdırılacak QR etiketinin özelliklerini içeren nesne.  
- setPrintingQr: (v: boolean) => void — Yazdırma işleminin başlatılıp bitirilmesini gösteren durum güncelleyici fonksiyonu.  
**Dönüş**: void — Fonksiyon bir değer döndürmez.

---

## INTERFACES

### QrLabelProps
- `product_id: string`
- `name: string`
- `warehouse_location?: string | null`
- `physical_stock: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: InventoryQrLabel.tsx::printQrLabel
- **params**: `(r: QrLabelProps, setPrintingQr: (v: boolean) => void)`
  - `r` — QR etiketi basılacak ürünün bilgilerini taşıyan nesne; `r.product_id`, `r.name`, `r.warehouse_location`, `r.physical_stock` alanları kullanılır
  - `setPrintingQr` — yazdırma işleminin devam edip etmediğini belirten state setter; `true` ile başlar, `finally` bloğunda `false` yapılır
- **ic_degiskenler**:
  - `url` — qrserver.com API'si kullanılarak oluşturulan QR kod görselinin URL adresi; `r.product_id` Base64-URL-encode edilerek dataya eklenir
  - `iframe` — yazdırma işlemini gerçekleştirmek için DOM'a eklenen gizli iframe elemanı; HTML içeriği içine yazılır ve `window.print()` tetiklenir
  - `safeName` — `r.name` değerinin XSS-safe hali; `<` ve `>` karakterleri HTML entity'lerine dönüştürülür; HTML template'de ürün adı olarak gösterilir
  - `safeSku` — `r.product_id`'den ilk 8 karakter alınıp büyük harfe çevrilmiş, XSS-safe SKU kodu; HTML template'de "SKU Kodu" olarak gösterilir
  - `safeLoc` — `r.warehouse_location` değerinin XSS-safe hali; boşsa `'-'` değeri kullanılır; HTML template'de "Depo Rafı" olarak gösterilir
  - `htmlContent` — iframe içine yazılacak tam HTML doküman stringi; CSS stilleri, QR görseli, ürün bilgileri ve yazdırma medya sorgularını içerir; `safeSku`, `safeName`, `safeLoc`, `url`, `r.physical_stock` template literal ile interpolatedir
  - `doc` — `iframe.contentWindow?.document` ifadesinden elde edilen iframe'in Document nesnesi; `null` kontrolü yapılarak `doc.open()`, `doc.write(htmlContent)`, `doc.close()` ile HTML içeriği iframe'a yazılır
- **Dönüş**: yok — fonksiyon asenkrondür, doğrudan bir değer dönmez; yan etki olarak iframe oluşturur, HTML yazar, 5 saniye sonra iframe'ı DOM'dan kaldırır; hata durumunda `toast.error('Etiket oluşturulamadı')` gösterir; her durumda `setPrintingQr(false)` çağırır

---

## NODE ID STANDARD

  file: src\components\admin\InventoryQrLabel.tsx
  function: src\components\admin\InventoryQrLabel.tsx::printQrLabel

---

## DISA AKTARILANLAR (EXPORTS)
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