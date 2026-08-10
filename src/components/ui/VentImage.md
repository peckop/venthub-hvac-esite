---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\ui\VentImage.tsx
skeleton_hash: c33c889cb5e7319a
entity_hashes:
  func:VentImage: 5527f2e63e5e22a5
  overview: ed4ba88e88a612db
  style_tokens: 1d628435b48e7258
generated_at: 2026-06-19T20:47:39Z
---

## Genel Bakış
VentHub HVAC projelerinde kullanılmak üzere tasarlanmış bu React modülü, havalandırma sistemlerine ait görselleri güvenilir bir şekilde sunmak için geliştirilmiş bir bileşendir. Görsel yükleme hatalarında önceden tanımlanmış alternatif görselleri göstererek arayüzün kesintisiz ve tutarlı kalmasını sağlar.

## Fonksiyon Grupları
### Ana Görsel Bileşeni
Görsel gösterimi ve hata yönetimi için temel bileşendir. Aldığı özelliklerle görseli render eder ve yükleme başarısız olduğunda fallback mekanizmasını devreye alır.
- VentImage

### Görsel Kaynak Yönetimi
Bileşenin kullanacağı görseller için geçerli ve erişilebilir URL adresleri üreten yardımcı bir işlevdir. Görsel yükleme sürecinin ilk adımını oluşturur.
- getImageUrl

---

## AXIOMS – Mimari Varsayımlar

Bu modül, görsel gösterimi ve yedek görsel mekanizması üzerine kurulu bir React bileşenidir. Aşağıdaki mimari varsayımlar fonksiyon imzası ve modül sabitlerine dayanarak türetilmiştir.

[Aksiyom 1]: Eğer `src` prop'u sağlanmazsa, bileşen geçerli bir görsel kaynağı olmadığı için görüntüleme yapılamaz ve yedek görsel mekanizmasına yönelmek zorunda kalır.

[Aksiyom 2]: Eğer `alt` prop'u sağlanmazsa, görselin erişilebilirliği (accessibility) bozulur; ekran okuyucular görseli tanımlayamaz.

[Aksiyom 3]: Eğer `fallbackType` prop'u sağlanmazsa, `'generic'` değeri kullanılır; bu nedenle `FALLBACK_IMAGES` nesnesinin mutlaka `'generic'` anahtarı içermesi gerekir, aksi halde yedek görsel gösterimi başarısız olur.

[Aksiyom 4]: Eğer `FALLBACK_IMAGES` sabit nesnesi modül kapsamında tanımlı veya içe aktarılmamışsa, yedek görsel mekanizması çalışmaz; hem `fallbackType = 'generic'` varsayılanı hem de diğer olası fallback türleri işlevsiz kalır.

[Aksiyom 5]: Eğer `fallbackType` olarak sağlanan değer, `FALLBACK_IMAGES` nesnesindeki hiçbir anahtar ile eşleşmiyorsa, bileşen yedek görseli bulamaz ve görsel alanı boş kalır.

[Aksiyom 6]: Eğer `FALLBACK_IMAGES` nesnesindeki bir anahtarın değeri geçerli bir görsel yolu (URL/path) içermiyorsa, o fallback türü seçildiğinde tarayıcıda kırık görsel ikonu görüntülenir.

---

## FONKSİYON DETAYLARI

### VentImage
**Ne yapar**: VentHub HVAC uygulaması için özel olarak geliştirilmiş profesyonel React görsel bileşenidir. Tüm uygulama genelindeki görsel ihtiyaçlarını Supabase Storage entegrasyonu, otomatik hata yönetimi ve performans odaklı optimizasyonlar ile tek bir bileşende toplar. Erişilebilirlik standartlarına uygun, kullanıcı deneyimini artıran ve bakımı kolay bir görsel sunum altyapısı sunar.
**Nasıl yapar**: Öncelikle aldığı görsel yolunu (src) getImageUrl yardımcı fonksiyonu ile Supabase Storage'un erişilebilir tam URL'sine dönüştürür. Görselin herhangi bir nedenle yüklenememesi durumunda belirtilen fallbackType parametresine uygun şık bir yer tutucu (placeholder) görselini otomatik olarak yükler. Next.js Image bileşenini kullanarak resim boyutlandırma, format optimizasyonu ve önbellekleme gibi performans özelliklerinden tam olarak faydalanır, aldığı tüm ek stil ve özellik props'larını temel Image bileşenine ileterek esnek kullanım sağlar.
**Parametreler**:
- src: string — Supabase Storage üzerinde saklanan hedef görselin relative yoludur, bileşen içinde otomatik olarak tam erişim URL'sine çevrilir
- alt: string — Görsel için erişilebilirlik standartlarına uygun alternatif metindir, ekran okuyucular tarafından kullanılır ve görsel yüklenemediğinde metin olarak görüntülenir
- fallbackType: string — Görselin yüklenememesi durumunda gösterilecek yer tutucu görselinin tipini belirler, varsayılan değeri 'generic' olarak ayarlanmıştır
- className: string — Bileşene özel CSS sınıfları eklemek için kullanılan isteğe bağlı string parametresidir, özel stil tanımlamaları için kullanılır
- ...props: any — React görüntü elementine veya Next.js Image bileşenine iletilecek tüm ek standart veya özel props'ları toplar, bileşenin farklı kullanım senaryolarına uyum sağlamasını sağlar
**Dönüş**: React.FC<VentImageProps> — VentImageProps türündeki giriş parametrelerini alan, sayfada sorunsuz şekilde render edilen React fonksiyonel bileşenini döndürür

---

## İTHALATLAR (IMPORTS)
- import: @/utils/imageUtils::normalizeImageUrl
- import: next/image::Image
- import: next/image::ImageProps
- import: react::React

---

## INTERFACES

### VentImageProps
- `src: string | null | undefined`
- `fallbackType?: 'product' | 'category' | 'brand' | 'generic'`

---

## SABİTLER
- **FALLBACK_IMAGES** (object) — `{
  product: '/images/placeholders/product-placeholder.png',
  category: '/...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: VentImage.tsx::VentImage
- **params**: (src, alt, fallbackType = 'generic', className, ...props)
- **ic_degiskenler**: 
  - `error` — React state boolean, resim yükleneme durumunu takip eder
  - `isLoaded` — React state boolean, resmin başarıyla yüklenip yüklenmediğini takip eder
  - `finalSrc` — Hesaplanan son resim URL'si, hata durumunda fallback, başarılıda normalize edilmiş URL
  - `width` — props'tan çıkarılan genişlik değeri (Next.js Image için)
  - `height` — props'tan çıkarılan yükseklik değeri (Next.js Image için)
  - `fill` — props'tan çıkarılan boolean, Image'ın fill modunda çalışıp çalışmadığını belirtir
  - `rest` — width, height ve fill dışındaki kalan props'lar
  - `isFillMode` — Boolean, fill modunun aktif olup olmadığını belirtir
  - `needsDefaultSizes` — Boolean, fill modu yoksa ve genişlik/yükseklik yoksa default boyutların gerekip gerekmediğini belirtler
  - `wrapperClass` — Wrapper div için oluşturulmuş className string'i
- **Dönüş**: JSX (React element) - Resim bileşenini saran div ve içindeki Image elementini döndürür

---

## NODE ID STANDARD

  file: src\components\ui\VentImage.tsx
  function: src\components\ui\VentImage.tsx::VentImage

---

## DISA AKTARILANLAR (EXPORTS)
  export: VentImage

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-100/50`
- **Layout:** `absolute`, `h-auto`, `transform-gpu`, `w-full`, `z-0`
- **Varyant/Responsive:** `:` önekleri
- **Yardımcı Sınıflar:** `$`, `${className`, `${isFillMode`, `:`, `duration-300`, `ease-in-out`, `inset-0`, `isLoaded`, `object-cover`, `opacity-0`, `opacity-100`, `props.priority`, `transition-opacity`, `||`