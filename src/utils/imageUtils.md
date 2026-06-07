---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\imageUtils.ts
skeleton_hash: 52b8f3fce4575628
entity_hashes:
  func:compressImage: 52ddf4e7747053ca
  func:normalizeImageUrl: a7c1782886d55260
  overview: 3edb070ce8076b34
generated_at: 2026-06-07T19:52:14Z
---

## Genel Bakış
VentHub HVAC projesinin src/utils/imageUtils.ts modülü, platformda kullanılan görsel dosyaların yönetimi ve optimize edilmesi için yardımcı fonksiyonlar sunan bir modüldür. Temel olarak, yüklenen resim dosyalarının boyutunu küçülterek web performansını artıran bir sıkıştırma işlemi ve görsel URL'lerinin standartlaştırılmasını sağlayan bir normalizasyon işlevi içerir.

## Fonksiyon Grupları
### Görsel Optimizasyonu
Orijinal resim dosyalarını alır ve web kullanımı için daha küçük, daha hızlı yüklenen formata dönüştürerek performans kazandırır.
- compressImage

### URL Yönetimi ve Normalizasyonu
Verilen görsel URL'lerini tutarlı ve eksiksiz bir forma getirir, eksik veya geçersiz URL durumlarında tanımlı bir yedek değer döndürerek uygulamanın hata almasını engeller.
- normalizeImageUrl

---

## AXIOMS – Mimari Varsayımlar
Bu modül, resimleri sıkıştırmak ve görsel URL'leri normalize etmek için bir dizi kütüphane ve tarayıcı API'sine bağımlıdır. Çalışması için belirtilen fonksiyon imzalarına uygun girdiler ve varsayılan değerlerin sağlanması gerekir.

[Aksiyom 1]: Eğer `compressImage` fonksiyonuna geçilen `file` parametresi, geçerli bir `File` nesnesi (tarayıcı ortamında) yoksa, fonksiyon hata verir veya başarısız bir sonuç döner.

[Aksiyom 2]: Eğer `normalizeImageUrl` fonksiyonuna geçilen `url` parametresi `null` veya `undefined` ise ve `fallback` parametresi boş bir dize (`""`) olarak geçilmişse, fonksiyon boş bir dize döner.

[Aksiyom 3]: Eğer `normalizeImageUrl` fonksiyonuna geçilen `url` parametresi geçerli bir dize ise, `fallback` parametresi dikkate alınmaz ve `url` değeri (opsiyonel olarak `bucketPrefix` ile işlenmiş şekilde) döner.

[Aksiyom 4]: Eğer `normalizeImageUrl` fonksiyonuna geçilen `url` parametresi `null` veya `undefined` ise, fonksiyon her zaman `fallback` parametresinin değerini döner.

[Aksiyom 5]: Eğer `normalizeImageUrl` fonksiyonuna geçilen `url` parametresi `null` veya `undefined` değilse ve `bucketPrefix` opsiyonel parametresi verilmişse, dönen URL'nin alan adı (domain) kısmının, `bucketPrefix` ile başlaması gerekir (örneğin, `https://bucket-prefix.example.com/path` formatında). Bu, URL'nin doğru depolama alanına yönlendirildiğinin bir kabul kriteridir.

---

## FONKSİYON DETAYLARI

### compressImage
**Ne yapar**: Gelen görüntü dosyasını WebP formatına dönüştürerek sıkıştırır, maksimum genişliğini 1200 piksel ile sınırlar. Temel amacı Supabase Storage platformuna yüklenecek görüntülerin dosya boyutunu küçülterek yükleme ve erişim performansını artırmaktır. Tüm görüntü yükleme süreçlerinde ön işlem adımı olarak kullanılır.
**Nasıl yapar**: Orijinal görüntünün en-boy oranını koruyarak genişliğini 1200 piksel üstüne çıkarmayacak şekilde yeniden boyutlandırma işlemi uygular. Yeniden boyutlandırılan görüntüyü WebP formatında sıkıştırarak sonucu bir Blob nesnesi olarak hazırlar, tüm işlemi asenkron olarak gerçekleştirir ki ana thread'in bloklanmasını önler.
**Parametreler**:
- name: file, type: File — Sıkıştırma ve yeniden boyutlandırma işlemine tabi tutulacak olan orijinal görüntü dosyasını temsil eden tarayıcı tarafı File nesnesi.
**Dönüş**: Promise<Blob> — İşlem sonunda oluşan sıkıştırılmış WebP formatındaki görüntü dosyasını içeren Blob nesnesini döndüren asenkron Promise nesnesi. İşlem başarısız olursa Promise reddedilir, başarılı olduğunda sıkıştırılmış görüntü verisini içeren Blob nesnesini iletir.

### normalizeImageUrl

**Ne yapar**: Görsel URL'lerini normalize ederek geçerli ve kullanıma hazır hale getirir. Geçersiz, boş veya tanımsız URL'ler için güvenli bir yedek (placeholder) değer döndürerek uygulama içinde görsel gösterimlerinde hata oluşmasını engeller.

**Nasıl yapar**: Fonksiyon, girilen URL değerinin geçerliliğini kontrol eder. URL string|null|undefined tiplerinde olabilir ve bu esneklik sayesinde farklı kaynaklardan gelen verileri güvenle işler. Boş string, null veya undefined durumlarında doğrudan fallback parametresini döndürerek güvenli bir varsayılan görsel sunar. Geçerli URL durumunda ise bucketPrefix parametresi ile yerel/uzak kaynak ayrımını ve bucket öneklemesini yönetebilir.

**Parametreler**:
- `url`: `string | null | undefined` — Normalize edilecek görsel URL adresi. null veya undefined olabilir; bu durumda fallback kullanılır
- `fallback`: `string` — URL geçersiz, boş veya tanımsız olduğunda döndürülecek yedek görsel adresi (varsayılan placeholder)
- `bucketPrefix`: `string | undefined` — Opsiyonel. Uzak depolama bucket'ı için önek değeri. Yerel ve uzak görsellerin ayrıştırılmasında kullanılabilir

**Dönüş**: `string` — Normalize edilmiş, geçerli bir görsel URL adresi veya fallback olarak verilen yedek değer döndürür. Her durumda geçerli bir string URL dönüşü garanti edilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `src/utils/imageUtils.ts::compressImage`
- **params**: `file: File` — sıkıştırılacak orijinal görsel dosyası
- **ic_degiskenler**:
  - `reader` — `FileReader` nesnesi, dosyayı base64 DataURL olarak okumak için kullanılır
  - `img` — `HTMLImageElement`, okunan DataURL'yi yükleyip genişlik/yükseklik bilgisini almak için kullanılır
  - `canvas` — `HTMLCanvasElement`, görseli yeniden boyutlandırmak ve çizmek için oluşturulan sanal tuval
  - `MAX_WIDTH` — `const 1200`, görselin izin verilen maksimum genişliği sabiti
  - `scaleSize` — `MAX_WIDTH / img.width`, genişlik oranına göre yükseklik ölçekleme katsayısı
  - `newWidth` — hesaplanan final genişlik; `img.width > MAX_WIDTH` ise 1200, değilse orijinal genişlik
  - `newHeight` — hesaplanan final yükseklik; genişlik kısaltıldıysa `img.height * scaleSize`, değilse orijinal yükseklik
  - `ctx` — `CanvasRenderingContext2D | null`, canvas'ın 2d çizim bağlamı; `drawImage` ve `toBlob` için kullanılır
- **Dönüş**: `Promise<Blob>` — WebP formatında, kalite 0.8 ile sıkıştırılmış görsel Blob'u. Hata durumunda reject ile Error fırlatır.

---

### [N2_NASIL] AST Pointer: `src/utils/imageUtils.ts::normalizeImageUrl`
- **params**:
  - `url: string | null | undefined` — normalize edilecek ham görsel URL'si veya yolu
  - `fallback: string` — geçersiz/boş URL durumunda kullanılacak varsayılan görsel yolu (`'/images/vortice_lineo_futuristic.png'`)
  - `bucketPrefix?: string` — Supabase storage bucket ön eki (opsiyonel, örneğin `'category-images'`)
- **ic_degiskenler**:
  - `trimmed` — `url.trim()` ile boşlukları temizlenmiş URL dizgisi
  - `hasExtension` — `boolean`, URL'nin standart görsel uzantısı (jpg, jpeg, png, webp, gif, svg, bmp, tiff) içerip içermediğini kontrol eden regex eşleşmesi sonucu
  - `isAbsolute` — `boolean`, URL'nin `http://`, `https://` veya `data:` ile başlayıp başlamadığını belirler
  - `isRootRelative` — `boolean`, URL'nin `/` ile başlayıp başlamadığını belirler (kök bağıl yol)
  - `supabaseUrl` — `process.env.NEXT_PUBLIC_SUPABASE_URL` değerinden okunan Supabase URL'si; Supabase storage yolu oluşturmak için kullanılır
  - `pathWithBucket` — `bucketPrefix` verilmişse ve `trimmed` zaten o prefix ile başlamıyorsa `${bucketPrefix}/${trimmed}` olarak birleştirilmiş yol; aksi halde `trimmed`'in kendisi
  - `cleanPath` — `pathWithBucket` içindeki mükerrer `${supabaseUrl}/storage/v1/object/public/` ifadesi temizlenmiş yol
- **Dönüş**: `string` — normalize edilmiş tam görsel URL'si. Geçersiz/boş URL → `fallback`, mutlak/yönel yollar → olduğu gibi döner, Supabase yolları → tam URL'ye dönüştürülerek döner.

---

## NODE ID STANDARD

  file: src\utils\imageUtils.ts
  function: src\utils\imageUtils.ts::compressImage
  function: src\utils\imageUtils.ts::normalizeImageUrl

---

## DISA AKTARILANLAR (EXPORTS)
  export: compressImage
  export: normalizeImageUrl