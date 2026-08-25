---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\wt-supurme\src\components\products\BlueprintCanvas.tsx
skeleton_hash: 607d86de4a3e9980
entity_hashes:
  func:BlueprintCanvas: b871a8b848648d7b
  func:CinematicCard: 7fb3fd44dcd5e71f
  overview: 4cbade83072ab96e
  style_tokens: 31f4acfd42638e52
generated_at: 2026-08-25T07:26:03Z
---

## Genel Bakış

BlueprintCanvas modülü, ürün görsellerini sergilemek için kullanılan React bileşenlerini içerir. Modül, sinematik bir kart görünümü sunan alt bileşen ve ana canvas bileşeni olmak üzere iki bileşenden oluşur. Her iki bileşen de görsel girdisi alarak görüntüleme işlemini gerçekleştirir.

## Fonksiyon Grupları

### Görüntüleme Bileşenleri

Bu grup, ürün görsellerini kullanıcı arayüzünde göstermekten sorumludur. Bileşenler görsel girdisi alarak render işlemi yapar.

- CinematicCard, BlueprintCanvas

### Notlar

- CinanticCard, sinematik bir kart görünümü sağlayan yardımcı bir bileşendir
- BlueprintCanvas, ana bileşen olup BlueprintProps tipinde yapılandırma alır
- Her iki bileşen de image parametresi aracılığıyla görsel girdisi kabul eder
- Modül React kütüphanesine bağımlıdır

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdeleri verilmediğinden, modülün doğru çalışması için gerekli koşullar belirlenememektedir. Yalnızca fonksiyon imzaları (`CinematicCard`, `BlueprintCanvas`) ve bir sabit (`HolographicMaterial`) mevcut olup, gövde mantığı bilinmemektedir.

---

## FONKSİYON DETAYLARI

### CinematicCard
**Ne yapar**: Sinematik 3D kart bileşenidir. Verilen görseli derinlik efekti, süzülme animasyonu ve holografik katman ile birlikte render eder. Üç boyutlu bir kart görünümü oluşturarak görseli öne çıkarır.

**Nasıl yapar**: Bileşen, aldığı `image` prop'u aracılığıyla bir görsel URL'si alır ve bu görseli sinematik bir 3D kart içinde görüntüler. Kart, derinlik hissi veren gölgelendirme ve perspektif efektleri, sürekli süzülme (floating) animasyonu ve holografik bir katman (holographic overlay) ile zenginleştirilmiştir. Bu efektler birlikte çalışarak kartın fiziksel dünyada var olan üç boyutlu bir nesne gibi görünmesini sağlar.

**Parametreler**:
- image: string — Kart üzerinde gösterilecek görselin URL adresi

**Dönüş**: React.FC<{ image: string }> — `image` prop'u alan bir React fonksiyonel bileşeni döndürür.

### BlueprintCanvas
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

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

### [N1_NASIL] AST Pointer: src/components/products/BlueprintCanvas.tsx::CinematicCard
- **params**: `{ image }` — kart üzerinde gösterilecek görselin dosya yolu veya URL'si
- **ic_degiskenler**:
  - `texture` — `useTexture(image)` ile yüklenen Three.js Texture nesnesi; `holographicMaterial` bileşeninin `uTexture` prop'una aktarılır
  - `meshRef` — `useRef<Mesh>(null)` ile oluşturulan referans; ana kart mesh'ine atanır ve `useFrame` içinde rotasyon güncellemeleri için kullanılır
- **Dönüş**: JSX — `<Float>` bileşeni içinde `<group>`; bu group iki `<mesh>` içerir: birincisi `planeGeometry` + `holographicMaterial` ile ana kart, ikincisi `planeGeometry` + `meshBasicMaterial` ile arka plan ambient glow

### [N2_NASIL] AST Pointer: src/components/products/BlueprintCanvas.tsx::CinematicCard::useFrame callback
- **params**: `(state)` — `@react-three/fiber`'ın `useFrame` hook'u tarafından her karede sağlanan state nesnesi
- **ic_degiskenler**:
  - `state` — frame state nesnesi; `mouse` ve `clock` alt nesnelerini içerir
  - `state.mouse` — fare pozisyonunu tutan nesne
  - `x` — `state.mouse.x` değerinden destructured edilen yatay fare koordinatı; `meshRef.current.rotation.y` hesaplamasında kullanılır
  - `y` — `state.mouse.y` değerinden destructured edilen dikey fare koordinatı; `meshRef.current.rotation.x` hesaplamasında kullanılır
  - `meshRef.current` — mevcut mesh referansı; null kontrolü yapıldıktan sonra rotasyon ve materyal erişimi için kullanılır
  - `meshRef.current.rotation.x` — mesh'in X ekseni rotasyonu; `MathUtils.lerp` ile `-y * 0.2` hedef değerine yumuşak geçişle güncellenir
  - `meshRef.current.rotation.y` — mesh'in Y ekseni rotasyonu; `MathUtils.lerp` ile `x * 0.2` hedef değerine yumuşak geçişle güncellenir
  - `material` — `meshRef.current.material` değerinin `ShaderMaterial` tipine cast edilmiş hali
  - `material.uniforms` — shader uniform değişkenleri nesnesi
  - `material.uniforms.uTime` — shader zaman uniform'u; `state.clock.getElapsedTime()` değeriyle güncellenir
- **Dönüş**: yok — yan etki: her karede mesh rotasyonunu parallax etkisiyle günceller ve shader zaman uniform'unu ilerletir

### [N3_NASIL] AST Pointer: src/components/products/BlueprintCanvas.tsx::BlueprintCanvas
- **params**: `{ image }` — 3D sahnedeki CinematicCard bileşenine aktarılacak görsel kaynağı
- **ic_degiskenler**:
  - `t` — `useI18n()` hook'undan gelen çeviri fonksiyonu; `'products.blueprint.scanning'`, `'products.blueprint.objectReference'` ve `'products.blueprint.cinematicMode'` anahtarlarıyla UI metinlerini yerelleştirmek için kullanılır
- **Dönüş**: JSX — `div` kapsayıcı içinde: koyu arka plan grid deseni, `VentHubCanvas` bileşeni (`preset="showcase"`, `frameloop="always"`, `camera={{ position: [0, 0, 5], fov: 45 }}`) içinde `Suspense` ile sarılmış `CinematicCard`, sol üst köşede tarama göstergesi, sol alt köşede nesne referans etiketi, sağ alt köşede sinematik mod etiketi ve dekoratif çizgi elemanları, en üstte inset gölge overlay'i

---

## NODE ID STANDARD

  file: BlueprintCanvas.tsx
  function: BlueprintCanvas.tsx::CinematicCard
  function: BlueprintCanvas.tsx::BlueprintCanvas

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