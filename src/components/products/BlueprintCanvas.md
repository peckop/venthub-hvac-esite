---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\BlueprintCanvas.tsx
skeleton_hash: 4608b975f17d14cc
entity_hashes:
  func:BlueprintCanvas: b871a8b848648d7b
  func:CinematicCard: 7fb3fd44dcd5e71f
  overview: 385e4d7ea58dcd13
  style_tokens: 31f4acfd42638e52
generated_at: 2026-06-17T20:01:18Z
---

## Genel Bakış
Bu modül, ürünlerin görsel sunumunu güçlendirmek için kullanılan iki bağımsız ve odaklı React bileşenini içerir. Birincil amacı, ürün görsellerini farklı bağlamlarda (ana ürün vitrini veya öne çıkan kartlar) görsel olarak çekici ve etkileşimli bir şekilde sunmaktır.

## Fonksiyon Grupları
### Odaklanmış Ürün Görseli Bileşeni
Ürünün ana görselini veya teknik çizimini, genellikle ürün detay sayfalarında büyük ve temiz bir şekilde sergilemek için kullanılan temel bileşendir.
- BlueprintCanvas

### Etkileşimsel Vurgu Kartı
Ürün görsellerini veya promosyon görsellerini, 3D derinlik, animasyon ve holografik efektlerle zenginleştirerek öne çıkaran ve estetik bir vurgu yapan yardımcı bileşendir.
- CinematicCard

---

## AXIOMS – Mimari Varsayımlar
Bu modül, ürün görsellerini ve holografik efektleri sunmak için iki React bileşeni (CinematicCard ve BlueprintCanvas) kullanır.

[Aksiyom 1]: Eğer `CinematicCard` bileşenine geçilen `image` parametresi geçerli bir görsel URL'si (string) değilse, bileşen düzgün çalışmay

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
- import: ./3d/core::VentHubCanvas
- import: @react-three/drei::Float
- import: @react-three/drei::shaderMaterial
- import: @react-three/drei::useTexture
- import: @react-three/fiber::extend
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::Suspense
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

### [N1_NASIL] AST Pointer: `src/components/products/BlueprintCanvas.tsx`::CinematicCard
- **params**: `{ image }` — `image: string`, 3D kart üzerinde gösterilecek görselin URL/yolu
- **ic_degiskenler**:
  - `texture` — `useTexture(image)` hook'undan dönen THREE.Texture nesnesi; holographic malzemeye (`holographicMaterial`) `uTexture` uniform'u olarak bağlanan görsel dokudur
  - `meshRef` — `useRef<Mesh>(null)` ile oluşturulan React ref nesnesi; ana kart mesh'ine (`<mesh ref={meshRef}>`) referans verir, `useFrame` callback'i içinde rotasyon ve material erişimi için kullanılır
  - `x` — `state.mouse` destructuring'inden elde edilen yatay mouse pozisyonu (-1 ile 1 arası); `meshRef.current.rotation.y` hesaplamasında `MathUtils.lerp` ile yumuşak döndürme sağlamak için kullanılır
  - `y` — `state.mouse` destructuring'inden elde edilen dikey mouse pozisyonu (-1 ile 1 arası); `meshRef.current.rotation.x` hesaplamasında parallax tilt efekti yaratmak için kullanılır
  - `material` — `meshRef.current.material` ifadesinin `ShaderMaterial` olarak cast edilmiş hali; shader'ın `uTime` uniform'una erişerek frame bazlı zaman değerini güncellemek için kullanılır
- **Dönüş**: JSX — `<Float>` sarmalayıcısı içinde holographic image kartı ve arkasında ambient glow plane'inden oluşan 3D sahne

---

### [N2_NASIL] AST Pointer: `src/components/products/BlueprintCanvas.tsx`::BlueprintCanvas
- **params**: `{ image }` — `image: string`, ürün blueprint görselinin URL/yolu; `CinematicCard` bileşenine prop olarak iletilir
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan destructure edilen çeviri fonksiyonu; `t('products.blueprint.scanning')`, `t('products.blueprint.objectReference')`, `t('products.blueprint.cinematicMode')` çağrılarıyla UI üzerinde çoklu dil desteği sağlanan metinleri renderlamak için kullanılır
- **Dönüş**: JSX — tam sayfa genişliğinde, karanlıktech grid arka planlı, `VentHubCanvas` üzerinde `CinematicCard`'ı sarmalayan, köşelerde tech dekoratif HUD elemanları (tarama göstergesi, referans etiketi, cinematic mode etiketi) ve vignette overlay içeren Responsive container

---

### [N3_NASIL] AST Pointer: `src/components/products/BlueprintCanvas.tsx`::CinematicCard::useFrame_callback
- **params**: `{ state }` — `@react-three/fiber` tarafından her frame'de sunulan ` RootState` nesnesi; `state.mouse` ( fare pozisyonu) ve `state.clock` (animasyon saati) erişimi sağlar
- **ic_degiskenler**:
  - `x` — `state.mouse` destructuring'inden elde edilen yatay mouse pozisyonu; parallax Y-rotation hesaplamasında kullanılır
  - `y` — `state.mouse` destructuring'inden elde edilen dikey mouse pozisyonu; parallax X-rotation hesaplamasında kullanılır
  - `material` — `meshRef.current.material`'ın `ShaderMaterial` cast'ı; `material.uniforms.uTime.value` alanına `state.clock.getElapsedTime()` sonucu yazılarak shader zaman animasyonu güncellenir
- **Dönüş**: yok (side-effect: `meshRef.current.rotation.x`, `meshRef.current.rotation.y`, `material.uniforms.uTime.value` değerlerini her frame'de mutation ile günceller)

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