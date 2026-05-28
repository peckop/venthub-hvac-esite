---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\imageUtils.ts
skeleton_hash: e6d60b653470869f
entity_hashes:
  func:compressImage: 52ddf4e7747053ca
  overview: da4b1ecf34cfb8bc
generated_at: 2026-05-28T22:38:46Z
---

## Genel Bakış
VentHub HVAC projesinin src/utils/imageUtils.ts modülü, platforma yüklenen resim dosyalarını web kullanımına uygun şekilde işleyen genel amaçlı bir yardımcı modüldür. Modül, resimlerle ilgili optimizasyon işlemlerini tek merkezden yürütmek üzere tasarlanmıştır, şu anda temel olarak resim sıkıştırma işlevini sunar.

## Fonksiyon Grupları
### Resim Sıkıştırma ve Optimizasyonu
Yüklenen orijinal resim dosyalarını boyutlarını küçülterek web performansına uygun hale getirir, asenkron olarak çalışarak sıkıştırılmış veriyi kullanıma sunar.
- compressImage

---

## AXIOMS – Mimari Varsayımlar
Bu görüntü sıkıştırma modülü, tarayıcı ortamında çalışmak üzere tasarlanmıştır, çalışması için çalıştığı ortamın web standartlarındaki dosya ve görüntü işleme API'lerini desteklemesi ve fonksiyona iletilen girdinin geçerli bir görüntü dosyası olması zorunludur.

[Aksiyom 1]: Eğer fonksiyona iletilen girdi geçerli bir tarayıcı File nesnesi değilse, dosya metriklerine erişilemez, sıkıştırma işlemi başlatılamaz ve modül hata fırlatır.
[Aksiyom 2]: Eğer çalıştığı ortam File API standardını desteklemiyorsa, dosya nesnesinin içeriğine ve özelliklerine erişilemez, sıkıştırma işlemi hiçbir şekilde gerçekleştirilemez.
[Aksiyom 3]: Eğer çalıştığı ortam görüntü sıkıştırma işleminde kullanılan Canvas API standardını desteklemiyorsa, görüntü dosyası yeniden boyutlandırılamaz ve sıkıştırılamaz, modül işlevini yerine getiremez.
[Aksiyom 4]: Eğer iletilen File nesnesi geçerli bir görüntü formatına sahip değilse, görüntü işleme hattına yüklenemediği için sıkıştırma işlemi başarısız olur, modül geçersiz dosya hatası fırlatır.

---

## FONKSİYON DETAYLARI

### compressImage
**Ne yapar**: Gelen görüntü dosyasını WebP formatına dönüştürerek sıkıştırır, maksimum genişliğini 1200 piksel ile sınırlar. Temel amacı Supabase Storage platformuna yüklenecek görüntülerin dosya boyutunu küçülterek yükleme ve erişim performansını artırmaktır. Tüm görüntü yükleme süreçlerinde ön işlem adımı olarak kullanılır.
**Nasıl yapar**: Orijinal görüntünün en-boy oranını koruyarak genişliğini 1200 piksel üstüne çıkarmayacak şekilde yeniden boyutlandırma işlemi uygular. Yeniden boyutlandırılan görüntüyü WebP formatında sıkıştırarak sonucu bir Blob nesnesi olarak hazırlar, tüm işlemi asenkron olarak gerçekleştirir ki ana thread'in bloklanmasını önler.
**Parametreler**:
- name: file, type: File — Sıkıştırma ve yeniden boyutlandırma işlemine tabi tutulacak olan orijinal görüntü dosyasını temsil eden tarayıcı tarafı File nesnesi.
**Dönüş**: Promise<Blob> — İşlem sonunda oluşan sıkıştırılmış WebP formatındaki görüntü dosyasını içeren Blob nesnesini döndüren asenkron Promise nesnesi. İşlem başarısız olursa Promise reddedilir, başarılı olduğunda sıkıştırılmış görüntü verisini içeren Blob nesnesini iletir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\imageUtils.ts::compressImage
- **params**: [file: File]
- **ic_degiskenler**:
  - `Promise` - Ana fonksiyonun dönüş değerini oluşturmak için kullanılan asenkron işlem sarmalayıcısı
  - `reader` - Gelen dosyayı base64 formatında okumak için oluşturulan FileReader nesnesi
  - `reader.readAsDataURL` - FileReader nesnesi ile dosyayı veri URL formatında okuyan API çağrısı
  - `reader.onload` - Dosya başarıyla okunduğunda tetiklenecek event handler ataması
  - `reader.onerror` - Dosya okuma hatası oluştuğunda tetiklenecek event handler ataması
- **Dönüş**: Promise<Blob>

---

## NODE ID STANDARD

  file: src\utils\imageUtils.ts
  function: src\utils\imageUtils.ts::compressImage

---

## DISA AKTARILANLAR (EXPORTS)
  export: compressImage