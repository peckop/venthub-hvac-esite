---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-t088\src\components\authority\ThreeDAuthority.tsx
skeleton_hash: 21cf35edb21c4e5b
entity_hashes:
  func:Model: cad84f3d7aa627bb
  func:ThreeDAuthority: 4f723bb2221e26f2
  overview: 1ca18e8f0d071f75
  style_tokens: 79effa301ffb588d
generated_at: 2026-08-27T13:19:25Z
---

## Genel Bakış
Bu modül, 3 boyutlu bir modelin tarayıcıda yüklenmesini ve model üzerinde etkileşimli noktaların (hotspot) gösterilmesini üstlenen bir React bileşenidir. Dışarıdan gelen model URL'si ve hotspot tanımlarını alarak 3D motoru ile arayüz arasında bir yönlendirici işlevi görür. Modül davranışsal mantık içermez; salt veri, konfigürasyon ve tip tanımı barındırır.

## Fonksiyon Grupları

### Model Render ve Hotspot Yönetimi
Bu grup, asıl 3D sahnenin yüklenmesini ve model üzerine yerleştirilmiş hotspot işaretçilerinin render edilmesinden sorumludur. Verilen URL ile model yüklenir, sağlanmışsa bu noktalar modele eklenir.
- Model

### Üst Seviye Bileşen Sarmalayıcı
Bu grup, dış kaynaklardan gelen veri paketini (metadata) alır, gerekli dönüşümleri yapar ve altındaki Model bileşenine doğru prop'ları aktararak modülün dışarıya sunduğu tek bir arayüzü oluşturur.
- ThreeDAuthority

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Model
**Ne yapar**: Verilen `url` ve opsiyonel `hotspots` ile bir 3D modeli render eder.  
**Nasıl yapar**: `url` parametresi kullanılarak model yüklenir; `hotspots` sağlanmışsa model üzerine bu noktalar eklenir (detaylı yükleme mantığı kaynak kodunda bulunur).  
**Parametreler**:
- `url`: string — render edilecek 3D modelinin adresi (GLB/GLTF formatında).  
- `hotspots`: ThreeDMetadata['hotspots']? — model üzerine eklemek isteğe bağlı etkileşim noktaları listesi; tanımlanmazsa hiçbir hotspot eklenmez.  
**Dönüş**: void — fonksiyon JSX elementi döndürür, açık bir değer döndürmez.

### ThreeDAuthority

**Ne yapar**: Gerçek 3D ürün modellerini (GLB/GLTF) interaktif olarak render eden bir React fonksiyonel bileşenidir. Performans optimizasyonu için "Click-to-Load" (tıklayarak yükle) stratejisini uygular; bileşen ilk yüklendiğinde 3D modeli hemen yüklemez, kullanıcı tıkladıktan sonra yüklemeyi başlatır.

**Nasıl yapar**: Bileşen, `isStarted` adlı bir durum değişkeniyle iki farklı görünüm arasında geçiş yapar. İlk durumda (`isStarted` değeri `false` iken), kullanıcıya tıklanabilir bir placeholder gösterilir; bu placeholder, dönen bir yükleme ikonu ve "etkileşimli görünümü başlatmak için tıklayın" mesajı içerir. Kullanıcı bu alana tıkladığında `setIsStarted(true)` çağrılarak durum güncellenir ve ikinci görünüme geçilir. İkinci durumda, `VentHubCanvas` bileşeni kullanılarak bir 3D canvas oluşturulur. Canvas içinde `Suspense` ile sarmalanan `Model` bileşeni, verilen URL'den 3D modeli yükler; yükleme sırasında bir spinner gösterilir. `metadata.config.autoRotate` değerine göre canvas'ın `frameloop` modu `'always'` (sürekli render) veya `'demand` (talep üzerine render) olarak ayarlanır. `ContactShadows` bileşeni, `metadata.config.shadows` değeri `false` değilse zemin gölgeleri ekler. `OrbitControls` bileşeni, kullanıcının fareyle modeli döndürmesine olanak tanır; yatay kaydırma (`enablePan`) devre dışıdır ve dikey açı sınırları belirlenmiştir. Her iki görünüm de `motion.div` ile sarmalanarak opaklık animasyonu uygulanır. `useI18n` hook'u ile uluslararasılaştırma metinleri alınır.

**Parametreler**:
- `metadata`: `ThreeDAuthorityProps` tipinden gelen ve 3D model yapılandırmasını içeren nesne. Alt alanları kaynak kodundan tespit edildiği kadarıyla şunlardır:
  - `metadata.modelUrl`: `string` — Yüklenecek 3D modelin (GLB/GLTF) URL adresi.
  - `metadata.hotspots`: tipi kaynakta belirtilmemiş — Modele atanmış hotspot (sıcak nokta) verileri.
  - `metadata.config.autoRotate`: `boolean` — Modelin otomatik olarak dönüp dönmeyeceğini belirler. Varsayılan değeri `false` olarak kullanılır.
  - `metadata.config.initialZoom`: `number` — Kameranın başlangıç zoom mesafesi. Belirtilmezse `5` kullanılır.
  - `metadata.config.shadows`: `boolean` — Zemin gölgelerinin gösterilip gösterilmeyeceğini belirler. `false` olarak ayarlanmadığı sürece gölgeler gösterilir.
- `className`: `string` — Bileşenin kök elementine eklenecek ek CSS sınıf adları. Varsayılan değeri boş string (`''`) dir.

**Dönüş**: Kaynak kodunda dönüş tipi açıkça belirtilmemiştir. Fonksiyon, `isStarted` durumuna göre iki farklı JSX yapısı döndürür; her ikisi de `motion.div` ile sarmalanmış, animasyonlu ve stillendirilmiş bir konteynerdir. İlk durumda tıklanabilir bir placeholder, ikinci durumda 3D canvas içeren bir yapı döndürülür.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/media.types::type { ThreeDMetadata }
- import: ../products/3d/core::VentHubCanvas
- import: @/i18n/I18nProvider::useI18n
- import: framer-motion::motion
- import: react::React
- import: react::Suspense

---

## INTERFACES

### ThreeDAuthorityProps
- `metadata: ThreeDMetadata`
- `className?: string`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/authority/ThreeDAuthority.tsx::Model
- **params**: `url` (string), `hotspots` (ThreeDMetadata['hotspots'] opsiyonel)
- **ic_degiskenler**:
  - `scene` — useGLTF(url) ile elde edilen 3D sahne nesnesi; primitive bileşenine object prop'u olarak aktarılır
  - `spot` — hotspots dizisinin map döngüsündeki her bir elemanı; position, label ve description alanlarına erişilir
  - `idx` — hotspots dizisinin map döngüsündeki indeks numarası; Html bileşenine key prop'u olarak kullanılır
  - `spot.position` — hotspots elemanının 3D uzaydaki konumu; Html bileşenine position prop'u olarak aktarılır
  - `spot.label` — hotspots elemanının etiket metni; üst-case CSS sınıfıyla p etiketinde görüntülenir
  - `spot.description` — hotspots elemanının açıklama metni; varsa koşullu olarak p etiketinde görüntülenir
- **Dönüş**: JSX — group bileşeni içinde primitive ve hotspots haritası

### [N2_NASIL] AST Pointer: src/components/authority/ThreeDAuthority.tsx::ThreeDAuthority
- **params**: `metadata` (ThreeDAuthorityProps), `className` (string, varsayılan '')
- **ic_degiskenler**:
  - `t` — useI18n() ile elde edilen çeviri fonksiyonu; 'pdp.threeDAuthority.interactiveView', 'pdp.threeDAuthority.clickToInitialize', 'pdp.threeDAuthority.loadingModel', 'pdp.threeDAuthority.dragToRotate' anahtarlarıyla metin almak için kullanılır
  - `isStarted` — React.useState(false) ile oluşturulan boolean durum; 3D modelin başlatılıp başlatılmadığını kontrol eder
  - `setIsStarted` — isStarted durumunu güncelleyen setter fonksiyonu; onClick olayında true olarak çağrılır
  - `metadata.config?.autoRotate` — otomatik döndürme ayarı; true ise frameloop 'always', değilse 'demand' olur
  - `metadata.config?.initialZoom` — başlangıç yakınlaştırma mesafesi; yoksa 5 kullanılır, kamera position'ının z bileşenine aktarılır
  - `metadata.config?.shadows` — gölge ayarı; false değilse ContactShadows bileşeni render edilir
  - `metadata.modelUrl` — 3D model dosyasının URL'si; Model bileşenine url prop'u olarak aktarılır
  - `metadata.hotspots` — 3D model üzerindeki hotspot tanımları; Model bileşenine hotspots prop'u olarak aktarılır
- **Dönüş**: JSX — isStarted durumuna göre ya başlatma ekranı (motion.div) ya da 3D canvas (VentHubCanvas) render eder

---

## NODE ID STANDARD

  file: src\components\authority\ThreeDAuthority.tsx
  function: src\components\authority\ThreeDAuthority.tsx::Model
  function: src\components\authority\ThreeDAuthority.tsx::ThreeDAuthority

---

## DISA AKTARILANLAR (EXPORTS)
  export: Model
  export: ThreeDAuthority

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- `tracking-hvac-normal`

### Tailwind Sınıf Özeti
- **Renkler:** `bg-primary-navy`, `bg-slate-50`, `bg-white`, `bg-white/50`, `bg-white/90`, `border-2`, `border-primary-navy`, `border-slate-200`, `border-t-transparent`, `border-white`, `text-center`, `text-industrial-gray`, `text-slate-400`, `text-slate-500`, `text-steel-gray`
- **Layout:** `absolute`, `backdrop-blur-md`, `backdrop-blur-sm`, `bottom-4`, `flex`, `flex-col`, `group-hover:block`, `h-16`, `h-2`, `h-4`, `h-8`, `hidden`, `items-center`, `justify-center`, `left-4`
- **Varyant/Responsive:** `group-hover:` önekleri
- **Yardımcı Sınıflar:** `${className`, `animate-pulse`, `animate-spin`, `animate-spin-slow`, `border`, `cursor-pointer`, `font-black`, `font-bold`, `group`, `group-hover:scale-110`, `inset-0`, `leading-tight`, `mb-1`, `mb-2`, `mt-1`