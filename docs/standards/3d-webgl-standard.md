# VentHub 3D / WebGL Standardı (Cetvel)

> **Ne bu?** R3F (React Three Fiber) + Three.js tabanlı 3D katmanının **tek doğru kaynak (SSOT)**
> kuralları ve bunların **otomatik bekçileri (conformance kapıları, INV-3D-*)**. Cetvel = kural (insan:
> niçin/ne) · Kapı = zorlayıcı (makine: nasıl-doğru-kalır). "Güzel görünüyor" demez, **ölçer.**
> Oluşturma: 2026-06-16 · Sahibi: Recep · Nasıl-yapılır oyun kitabı → `.claude/skills/threejs-webgl-performance`
> **Kaynaklar (bu cetvel hafızadan değil bunlardan damıtıldı):** NLM "4. THREE.JS / WEBGPU / AI 3D" defteri
> (three.js docs · @react-three/drei · **WebGPU W3C spec** · MDN) + web: [utsubo 100 tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips) ·
> [Codrops efficient three.js](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) ·
> [threedium e-commerce](https://threedium.io/3d-model/web-ecommerce) · [cylindo mobil](https://blog.cylindo.com/optimizing-3d-viewer-load-speed-for-mobile-first-shoppers) · [pmndrs drei `<View>`](http://drei.docs.pmnd.rs/portals/view).

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
prosedürel environment + perf bütçeleri = o deneyimlerin altyapısı.

---

## 1. SSOT Katmanları (merkezi — tek doğru kaynak)

| Alan | Tek Doğru Kaynak | Niçin |
|---|---|---|
| **Canvas/renderer config** | tek `<VentHubCanvas>` sarmalayıcı (DPR · shadow · frameloop · colorSpace · toneMapping tek yerden) | her bileşenin kendi config'i = drift + tutarsız görsel |
| **Işık & Environment** | tek **prosedürel** environment (drei `<Environment>` + `<Lightformer>` rig) + ortak ışık preset'i | dosya/CDN bağımlılığı = çökme/yavaşlık; metal IBL'siz kararır |
| **PBR materyal** | merkezi metalness/roughness **token'ları** | per-ürün sihirli-sayı = tutarsız + bakımsız |
| **Asset** | tek model/asset **registry** (yol + Draco/KTX2 + geçerlilik) | dağınık string path → bozuk/eksik asset (dummy HDR) |
| **Çoklu yüzey** | **TEK** `<Canvas>` + drei `<View>` (gl.scissor) | çoklu Canvas → context limiti → Safari en eskiyi atar → çökme |

---

## 2. Mutlak Kurallar (ihlal = mimari hata) — *kural · neden · ölçülebilir eşik · kaynak*

### A. Asla-Çökme / Dayanıklılık
- **A1 — Her asset Suspense + ErrorBoundary içinde.** Hata 3D alt-ağacını düşürür, sayfayı değil; fallback UI +
  retry/reset. *(React error boundaries; [MDN/forum](https://discourse.threejs.org/t/context-lost-when-i-route-to-another-page-in-react-three-fiber/61736))*
- **A2 — Kritik render yolunda yüklenip-bozulabilen dosya/CDN bağımlılığı YASAK.** Prosedürel environment tercih
  edilir; dosya zorunluysa **fallback + geçerlilik kontrolü** şart. *(dummy HDR çökmesi tam bu ihlaldi.)*
- **A3 — Context-loss kurtarma.** `webglcontextlost`/`webglcontextrestored` dinle + `WEBGL_lose_context.restoreContext()`. Eşik: context kaybı → sayfa **çökmez**, kendini toparlar. *([MDN](https://developer.mozilla.org/docs/Web/API/WEBGL_lose_context/restoreContext))*
- **A4 — `dispose()` zorunlu.** Unmount'ta geometry/material/texture/renderTarget bellekten temizlenir; GLTF için `texture.source.data.close?.()`. Sızıntı = birikmiş context = kayıp. *(three.js docs · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **A5 — TEK Canvas.** Bir route'ta birden fazla `<Canvas>`/Renderer örneği yasak → çoklu yüzey drei `<View>` ile. *(Safari context limiti; [pmndrs](https://github.com/pmndrs/react-three-fiber/discussions/2457))*
- **A6 — (WebGPU geleceği)** `pushErrorScope`/`popErrorScope` + `uncapturederror` dinleyici + `GPUDevice.lost` recovery; hatalar "bulaşıcı" (contagious), merkezi yakala. *(WebGPU W3C spec · MDN)*

### B. Performans Bütçeleri
- **B1 — Draw call < 100/frame** (e-ticaret 50–100). **> 500 yasak** (güçlü GPU bile zorlanır). Araçlar: `InstancedMesh` (10+ aynı nesne), `BatchedMesh` (aynı materyal farklı geometri), `BufferGeometryUtils.merge` (statik), texture atlas. Draw call **üçgenden daha kritik.** *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips) · [threedium](https://threedium.io/3d-model/web-ecommerce))*
- **B2 — Üçgen bütçesi:** mobil 1–2k · web LOD 5–15k · konfigüratör ≤50k · adaptif 500–50k (cihaza göre); mutlak tavan <1–2M. LOD: drei `<Detailed>` (büyük sahnede +%30-40 FPS), mesafe 0/50/100m. *([threedium](https://threedium.io/3d-model/web-ecommerce) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B3 — `frameloop="demand"`** (statik sahne; `invalidate()` ile tetikle). Tab gizliyse render dur (`visibilitychange`). `useFrame` içinde **allocate YASAK** (`new Vector3()` yok); animasyon React state ile değil `useFrame` mutasyonuyla; daima `delta`. *([Codrops](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B4 — DPR cap: masaüstü 1.0 · mobil 1.5.** Drop'ta `AdaptiveDpr` + `PerformanceMonitor` ile DPR ×0.8. *(Mevcut `Product3DViewer` `dpr={[1,2]}` → mobilde fazla, düşürülecek.)* *([Codrops](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/))*
- **B5 — Gölge:** ≤ **3 gerçek-zamanlı ışık**; statik gölge **bake** (`BakeShadows`/`ContactShadows`); dinamik shadow-map recalc 0–1. Shadow map: mobil 512–1024 · masaüstü 1024–2048 · kritik 4096. PointLight gölgesi = 6 render. *(Mevcut kod `shadow-mapSize={2048}` masaüstü-tamam/mobil-ağır.)* *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B6 — Asset boyutu:** ürün başı ≤ 5–10MB · **ilk yük < 4MB**. **Draco** (geometri %80–95) + **KTX2/Basis** (GPU bellek %75–85, yük %40–50). Tekstür power-of-2, ≤4096 (mobil 256–512); texture memory < 100MB/ürün ailesi (tek 4K = 64MB VRAM). *([threedium](https://threedium.io/3d-model/web-ecommerce) · [utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*
- **B7 — Yükleme:** below-fold **lazy** (`IntersectionObserver` / `content-visibility`); **progressive** (low-res 200–500ms içinde, high-res arka planda); `useGLTF.preload`. Hedef: ilk render 150ms · 4G < 3s · terk eşiği 3.8s · dokunma gecikmesi < 20ms. *([threedium](https://threedium.io/3d-model/web-ecommerce) · [cylindo](https://blog.cylindo.com/optimizing-3d-viewer-load-speed-for-mobile-first-shoppers))*

### C. Görsel Kalite / PBR
- **C1 — MeshStandard/MeshPhysical kullanan sahne → IBL/environment ZORUNLU.** Yoksa metalik (yüksek metalness) materyaller ortamdan ışık alamaz, **tamamen kararır.** *(three.js docs · drei `<Environment>`; canlı kanıt: Orbital/Infinite vitrinlerde environment yok → metaller donuk.)*
- **C2 — Color management:** sRGB output + ACESFilmic tone mapping; texture `colorSpace` doğru. *(WebGPU spec: `getPreferredCanvasFormat` `rgba8unorm`/`bgra8unorm`; three.js Color Management)*
- **C3 — Materyal instance paylaş; shader variant minimize.** Aynı özellikteki tüm nesneler tek materyal referansı. *([utsubo](https://www.utsubo.com/blog/threejs-best-practices-100-tips))*

### D. Güvenlik
- **D1 — Dış GLTF/GLB/image origin-clean + CORS + HTTPS.** `crossOrigin` etiketi; CSP `connect-src` whitelist (`raw.githubusercontent.com`, `raw.githack.com` — CLAUDE.md #9 ile uyumlu, **kaldırma**). WebGPU origin-clean olmayan kaynakta `SecurityError` fırlatır. *(WebGPU W3C spec §3.9)*
- **D2 — Güvenilmeyen model yükleme yok;** (SaaS) asset yükleme **tenant-scoped.**

### E. SaaS / Multi-tenant
- **E1 — 3D yüzey teması/branding tenant'a göre çözülür;** asset/registry tenant-scoped (data bleeding = felaket, CLAUDE.md #12 ile uyumlu).

---

## 3. Conformance Kapıları — Drift Eksenleri (INV-3D-*)

> **3D testleri i18n gibi tam-statik değil** — bir kısmı **runtime/asset-parse**. Bu "farklı TÜR test" tam da
> kabul ettiğimiz nokta. Her eksen bir bug-sınıfı; kapısı olan **kalıcı kapalı**.

| # | Eksen | SSOT | Kapı (bekçi) | Tür | Durum |
|---|---|---|---|---|---|
| **3D-1** | **Asset-geçerlilik** | asset registry | `3d-asset-validity.test` — her referans `.hdr/.glb` gerçek + geçerli + parse-edilebilir (boş/dummy/404 yakalanır) | statik + dosya-parse | 🔜 (dummy HDR'ı yakalardı) |
| **3D-2** | **Tek-Canvas** | `<VentHubCanvas>` | `3d-single-canvas.test` — bir route ağacında >1 `<Canvas>` yasak | statik kaynak tarama | 🔜 |
| **3D-3** | **Dayanıklılık** | A1 | `3d-resilience.test` — asset-yükleyen her 3D bileşen Suspense+ErrorBoundary sarmalı | statik | 🔜 |
| **3D-4** | **Merkezi-config** | SSOT §1 | `3d-central-config.test` — ham `<Canvas>` / ad-hoc `<Environment files>` / sihirli-metalness yasak → paylaşılan sistem | statik | 🔜 |
| **3D-5** | **CSP/origin** | D1 | `3d-csp.test` — dış 3D origin `next.config.mjs` whitelist'inde | statik config | 🔜 |
| **3D-6** | **Perf-bütçe** | B1–B6 | `renderer.info` draw-call/triangle bütçe izleme (runtime proxy) | runtime/build | ⚠️ açık borç (zor; başta uyarı) |

**Açık eksenleri kapatma yöntemi:** ajan **paralel audit** (mevcut envanter) → merkezi sistem (`<VentHubCanvas>` + prosedürel environment) inşası → bileşen göçü → **yeni INV-3D testi** → commit.

---

## 4. DoD — Canlı 3D'de ASLA olmamalı / DAİMA olmalı
- [ ] Hiçbir 3D hatasında (404/bozuk asset, context-loss) **sayfa çökmez** — fallback render eder.
- [ ] Bir route'ta **tek Canvas**; çoklu yüzey `<View>` ile.
- [ ] Metalik materyaller environment'lı (kararmıyor).
- [ ] Draw call < 100 · mobil DPR ≤ 1.5 · ilk yük < 4MB · ≤3 dinamik ışık.
- [ ] `dispose` temiz — `renderer.info` üzerinde sızıntı (artan geometries/textures) yok.
- [ ] Dış asset CSP whitelist + CORS + HTTPS.

---

## 5. Mevcut Durum (ajan audit'i tamamlayacak) + İlgili

**Şu anki 3D yüzeyleri (ilk harita — `2026-06-16`):**
- `Product3DViewer` — `<Environment files="/env/city_256.hdr">` **bozuk dummy** + Suspense/ErrorBoundary DIŞINDA → **çökme** (A1/A2 ihlali). FanRenderer yüksek metalness.
- `OrbitalProductsShowcase` · `InfiniteProductsShowcase` — **environment YOK**, sadece düz ışık → metaller kararık (C1 ihlali).
- `ThreeDAuthority` — `<Environment preset="studio">` (CDN) → çalışır ama dış bağımlılık (A2 risk).
- 6 nav 3D (CategoryCard3D, MegaMenu3DBackground...) — perf sprint'inde Environment söküldü.
> **Ajanın `parallel-file-audit` skill'i** tam envanteri + merkezîleştirme dalga-roadmap'ini üretecek (kontrolör config'i + stratejik denetim).

**İlgili:** CLAUDE.md Kural #9 (R3F+Drei only · gölge `percentage` · GLB CDN CSP) · `.claude/skills/threejs-webgl-performance` · `i18n-localization-standard.md` (kardeş cetvel deseni) · memory `3d-roadmap-crash-then-standards` · komşu vizyon: 3D showroom (roadmap §1-L) + tiny-planet/curved-world.
