---
name: threejs-webgl-performance
description: Three.js ve React Three Fiber (R3F) tabanlı 3D render performansını optimize etmek, draw call'ları azaltmak, gölge işlemeyi yönetmek ve Lighthouse mobil skorlarını yükseltmek için pratik kuralları sunar.
category: guards
metadata:
  triggers:
  - threejs performance
  - r3f render optimization
  - webgl optimization
  - 3d canvas lag
  inputs:
  - 3D Canvas settings
  - R3F component code
  outputs:
  - Performance optimization plan
  - Audit checklist
  commands:
    validate: python -c "import subprocess,sys; r=subprocess.run(['git','grep','-rn','frameloop','--','src/'],capture_output=True,text=True); lines=r.stdout.strip().split('\n') if r.stdout.strip() else []; violations=[l for l in lines if 'always' in l.lower() and 'demand' not in l.lower()]; print(f'Canvas frameloop check: {len(lines)} usages, {len(violations)} hardcoded-always'); sys.exit(1) if violations else print('PASS: No hardcoded frameloop=always')"
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# Three.js & R3F WebGL Performance Optimization Skill

Bu yetenek, VentHub HVAC projesinde yer alan 3D modellerin (özellikle kategori gösterimleri ve ürün detay stüdyolarındaki fan/cihaz modelleri) render performansını maksimize etmek ve Lighthouse mobil skorlarını (30-40 aralığından 90+ seviyesine) yükseltmek amacıyla tasarlanmıştır.

---

## 1. Ne Zaman Tetiklenmeli?
- Aşağıdaki 3D Canvas bileşenlerinde performans düşüşü, FPS kaybı veya mobil cihazlarda ısınma/kasılma şikayetleri olduğunda:
  - `src/components/products/3d/Product3DViewer.tsx` — Ana 3D ürün görüntüleyici
  - `src/components/products/OrbitalProductsShowcase.tsx` — Orbital ürün vitrini
  - `src/components/products/InfiniteProductsShowcase.tsx` — Sonsuz kaydırmalı ürün vitrini
  - `src/components/navigation/CategoryCard3D.tsx` — 3D kategori kartları
  - `src/components/navigation/CategorySpotlightScene.tsx` — Spotlight sahne bileşeni
  - `src/components/navigation/MegaMenu3DBackground.tsx` — Mega menü 3D arka planı
  - `src/components/products/Category3DIcon.tsx` — Kategori 3D ikon bileşeni
  - `src/components/products/BentPlaneGeometry.tsx` — Özel geometri bileşeni
  - `src/components/products/3d/types/` — 16+ fan modeli (AxialFanModel, CentrifugalFanModel, JetFanModel vb.)
  - `src/components/products/3d/parts/Impeller.tsx` — Dönen pervane parçası
  - `src/components/products/3d/factory/parts/InternalFanRotor.tsx` — Dönen rotor parçası
  - `src/components/products/3d/SmartCenterScale.tsx` — Akıllı ortalama/ölçekleme yardımcısı
  - `src/components/products/3d/AutoCenter.tsx` — Otomatik ortalama yardımcısı
  - `src/utils/three-utils.ts` — Paylaşılan Three.js yardımcı fonksiyonları
- React Three Fiber (`<Canvas>`) veya Three.js kodlarında değişiklik yapılması gerektiğinde.
- Mobil cihazlar için Lighthouse performans audits / web vitals kontrolleri yapıldığında.

---

## 2. Temel Performans Prensipleri

### A. İsteğe Bağlı Render (Rendering On Demand)
Standart bir 3D Canvas, saniyede 60 kez (60 FPS) sürekli yeniden çizilir. Kullanıcı sahneyle etkileşime girmediğinde veya sahne durağan olduğunda bu döngüyü çalıştırmak, mobil işlemcileri ve pilleri tüketir.
- **R3F Kuralı:** `<Canvas>` bileşeninde `frameloop="demand"` kullanarak render'ı sadece state veya props değiştiğinde ya da etkileşim olduğunda tetikleyin.
- **Kullanım Şekli:**
  ```tsx
  <Canvas 
    frameloop="demand"
    // Diğer ayarlar...
  >
  ```
- **Dinamik Invalidate:** Eğer sahnede animasyon yapılıyorsa veya kamera dönüyorsa, geçici olarak frameloop'u `always` yapabilir veya R3F'in `invalidate` metodunu çağırabilirsiniz.

### B. Geometri & Materyal Memoization (useMemo)
R3F JSX bileşenleri içerisinde inline yazılan diziler (örn: `args={[1, 32, 16]}`) her render'da yeni referans oluşturur. Bu durum R3F'in Three.js nesnelerini (Geometri/Materyal) her seferinde yok edip yeniden yaratmasına (reconstruct) yol açar. Bu işlem devasa bir çöp toplayıcı (Garbage Collector) yükü ve anlık donmalar (lag spike) yaratır.
- **Kural:** Tüm özel geometrileri, parametre dizilerini ve materyalleri `useMemo` ile sarmalayın veya component dışında tanımlayın.
- **Örnek:**
  ```tsx
  // Doğru yaklaşım:
  const bladeGeometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(shape, settings)
  }, [settings])
  
  return <mesh geometry={bladeGeometry} material={materials.matteBlack} />
  ```

### C. Gölge (Shadow) Optimizasyon Kuralları
Dinamik gölgeler, sahnenin her karede ışık gözünden tekrar çizilmesini (render pass) gerektirir. Mobil cihazlarda dinamik gölgeyi tamamen kapatmak veya statikleştirmek en kritik adımdır.
- **Project DNA Kuralı:** Proje standartları gereğince gölge haritalama türü kesinlikle `"percentage"` (ya da standarda göre ayarlanmış hali) olmalıdır:
  ```tsx
  <Canvas shadows="percentage">
  ```
- **BakeShadows (Drei):** Işıklar ve nesneler hareket etmiyorsa, Drei'nin `<BakeShadows />` bileşenini kullanarak gölgeleri ilk karede hesaplayıp dondurun.
- **ContactShadows:** Pahalı geometri gölgeleri yerine, zemin seviyesinde sahte gölge oluşturmak için Drei'nin `<ContactShadows />` bileşenini tercih edin.
  ```tsx
  <ContactShadows 
    position={[0, -1.5, 0]} 
    opacity={0.4} 
    scale={10} 
    blur={2} 
    far={3} 
  />
  ```

### D. Dinamik Ölçekleme & DPR (Device Pixel Ratio) Yönetimi
Mobil ekranlar yüksek piksel yoğunluğuna (retina/3x) sahiptir. Mobil cihazlarda DPR'ı 3 olarak ayarlamak, GPU'nun işlemesi gereken piksel sayısını 9 kat artırır.
- **Kural:** DPR değerini mobil cihazlarda en fazla 1.5 veya 2 ile sınırlandırın.
- **Çözüm:** `<Canvas dpr={[1, 1.5]}>` kullanarak mobil cihazlarda çözünürlüğü düşürün.
- **PerformanceMonitor (Drei):** FPS düştüğünde çözünürlüğü dinamik olarak düşüren yapıyı kurun:
  ```tsx
  import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'

  // Canvas içinde:
  <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)}>
    <AdaptiveDpr pixelated />
  </PerformanceMonitor>
  ```

### E. Draw Calls Azaltma (Instancing & Merging)
Özellikle kategori veya liste sayfalarında birden fazla aynı nesne çizileceği zaman Draw Call sayısını düşürmek gerekir.
- **Instances (Drei):** Aynı mesh'ten yüzlerce adet çizilecekse `<Instances>` ve `<Instance>` bileşenlerini kullanın.
- **Merged (Drei):** Farklı geometrileri tek bir çizim pass'inde birleştirmek için kullanın.

---

## 3. Performans Denetim Listesi (Audit Checklist)
1. [ ] Canvas bileşeninde `frameloop="demand"` tanımlı mı?
2. [ ] `args` propları veya geometriler her render'da yeniden oluşturuluyor mu (useMemo eksikliği)?
3. [ ] Gölgeler `<BakeShadows />` ile dondurulmuş mu veya `<ContactShadows />` mu kullanılıyor?
4. [ ] Mobil için `dpr={[1, 1.5]}` ayarı yapılmış mı?
5. [ ] `shadows="percentage"` kuralına uyulmuş mu?

---

## 4. VentHub Project-Specific Rules

### A. Dönen Parçalar ve Frameloop Yönetimi
Projede fiziksel olarak dönen parçalar içeren iki kritik bileşen bulunur:
- `src/components/products/3d/parts/Impeller.tsx` — Fan pervane animasyonu
- `src/components/products/3d/factory/parts/InternalFanRotor.tsx` — İç rotor animasyonu

**Kurallar:**
- Bu bileşenler aktif dönerken `frameloop="always"` gerekir; ancak animasyon durduğunda derhal `frameloop="demand"` moduna dönülmelidir.
- `useFrame` hook'u içinde gereksiz state güncellemelerinden kaçının; dönüş açısını doğrudan `ref.current.rotation` üzerinde mutasyonla güncelleyin:
  ```tsx
  useFrame((_, delta) => {
    // Directly mutate rotation — avoid setState to prevent re-renders
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * speed
    }
  })
  ```
- Dönen parça yokken (ör. statik model görünümü) `useFrame` hook'unun boşta çalışmadığından emin olun.

### B. Fan Model Tipleri — Instancing Adayları
`src/components/products/3d/types/` dizininde 16+ fan modeli (AxialFanModel, CentrifugalFanModel, JetFanModel vb.) yer alır. Bu modeller benzer geometri kalıplarını paylaşır.

**Kurallar:**
- Aynı sayfada birden fazla fan modeli listeleniyorsa (örn. `OrbitalProductsShowcase`, `InfiniteProductsShowcase`), tekrarlayan geometrileri `<Instances>` / `<Instance>` ile paylaştırarak draw call sayısını azaltın.
- Ortak malzemeleri (materyalleri) modüller arasında paylaşılan bir `materialCache` ile yönetin; her model kendi materyalini oluşturmamalıdır.
- Geometri karmaşıklığını kontrol edin: Liste/vitrin görünümlerinde LOD (Level of Detail) veya düşük-poly sürümler kullanın; detaylı geometri yalnızca `Product3DViewer` tek-ürün görünümünde yüklenmelidir.

### C. Paylaşılan Yardımcı Modüller — Memoization Kontrolü
Aşağıdaki yardımcı modüller birden fazla 3D bileşen tarafından tüketilir:
- `src/utils/three-utils.ts` — Paylaşılan Three.js hesaplama ve yardımcı fonksiyonları
- `src/components/products/3d/SmartCenterScale.tsx` — Dinamik ölçekleme/ortalama mantığı
- `src/components/products/3d/AutoCenter.tsx` — Otomatik ortalama hesaplaması

**Kurallar:**
- Bu modüllerdeki her fonksiyon ve hesaplama sonucu `useMemo` veya `useCallback` ile sarmalanmış olmalıdır.
- `three-utils.ts` içinde oluşturulan geçici Three.js nesneleri (Vector3, Matrix4, Box3 vb.) modül seviyesinde bir kez oluşturulmalı ve tekrar kullanılmalıdır (object pooling):
  ```ts
  // Module-level reusable objects — avoid per-call allocations
  const _tempVec3 = new THREE.Vector3()
  const _tempBox3 = new THREE.Box3()

  export function computeBounds(mesh: THREE.Mesh): THREE.Box3 {
    return _tempBox3.setFromObject(mesh)
  }
  ```
- `SmartCenterScale` ve `AutoCenter` bileşenleri bounding-box hesaplamalarını her frame'de değil, yalnızca model değiştiğinde yapmalıdır.

### D. Navigasyon 3D Bileşenleri — Ultra-Hafif Olmalı
Aşağıdaki bileşenler yüksek trafikli sayfalarda (ana sayfa, kategori listesi, mega menü) yer alır ve her sayfa yüklemesinde çalıştırılır:
- `src/components/navigation/CategoryCard3D.tsx`
- `src/components/navigation/CategorySpotlightScene.tsx`
- `src/components/navigation/MegaMenu3DBackground.tsx`
- `src/components/products/Category3DIcon.tsx`

**Kurallar:**
- Bu bileşenler **maksimum 500 üçgen** ve **tek bir draw call** hedeflemeli; karmaşık geometrilerden kaçınılmalıdır.
- `frameloop="demand"` zorunludur — kullanıcı etkileşimi (hover/scroll) olmadığında hiçbir render döngüsü çalışmamalıdır.
- Gölge (shadow) kesinlikle kullanılmamalıdır; derinlik hissi için CSS `box-shadow` veya basit `<ContactShadows>` ile sahte gölge oluşturulmalıdır.
- `MegaMenu3DBackground` gibi arka plan bileşenlerinde `<Canvas>` lazy-load (`React.lazy` + `Suspense`) ile yüklenmelidir; menü açılmadan 3D context oluşturulmamalıdır.
- DPR bu bileşenlerde `dpr={[1, 1]}` ile sınırlandırılmalı; retina çözünürlük gereksizdir.
- `BentPlaneGeometry.tsx` navigasyon bileşenlerinde kullanılıyorsa, geometrisi modül seviyesinde bir kez oluşturulup paylaşılmalıdır.

---

## 5. Proje Hafızası Aksiyomları (Digital Twin Rules)

> Aşağıdaki kurallar VentHub HVAC projesinin **sarsılmaz mimari aksiyomlarıdır**.
> Kaynakları: `project-dna.yaml`, SCADA Master, NotebookLM defterindeki L8/L10 denetim kayıtları ve Three.js R3F defteridir.
> Bu kurallardan herhangi birini ihlal etmek, kurumsal kalite kapılarından (L8 Lighthouse, L10 Next.js 15 Disiplini) FAIL almak demektir.

### AX-01: Click-to-Load Stratejisi (İlk Yükleme Maliyeti = Sıfır)
`ThreeDAuthority` ve tüm 3D ürün modelleri (JetFanModel, HRVModel, SilentChannelFanModel, Silencer vb.) sayfa açılışında **otomatik olarak yüklenmez**. Kullanıcı etkileşime geçmeden model dosyaları (GLB/GLTF) indirilmez. Bu strateji LCP koruması için zorunludur.

```tsx
// ThreeDAuthority — Click-to-Load pattern
// The 3D model is NOT fetched until user explicitly triggers load
<ThreeDAuthority metadata={metadata} className="content-auto" />
```

### AX-02: PCFSoftShadowMap — ❌ STRICT BLOCKED
React Three Fiber `<Canvas>` bileşenlerinde `PCFSoftShadowMap` kullanımı **kesinlikle ve istisnasız yasaktır**. Gölge haritalama türü yalnızca `'percentage'` olabilir. Bu kural `Product3DViewer`, `ThreeDAuthority`, `OrbitalProductsShowcase` ve tüm 3D sahneler için geçerlidir.

```tsx
// ✅ CORRECT — Only allowed shadow type
<Canvas shadows="percentage">

// ❌ BANNED — Will fail L8 Lighthouse audit
<Canvas shadows={{ type: THREE.PCFSoftShadowMap }}>
```

### AX-03: content-visibility: auto (.content-auto) Zorunluluğu
Sayfa dışı (below-the-fold) 3D Canvas bileşenlerinin viewport dışında render yükünü sıfırlamak ve LCP/FID/TBT performansını korumak için, sarmalayıcı elemanlara `.content-auto` CSS utility sınıfı **zorunlu** olarak eklenmelidir.

```tsx
// Wrapper must use content-auto for off-screen 3D canvases
<div className="content-auto">
  <Canvas shadows="percentage" frameloop="demand">
    {/* 3D scene content */}
  </Canvas>
</div>
```

### AX-04: CSP Beyaz Liste — 3D CDN İzinleri
`@react-three/drei` kütüphanesinin ve GLB/GLTF nesnelerinin dış kaynaklardan güvenle yüklenmesi için `next.config.mjs` içindeki `connect-src` CSP yönergesine aşağıdaki adresler **kalıcı olarak** eklenmiş olmalıdır:
- `raw.githubusercontent.com`
- `raw.githack.com`

Bu kuralı esnetmek veya kaldırmak, 3D modellerin CORS/CSP ihlali nedeniyle **sessizce çökmesine** neden olacağından kesinlikle yasaktır.

### AX-05: React 19 Compiler — useMemo/useCallback Sınırlandırması
React 19 Compiler performansı otomatik optimize ettiğinden, **yeni yazılacak basit UI bileşenlerinde** manuel `useMemo` ve `useCallback` kullanımı kısıtlanmıştır (gereksiz teknik borç). 

**İSTİSNA:** Gateway viewmodel'ları ve Context Provider'lar asenkron veri karmaşalarından ötürü bu kuraldan **muaf** tutulmuştur; bu katmanlarda `useMemo`/`useCallback` kullanılmaya devam edilmelidir.

> ⚠️ **DİKKAT:** Bu kural §2.B'deki genel "geometri memoization" kuralını geçersiz kılmaz.
> Three.js nesneleri (Geometri, Materyal, Vector3, BufferGeometry) React Compiler tarafından optimize **edilemez**;
> bu nesneler hâlâ `useMemo` ile korunmalıdır. Kısıtlama yalnızca sade JSX/prop hesaplamalarını kapsar.

### AX-06: drei/Image — Vitrin Doku Optimizasyonu
`InfiniteProductsShowcase` ve `OrbitalProductsShowcase` gibi çoklu ürün sergileyen 3D vitrinlerde, standart R3F doku yükleyicileri yerine **`drei/Image`** yapısı kullanılmalıdır. Bu yapı `next/image` performans ve lazy-loading standartlarını 3D sahne (canvas) içinde taklit ederek:
- Draw call sayısını azaltır
- Uyarlanabilir performans ölçeklemesi sağlar
- `getOptimizedImageUrl` yardımcı fonksiyonu ile doku boyutlarını optimize eder

### AX-07: R3F Ekosistem Kilidi (Kural 6)
Projede 3D model render ve optimizasyonu için saf Three.js DOM manipülasyonu veya farklı bir 3D motoru (Babylon.js, PlayCanvas vb.) **kullanılamaz**. Tüm optimizasyonlar yalnızca **React Three Fiber** ve `@react-three/drei` ekosistemi üzerinden yapılmak zorundadır.

### AX-08: Next.js 15 dynamic() + Suspense (React.lazy Yasağı)
Ağır 3D bileşenlerin tembel yüklenmesinde eski `React.lazy` API'si **kısıtlanmıştır**. Bunun yerine:
- Next.js'in `dynamic` import() fonksiyonu kullanılmalıdır
- Her dinamik import **mutlaka** `<Suspense fallback={<Skeleton />}>` ile sarmalanmalıdır
- Her `<Suspense>` alanı için görsel bir Skeleton bileşeni tanımlanmalıdır

```tsx
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Product3DViewerSkeleton } from '@/components/skeletons'

// Correct: Next.js dynamic import for 3D component
const Product3DViewer = dynamic(
  () => import('@/components/products/3d/Product3DViewer'),
  { ssr: false }
)

// Usage — always wrap with Suspense
<Suspense fallback={<Product3DViewerSkeleton />}>
  <Product3DViewer model={modelUrl} />
</Suspense>
```

### AX-09: Placeholder Wireframe Deseni
Kullanıcının 3D sahne indirilirken boş bir tuval görmesini engellemek için geçici 3B iskeletler kullanılmalıdır:
- **`PlaceholderWireframe`:** `OrbitalProductsShowcase` vb. sistemlerde gerçek model yüklenene kadar dönen tel kafes (wireframe) animasyonu gösterir.
- **`SuspendedCardMaterial`:** Doku (texture) ağ üzerinden indirilirken arka planda bekleyen geçici materyal bileşenidir; hover etkileşiminde ek efektler uygular.

### AX-10: Bellek Yönetimi ve Dispose Protokolü
Sahnede artık kullanılmayan 3D modellerin, `BufferGeometry` nesnelerinin ve materyallerin bellekten düzgün şekilde atılması (**dispose**) zorunludur. Aksi hâlde VRAM sızıntıları oluşur.

```tsx
// Always dispose geometry and materials when unmounting
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
    texture?.dispose()
  }
}, [geometry, material, texture])
```

Ağır geometri hesaplamaları (CSG, büyük BufferGeometry) uygulamanın donmasını engellemek için **Web Worker** (`WorkerPool`) veya `OffscreenCanvas` aracılığıyla arka plana taşınmalıdır.

### AX-11: Raycast Optimizasyonu — Bvh / meshBounds
Raycasting hesaplamalarının ana iş parçacığını bloke etmesini engellemek için Drei'nin sunduğu optimizasyon araçları kullanılmalıdır:
- **`Bvh`** (Bounding Volume Hierarchy): Karmaşık geometrilerde ışın izleme hızını dramatik şekilde artırır
- **`meshBounds`**: Basit bounding-sphere tabanlı raycast ile hızlı isabet kontrolü sağlar

```tsx
import { Bvh } from '@react-three/drei'

// Wrap interactive 3D objects for faster raycasting
<Bvh>
  <mesh onClick={handleClick}>
    <bufferGeometry />
    <meshStandardMaterial />
  </mesh>
</Bvh>
```

### AX-12: WebGPU / TSL Modernizasyon Farkındalığı
Three.js r165+ ile gelen `WebGPURenderer` ve TSL (Three.js Shading Language) desteği, gelecekte mevcut `WebGLRenderer`'ın yerini alacak teknolojilerdir. Yeni özel shader veya materyal yazılırken:
- **Node tabanlı materyaller** (`MeshStandardNodeMaterial` vb.) tercih edilmelidir
- Mevcut `WebGLRenderer` tabanlı kod korunabilir ancak yeni geliştirmelerde WebGPU uyumluluğu göz önünde bulundurulmalıdır
- Bu kural şu anda **farkındalık seviyesinde** olup zorunlu geçiş henüz planlanmamıştır
