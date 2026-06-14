---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\authority\ThreeDAuthority.tsx
skeleton_hash: c9194246507cc7e5
entity_hashes:
  func:Model: cad84f3d7aa627bb
  func:ThreeDAuthority: c02b5265d94cfe82
  overview: 7857aa142adb4c56
  style_tokens: 79effa301ffb588d
generated_at: 2026-06-14T22:17:21Z
---

## Genel Bakış
Bu modül, 3‑boyutlu bir modelin tarayıcıda yüklenmesini ve model üzerinde etkileşimli noktaların (hotspot) gösterilmesini yöneten, üst seviye bir React bileşenidir. Dışarıdan veri (model URL'si ve hotspot tanımları) alıp, bu verileri 3D motoru ile arayüz arasını bağlayan bir “yönlendirici” (authority) işlevi görür.

## Fonksiyon Grupları
### Model Render ve Hotspot Yönetimi
Bu grup, asıl 3D sahnenin yüklenmesini ve model üzerine yerleştirilmiş hotspot işaretçilerinin render edilmesinden sorumludur.
- Model

### Üst‑Seviye Bileşen Sarmalayıcı
Bu grup, dış kaynaklardan gelen veri paketini (metadata) alır, gerekli dönüşümleri yapar ve altındaki Model bileşenine doğru prop'ları aktararak modülün dışarıya sunduğu tek bir arayüz oluşturur.
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
**Ne yapar**: ThreeDAuthority, bir HVAC ürününün gerçek 3D modelini (GLB/GLTF formatında) interaktif bir şekilde görüntülemek için kullanılır. Bileşen, performans optimizasyonu sağlamak amacıyla "Tıkla-Yükle" (Click-to-Load) stratejisini uygular; yani 3D model, kullanıcı bir yükleme ekranına tıklayana kadar tarayıcıda arka planda hazırlanmaz.

**Nasıl yapar**: Fonksiyon, `useI18n` hook'u ile çoklu dil desteğini, `React.useState` ile `isStarted` adlı bir durum değişkenini yönetir. Başlangıçta (`isStarted` false iken), `motion.div` ile animasyonlu bir placeholder (yükleme ekranı) döndürür. Bu ekranda "Tıkla ve Başlat" çağrısı ve loading animasyonu bulunur. Kullanıcı bu alana tıkladığında `setIsStarted(true)` çağrısı yapılır ve bileşen durumu değişir. Ardından `@react-three/fiber` kütüphanesinden gelen `Canvas` bileşeni içinde 3D sahne oluşturulur. `metadata.config` nesnesindeki değerler (`autoRotate`, `initialZoom`, `environment`, `shadows`) kullanılarak sahne özelleştirilir. `Model` bileşeni (`url` ve `hotspots` prop'ları ile) yüklenir, ortam aydınlatması ve gölgeler eklenir. `OrbitControls` ile kullanıcı etkileşimine (sürükleme, döndürme) izin verilir. `frameloop` prop'u, `autoRotate`true ise `'always'` (sürekli yeniden çizim), değilse `'demand'` (sadece etkileşimde yeniden çizim) olarak dinamik atanarak performans optimizasyonu yapılır.

**Parametreler**:
- `metadata`: `ThreeDAuthorityProps` tipindeki nesne. Bileşenin render edeceği 3D modelin ve yapılandırma ayarlarının tüm bilgilerini içerir.
    - `modelUrl`: `string` — GLB/GLTF formatındaki 3D model dosyasının URL'i.
    - `hotspots`: `any[]` — (Seçeneksel) Model üzerindeki interaktif bilgi noktaları.
    - `config`: `object` (Seçeneksel) — Sahne yapılandırma ayarları:
        - `autoRotate`: `boolean` — Otomatik döndürme aktif mi.
        - `initialZoom`: `number` — Başlangıç kamera mesafesi.
        - `environment`: `string` — Ortam haritası preset'i ('studio', 'sunset' vb.).
        - `shadows`: `boolean` — Gölgelerin gösterilip gösterilmeyeceği.
- `className`: `string` — (Varsayılan: `''`) Bileşenin dış sarmalayıcısına (wrapper) eklenecek CSS sınıf adı.

**Dönüş**: `JSX.Element` (veya `React.ReactNode`). Başlangıç durumuna göre animasyonlu bir yükleme ekranı veya tam interaktif 3D görüntüleyici JSX'i döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../types/media.types::type { ThreeDMetadata }
- import: @/i18n/I18nProvider::useI18n
- import: @react-three/fiber::Canvas
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

### [N1_NASIL] AST Pointer: src\components\authority\ThreeDAuthority.tsx::Model
- **params**: (url: string, hotspots?: ThreeDMetadata['hotspots'])
- **ic_degiskenler**:
  - `scene` — useGLTF(url) hook'undan dönen 3D model sahnesi. primitive elementine object olarak bağlanır
- **Dönüş**: JSX element (group içinde scene ve hotspot'lerin render ettiği yapı)

### [N2_NASIL] AST Pointer: src\components\authority\ThreeDAuthority.tsx::ThreeDAuthority
- **params**: (metadata: ThreeDAuthorityProps, className: string = '')
- **ic_degiskenler**:
  - `t` — useI18n() hook'undan dönen çeviri fonksiyonu. Metinleri çok dilli yapmak için kullanılır
  - `isStarted` — 3D modelin yüklenip yüklenmediğini takip eden boolean state
  - `setIsStarted` — isStarted state'ini güncellemek için setter fonksiyonu
- **Dönüş**: JSX element (isStarted false ise placeholder, true ise Canvas ile 3D görünüm)

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