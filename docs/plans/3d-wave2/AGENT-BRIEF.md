# AJAN BRİEFİ — 3D Wave 2: 3 Canvas yüzeyini VentHubCanvas'a taşı

> # ⛔ ÖNCE BUNU OKU — KODA DALMA, "PAT DİYE" BAŞLAMA.
> **ÇALIŞTIRMA YÖNTEMİ = `/paralel-code-mutation` (paralel kod mutasyonu).** Bu iş **paralel ajanlarla** yapılır:
> **her dosyaya AYRI bir ajan** (3 dosya = 3 paralel ajan), her ajan §3'ten **yalnız kendi dosyasının** kontratını alır.
> 3 dosya birbirinden bağımsız (disjoint) → paralel güvenli.
> **❌ Bireysel / tek-ajan / elle / sırayla TAŞIMA. ❌ "Başla" der demez koda dalma.**
> Önce paralel orkestrasyonu KUR → her ajana dar brief ver → SONRA göçü başlat.

> **Bu dosya GEÇİCİ** (iş bitince silinir). Ajan: SADECE aşağıdaki kurallara uy, internet/araç-dokümanı
> kullanma, kendi dosyandan başkasına dokunma. Doğrulamayı (test/build) controller yapar — sen ÇALIŞTIRMA.

## 1. Görev (ne / neden)

3 bileşen kendi ham `<Canvas>`'ını kuruyor → her biri farklı ışık/dpr/tone-mapping = config drift + tutarsız
görsel + çoklu-Canvas Safari context çökmesi. Hepsini **tek merkezi kabuk** `<VentHubCanvas>`'a taşı. Kabuk
gölge/dpr/tone-mapping/environment'ı **standart** veriyor; sen sadece `<Canvas>`'ı `<VentHubCanvas>` yapıp
**düz ışıkları + Canvas-config proplarını siliyorsun.** Sahne içeriği (model, OrbitControls, Suspense) AYNEN kalır.

## 2. ALTIN ÖRNEK — `src/components/products/3d/Product3DViewer.tsx`

Bu dosya Wave 1'de aynen bu şekilde taşındı. **Birebir bu deseni kopyala.** Bak:
- satır 19: `import { VentHubCanvas } from './core'`
- satır 164: `<VentHubCanvas preset="product" frameloop="always" camera={{ position: [2, 2, 2.8], fov: 40 }}>`
- İçinde **ham `ambientLight`/`directionalLight`/`<Environment>` YOK** (kabuğun rig'i veriyor). OrbitControls,
  Suspense, ContactShadows, Grid, GizmoHelper hepsi `<VentHubCanvas>` çocuğu olarak AYNEN duruyor.

### Genel dönüşüm (her dosyada aynı 5 adım)
1. **Import:** `import { Canvas } from '@react-three/fiber'` satırından **sadece `Canvas`'ı çıkar**
   (aynı satırdaki `useFrame`/`useThree`/`ThreeEvent` KALIR). Yeni: `import { VentHubCanvas } from '<core-yolu>'`.
2. **Etiket:** `<Canvas ...>` → `<VentHubCanvas preset="..." frameloop={...} camera={...}>` ; kapanış `</Canvas>` → `</VentHubCanvas>`.
3. **SİL (kabuk standartlıyor — KORUMA, bu merkezileşmenin amacı):** `shadows`, `gl`, `dpr`, `style` propları.
4. **SİL:** Canvas'ın İÇİNDEKİ ham `ambientLight` / `directionalLight` / `spotLight` / `pointLight` / `<Environment>`.
   (Işık artık `SceneLightingRig`'ten geliyor.)
5. **KORU:** `frameloop` ifadesini ve `camera` objesini **birebir** taşı (davranış sözleşmesi — basitleştirme YOK).
   Suspense, OrbitControls, model bileşeni, Html, Float, Sparkles, mesh/floor — hepsi AYNEN çocuk olarak kalır.

> `className` gerekiyorsa `<VentHubCanvas className="...">` destekler (prop mevcut). `style` desteklenMEZ —
> arka plan zaten şeffaf (kabuk `gl alpha:true`), `style={{background:'transparent'}}` gereksiz, sil.

---

## 3. DOSYA BAŞINA KONTRAT (yalnız bu 3 dosya)

### A) `src/components/products/OrbitalProductsShowcase.tsx`  → preset **showcase**
- core yolu: `import { VentHubCanvas } from './3d/core'`
- import satırı: `import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber'`
  → `import { ThreeEvent, useFrame, useThree } from '@react-three/fiber'` (sadece `Canvas` gitti).
- `<Canvas>` (≈ satır 835) propları: `shadows`, `gl`, `dpr` → **SİL**.
- `frameloop={isInView ? "always" : "demand"}` → **BİREBİR KORU** (in-view perf sözleşmesi).
- `camera={{ position: [...CONFIG...], fov: ...CONFIG... }}` → **BİREBİR KORU** (hesaplı ifade aynen kalsın).
- İçeride **SİL:** `<ambientLight>`, `<directionalLight>`, `<spotLight ... castShadow>` (3 satır).
- **KORU:** `<MotionTransitionFix />`, `<Stage .../>`, `<CarouselItems .../>` — hepsi çocuk olarak aynen.
- ⚠️ Not: `spotLight castShadow` gidince cast-shadow kalkar; sahne karanlık + zemin düz, görsel etki ihmal
  edilebilir. **Gölge rig'i EKLEME**, panik yok — controller görsel kontrol eder.

### B) `src/components/navigation/CategoryHubOverlay.tsx`  → preset **nav**
- core yolu: `import { VentHubCanvas } from '../products/3d/core'`
- import: `import { Canvas } from '@react-three/fiber'` satırını **tamamen sil**, yerine VentHubCanvas importu.
  (`OrbitControls` `@react-three/drei`'den geliyor — KALIR.)
- `<Canvas>` (≈ satır 158) propları: `gl`, `dpr`, `style` → **SİL**. `frameloop="demand"` → KORU.
  `camera={{ position: [0, 0, 2.2], fov: 40 }}` → KORU. `className="animate-in fade-in zoom-in-95 duration-700"` → KORU.
- İçeride **SİL:** `<ambientLight>`, `<directionalLight>`.
- **KORU:** `<Suspense>`, `<Category3DIcon .../>`, `<OrbitControls autoRotate .../>` aynen.

### C) `src/components/navigation/MegaMenu3DBackground.tsx`  → preset **nav**
- core yolu: `import { VentHubCanvas } from '../products/3d/core'`
- import: `import { Canvas } from '@react-three/fiber'` satırını **tamamen sil**, yerine VentHubCanvas importu.
- `<Canvas>` (≈ satır 22) propları: `style`, `dpr` → **SİL**. `frameloop="demand"` → KORU.
  `camera={{ position: [0, 0.1, 2.2], fov: 40 }}` → KORU.
- İçeride **SİL:** `<ambientLight>`, `<directionalLight>`.
- **KORU:** `<Suspense>`, `<Category3DIcon .../>`, `<OrbitControls autoRotate .../>`, dıştaki gradient `<div>`.

> dpr/gl farkı (ör. CategoryHub `antialias:false`, MegaMenu `dpr={[1,1]}`) **bilerek** kayboluyor — kabuk
> standart dpr/gl veriyor. Geri eklemeye ÇALIŞMA; merkezileşmenin tüm amacı bu.

---

## 4. KESİN YASAKLAR (ihlal = ret)
- Sadece **kendi dosyana** dokun. `core/` klasörü, barrel/index, `tr.ts`/`en.ts`, test dosyaları, diğer 2
  hedef → **DEĞİŞTİRME.**
- `INV-3D-2` test allowlist'ine **DOKUNMA** (controller günceller).
- İnternet / context7 / web / araç-dokümanı **YOK** — her şey repo'da + bu brief'te.
- Yasak desen: `as any`, `as unknown as`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, `PCFSoftShadowMap`.
- `pnpm` / `tsc` / `test` / `build` **KOŞTURMA** — merkezi kapı controller'da.
- Yeni ışık/Environment/gölge **EKLEME**; sadece SİL + sar. Yeni paket/import ekleme (VentHubCanvas hariç).

## 5. Kendi kendine kontrol (bitirince doğrula)
- [ ] `<Canvas` ve `</Canvas>` kalmadı; yerine `<VentHubCanvas>`/`</VentHubCanvas>`.
- [ ] Ham `ambientLight`/`directionalLight`/`spotLight`/`pointLight`/`<Environment>` kalmadı.
- [ ] `frameloop` ve `camera` birebir korundu (özellikle Orbital'ın `isInView` ifadesi).
- [ ] `Canvas` importu kalktı; `VentHubCanvas` importu doğru göreli yolla eklendi.
- [ ] `useFrame`/`useThree`/`OrbitControls`/`Suspense`/model bileşeni AYNEN duruyor.
- [ ] Yasak desen yok, başka dosya değişmedi.
- **Yapısal çıktı döndür:** `{ file, preset, removedLights:[...], keptFrameloop, keptCamera, notes }`.

## 6. Controller (ben) ne yapacağım — sen yapma
- 3 dosya gelince: `INV-3D-2 LEGACY_RAW_CANVAS`'tan bu 3 satırı sil (stale-guard zorlar) → 6'dan 3'e iner.
- Merkezi kapı: `type-check` + `lint` + `test --run` (INV-3D dahil) + **`pnpm build`** (RSC/`'use client'` sınırı) + axe.
- Yeşilse: bu `docs/plans/3d-wave2/` klasörünü sil + tek PR → master.

---

> # ⛔ SON HATIRLATMA — YÖNTEM
> Bu iş **`/paralel-code-mutation` ile, PARALEL ajanlarla** yapılır — **her dosyaya ayrı ajan.**
> **❌ Bireysel / tek-ajan / elle sırayla YAPMA. ❌ "Başla" der demez koda dalma.**
> Önce paralel orkestrasyonu kur → her ajana yalnız kendi dosyasının §3 kontratını ver → sonra koştur.
