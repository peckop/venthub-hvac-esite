---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\admin\InventoryQrLabel.tsx
skeleton_hash: 1c3557ada2a9bd3b
generated_at: 2026-05-23T21:53:39Z
---

## Genel Bakış
InventoryQrLabel bileşeni, envanter öğeleri için QR kod etiketlerinin oluşturulması ve yazdırılmasından sorumludur. Kullanıcı etkileşimiyle tetiklenen asenkron bir işlem yürütür, yazdırma sürecinin durumunu yönetir ve ilgili UI güncellemelerini sağlar.

## Fonksiyon Grupları
### QR Etiket Yazdırma
Bu grup, QR kod etiketinin hazırlanması, yazdırma komutunun gönderilmesi ve yazdırma işleminin ilerleyişinin UI’da yansıtılmasından sorumludur.
- printQrLabel

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki koşulların sağlanması gerekir; koşullar sağlanmazsa fonksiyonun davranışı belirsiz veya hata verebilir.

- **Eğer** `r` parametresi geçerli bir `QrLabelProps` nesnesi **olmazsa**, fonksiyon QR kod verisini hazırlayamayacağından işlem başarısız olur veya bir hata fırlatır.  
- **Eğer** `setPrintingQr` parametresi bir fonksiyon **olmazsa**, yazdırma sürecinin durumunu UI’a yansıtmak için state güncellenemez; bu da kullanıcıya yazdırma ilerlemesinin gösterilmesini engeller.  
- **Eğer** `QrLabelProps` içindeki QR kod üretimi için zorunlu veri alanları (örneğin kimlik, açıklama vb.) **eksikse veya geçersizse**, oluşturulan QR kod boş veya hatalı olur ve yazdırma işlemi beklenildiği gibi gerçekleşmez.  
- **Eğer** fonksiyon asenkron bir işlem (örneğin basıcıyla iletişim) gerçekleştiriyorsa ve bu işlem sırasında bir hata oluşursa, `setPrintingQr(false)` çağrısı yapılarak yazdırma durumunun sıfırlanması beklenir; aksi takdirde UI sürekli “yazdırılıyor” durumunda kalabilir.  

Bu varsayımlar, fonksiyon gövdesindeki dış bağımlılıklar ve veri akışı üzerinden türetilmiştir; docstring, yorum veya değişken isimlerinden çıkarılmamıştır.

---

## FONKSIYON DETAYLARI

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

### [N1_NASIL] AST Pointer: src/components/admin/InventoryQrLabel.tsx::printQrLabel
- **params**: r: QrLabelProps, setPrintingQr: (v: boolean) => void
- **ic_degiskenler**:
  - `window` — global object used to check if running in browser (typeof window === 'undefined')
  - `url` — string containing QR code API URL with encoded product_id
  - `iframe` — HTMLIFrameElement created to host printable HTML content
  - `safeName` — sanitized product name with HTML entities escaped
  - `safeSku` — uppercase first 8 chars of product_id with HTML escaping
  - `safeLoc` — warehouse location string with HTML escaping, default '-'
  - `htmlContent` — full HTML string for the label page, includes interpolated variables
  - `doc` — document object of the iframe's contentWindow, used to write HTML
  - `toast` — imported react-hot-toast function for error notification
- **Dönüş**: yok (function returns undefined; side effects: sets printing state, creates iframe, triggers print, shows toast on error)

### [N2_NASIL] AST Pointer: src/components/admin/InventoryQrLabel.tsx::setTimeout callback
- **params**: (none)
- **ic_degiskenler**:
  - `iframe` — reference to the iframe element captured from outer scope; used to check if still attached and remove it from DOM
- **Dönüş**: yok (callback returns undefined; side effect: removes iframe after delay)

---

## NODE ID STANDARD

  file: src\components\admin\InventoryQrLabel.tsx
  function: src\components\admin\InventoryQrLabel.tsx::printQrLabel

---

## DISA AKTARILANLAR (EXPORTS)
  export: printQrLabel