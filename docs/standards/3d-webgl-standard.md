# VentHub 3D / WebGL Standardı (Cetvel)

> **Ne bu?** R3F (React Three Fiber) + Three.js tabanlı 3D katmanının **tek doğru kaynak (SSOT)**
> kuralları ve bunların **otomatik bekçileri (conformance kapıları, INV-3D-*)**. Cetvel = kural (insan:
> niçin/ne) · Kapı = zorlayıcı (makine: nasıl-doğru-kalır). "Güzel görünüyor" demez, **ölçer.**
> Oluşturma: 2026-06-16 · Sahibi: Recep · Nasıl-yapılır oyun kitabı → `.claude/skills/threejs-webgl-performance`
>
> **v1.1 (2026-06-16) — birleştirme:** Bu cetvel artık **tek 3D SSOT**. İkinci bir LLM'in bağımsız
> ürettiği `world_class_design_standards.md` **PART I** (WebGPU/TSL · BatchedMesh/InstancedMesh ·
> `gltf-transform` pipeline · recursive dispose kodu · AX-01..12 aksiyomları) **buraya emildi**: kural/eşik/kapı
> §0–§4'te (otorite), somut kod §6'da (uygulama). Örtüşen teknikler iki kaynakta **hemfikir** çıktı
> (InstancedMesh/BatchedMesh · Draco+KTX2 · dispose · `frameloop` · `shadows="percentage"`) → yön çift-doğrulandı.
> *(Not: o dokümanın PART II'si = UI/UX tasarım alanı, AYRI cetvel; buraya dahil DEĞİL.)*
>
> **Kaynaklar (bu cetvel hafızadan değil bunlardan damıtıldı):** NLM "4. THREE.JS / WEBGPU / AI 3D" defteri
> (three.js docs · @react-three/drei · **WebGPU W3C spec** · MDN) + web: [utsubo 100 tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips) ·
> [Codrops efficient three.js](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) ·
> [threedium e-commerce](https://threedium.io/3d-model/web-ecommerce) · [cylindo mobil](https://blog.cylindo.com/optimizing-3d-viewer-load-speed-for-mobile-first-shoppers) · [pmndrs drei `<View>`](http://drei.docs.pmnd.rs/portals/view)
> + **ikinci kaynak damıtması:** `world_class_design_standards.md` PART I (gltf-transform CLI · TSL node API · BatchedMesh).
>
> **Eşik kalibrasyonu (dürüstlük notu):** Aşağıdaki sayısal bütçeler (draw call <100, ilk yük <4MB, üçgen
> aralıkları…) sektör best-practice **kural-of-thumb**'larıdır; **bizim asset'lerimizde/cihazlarımızda ölçülmüş
> v1 başlangıç hedefleridir.** `audit/3d-surfaces` denetimi + Lighthouse + INV-3D-6 (`renderer.info`) bunları
> gerçek ölçümle **sertleştirecek** — "kanıtlanmış VentHub gerçeği" değil, ölçülecek hedef olarak oku.

---

## 0. Yönetici İlke

3D, enterprise vitrinin **WOW'u** ama aynı zamanda **en kırılgan katman**. İki mutlak vardır:

1. **ASLA ÇÖKME.** Bir asset 404/bozuk olsa, GPU context kaybolsa, bellek dolsa bile **3D alt-ağacı zarifçe
   düşer, SAYFA çökmez.** (Canlı kanıt: `Product3DViewer`'a konan 42 byte'lık bozuk dummy HDR tüm sayfayı
   `Context Lost` ile çökertti — bu cetvel tam olarak bunu imkânsız kılmak için var.)
2. **Performans bütçeden gelir, sonradan temizlikten değil.** Bütçe tasarım anında konur; "demo güzel oldu,
   sonra optimize ederiz" = anti-pattern. ([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))

Bir kural "önemli + kolay ihlal + gözle zor yakalanır" ise → **kapı (test) ister**, code-review'a bırakılmaz.
**Bu cetvel aynı zamanda showroom + tiny-planet vizyonunun temelidir:** tek Canvas + `<View>` portalları +
prosedürel environment + perf bütçeleri = o deneyimlerin altyapısı. (Tiny-planet'in teknik çekirdeği =
TSL vertex-displacement shader → §6.4.)

---

## 1. SSOT Katmanları (merkezi — tek doğru kaynak)

| Alan | Tek Doğru Kaynak | Niçin |
|---|---|---|
| **Canvas/renderer config** | tek `<VentHubCanvas>` sarmalayıcı (DPR · shadow · frameloop · colorSpace · toneMapping tek yerden) | her bileşenin kendi config'i = drift + tutarsız görsel |
| **Işık & Environment** | tek **prosedürel** environment (drei `<Environment>` + `<Lightformer>` rig) + ortak ışık preset'i | dosya/CDN bağımlılığı = çökme/yavaşlık; metal IBL'siz kararır |
| **PBR materyal** | merkezi metalness/roughness **token'ları** | per-ürün sihirli-sayı = tutarsız + bakımsız |
| **Asset** | tek model/asset **registry** (yol + Draco/KTX2 + geçerlilik); **decoder'lar YEREL** (`/public/decoders/…`) | dağınık string path → bozuk/eksik asset (dummy HDR); CDN decoder = CSP + çökme riski |
| **Çoklu yüzey** | **TEK** `<Canvas>` + drei `<View>` (gl.scissor) | çoklu Canvas → context limiti → Safari en eskiyi atar → çökme |

---

## 2. Mutlak Kurallar (ihlal = mimari hata) — *kural · neden · ölçülebilir eşik · kaynak*

### A. Asla-Çökme / Dayanıklılık
- **A1 — Her asset Suspense + ErrorBoundary içinde.** Hata 3D alt-ağacını düşürür, sayfayı değil; fallback UI +
  retry/reset. *(React error boundaries; [MDN/forum](https://discourse.threejs.org/t/context-lost-when-i-route-to-another-page-in-react-three-fiber/61736))*
- **A2 — Kritik render yolunda yüklenip-bozulabilen dosya/CDN bağımlılığı YASAK.** Prosedürel environment tercih
  edilir; dosya zorunluysa **fallback + geçerlilik kontrolü** şart. **Draco/KTX2 decoder wasm'leri de yerel
  barındırılır** (`/public/decoders/`), CDN'den değil. *(dummy HDR çökmesi tam bu ihlaldi.)*
- **A3 — Context-loss kurtarma.** `webglcontextlost`/`webglcontextrestored` dinle + `WEBGL_lose_context.restoreContext()`. Eşik: context kaybı → sayfa **çökmez**, kendini toparlar. *([MDN](https://developer.mozilla.org/docs/Web/API/WEBGL_lose_context/restoreContext))*
- **A4 — `dispose()` zorunlu.** Unmount'ta geometry/material/texture/renderTarget bellekten temizlenir; GLTF için `texture.source.data.close?.()`. **R3F yalnız declaratif (`<boxGeometry/>`) nesneleri otomatik temizler; `<primitive object={...}>` ve `useGLTF` global cache'i ELLE** recursive dispose ister → §6.1. Sık aç/kapa yerine `visible={false}` (VRAM realloc'ı önler). Sızıntı = birikmiş context = kayıp. *(three.js docs · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **A5 — TEK Canvas.** Bir route'ta birden fazla `<Canvas>`/Renderer örneği yasak → çoklu yüzey drei `<View>` ile. *(Safari context limiti; [pmndrs](https://github.com/pmndrs/react-three-fiber/discussions/2457))*
- **A6 — (WebGPU geleceği)** `WebGPURenderer` async init (`await renderer.init()` → §6.4); `pushErrorScope`/`popErrorScope` + `uncapturederror` dinleyici + `GPUDevice.lost` recovery; hatalar "bulaşıcı" (contagious), merkezi yakala. Custom shader → ham GLSL string DEĞİL, **TSL Node Material** (WebGL'e de düşer). *(WebGPU W3C spec · MDN · ikinci-kaynak PART I §1)*

### B. Performans Bütçeleri
- **B1 — Draw call < 100/frame** (e-ticaret 50–100). **> 500 yasak** (güçlü GPU bile zorlanır). Araç seçimi:
  **`InstancedMesh`** = çok sayıda **aynı** geometri (bütün-ya-hiç frustum cull) · **`BatchedMesh`** = **farklı**
  geometriler tek draw call (per-instance frustum cull, pre-allocate `[maxInstance, maxVertex, maxIndex]`) ·
  drei `<Instances>/<Merged>` = declaratif sarmalayıcı · `BufferGeometryUtils.merge` (statik) · texture atlas ·
  vitrin tekstürleri için **drei `<Image>`** (basit texture loader değil; AX-06). Karar matrisi + kod → §6.2.
  Draw call **üçgenden daha kritik.** *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips) · [threedium](https://threedium.io/3d-model/web-ecommerce) · PART I §2)*
- **B2 — Üçgen bütçesi:** mobil 1–2k · web LOD 5–15k · konfigüratör ≤50k · adaptif 500–50k (cihaza göre); mutlak tavan <1–2M. LOD: drei `<Detailed>` (büyük sahnede +%30-40 FPS), mesafe 0/50/100m. *([threedium](https://threedium.io/3d-model/web-ecommerce) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B3 — `frameloop="demand"`** (statik sahne; `invalidate()` ile tetikle). Tab gizliyse render dur (`visibilitychange`). `useFrame` içinde **allocate YASAK** (`new Vector3()` yok) → **modül-seviye temp nesne havuzu** (AX-10, §6.5); animasyon React state ile değil `useFrame` mutasyonuyla; daima `delta`. *([Codrops](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B4 — DPR cap: masaüstü 1.0 · mobil 1.5.** Drop'ta `AdaptiveDpr` + `PerformanceMonitor` ile DPR ×0.8. *(Mevcut `Product3DViewer` `dpr={[1,2]}` → mobilde fazla, düşürülecek.)* *([Codrops](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/))*
- **B5 — Gölge:** `shadows="percentage"` (**`PCFSoftShadowMap` YASAK** — CLAUDE.md #9 / AX-02); ≤ **3 gerçek-zamanlı ışık**; statik gölge **bake** (`BakeShadows`/`ContactShadows`); dinamik shadow-map recalc 0–1. Shadow map: mobil 512–1024 · masaüstü 1024–2048 · kritik 4096. PointLight gölgesi = 6 render. *(Mevcut kod `shadow-mapSize={2048}` masaüstü-tamam/mobil-ağır.)* *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B6 — Asset boyutu:** ürün başı ≤ 5–10MB · **ilk yük < 4MB**. **Draco** (geometri %80–95) + **KTX2/Basis** (GPU bellek %75–85, yük %40–50). Tekstür power-of-2, ≤4096 (mobil 256–512); texture memory < 100MB/ürün ailesi (tek 4K = 64MB VRAM). Pipeline: `gltf-transform` resize 2048 → UASTC (normal/ORM) → ETC1S (baseColor) → Draco edgebreaker → §6.3. **Decoder'lar yerel** (B6 ⊃ A2). *([threedium](https://threedium.io/3d-model/web-ecommerce) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips) · PART I §3)*
- **B7 — Yükleme:** below-fold **lazy** (`IntersectionObserver` / `content-visibility: auto` → `.content-auto`; AX-03); **progressive** (low-res 200–500ms içinde, high-res arka planda); model yüklenirken **PlaceholderWireframe** (CLS önler; AX-09); `useGLTF.preload`. Hedef: ilk render 150ms · 4G < 3s · terk eşiği 3.8s · dokunma gecikmesi < 20ms. *([threedium](https://threedium.io/3d-model/web-ecommerce) · [cylindo](https://blog.cylindo.com/optimizing-3d-viewer-load-speed-for-mobile-first-shoppers))*
- **B8 — Click-to-Load (ilk yük maliyeti = 0).** Ağır GLB modelleri sayfa açılışında **otomatik yüklenmez**; ancak kullanıcı etkileşimiyle (ör. "3D'yi yükle" butonu) indirilir → **LCP korunur**. *(AX-01; `ThreeDAuthority` deseni)*
- **B9 — Raycast hızlandırma.** Etkileşimli (tıklanan/hover) karmaşık mesh → drei `<Bvh>`; basit geometri → `meshBounds`. Ham raycast ana-thread'i kilitler. *(AX-11; drei `<Bvh>`)*

### C. Görsel Kalite / PBR
- **C1 — MeshStandard/MeshPhysical kullanan sahne → IBL/environment ZORUNLU.** Yoksa metalik (yüksek metalness) materyaller ortamdan ışık alamaz, **tamamen kararır.** *(three.js docs · drei `<Environment>`; canlı kanıt: Orbital/Infinite vitrinlerde environment yok → metaller donuk.)*
- **C2 — Color management:** sRGB output + ACESFilmic tone mapping; texture `colorSpace` doğru. *(WebGPU spec: `getPreferredCanvasFormat` `rgba8unorm`/`bgra8unorm`; three.js Color Management)*
- **C3 — Materyal instance paylaş; shader variant minimize.** Aynı özellikteki tüm nesneler tek materyal referansı. *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*

### D. Güvenlik
- **D1 — Dış GLTF/GLB/image origin-clean + CORS + HTTPS.** `crossOrigin` etiketi; CSP `connect-src` whitelist (`raw.githubusercontent.com`, `raw.githack.com` — CLAUDE.md #9 / AX-04 ile uyumlu, **kaldırma**). WebGPU origin-clean olmayan kaynakta `SecurityError` fırlatır. *(WebGPU W3C spec §3.9)*
- **D2 — Güvenilmeyen model yükleme yok;** (SaaS) asset yükleme **tenant-scoped.**

### E. SaaS / Multi-tenant
- **E1 — 3D yüzey teması/branding tenant'a göre çözülür;** asset/registry tenant-scoped (data bleeding = felaket, CLAUDE.md #12 ile uyumlu).

### F. React / Next.js Entegrasyonu
- **F1 — Ağır 3D = `next/dynamic` + `ssr:false` + `<Suspense fallback={<Skeleton/>}>`** (React.lazy DEĞİL). Ana rotalarda `ssr:false` CLAUDE.md #4 ile sadece **etkileşimli uç** 3D bileşende. *(AX-08)*
- **F2 — React 19 Compiler:** UI düğümlerini elle `useMemo/useCallback` etme. **İSTİSNA:** Three.js çekirdek nesneleri (`BufferGeometry`, `Material`, matrisler) Compiler tarafından izlenmez → her render'da yeniden yaratılmasın diye **elle memoize ZORUNLU.** *(AX-05)*
- **F3 — R3F/drei ekosistem kilidi.** React yaşam döngüsü dışında ham Three.js DOM manipülasyonu yasak; tüm WebGL/WebGPU R3F + `@react-three/drei` üstüne. *(AX-07 · CLAUDE.md #9)*

---

## 3. Conformance Kapıları — Drift Eksenleri (INV-3D-*)

> **3D testleri i18n gibi tam-statik değil** — bir kısmı **runtime/asset-parse**. Bu "farklı TÜR test" tam da
> kabul ettiğimiz nokta. Her eksen bir bug-sınıfı; kapısı olan **kalıcı kapalı**.

| # | Eksen | SSOT | Kapı (bekçi) | Tür | Durum |
|---|---|---|---|---|---|
| **3D-1** | **Asset-geçerlilik** | asset registry | `3d-asset-validity.test` — her referans `.hdr/.glb` gerçek + geçerli + parse-edilebilir (boş/dummy/404 yakalanır) | statik + dosya-parse | 🔜 (dummy HDR'ı yakalardı) |
| **3D-2** | **Tek-Canvas** | `<VentHubCanvas>` | `3d-single-canvas.test` — bir route ağacında >1 `<Canvas>` yasak | statik kaynak tarama | 🔜 |
| **3D-3** | **Dayanıklılık** | A1 | `3d-resilience.test` — asset-yükleyen her 3D bileşen Suspense+ErrorBoundary sarmalı | statik | 🔜 |
| **3D-4** | **Merkezi-config** | SSOT §1 | `3d-central-config.test` — ham `<Canvas>` / ad-hoc `<Environment files>` / sihirli-metalness / **CDN decoder yolu** yasak → paylaşılan sistem | statik | 🔜 |
| **3D-5** | **CSP/origin** | D1 | `3d-csp.test` — dış 3D origin `next.config.mjs` whitelist'inde | statik config | 🔜 |
| **3D-6** | **Perf-bütçe** | B1–B6 | `renderer.info` draw-call/triangle bütçe izleme (runtime proxy) — **ödünç eşikleri burada ölçümle kalibre et** | runtime/build | ⚠️ açık borç (zor; başta uyarı) |

**Açık eksenleri kapatma yöntemi:** ajan **paralel audit** (`audit/3d-surfaces`, mevcut envanter) → merkezi sistem
(`<VentHubCanvas>` + prosedürel environment + yerel decoder) inşası → bileşen göçü → **yeni INV-3D testi** → commit.

---

## 4. DoD — Canlı 3D'de ASLA olmamalı / DAİMA olmalı
- [ ] Hiçbir 3D hatasında (404/bozuk asset, context-loss) **sayfa çökmez** — fallback render eder.
- [ ] Bir route'ta **tek Canvas**; çoklu yüzey `<View>` ile.
- [ ] Metalik materyaller environment'lı (kararmıyor).
- [ ] Draw call < 100 · mobil DPR ≤ 1.5 · ilk yük < 4MB · ≤3 dinamik ışık.
- [ ] Ağır model **click-to-load** (otomatik LCP'yi bozmuyor); decoder'lar **yerel**.
- [ ] `dispose` temiz (`<primitive>`/`useGLTF` elle) — `renderer.info` üzerinde sızıntı (artan geometries/textures) yok.
- [ ] Dış asset CSP whitelist + CORS + HTTPS; CDN decoder yolu yok.

---

## 5. Mevcut Durum (ajan audit'i tamamlayacak) + İlgili

**Şu anki 3D yüzeyleri (ilk harita — `2026-06-16`; tam envanter `audit/3d-surfaces` ile gelecek):**
- `Product3DViewer` — `<Environment files="/env/city_256.hdr">` **bozuk dummy** + Suspense/ErrorBoundary DIŞINDA → **çökme** (A1/A2 ihlali). FanRenderer yüksek metalness.
- `OrbitalProductsShowcase` · `InfiniteProductsShowcase` — **environment YOK**, sadece düz ışık → metaller kararık (C1 ihlali).
- `ThreeDAuthority` — `<Environment preset="studio">` (CDN) → çalışır ama dış bağımlılık (A2 risk).
- 6 nav 3D (CategoryCard3D, MegaMenu3DBackground...) — perf sprint'inde Environment söküldü.
> **Ajanın `parallel-file-audit` skill'i** (39 dosya, `audit-rules.json` deterministik kapısı) tam envanteri +
> merkezîleştirme dalga-roadmap'ini üretecek; sonuç buraya (§5) işlenir + B6/INV-3D-6 sayıları **gerçek asset
> ölçümüyle kalibre edilir.**

**İlgili:** CLAUDE.md Kural #9 (R3F+Drei only · gölge `percentage` · GLB CDN CSP) · `.claude/skills/threejs-webgl-performance` · `i18n-localization-standard.md` (kardeş cetvel deseni) · memory `3d-roadmap-crash-then-standards` · komşu vizyon: 3D showroom (roadmap §1-L) + tiny-planet/curved-world (§6.4 TSL shader).

---

## 6. Uygulama Desenleri (kod ekleri) — "nasıl" katmanı

> Otorite (eşik + kapı) §0–§4'te; burası **referans uygulama**. Bu desenler ikinci kaynağın
> (`world_class_design_standards.md` PART I) damıtmasıdır — **decoder yolları bilinçle yerel-host'a çevrildi**
> (A2/B6: CDN bağımlılığı = çökme + CSP genişletme riski).

### 6.1 Recursive dispose (A4) — `<primitive>` / `useGLTF` için
R3F declaratif nesneleri otomatik temizler; **ham `<primitive>` ve global cache ELLE** ister:
```tsx
export function disposeSceneObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry?.dispose()
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const mat of mats) {
      if (!mat) continue
      for (const key of Object.keys(mat)) {
        const v = (mat as Record<string, unknown>)[key]
        if (v && typeof (v as THREE.Texture).dispose === 'function' && (v as THREE.Texture).isTexture) {
          (v as THREE.Texture).dispose()
        }
      }
      mat.dispose()
    }
  })
}
// useEffect cleanup: return () => disposeSceneObject(modelScene)
// useGLTF.clear(path) yalnız JS cache referansını siler — VRAM için yukarıdaki dispose ŞART.
// Sık aç/kapa yerine: <group visible={isVisible}><primitive .../></group>
```

### 6.2 Draw call (B1) — InstancedMesh vs BatchedMesh
| | `InstancedMesh` | `BatchedMesh` |
|---|---|---|
| Geometri | **aynı** | **farklı** geometriler |
| Frustum cull | bütün-ya-hiç | **per-instance** |
| Kullan | binlerce aynı nesne | farklı ürün parçaları tek draw call |
```tsx
// InstancedMesh: useFrame içinde temp Object3D havuzu (B3/AX-10), her frame setMatrixAt + needsUpdate.
// BatchedMesh: pre-allocate → <batchedMesh args={[maxInstance, maxVertex, maxIndex]} />, addGeometry/addInstance.
// Declaratif kısayol:
import { Instances, Instance } from '@react-three/drei'
<Instances limit={100} castShadow><boxGeometry /><meshStandardMaterial />
  <Instance position={[0,0,0]} /><Instance position={[2,1,-2]} />
</Instances>
// Vitrin tekstürleri (Orbital/Infinite): basit texture loader DEĞİL → drei <Image /> (AX-06).
```

### 6.3 Asset pipeline (B6) — `gltf-transform` + YEREL decoder
```bash
# Sıralı sıkıştırma (KTX-Software/toktx PATH'te olmalı):
gltf-transform resize  in.glb  s1.glb --width 2048 --height 2048
gltf-transform uastc   s1.glb  s2.glb --level 4 --rdo --zstd 18 \
  --slots "{normalTexture,occlusionTexture,metallicRoughnessTexture}"   # yüksek kalite: normal/ORM
gltf-transform etc1s   s2.glb  s3.glb --level 2 --quality 128 --slots "baseColorTexture"  # yüksek sıkıştırma: baseColor
gltf-transform draco   s3.glb  out.glb --method edgebreaker --quantizePosition 14 --quantizeNormal 10
# Tek komut alternatifi: gltf-transform optimize in.glb out.glb --texture-compress ktx2
```
```tsx
// Decoder'lar YEREL (public/), CDN DEĞİL → A2 (çökme) + CSP genişletme riski yok:
const DRACO_PATH = '/decoders/draco/'     // public/decoders/draco/  (gstatic CDN değil)
const KTX2_PATH  = '/decoders/basis/'     // public/decoders/basis/  (jsdelivr CDN değil)
const { scene } = useGLTF(modelUrl, DRACO_PATH, KTX2_PATH)
useGLTF.preload('/models/hvac_fan.glb', DRACO_PATH, KTX2_PATH)
```

### 6.4 WebGPU / TSL (A6) — tiny-planet vertex-displacement çekirdeği
```tsx
// Async renderer init (WebGL2 fallback otomatik):
import * as THREE from 'three/webgpu'
<Canvas gl={async (props) => { const r = new THREE.WebGPURenderer(props); await r.init(); return r }}>
// Custom shader = ham GLSL string DEĞİL → TSL Node Material (WebGPU→WGSL, WebGL→GLSL derler):
import { Fn, positionLocal, time, vec3 } from 'three/tsl'
const waveNode = Fn(() => {                          // tiny-planet/curved-world çekirdeği
  const p = positionLocal
  const wave = p.y.mul(4.0).add(time).sin().mul(0.15)
  return vec3(p.x.add(wave), p.y, p.z)
})
// <meshStandardNodeMaterial positionNode={waveNode()} />
// NOT: TSL içinde JS if/for ÇALIŞMAZ → If/Loop/select() kullan.
```

### 6.5 Object pooling (B3/AX-10) — GC spike önleme
```tsx
// Modül kapsamı: bir kez yarat, frame'lerde yeniden kullan (useFrame içinde new YASAK):
const _tmpVec3 = new THREE.Vector3()
const _tmpBox3 = new THREE.Box3()
export const getMeshBounds = (mesh: THREE.Mesh) => _tmpBox3.setFromObject(mesh)
```
