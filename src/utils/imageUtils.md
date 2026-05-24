---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\imageUtils.ts
skeleton_hash: e6d60b653470869f
generated_at: 2026-05-23T22:34:08Z
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

## FONKSIYON DETAYLARI

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

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\imageUtils.ts::Promise_executor_callback
- **params**: [resolve: Function, reject: Function]
- **ic_degiskenler**:
  - `file` - Ana fonksiyondan gelen sıkıştırılacak orijinal dosya nesnesi
  - `reader` - Dosya okuma işlemini yönetmek için oluşturulan FileReader instance'ı
  - `reader.readAsDataURL` - Dosyayı veri URL formatında okumak için kullanılan API çağrısı
  - `reader.onload` - Dosya başarılı okuma sonrası tetiklenecek handler ataması
  - `reader.onerror` - Dosya okuma hatası durumunda tetiklenecek handler ataması
- **Dönüş**: yok

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\imageUtils.ts::FileReader_onload_handler
- **params**: [event: ProgressEvent<FileReader>]
- **ic_degiskenler**:
  - `event.target?.result` - FileReader ile okunan dosyanın base64 formatlı verisi
  - `img` - Görüntü verisini yüklemek için oluşturulan HTML Image nesnesi
  - `img.src` - Image nesnesine yüklenecek kaynak olarak base64 verisinin atanması
  - `img.onload` - Görüntü başarılı şekilde yüklendiğinde tetiklenecek handler ataması
  - `reject` - İşlem hatalarını ana promise'a iletmek için kullanılan dışarıdan gelen reject fonksiyonu
  - `resolve` - Başarılı işlem sonucunu ana promise'a iletmek için kullanılan dışarıdan gelen resolve fonksiyonu
- **Dönüş**: yok

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\imageUtils.ts::Image_onload_handler
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `img` - Boyutları hesaplanacak yüklü orijinal HTML Image nesnesi
  - `canvas` - Görüntüyü yeniden boyutlandırıp sıkıştırmak için oluşturulan HTML Canvas nesnesi
  - `document.createElement('canvas')` - Geçici canvas nesnesi oluşturan DOM API çağrısı
  - `MAX_WIDTH` - Sıkıştırılmış görüntünün sabit maksimum genişliği (1200px)
  - `scaleSize` - Görüntüyü orantılı küçültmek için hesaplanan ölçekleme oranı
  - `newWidth` - Hesaplanan yeni görüntü genişliği, maksimum genişliği aşmayacak şekilde ayarlanır
  - `newHeight` - Ölçekleme oranı ile hesaplanan yeni görüntü yüksekliği, oran korunur
  - `canvas.width` - Canvas nesnesinin genişliğine hesaplanan newWidth'in atanması
  - `canvas.height` - Canvas nesnesinin yüksekliğine hesaplanan newHeight'in atanması
  - `ctx` - Canvas'ın 2D çizim bağlamı, görüntüyü canvas üzerine çizmek için kullanılır
  - `canvas.getContext('2d')` - Canvas'ın 2D çizim bağlamını almak için yapılan API çağrısı
  - `ctx.drawImage` - Orijinal görüntüyü yeni boyutlarla canvas üzerine çizen API çağrısı
  - `canvas.toBlob` - Canvas üzerindeki görüntüyü Blob formatına dönüştüren API çağrısı
  - `reject` - Canvas bağlamı alınamadığında hata fırlatmak için kullanılan dışarıdan gelen reject fonksiyonu
  - `resolve` - Sıkıştırılmış blob'u döndürmek için kullanılan dışarıdan gelen resolve fonksiyonu
- **Dönüş**: yok

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\utils\imageUtils.ts::Canvas_toBlob_handler
- **params**: [blob: Blob | null]
- **ic_degiskenler**:
  - `blob` - Canvas'tan dönen sıkıştırılmış görüntü Blob nesnesi
  - `resolve` - Blob geçerliyse ana promise'ı bu blob ile çözmek için kullanılan dışarıdan gelen resolve fonksiyonu
  - `reject` - Blob null ise sıkıştırma hatası olarak ana promise'ı reddetmek için kullanılan dışarıdan gelen reject fonksiyonu
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\utils\imageUtils.ts
  function: src\utils\imageUtils.ts::compressImage

---

## DISA AKTARILANLAR (EXPORTS)
  export: compressImage