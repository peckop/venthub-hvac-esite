---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\authority\ThreeDAuthority.tsx
skeleton_hash: 96b9bdf60e143cbe
entity_hashes:
  func:Model: cad84f3d7aa627bb
  func:ThreeDAuthority: 4f723bb2221e26f2
  overview: 1ca18e8f0d071f75
  style_tokens: 79effa301ffb588d
generated_at: 2026-08-27T08:25:40Z
---

## Genel Bakış
Bu modül, 3 boyutlu modelin tarayıcıda yüklenmesini ve model üzerinde etkileşimli noktaların (hotspot) gösterilmesini üstlenen bir React bileşenidir. Dışarıdan gelen model URL'si ve hotspot tanımlarını alıp 3D motoru ile arayüz arasında bir köprü görevi görür. Üst seviye bileşen olan `ThreeDAuthority`, dış kaynaklardan gelen veri paketini işleyerek alt bileşenine aktarır.

## Fonksiyon Grupları

### Model Render ve Hotspot Yönetimi
Bu grup, verilen URL adresindeki 3D modelin yüklenmesinden ve model üzerine yerleştirilmiş hotspot işaretçilerinin render edilmesinden sorumludur.
- Model

### Üst Seviye Bileşen Sarmalayıcı
Bu grup, dış kaynaklardan gelen veri paketini alır, gerekli dönüşümleri yapar ve altındaki `Model` bileşenine doğru özellikleri aktararak modülün dışarıya sunduğu tek bir arayüzü oluşturur.
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
**Ne yapar**: Gerçek 3D ürün modellerini (GLB/GLTF formatında) interaktif olarak kullanıcıya sunan bir React fonksiyonel bileşenidir. Performans optimizasyonu amacıyla "Click-to-Load" (yükleme için tıkla) stratejisini benimser; bu sayede sayfa yüklendiğinde ağır 3D model hemen render edilmez, kullanıcı tıkladığında başlatılır.

**Nasıl yapar**: Bileşen, `isStarted` adlı bir React state'i üzerinden iki farklı görünüm arasında geçiş yapar. İlk durumda (`isStarted === false`), Framer Motion kütüphanesinin `motion.div` bileşeniyle animasyonlu bir placeholder/CTA (harekete geçirici çağrı) ekranı gösterilir; bu ekranda dönen bir yükleme ikonu ve "etkileşimli görünümü başlatmak için tıklayın" mesajı yer alır. Kullanıcı bu alana tıkladığında `setIsStarted(true)` çağrılarak ikinci duruma geçilir. İkinci durumda (`isStarted === true`), `VentHubCanvas` bileşeni içerisine yerleştirilmiş bir Three.js/R3F (React Three Fiber) sahnesi render edilir. Bu sahne; `Suspense` ile sarılmış bir `Model` bileşeni (3D model yükleme), isteğe bağlı `ContactShadows` (gölge efekti) ve `OrbitControls` (kullanıcının fareyle modeli döndürmesini sağlayan kontrol) içerir. `VentHubCanvas`'a verilen `frameloop` parametresi, `metadata.config.autoRotate` değerine göre `'always'` (sürekli render) veya `'demand'` (talep üzerine render) olarak ayarlanır; bu, otomatik döndürme aktif değilse gereksiz render döngülerini önleyerek performans kazandırır. Kamera pozisyonu ve görüş açısı (FOV) `metadata.config.initialZoom` ve sabit değerlerle yapılandırılır. `OrbitControls` bileşeninde yatay kaydırma (pan) devre dışı bırakılmış, dikey döndürme açısı `Math.PI / 4` ile `Math.PI / 1.5` arasında sınırlandırılmıştır. Model yüklenirken `Suspense`'ın `fallback` prop'u aracılığıyla bir yükleme göstergesi (spinner ve metin) görüntülenir. Ekranın sol alt köşesinde, kullanıcının fareyle sürükleyerek döndürebileceğini belirten bir yardım metni yer alır. Tüm metinler `useI18n()` hook'u ile uluslararasılaştırma (i18n) desteği kullanılarak render edilir.

**Parametreler**:
- `metadata`: `ThreeDAuthorityProps` tipinde — 3D modelin yapılandırma verilerini içerir. Alt alanları kaynak koddan tespit edildiği kadarıyla şunlardır: `metadata.modelUrl` (yüklenecek 3D model dosyasının URL'si), `metadata.hotspots` (model üzerindeki etkileşimli noktalar), `metadata.config.autoRotate` (modelin otomatik dönüp dönmeyeceği, boolean), `metadata.config.initialZoom` (kameranın başlangıç yakınlaştırma mesafesi, sayı), `metadata.config.shadows` (gölge efektinin gösterilip gösterilmeyeceği, boolean; `false` olarak ayarlanmadığı sürece gölgeler gösterilir).
- `className`: `string` — Bileşenin kök DOM elemanına uygulanacak ek CSS sınıf adları. Varsayılan değeri boş string (`''`) dir.

**Dönüş**: JSX elementi döndürür. `isStarted` durumuna göre ya bir `motion.div` placeholder'ı ya da `VentHubCanvas` içeren tam bir 3D sahne yapısı render eder. Fonksiyonun açık bir dönüş tipi belirtilmemiştir; bu bir React fonksiyonel bileşeni olduğundan dönüş tipi `React.ReactElement` (JSX) olarak değerlendirilir.

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

### [N1_NASIL] AST Pointer: ThreeDAuthority.tsx::Model
- **params**: `url` (string), `hotspots` (ThreeDMetadata['hotspots'] opsiyonel)
- **ic_degiskenler**:
  - `scene` — `useGLTF(url)` çağrısıyla elde edilen 3D sahne nesnesi; `<primitive object={scene} />` ile render edilir
  - `spot` — `hotspots` dizisinin `.map()` içindeki her bir elemanı; `spot.position`, `spot.label`, `spot.description` alanlarına erişilir
  - `idx` — `hotspots` dizisinin `.map()` içindeki indeks numarası; `<Html key={idx}>` olarak kullanılır
- **Dönüş**: JSX — `<group>` içinde `<primitive>` ve hotspots haritası

### [N2_NASIL] AST Pointer: ThreeDAuthority.tsx::ThreeDAuthority
- **params**: `metadata` (ThreeDAuthorityProps), `className` (string, varsayılan `''`)
- **ic_degiskenler**:
  - `t` — `useI18n()` çağrısıyla elde edilen çeviri fonksiyonu; `'pdp.threeDAuthority.interactiveView'`, `'pdp.threeDAuthority.clickToInitialize'`, `'pdp.threeDAuthority.loadingModel'`, `'pdp.threeDAuthority.dragToRotate'` anahtarlarıyla metinleri çözer
  - `isStarted` — `React.useState(false)` ile oluşturulan boolean state; 3D modelin başlatılıp başlatılmadığını belirler
  - `setIsStarted` — `isStarted` state'ini güncelleyen setter fonksiyonu; `onClick={() => setIsStarted(true)}` ile tetiklenir
  - `metadata.config?.autoRotate` — opsiyonel boolean; `frameloop` ve `OrbitControls autoRotate` değerlerini belirler
  - `metadata.config?.initialZoom` — opsiyonel sayı; kamera z pozisyonu olarak kullanılır, yoksa `5` varsayılır
  - `metadata.config?.shadows` — opsiyonel; `false` değilse `<ContactShadows>` render edilir
  - `metadata.modelUrl` — string; `<Model url={metadata.modelUrl}>` prop'u olarak aktarılır
  - `metadata.hotspots` — opsiyonel dizi; `<Model hotspots={metadata.hotspots}>` prop'u olarak aktarılır
- **Dönüş**: JSX — `isStarted` durumuna göre ya tıklama ekranı (`motion.div` ile placeholder) ya da `<VentHubCanvas>` içinde 3D model render'ı

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