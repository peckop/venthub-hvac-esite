# 3D Wave 3 — Leaf Model & Part Conformance Brief (Antigravity worker)

> **Bu nedir?** Ortak Antigravity CLI worker'ına verilecek **dar/sert** uygulama brief'i: 3D leaf
> model + part/helper dosyalarını `3d-webgl-standard.md` cetveline (B3/A4/C3/C1) uydurmak.
> **Sahip (Controller #2 / 3D şeridi):** bu işi ben brief'lerim, gate'lerim, merge'lerim.
> **Worker:** üretir → push → **DURUR**; master'a merge **ETMEZ**. Kapıyı **ben** vururum.
>
> **Bu brief kuralları TEKRAR ETMEZ — REFERANS verir:**
> - Cetvel (otorite + eşik): `docs/standards/3d-webgl-standard.md` (§2 A/B/C kuralları, §6 kod desenleri)
> - Per-dosya ihlal envanteri: `docs/audits/3d-surfaces-audit-2026-06-16.md` (§2 tablo)
> - Göç sınıfları + bağlam: `docs/plans/3d-migration-waves-2026-06-17.md`
> - İşbirliği yöntemi (dal/kapı/izolasyon): `docs/standards/collaboration-protocol.md` (§1, §2, §3)
> - Mutlak proje kuralları: `CLAUDE.md` (#3 no-any, #4 RSC, #9 R3F+Drei/gölge `percentage`)

---

## 0. Kapsam — NE girer / NE girmez

**Girer (28 dosya, audit Wave 3–6 = leaf/part/helper katmanı):** Canvas yüzeyleri DEĞİL — onlar
zaten `VentHubCanvas`'a taşındı (Wave 1–2, #368/#374/#375/#379; ErrorBoundary/Suspense/Environment/DPR
kabuktan geliyor). Buradaki dosyalar **kabuğun İÇİNDEKİ** leaf bileşenler: hâlâ inline geometri/materyal,
`useFrame` allocate, dispose-yok ihlali taşıyorlar.

**GİRMEZ (controller'ın / ayrı PR'ın işi — worker DOKUNMAZ):**
- `FanRenderer` (router — 21-giriş `MODEL_COMPONENTS` DEĞİŞMEZ) ve onun `ProductModelRenderer` rename'i → **ayrı kozmetik PR**.
- `core/*` (`VentHubCanvas`, `disposeSceneObject`, `tenantScene`, `SceneLightingRig`, barrel) → **DONMUŞ paylaşılan altyapı**.
- `materials/useFanMaterials.ts` (audit'in TEK temiz dosyası — paylaşılan materyal kaynağı) → **DONMUŞ**; bağlan, düzenleme.
- Conformance kapıları (INV-3D-5 CSP, INV-3D-6 perf) → controller yazar.

---

## 1. Kanonik dönüşüm (conformance reçetesi) — HER dosyaya uygulanır

Cetvelden 4 ihlal sınıfı; her biri için **tek doğru düzeltme**:

| İhlal | Şu an (yanlış) | Düzeltme | Cetvel |
|---|---|---|---|
| **Inline geometri** | JSX/map içinde her render `new BoxGeometry(...)` / `<boxGeometry args>` döngüde yeniden | Statik geometri → **modül-seviye** `const` ya da `useMemo`; map'lerde **tek paylaşılan** referans | B3 |
| **Inline materyal** | `new MeshStandardMaterial({...})` bileşen içinde / map'te | Metalik/çelik/yeşil/gri yüzey → `useResolveMaterials()` cache'inden (aşağı); cache'te yoksa **modül-seviye memoized const** | C3 / C1 |
| **`useFrame` allocate** | Loop içinde `new Box3()`/`new Vector3()`/`new TubeGeometry()` | **Modül-seviye temp havuz** (`const _v = new Vector3()` bir kez); frame'de `.set()`/reuse | B3 / AX-10 (§6.5) |
| **dispose yok** | Unmount'ta geometry/material/texture VRAM'de kalır | `useEffect` cleanup → memoized geometri'leri `.dispose()`; `<primitive>`/sahne için `disposeSceneObject` | A4 (§6.1) |
| **Frame-bağımlı dönüş** | `mesh.rotation.y += 0.01` (FPS'e bağlı) | `mesh.rotation.y += speed * delta` (`useFrame((_, delta) => …)`) | B3 |

**Materyal API (kesin):**
```tsx
import { useResolveMaterials } from '../core'          // types/ ve parts/ → '../core'; factory/parts/ → '../../core'
const mats = useResolveMaterials()                      // tenant-hazır seam → paylaşılan MATERIALS_CACHE
// mevcut alanlar: industrialSteel, vorticeGreen, darkGrey, clampMat, baseMat, chassisInnerMat, galvanizedSteel
<mesh material={mats.industrialSteel} geometry={bladeGeo} />
```
```tsx
import { disposeSceneObject } from '../core'
useEffect(() => () => { bladeGeo.dispose(); ringGeo.dispose() }, [bladeGeo, ringGeo])   // memoized geo'lar
```

> **⚠️ Görsel niyet koruması:** Renk/metalness DEĞERLERİNİ kafana göre değiştirme. İki istisna:
> (a) metalik yüzey şu an environment yokluğundan **kararıyordu** → cache materyaline bağlanınca düzgün
> aydınlanır (C1 fix, **beklenen iyileşme**); (b) cache'te tam karşılığı olmayan özgün renk → o dosyada
> **modül-seviye memoized const** yap (yeni metalness UYDURMA). Kararsız kalırsan → `notes`'a yaz, judge bakar.

---

## 2. Batch'ler (dosya-disjoint paralel — her ajan YALNIZ kendi dosyası)

> Paralel güvenlik = dosya disjoint'liği. Aynı dosyaya iki ajan dokunmaz. Paylaşılan altyapı DONMUŞ (§0).

### Batch R — Rutin modeller (16 dosya · audit Wave 6 · TEMİZ, reçete birebir)
3–4 paralel. Her biri bağımsız, aynı reçete (§1). Materyal swap çoğunlukla mekanik (çelik kanat → `industrialSteel`).
`SilentChannelFanModel · AxialFanModel · CentrifugalFanModel · NicotraFanModel · RoofFanModel ·
SmokeExhaustFanModel · WallMountedCompactFanModel · SnailFanModel · SpeedControlModel · RoundDuctFanModel ·
ExproofFanModel · PlugFanModel · JetFanModel · HRVModel · DuctFanModel · DehumidifierModel`
> Özel notlar (audit §2'den): `SnailFanModel`/`ExproofFanModel` → `Bolt` alt-bileşeni **gövde içinde tanımlı**
> (her render yeniden yaratılır) → **modül-seviyeye taşı**. `PlugFanModel` → frame-bağımlı dönüş `delta`'ya çevir.

### Batch P — Part / helper (9 dosya · audit Wave 3+4 · pooling + memoize + dispose)
2–3 paralel.
`parts/Housing · parts/Impeller · parts/Motor · parts/Silencer · factory/parts/MainChassis ·
factory/parts/InternalFanRotor · 3d/SmartCenterScale · 3d/AutoCenter · BentPlaneGeometry`
> `Housing` (5 ihlal — inline ExtrudeGeometry/shapeGeometry memoize + shared material). `Silencer` (kullanılmayan
> `ShapeGeometry` SİL + dispose). `BentPlaneGeometry` (TextureLoader texture'ı dispose).
> **Severity notu (plan §4):** `SmartCenterScale`/`AutoCenter` "CRITICAL" **abartılı** — `useFrame` içinde
> `new Box3/Vector3` var ama `isLocked` guard ~3 frame sonra durduruyor. Yine de pool'la, **panik yok**.

### Batch H — Ağır / TASARIM-GEREK (3 dosya · audit Wave 5 · AYRI perf-dönüşümü, judge GÖRSEL-DIFF)
**Tek tek**, dar brief, görsel-diff judge zorunlu. Cleanup ile InstancedMesh dönüşümünü **KARIŞTIRMA** (churn patlar).
| Dosya | Dönüşüm |
|---|---|
| `DomesticFanModel` | 12×12 = **144 inline boxGeometry** → `InstancedMesh` / drei `<Instances>` (tek paylaşılan `industrialSteel`, tekdüze transform → BatchedMesh GEREKSİZ). §6.2. |
| `FlexibleDuctModel` | `useFrame` içinde dinamik `TubeGeometry` allocate → pre-allocate/pool ya da on-demand rebuild + eski geo dispose. Materyal/metalness override → cache. |
| `AirCurtainModel` | render loop'unda **28 materyal/geometri** → memoize + paylaşılan referans. |

---

## 3. Worker sözleşmesi (DAR — kaçağı kaynakta kes; maestro guardrail'leri)

- **Yalnız KENDİ dosya(lar)ına dokun.** `core/*`, `useFanMaterials.ts`, `FanRenderer`, barrel, başka batch = **YASAK**.
- **İnternet/araç-dokümanı YOK** (context7/web/gitmcp). Her şey repo'da; cetvel + audit + bu brief yeter.
- **Yasak desen YOK:** `as any` · `as unknown as` · `: any` · `@ts-ignore` · `@ts-expect-error` · `eslint-disable` · `PCFSoftShadowMap`. (CLAUDE.md #3/#9 + protect-config.)
- **pnpm/tsc/test/build KOŞMA** — merkezi doğrulama controller'da (tek pas, ajan başına ağır tsc yok).
- **i18n:** Bu dosyalarda kullanıcıya görünen string yok (3D mesh). Yeni metin EKLEME.
- **Çıktı = yapısal:** her dosya için `{ file, ihlaller_giderildi[], materyal_kararları[], yeni_modül_const[], notes }`. "Tamamlandı" cümlesi değil, **ne yaptığın**.
- **Bir-iş-bir-dal:** her batch (ağır modeller: her dosya) **master'dan TAZE dal** `feat/3d-wave3-<batch>`; yığma yok.
- Bitince **push + DUR**. PR'ı **AÇMA**, master'a merge **ETME** — dalı söyle, dur.

---

## 4. Kabul / DoD (Controller — ben vururum, §3 deterministik kapı)

Worker "geçti" dese de **diff'ten kendim doğrularım**, sonra tüm ağacı:
- `pnpm type-check` 0 · `pnpm lint` 0 (no-restricted-imports/no-arbitrary/no-console dahil) · `pnpm test -- --run` (INV-3D dahil) · **`pnpm build`** (RSC sınırı) · axe 0.
- **Batch H → görsel-diff judge:** InstancedMesh sonrası grid görsel olarak AYNI mı; metalik yüzey kararmıyor mu (C1); FPS düşmedi mi.
- **`renderer.info` sızıntı yok** (unmount sonrası artan geometries/textures) — A4 kanıtı.
- Her batch yeşilse: yalnız o batch'in dosyaları stage → conventional commit → PR → merge. Sonraki batch master'dan dallanır.

---

## 5. Per-dosya checklist (worker bunu doldurur, controller doğrular)

> Audit §2 "Açıklama & İhlal Detayları" sütunu her dosyanın spesifik ihlalini verir — **önce onu oku**, sonra §1 reçetesini uygula.

| Dosya | Batch | B3 geo memoize | C3 materyal→cache | B3 useFrame pool | A4 dispose | delta dönüş | Özel |
|---|---|:---:|:---:|:---:|:---:|:---:|---|
| 16 rutin model | R | ☐ | ☐ | ☐ | ☐ | ☐ | Bolt→modül (Snail/Exproof); PlugFan delta |
| 9 part/helper | P | ☐ | ☐ | ☐ | ☐ | — | Silencer SİL kullanılmayan; SmartCenter/AutoCenter panik-yok |
| DomesticFanModel | H | — | ☐ | — | ☐ | — | **InstancedMesh** (144 mesh) |
| FlexibleDuctModel | H | ☐ | ☐ | ☐ | ☐ | — | useFrame TubeGeometry pool |
| AirCurtainModel | H | ☐ | ☐ | — | ☐ | — | 28-loop memoize |

---

*SSOT: cetvel = `3d-webgl-standard.md`; bu = onun leaf-katman uygulama izdüşümü. Sahip = Controller #2 (3D). Worker = Antigravity. Kapı + merge = ben.*
