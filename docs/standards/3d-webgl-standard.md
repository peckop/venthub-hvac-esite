# VentHub 3D / WebGL Standardı (Cetvel)

> **Ne bu?** R3F (React Three Fiber) + Three.js tabanlı 3D katmanının **tek doğru kaynak (SSOT)**
> kuralları ve bunların **otomatik bekçileri (conformance kapıları, INV-3D-*)**. Cetvel = kural (insan:
> niçin/ne) · Kapı = zorlayıcı (makine: nasıl-doğru-kalır). "Güzel görünüyor" demez, **ölçer.**
> Oluşturma: 2026-06-16 · Sahibi: Recep · Nasıl-yapılır oyun kitabı → `.claude/skills/threejs-webgl-performance`
>
> **v1.2 (2026-06-18) — Sahne, Işık & Showroom UX entegrasyonu:** Bu sürümde, 3D stüdyo showroom
> kalitesi için belirlenen kamera-tabanlı stüdyo ışık değerleri, prosedürel environment/lightformer şeması
> ve rasyonel HVAC alıcı kararlarını hedefleyen bilgi paneli UX kuralları bu SSOT cetveline entegre edilmiştir.
>
> **Kaynaklar (bu cetvel hafızadan değil bunlardan damıtıldı):** NLM "4. THREE.JS / WEBGPU / AI 3D" defteri
> (three.js docs · @react-three/drei · **WebGPU W3C spec** · MDN) + web: [utsubo 100 tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips) ·
> [Codrops efficient three.js](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) ·
> [threedium e-commerce](https://threedium.io/3d-model/web-ecommerce) · [cylindo mobil](https://blog.cylindo.com/optimizing-3d-viewer-load-speed-for-mobile-first-shoppers) · [pmndrs drei `<View>`](http://drei.docs.pmnd.rs/portals/view)
> + W3C WCAG 2.2 ve CIE aydınlatma standartları + Nielsen Norman Group (3D Configurator Heuristics)
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
| **Işık & Environment** | kamera-tabanlı 3-nokta ışık ve prosedürel environment rig'i (drei `<Environment>` + `<Lightformer>` + `frames={1}`) | arkada gölge/kararma kalmasını önler; CDN bağımlılığı ve render VRAM yükü sıfırlanır |
| **PBR materyal** | merkezi metalness/roughness **token'ları** | per-ürün sihirli-sayı = tutarsız + bakımsız |
| **Asset** | tek model/asset **registry** (yol + Draco/KTX2 + geçerlilik); **decoder'lar YEREL** (`/public/decoders/…`) | dağınık string path → bozuk/eksik asset (dummy HDR); CDN decoder = CSP + çökme riski |
| **Kamera Geometrisi** | kilitli `cameraFOV: 45°` + mesafe `14` + yükseklik `1.5` | perspektif distorsiyonunu önler ve tüm vitrinde görsel parite sağlar |
| **Boyut Normalizasyonu** | otomatik bounding-box tabanlı `scale` normalizasyonu + `3dModelOffsets.ts` | HVAC ünitelerinin fiziksel boyut farklarını sanal ortamda dengeler |
| **Arayüz Kontrastı** | Glassmorphic arayüz paneli (`backdrop-filter: blur(16px)` + `%40 dark opacity`) | W3C WCAG 2.2 kontrast şartlarını 3D dinamik arka planlar önünde korur |
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
- **B3 — `frameloop="demand"` ve Geçiş Animasyonları:** Statik sahnelerde `frameloop="demand"` zorunludur (`invalidate()` ile tetiklenir). Ancak kamera pürüzsüz takip/lerp animasyonları yaparken (`lerp speed: 0.1` vb.), animasyon süresince `frameloop` geçici olarak reaktif şekilde `always` moduna alınmalı veya her karede `invalidate()` tetiklenmeli, animasyon bittiğinde tekrar `demand` moduna dönülmelidir. Tab gizliyse render durur. `useFrame` içinde nesne allocate etmek kesinlikle yasaktır (`new Vector3()` yok, temp nesne havuzu kullanılır). *([Codrops](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B4 — DPR cap: masaüstü 1.0 · mobil 1.5.** Drop'ta `AdaptiveDpr` + `PerformanceMonitor` ile DPR ×0.8. *(Mevcut `Product3DViewer` `dpr={[1,2]}` → mobilde fazla, düşürülecek.)* *([Codrops](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/))*
- **B5 — Gölge & Kamera-Tabanlı Işık:** `shadows="percentage"` (**`PCFSoftShadowMap` YASAK** — CLAUDE.md #9 / AX-02); ≤ **3 gerçek-zamanlı ışık**; statik gölge **bake** (`BakeShadows`/`<ContactShadows position={[0, -0.5, 0]} opacity={0.6} blur={2.5} far={2} scale={10} />` — B10 uyarınca normalize model tabanı `y = -0.5`'e yerleştirilmelidir). Dönen carousel'de ön yüz kararmasını önlemek için **ışıklar kamera aksına bağlı (camera-relative)** olmalıdır. Shadow map: mobil 512–1024 · masaüstü 1024–2048. *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B6 — Asset boyutu:** ürün başı ≤ 5–10MB · **ilk yük < 4MB**. **Draco** (geometri %80–95) + **KTX2/Basis** (GPU bellek %75–85, yük %40–50). Tekstür power-of-2, ≤4096 (mobil 256–512); texture memory < 100MB/ürün ailesi (tek 4K = 64MB VRAM). Pipeline: `gltf-transform` resize 2048 → UASTC (normal/ORM) → ETC1S (baseColor) → Draco edgebreaker → §6.3. **Decoder'lar yerel** (B6 ⊃ A2). *([threedium](https://threedium.io/3d-model/web-ecommerce) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips) · PART I §3)*
- **B7 — Yükleme:** below-fold **lazy** (`IntersectionObserver` / `content-visibility: auto` → `.content-auto`; AX-03); **progressive** (low-res 200–500ms içinde, high-res arka planda); model yüklenirken **PlaceholderWireframe** (CLS önler; AX-09); `useGLTF.preload`. Hedef: ilk render 150ms · 4G < 3s · terk eşiği 3.8s · dokunma gecikmesi < 20ms. *([threedium](https://threedium.io/3d-model/web-ecommerce) · [cylindo](https://blog.cylindo.com/optimizing-3d-viewer-load-speed-for-mobile-first-shoppers))*
- **B8 — Click-to-Load (ilk yük maliyeti = 0).** Ağır GLB modelleri sayfa açılışında **otomatik yüklenmez**; ancak kullanıcı etkileşimiyle (ör. "3D'yi yükle" butonu) indirilir → **LCP korunur**. *(AX-01; `ThreeDAuthority` deseni)*
- **B9 — Raycast hızlandırma.** Etkileşimli (tıklanan/hover) karmaşık mesh → drei `<Bvh>`; basit geometri → `meshBounds`. Ham raycast ana-thread'i kilitler. *(AX-11; drei `<Bvh>`)*
- **B10 — Bounding Box Normalizasyonu:** Farklı boyutlardaki HVAC modellerini vitrinde görsel olarak eşitlemek için yükleme anında modelin sınır kutusu (Bounding Box) hesaplanmalı ve çapı `1` birim olan sanal küreye sığacak şekilde otomatik ölçeklenmelidir. Ayrı ayrı scale çarpanları `3dModelOffsets.ts` üzerinden verilmelidir.

### C. Görsel Kalite / PBR
- **C1 — MeshStandard/MeshPhysical kullanan sahne → IBL/environment ZORUNLU.** Yoksa metalik (yüksek metalness) materyaller ortamdan ışık alamaz, **tamamen kararır.** *(three.js docs · drei `<Environment>`; canlı kanıt: Orbital/Infinite vitrinlerde environment yok → metaller donuk.)*
- **C2 — Color management & ACES Exposure:** sRGB output + ACESFilmic tone mapping; texture `colorSpace` doğru. ACES altında oluşan kararmayı telafi etmek için global **`toneMappingExposure: 1.3 - 1.5`** arasında ayarlanmalıdır. *(WebGPU spec: `getPreferredCanvasFormat` `rgba8unorm`/`bgra8unorm`; three.js Color Management)*
- **C3 — Materyal instance paylaş; shader variant minimize.** Aynı özellikteki tüm nesneler tek materyal referansı. *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **C4 — Üç-Noktalı Stüdyo Işık Konfigürasyonu:**
  * **Key Light:** Şiddet `1.8`, 4500K-5000K sıcak spot (`#FFF4E6`). Konum: `[5.5, 7.5, 9.5]` (Azimut: 30°, Yükseklik: 38°).
  * **Fill Light:** Şiddet `0.9`, 6500K-7500K soğuk dolgu (`#DBEAFE`). Konum: `[-7.0, 3.5, 7.5]` (Azimut: -43°, Yükseklik: 22°).
  * **Ambient Light:** Şiddet `0.85`, `#FFFFFF`.
  * **Key:Fill Şiddet Oranı:** 2:1.
- **C5 — Prosedürel Environment (IBL) Şeması:** CDN bağımlılığı olmaksızın yansımaları sağlamak için 4 adet Lightformer (Key, Fill, Rim, Top) rig'i kullanılmalıdır. GPU optimizasyonu için `<Environment>` bileşeninde `frames={1}` set edilmelidir.
- **C6 — Showroom UX & Bilgi Kartları:** 3D aydınlatma ve arayüz bütünüyle rasyonel B2B/B2C alım kararlarını tetiklemelidir:
  * Kademeli Açıklama (Progressive Disclosure) ve interaktif hotspots kullanımı esastır.
  * Bilgi panelinde öncelikli olarak **4 kilit HVAC metriği** gösterilmelidir: Hava Debisi ($m^3/h$), Toplam Verim (% / COP), Ses Güç Seviyesi ($dB(A)$), Elektriksel Güç ($kW$).
  * Panel arka planı metin okunabilirliğini garanti etmek için Glassmorphic (`backdrop-filter: blur(16px)` + `%40 dark opacity`) olmalıdır (W3C WCAG 2.2 uyumlu).
- **C7 — Mobil Arayüz ve Dokunma Sınırları:** Mobilde arayüz dikey kayan bir Bottom Sheet olarak açılmalı; 3D orbital döndürme alanı ile Bottom Sheet gestural alanları çakışmayacak şekilde touch collision sınırları ayrılmalıdır.

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
| **3D-1** | **Asset-geçerlilik** | asset registry | `3d-asset-validity.test` — her referans `.hdr/.glb` gerçek + geçerli + parse-edilebilir (boş/dummy/404 yakalanır) | statik + dosya-parse | ✅ canlı (`3d-asset-validity.test.ts`) |
| **3D-2** | **Tek-Canvas** | `<VentHubCanvas>` | `3d-single-canvas.test` — bir route ağacında >1 `<Canvas>` yasak | statik kaynak tarama | ✅ **KİLİTLİ** — allowlist boş (#374/#375/#379) |
| **3D-3** | **Dayanıklılık** | A1 | `3d-resilience.test` — asset-yükleyen her 3D bileşen Suspense+ErrorBoundary sarmalı | statik | 🔜 |
| **3D-4** | **Merkezi-config** | SSOT §1 | `3d-central-config.test` — ham `<Canvas>` / ad-hoc `<Environment files>` / sihirli-metalness / **CDN decoder yolu** yasak → paylaşılan sistem | statik | 🟡 kısmen — `3d-procedural-env.test.ts` canlı; tam central-config açık |
| **3D-5** | **CSP/origin** | D1 | `3d-csp.test` — dış 3D origin `next.config.mjs` whitelist'inde | statik config | ✅ canlı (`3d-csp.test.ts` — stale-guard zorunlu host + drift-catch) |
| **3D-6** | **Perf-bütçe** | B1–B6 | `renderer.info` draw-call/triangle bütçe izleme (runtime proxy) — **ödünç eşikleri burada ölçümle kalibre et** | runtime/build | ⚠️ açık borç (zor; başta uyarı) |
| **3D-7** | **Model-recipe** | B3 / C3 / §1 | `3d-model-recipe.test` — model/part'ta `useFrame` içi `new` allocate + inline sihirli `metalness:/roughness:` YASAK (RATCHET) | statik kaynak tarama | ✅ canlı (2 ratchet: FlexibleDuct useFrame-geo · DuctFan magic-PBR = worker'ın atladığı = sonraki punch-list) |

**Açık eksenleri kapatma yöntemi:** ajan **paralel audit** (`audit/3d-surfaces`, mevcut envanter) → merkezi sistem
(`<VentHubCanvas>` + prosedürel environment + yerel decoder) inşası → bileşen göçü → **yeni INV-3D testi** → commit.

---

## 4. DoD — Canlı 3D'de ASLA olmamalı / DAİMA olmalı
- [ ] Hiçbir 3D hatasında (404/bozuk asset, context-loss) **sayfa çökmez** — fallback render eder.
- [ ] Bir route'ta **tek Canvas**; çoklu yüzey `<View>` ile.
- [ ] Metalik materyaller environment'lı (kararmıyor).
- [ ] Draw call < 100 · mobil DPR ≤ 1.5 · ilk yük < 4MB · ≤3 dinamik ışık.
- [ ] Ağır model **click-to-load** (otomatik LCP'yi bozmuyor); decoder'lar **yerel**.
- [ ] Işıklar kameraya bağlı (camera-relative), orbital carousel dönüşlerinde ön yüz kararmıyor.
- [ ] Key:Fill şiddet oranı 2:1 ve Kelvin renk sıcaklıkları stüdyo standartlarında (`#FFF4E6` / `#DBEAFE`).
- [ ] Modeller sınır kutusu (Bounding Box) ile çapı `1` birim olan sanal küreye normalize edilip `3dModelOffsets.ts` ile ölçeklenmiş.
- [ ] Bilgi kartı glassmorphism (blur 16px, opacity %40) ile WCAG 2.2 contrast paritesine uygun.
- [ ] Showroom panelinde 4 temel HVAC metriği (Debi, Verim, Ses, Elektrik Gücü) öncelikli listelenmiş.
- [ ] Mobilde Bottom Sheet kullanılmış, touch gesture çakışmaları engellenmiş.
- [ ] `dispose` temiz (`<primitive>`/`useGLTF` elle) — `renderer.info` üzerinde sızıntı (artan geometries/textures) yok.
- [ ] Dış asset CSP whitelist + CORS + HTTPS; CDN decoder yolu yok.

---

## 5. Mevcut Durum (ajan audit'i tamamlayacak) + İlgili

**Şu anki 3D yüzeyleri (re-audit `2026-06-17` — `docs/audits/3d-surfaces-audit-2026-06-16.md` §0; conformance TEMİZ):**
- ✅ 36 dosya re-audit → **34 temiz**. Dalga 1-6 + 06-17 recipe işleri kapattı:
  - `Product3DViewer` · `ThreeDAuthority` · `OrbitalProductsShowcase` · `InfiniteProductsShowcase` ·
    `CategoryHubOverlay` · `MegaMenu3DBackground` → hepsi `VentHubCanvas` kabuğu (ResilientCanvasBoundary
    ErrorBoundary + prosedürel `SceneLightingRig` Environment) altında → A1/A2/C1/B4/B5 **çözüldü**.
  - Tüm leaf model/parça: useMemo geometri + unmount dispose + paylaşılan materyal (B3/A4/C3 temiz);
    `DomesticFanModel` → InstancedMesh. `CategoryCard3D` · `CategorySpotlightScene` **silinmiş**.
- ⚠️ Kalan: BlueprintCanvas A1 (Suspense — düzeltildi) · CategoryHubOverlay B3 minor (tartışmalı, doğrulanacak).
- ➡️ Conformance bitti; sıradaki 3D ekseni = **görsel/showroom** (tasarım-güdümlü), bu cetvelin §0 WOW + §6.4 tiny-planet vizyonu.
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

### 6.6 Kamera-Tabanlı Stüdyo Işık Rig'i ve Prosedürel Environment (B5 / C1 / C4 / C5)
```tsx
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, BakeShadows } from '@react-three/drei'
import * as THREE from 'three'

export function SceneLightingRig() {
  const lightGroupRef = useRef<THREE.Group>(null)

  // Işıkların yönünün kamerayla birlikte dönmesini veya kameraya bağlı kalmasını sağlar
  useFrame(({ camera }) => {
    if (lightGroupRef.current) {
      // Işıkları kameranın pozisyonu ve rotasyonuna kilitler (Camera-Relative)
      lightGroupRef.current.position.copy(camera.position)
      lightGroupRef.current.rotation.copy(camera.rotation)
    }
  })

  return (
    <>
      {/* Nötr ortam ışığı */}
      <ambientLight intensity={0.85} color="#ffffff" />

      {/* Kamera eksenine bağlı stüdyo 3-nokta ışıkları */}
      <group ref={lightGroupRef}>
        {/* Key Light (Sağ-Üst-Ön). FPS kaybını önlemek için castShadow=false seçilip
            gölgeler ContactShadows ile verilir ya da castShadow=true ile birlikte BakeShadows kullanılır */}
        <directionalLight
          castShadow
          intensity={1.8}
          position={[5.5, 7.5, 9.5]}
          color="#fff4e6" // 4500K warm hex
          shadow-mapSize={[1024, 1024]}
        />
        {/* Fill Light (Sol-Orta-Ön) */}
        <directionalLight
          intensity={0.9}
          position={[-7.0, 3.5, 7.5]}
          color="#dbeafe" // 6500K cool hex
        />
      </group>

      {/* B10 Bounding Box Normalizasyonu uyarınca zemin ve gölge y = -0.5 seviyesindedir */}
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.6}
        blur={2.5}
        far={2}
        scale={10}
      />

      {/* Gerçek zamanlı shadow map hesaplamasını dondurur ve tek karede sabitler (bake) */}
      <BakeShadows />

      {/* Prosedürel Environment / IBL (Tek seferlik bake: frames={1}) */}
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={2.0} position={[5, 4, 9]} scale={[10, 10, 1]} color="#fff4e6" />
        <Lightformer form="rect" intensity={1.6} position={[-6, 2, 6]} scale={[8, 8, 1]} color="#dbeafe" />
        <Lightformer form="rect" intensity={1.2} position={[0, 6, -6]} scale={[6, 2.5, 1]} color="#ffffff" />
        <Lightformer form="circle" intensity={1.0} position={[0, 8, 0]} scale={[6, 6, 1]} color="#ffffff" />
      </Environment>
    </>
  )
}
```

### 6.7 Model Boyut Normalizasyonu (B10)
```tsx
import * as THREE from 'three'

export function normalizeModelScale(scene: THREE.Group): number {
  const box = new THREE.Box3().setFromObject(scene)
  const sphere = new THREE.Sphere()
  box.getBoundingSphere(sphere)
  
  const diameter = sphere.radius * 2
  if (diameter === 0) return 1
  
  // Modeli 1 birimlik sanal bir küre içine sığacak şekilde ölçeklendir
  const scaleFactor = 1.0 / diameter
  scene.scale.setScalar(scaleFactor)
  
  // Modeli merkezle (pivot noktasını orta noktaya kaydır)
  const center = new THREE.Vector3()
  box.getCenter(center)
  scene.position.sub(center.multiplyScalar(scaleFactor))
  
  return scaleFactor;
}
```

### 6.8 Glassmorphic Showroom Arayüz Paneli (C6 / C7)
```css
/* Glassmorphism CSS standardı (3D Canvas üstünde yüksek kontrast ve okunabilirlik sağlar) */
.showroom-info-panel {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 380px;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.4); /* Koyu arkaplan + %40 saydamlık */
  backdrop-filter: blur(16px); /* 16px Blur ile W3C kontrast paritesi */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  color: #f8fafc;
  z-index: 10;
  pointer-events: auto; /* Tıklanabilir olmalı */
}

/* Mobilde Bottom Sheet tasarımı */
@media (max-width: 768px) {
  .showroom-info-panel {
    right: 0;
    bottom: 0;
    top: auto;
    transform: none;
    width: 100%;
    border-radius: 20px 20px 0 0;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(15, 23, 42, 0.65); /* Mobilde daha fazla yansıma kontrastı */
  }
}
```
