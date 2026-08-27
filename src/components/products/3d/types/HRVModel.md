---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\HRVModel.tsx
skeleton_hash: cadafa0fce0ac09b
entity_hashes:
  func:HRVModel: f0b65885747769cb
  overview: 9b95998e1a824768
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:17:29Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin 3D ürün gösterimleri katmanında yer alır ve ısı geri kazanım ventilatörü (HRV) cihazlarının üç boyutlu sahnede görselleştirilmesini sağlar. Modül, React Three Fiber altyapısıyla uyumlu, hava akışı animasyonlu bir HRV model bileşeni içerir. Taze hava ve atık hava partiküllerinin sürekli akışını simüle eden animasyonlu bir görselleştirme sunar.

## Fonksiyon Grupları
### Ana 3B HRV Model Bileşeni
HRV cihazının 3D sahne içinde görsel olarak sunulmasını ve hava akışı animasyonlarının çalıştırılmasını üstlenen tek bileşeni içerir. Bileşen, cihaz gövdesi, bağlantı flanşları, kontrol ünitesi ve animasyonlu hava akışı gruplarını oluşturur.
- HRVModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### HRVModel
**Ne yapar**: Hava akışı animasyonlu, fiziksel tabanlı Isı Geri Kazanım Ünitesi (HRV) modelini oluşturan bir React bileşenidir. Bileşen, 3D ortamda cihazın ana gövdesini, bağlantı flanşlarını, filtre kapağını ve taze/atık hava akışını simüle eden animasyonlu küreleri render eder.

**Nasıl yapar**: Bileşen, `useResolveMaterials` hook'u ile önceden tanımlanmış malzemeleri (örneğin `ral7035`, `matteBlack`) çözer. `useMemo` kullanarak ana gövde, flanş silindiri, filtre kutusu ve hava akış küreleri için geometrileri ve temel malzemeleri (mavi taze hava, kırmızı atık hava) önbelleğe alır ve performansı artırır. `useEffect` hook'u ile bileşen kaldırıldığında (unmount) tüm geometri ve malzemelerin `dispose()` metodu çağrılarak VRAM belleği temizlenir. `useFrame` hook'u ile her animasyon karesinde, `freshRef` ve `staleRef` referanslarıyla erişilen gruplardaki çocuk nesnelerin x pozisyonları güncellenerek sürekli bir hava akışı animasyonu sağlanır; nesneler belirli bir eşiği aştığında başlangıç noktasına sıfırlanır. Bileşenin JSX dönüşü, `ROOT_SCALE` ile ölçeklenmiş bir ana `group` içinde ana gövde mesh'ini, `FLANGE_POSITIONS` ve `FLANGE_ROTATION` sabitlerini kullanarak konumlandırılmış flanş mesh'lerini, `FILTER_POSITION` sabitine göre konumlandırılmış filtre mesh'ini ve `FLOW_GROUP_POSITION` sabitindeki hava akışı grubunu içerir. Hava akışı grubu içinde, `FRESH_X_POSITIONS` ve `STALE_X_POSITIONS` dizilerindeki x koordinatlarını kullanarak taze ve atık hava için animasyonlu küreler oluşturulur.

**Parametreler**:
- Fonksiyon herhangi bir parametre almaz.

**Dönüş**: React bileşeni olarak bir JSX elementi (`<group>`) döndürür. Bu element, 3D HRV modelinin tüm alt bileşenlerini (gövde, flanşlar, filtre, animasyonlu hava akışları) hiyerarşik bir şekilde içerir.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::BoxGeometry
- import: three::CylinderGeometry
- import: three::MeshBasicMaterial
- import: three::SphereGeometry
- import: three::type { Group, Object3D }

---

## SABİTLER
- **FLANGE_POSITIONS** (array) — `[
    [-0.35, 0.7, 0.12],
    [0.35, 0.7, 0.12],
    [-0.35, 0.7, -0.12],...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/HRVModel.tsx::HRVModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; JSX içinde `materials.ral7035` ve `materials.matteBlack` olarak erişilir
  - `freshRef` — `useRef<Group>(null)` ile oluşturulmuş ref; taze hava animasyon grubuna bağlanır, `useFrame` içinde `freshRef.current.children` üzerinden çocuk mesh'lerin `position.x` değeri güncellenir
  - `staleRef` — `useRef<Group>(null)` ile oluşturulmuş ref; atık hava animasyon grubuna bağlanır, `useFrame` içinde `staleRef.current.children` üzerinden çocuk mesh'lerin `position.x` değeri güncellenir
  - `mainBoxGeo` — `useMemo(() => new BoxGeometry(1.2, 1.3, 0.65), [])` ile oluşturulan ana gövde geometrisi; `useEffect` cleanup'ta `mainBoxGeo.dispose()` ile temizlenir
  - `flangeCylinderGeo` — `useMemo(() => new CylinderGeometry(0.09, 0.09, 0.18, 12), [])` ile oluşturulan flanş silindir geometrisi; `useEffect` cleanup'ta `flangeCylinderGeo.dispose()` ile temizlenir
  - `filterBoxGeo` — `useMemo(() => new BoxGeometry(0.35, 0.18, 0.02), [])` ile oluşturulan filtre kutu geometrisi; `useEffect` cleanup'ta `filterBoxGeo.dispose()` ile temizlenir
  - `airSphereGeo` — `useMemo(() => new SphereGeometry(0.028, 6, 6), [])` ile oluşturulan hava akış küresi geometrisi; `useEffect` cleanup'ta `airSphereGeo.dispose()` ile temizlenir
  - `freshMaterial` — `useMemo(() => new MeshBasicMaterial({ color: "#3b82f6", transparent: true, opacity: 0.8 }), [])` ile oluşturulan mavi yarı saydam materyal; taze hava mesh'lerinde kullanılır, `useEffect` cleanup'ta `freshMaterial.dispose()` ile temizlenir
  - `staleMaterial` — `useMemo(() => new MeshBasicMaterial({ color: "#ef4444", transparent: true, opacity: 0.8 }), [])` ile oluşturulan kırmızı yarı saydam materyal; atık hava mesh'lerinde kullanılır, `useEffect` cleanup'ta `staleMaterial.dispose()` ile temizlenir
  - `useEffect` cleanup fonksiyonu — bileşen unmount olduğunda tüm geometri ve materyal nesnelerinin VRAM'den temizlenmesini sağlar; bağımlılık dizisi `[mainBoxGeo, flangeCylinderGeo, filterBoxGeo, airSphereGeo, freshMaterial, staleMaterial]`
  - `useFrame` callback — her animasyon karesinde çalışır; `delta` parametresi ile zaman farkını alır, `freshRef.current` varsa çocuklarının `position.x` değerini `delta * 0.5` artırır (0.45 üstüne çıkınca -0.45'e sıfırlar), `staleRef.current` varsa çocuklarının `position.x` değerini `delta * 0.5` azaltır (-0.45 altına inince 0.45'e sıfırlar)
  - `pos` — `FLANGE_POSITIONS.map` içindeki her flanş pozisyonu; JSX'te `position={pos}` olarak kullanılır
  - `i` — `FLANGE_POSITIONS.map` ve `FRESH_X_POSITIONS.map`/`STALE_X_POSITIONS.map` içindeki indeks; `key` prop'u olarak kullanılır
  - `x` — `FRESH_X_POSITIONS.map` ve `STALE_X_POSITIONS.map` içindeki x koordinatı; `[x, 0, 0.12]` veya `[x, 0, -0.12]` pozisyon dizisi olarak kullanılır
  - `child` — `useFrame` içindeki `forEach` callback'indeki `Object3D` tipinde çocuk nesne; `child.position.x` değeri animasyon için güncellenir
- **Dönüş**: JSX elementi — `<group scale={ROOT_SCALE}>` kök elemanı içinde ana gövde mesh'i, `FLANGE_POSITIONS` ile haritalanmış flanş mesh'leri, filtre kapak mesh'i ve `FLOW_GROUP_POSITION` konumundaki taze/atık hava animasyon gruplarını içerir

---

## NODE ID STANDARD

  file: src\components\products\3d\types\HRVModel.tsx
  function: src\components\products\3d\types\HRVModel.tsx::HRVModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: HRVModel

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)