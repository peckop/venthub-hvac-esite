---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx
skeleton_hash: 0c0485d514a77465
entity_hashes:
  func:BlueprintCanvas: b871a8b848648d7b
  func:CinematicCard: 7fb3fd44dcd5e71f
  overview: 46250552be4be13b
  style_tokens: 31f4acfd42638e52
generated_at: 2026-06-14T22:20:14Z
---

## Genel Bakış
Bu modül, ürün bileşenleri içinde yer alan iki bağımsız React bileşenini barındırır. Ürün görsellerini ve mavi baskıları, farklı kullanım senaryolarına göre (örneğin ana galeri veya öne çıkan kartlar) görsel açıdan zengin ve çekici bir şekilde sunmak için tasarlanmıştır.

## Fonksiyon Grupları
### Ana Ürün Görseli Gösterimi
Ürünün temel görselini veya mavi baskı resmini, genellikle ürün detay sayfalarında ana odak noktası olarak sunmak için kullanılan temel bileşendir.
- BlueprintCanvas

### Sinematik Vurgu Kartı
Görselleri, animasyonlar ve holografik efektlerle zenginleştirerek, ürünün belirli özelliklerini veya promosyon görsellerini estetik bir kart formatında öne çıkarmak için kullanılan yardımcı bileşendir.
- CinematicCard

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### CinematicCard
**Ne yapar**: Bu fonksiyon, verilen bir görseli derinlik efekti, süzülme animasyonu ve holografik overlay (katman) ile sinematik bir 3D kart formatında render eder. Kullanıcıya interaktif ve görsel olarak zengin bir bileşen sunmayı amaçlar.

**Nasıl yapar**: Fonksiyon, React functional component yapısında tasarlanmıştır. `image` prop'u alarak başlar. İç mantığında, CSS transform ve animation özelliklerini (perspective, rotateX, rotateY, translateZ vb.) kullanarak 3D derinlik hissi yaratır. Hover veya其他 etkileşimlerle süzülme (floating) animasyonunu tetikleyebilir. Son olarak, yarı saydam bir holografik overlay efektini görselin üzerine bindirerek sinematik görünümü tamamlar.

**Parametreler**:
- image: string — 3D kart içinde gösterilecek görselin URL'si veya kaynak yolu.

**Dönüş**: `React.FC<{ image: string }>` tipinde bir React functional component döndürür.

### BlueprintCanvas
**Ne yapar**: Bu fonksiyon, bir mühendislik veya mimari plan (blueprint) görselini interaktif bir tuval (canvas) üzerinde göstermek ve muhtemelen üzerinde çizim veya vurgulama işlemleri yapmak için kullanılır.

**Nasıl yapar**: Fonksiyon, `BlueprintCanvasProps` arayüzünden türetilmiş prop'ları alır. Temel olarak bir `image` prop'u kullanarak arka planda bir mühendislik planı görseli yükler. Bu görseli bir `<canvas>` veya benzeri bir React bileşeni içinde render ederek, kullanıcının üzerinde yakınlaştırma, kaydırma veya çizim yapabilmesini sağlayacak interaktif bir alan oluşturur.

**Parametreler**:
- image: string — Blueprint tuvalinde arka plan olarak görüntülenecek mühendislik planı görselinin URL'si veya yolu.

**Dönüş**: `React.FC<BlueprintCanvasProps>` tipinde bir React functional component döndürür. `BlueprintCanvasProps` arayüzünün tam tanımı dış kaynakta yer almaktadır.

---

## İTHALATLAR (IMPORTS)
- import: ../../i18n/I18nProvider::useI18n
- import: @react-three/drei::Float
- import: @react-three/drei::shaderMaterial
- import: @react-three/drei::useTexture
- import: @react-three/fiber::Canvas
- import: @react-three/fiber::extend
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useRef
- import: three::MathUtils
- import: three::type { Mesh, ShaderMaterial,Texture }

---

## INTERFACES

### BlueprintCanvasProps
- `image: string`

---

## SABİTLER
- **HolographicMaterial** (call) — `shaderMaterial(
    {
        uTime: 0,
        uTexture: null,
        u...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/BlueprintCanvas.tsx::CinematicCard
- **params**: `{ image }` — Render edilecek ürün görselinin URL/path'i
- **ic_degiskenler**:
  - `texture` — `useTexture(image)` ile yüklenen Three.js texture nesnesi, holographic malzemeye `uTexture` uniform olarak bağlanır
  - `meshRef` — `useRef<Mesh>(null)` ile oluşturulan referans, ana kart mesh'ine bağlanır; `useFrame` içinde rotation ve material erişimi için kullanılır
- **Dönüş**: JSX — `Float` sarıcısı içinde holographic malzemeli bir düzlem kart (4×3 planeGeometry) ve arkasında ambient glow mesh'i (`[0, 0, -0.1]` pozisyonunda, `#0066ff` renkli, `0.1` opacity) içeren Three.js sahne düğümü; `useFrame` callback'i her frame'de `state.mouse` ile paralaks tilt uygular ve `material.uniforms.uTime.value`'i `state.clock.getElapsedTime()` ile günceller

---

### [N2_NASIL] AST Pointer: src/components/products/BlueprintCanvas.tsx::BlueprintCanvas
- **params**: `{ image }` — CinematicCard'a geçirilen ürün görselinin URL/path'i
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan alınan çeviri fonksiyonu; `t('products.blueprint.scanning')`, `t('products.blueprint.objectReference')`, `t('products.blueprint.cinematicMode')` çağrılarıyla çok dilli UI metinleri render eder
- **Dönüş**: JSX — Tam kapsamlı overlay yapısı: koyu tech-grid arka plan (`radial-gradient` dot pattern, `opacity-20`), `Canvas` içeren `CinematicCard` (kamera `position={[0,0,5]}`, `fov=45`, `dpr={[1,1.5]}`), köşe HUD dekoratif elemanları (sol üst: pulsing cyan dot + "scanning" etiketi, sol alt: çizgi + "objectReference" etiketi, sağ alt: "cinematicMode" etiketi + indicator bar), ve `shadow-inset-deep` vignette overlay'i

---

## NODE ID STANDARD

  file: src\components\products\BlueprintCanvas.tsx
  function: src\components\products\BlueprintCanvas.tsx::CinematicCard
  function: src\components\products\BlueprintCanvas.tsx::BlueprintCanvas

---

## DISA AKTARILANLAR (EXPORTS)
  export: BlueprintCanvas
  export: CinematicCard

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-cyan-500`, `bg-surface-darkest`, `bg-white/10`, `bg-white/20`, `border-white/5`, `text-cyan-500`, `text-right`, `text-slate-500`, `text-white`, `text-xs`
- **Layout:** `absolute`, `bottom-6`, `flex`, `flex-col`, `gap-1`, `gap-2`, `h-0.5`, `h-1.5`, `h-full`, `h-px`, `items-center`, `items-end`, `justify-between`, `justify-end`, `left-6`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`, `border`, `font-black`, `group`, `inset-0`, `leading-none`, `mt-1`, `opacity-20`, `pointer-events-none`, `rounded-3xl`, `rounded-full`, `tracking-widest`, `uppercase`