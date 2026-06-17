# 3D Göç Dalgaları — Wave 2-3 Planı (paralel)

> **Ne bu?** Merkezi `<VentHubCanvas>` omurgası (Wave 1, PR #368, master) kurulduktan sonra kalan 3D
> yüzeylerini ve modellerini omurgaya taşıma planı. Ajan **parallel-file-audit / maestro** ile paralel koşar;
> controller (Claude) her dalgayı deterministik doğrular + INV-3D kapısı + commit.
> Oluşturma: 2026-06-17 · Kaynak: ultracode tasarım-sentezi + `docs/audits/3d-surfaces-audit-2026-06-16.md`.
> İlgili: `docs/standards/3d-webgl-standard.md` (cetvel) · memory `3d-roadmap-crash-then-standards`.

---

## 0. Durum (Wave 1 BİTTİ — master `af115478`)

- **Cetvel:** `docs/standards/3d-webgl-standard.md` v1.1 (#367).
- **Omurga:** `src/components/products/3d/core/` — `VentHubCanvas` + `ResilientCanvasBoundary` + `ContextLossRecovery` + `SceneLightingRig` (prosedürel) + `useDeviceDpr` + `disposeSceneObject` + `assetRegistry` + `tenantScene` (throw-safe seam).
- **Çökme-fix:** `Product3DViewer` taşındı, dummy `city_256.hdr` silindi. Prod çökmesi kapandı.
- **Kapılar canlı:** `3d-asset-validity` · `3d-single-canvas` (RATCHET) · `3d-procedural-env`.

---

## 1. `<VentHubCanvas>` API (göç hedefi — koddan: `core/VentHubCanvas.tsx`)

```tsx
<VentHubCanvas
  preset="product | showcase | nav | authority"   // environment + ışık rig'i belirler
  frameloop="always | demand"                       // ⚠️ SURFACE'TEN gelir — kabuk SADELEŞTİRMEZ
  camera={{ position: [...], fov: ... }}            // opsiyonel
  tenantId={...}                                     // opsiyonel; verilmezse DEFAULT (throw-safe)
  environment={...} dprCap={...} fallback={...}      // opsiyonel
>
  {/* sahne içeriği + chrome (OrbitControls/Grid/Gizmo) — eskiden <Canvas> çocuklarıydı */}
</VentHubCanvas>
```
Kabuk **sabitliyor:** `shadows="percentage"` (B5), DPR cap masaüstü 1.0/mobil 1.5 (B4), ACESFilmic+sRGB (C2),
context-loss recovery (A3), prosedürel environment (A2/C1), tenant context. **Ham `<Canvas>` artık YASAK** (INV-3D-2).

---

## 2. ÜÇ heterojen göç sınıfı (kritik — "37 dosya tek-tip" YANLIŞ)

| Sınıf | Ne yapılır | Dosya sayısı |
|---|---|---|
| **A. Canvas-SAHİBİ** | Ham `<Canvas>` → `<VentHubCanvas>` SARMALA; düz ışık/Environment sil → rig'e gider | **8** (Wave 2) |
| **B. Leaf MODEL** | Canvas SARILMAZ (zaten saf JSX). Materyali `resolveMaterials`'tan + unmount `disposeSceneObject` + `useFrame` allocate→pool | **~23** (Wave 3) |
| **C. Part/factory** | dispose + pool dokunuşu | parts/ (Wave 3) |

> Modeller `<Canvas>`/`<Environment>` import ETMEZ — onları FanRenderer→Product3DViewer→VentHubCanvas sarar.
> Bu yüzden model göçü = materyal+dispose+pool, **kabuk değil.**

---

## 3. DALGA 2 — Canvas-sahibi 8 yüzey (PARALEL)

Hepsi environment kazanır → **C1 metal-kararması çözülür**. Her bağımsız dosya **master'dan TAZE dal** (yığma=tangle).
Göç edince **INV-3D-2 `LEGACY_RAW_CANVAS` allowlist'inden SİL** (stale-guard zorlar).

| Dosya | Preset | ⚠️ Özel kontrat |
|---|---|---|
| `OrbitalProductsShowcase` | showcase | **frameloop `isInView?'always':'demand'` KORUNUR** (davranış, default değil) |
| `InfiniteProductsShowcase` | showcase | **frameloop `'always'` KORUNUR** · ⚠️ **sıfır-importer (ölü kod?) → SİL/doğrula** |
| `CategoryHubOverlay` | nav | overlay açılınca mount |
| `CategoryCard3D` | nav | ⚠️ **sıfır-importer (ölü kod?) → SİL/doğrula** |
| `CategorySpotlightScene` | nav | ⚠️ **sıfır-importer (ölü kod?) → SİL/doğrula** |
| `MegaMenu3DBackground` | nav | dropdown açıkken mount |
| `ThreeDAuthority` | authority | **CDN `<Environment preset="studio">` → prosedürel 'authority' rig'e** (A2) · click-to-load korunur |
| `BlueprintCanvas` | (SAPAN) | **ham GLSL `shaderMaterial` (holografik, IBL semantiği YOK)** → preset enum'a SIĞMAZ; ÖNCE oku, 4. preset/override fiyatla |

**Ölü-kod kararı:** 3 sıfır-importer dosya **TAŞINMAZ** — CodeGraph `codegraph_callers` ile doğrula, gerçekten ölüyse SİL (göç kapsamından çıkar).

---

## 4. DALGA 3 — 23 model + parts (PARALEL, judge GÖRSEL-DIFF zorunlu)

- **FanRenderer = ROUTER, KALIR** (slug/modelType → model; 21-giriş `MODEL_COMPONENTS` DEĞİŞMEZ). `ProductModelRenderer` rename = **AYRI kozmetik PR** (4 dosya referans).
- **Her model:**
  1. Materyali `resolveMaterials(tenantId)`'tan al (inline metal materyal uydurma — C3); ürün tipine uygun (purifier beyaz/mat, fan çelik — "paslanmaz" sorunu BURADA çözülür, router'da değil).
  2. `useFrame` içi `new Box3/Vector3/TubeGeometry` → **modül-seviye temp havuz** (B3/AX-10).
  3. Unmount `disposeSceneObject` (A4).
- **`DomesticFanModel`** 144-mesh grid (`Array(12)×Array(12)`, TEK paylaşılan `industrialSteel` — DOĞRULANDI) → **saf `InstancedMesh`/drei `<Instances>`** (**BatchedMesh GEREKSİZ:** tek materyal+tekdüze transform). InstancedMesh **AYRI perf-dönüşümü**, kabuk-sarmasıyla KARIŞTIRMA (churn patlar).
- Gerçek instancing adayları: grid/loop'lu modeller (audit raporundaki per-dosya ihlallere bak).

> **Severity düzeltmesi (audit'ten):** `AutoCenter`/`SmartCenterScale` "CRITICAL" **abartılı** — `useFrame` içinde `new Box3/Vector3` var AMA `isLocked` guard'ı ~3 frame sonra durduruyor → küçük, acil değil. Yine de pool'la ama panik yok.

---

## 5. DALGA 4 (P2, opsiyonel/vizyon)

Çoklu showcase → **tek Canvas + drei `<View>` portalları** (showroom / tiny-planet / curved-world TSL shader §6.4).
Cross-surface state birleşmesi RİSKLİ + tek-hata-noktası blast-radius → **EN SONA**, bugün ZORLAMA.

---

## 6. Her dalganın kapısı (controller — SEN)

`pnpm type-check` + `pnpm lint` + `pnpm test -- --run` (INV-3D dahil) + **`pnpm build`** (RSC `'use client'`/`next/headers` sınır hataları yalnız burada) + axe a11y → commit.
**İzolasyon:** her bağımsız dosya master'dan taze dal; ajan PUSH+DUR, controller PR+merge.

---

## 7. Açık borç / ön-koşullar

- **INV-3D-2 ratchet:** `LEGACY_RAW_CANVAS` (8 dosya) → her göç birini siler → sıfırda tam kilit.
- **public/decoders/ wasm:** GLB asset eklemeden ÖNCE (Draco/KTX2). Bugün tüm modeller prosedürel → henüz gerekmez.
- **Yazılmamış kapılar:** INV-3D-5 (CSP) · INV-3D-6 (runtime perf `renderer.info` — ödünç eşikleri kalibre eder).
- **Audit raporu PR'ı:** `docs/audits/3d-surfaces-audit-2026-06-16.md` (`audit/3d-surfaces` a457ad08) master'a alınmalı (küçük PR).
- **Eşik kalibrasyonu:** cetveldeki sayılar (draw call <100, ilk yük <4MB…) v1 ödünç; gerçek asset ölçümü + INV-3D-6 sertleştirir.
