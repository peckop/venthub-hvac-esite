---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\SpeedControlModel.tsx
skeleton_hash: af9b94ffe1460863
entity_hashes:
  func:SpeedControlModel: 41e64c85f069a205
  overview: 031e0f24314d2b4e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:27:54Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin 3B ürün görselleştirme sistemi için hız kontrol ünitesinin dijital modelini tanımlayan bir React Three Fiber bileşenidir. HVAC ekipmanlarının fiziksel özelliklerini (gövde, düğme, göstergeler) ve animasyonlarını (dönme, nabız atma) tek bir merkezi yapı içinde paketleyerek 3B sahnede gerçekçi bir demonstrasyon sunar.

## Fonksiyon Grupları
### Hız Kontrol Ünitesi 3B Modeli
Bu grup, hız kontrol ünitesinin tüm fiziksel geometrisini, malzemelerini ve animasyon mantığını tek bir bileşen olarak tanımlar.
- `SpeedControlModel`

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### SpeedControlModel

**Ne yapar**: Hız kontrol cihazının (speed controller) interaktif 3B modelini oluşturur. Bu bileşen, HVAC sistemlerinde kullanılan bir hız kontrol ünitesinin Three.js tabanlı görsel temsilini render eder — kutu gövdesi, ön panel, soğutma kanatları, döner düğme (potansiyometre), LED göstergesi ve logo alanını içerir. Düğmenin sürekli dönme animasyonu ve LED'in nabız (pulse) efekti ile gerçekçi bir interaktif 3B deneyim sunar.

**Nasıl yapar**: React Three Fiber (R3F) ekosistemi üzerinde çalışan bir React fonksiyonel bileşenidir. `useResolveMaterials()` hook'u ile malzeme setini (boxMat, matteBlack, brushedAluminum) dış kaynaktan çözer. `useMemo` hook'ları ile geometri ve malzemeleri yalnızca ilk render'da oluşturarak VRAM sızıntılarını ve gereksiz yeniden hesaplamaları önler. `useEffect` hook'u bileşenUnmount olduğunda tüm geometri ve malzeme nesnelerinin `.dispose()` metodunu çağırarak GPU belleklerini temizler. `useFrame` hook'u her kare (frame) render'ında saat referansıyla düğmenin Z ekseni rotasyonunu `Math.sin(time * 2) * 0.5` formülüyle, LED renginin yeşil intensity değerini ise `Math.abs(Math.sin(time * 2))` ile hesaplayarak nabız efekti yaratır — bu sayede bileşen yeniden render edilmeden animasyon sağlanır.

**Parametreler**:

- Bu bileşen herhangi bir prop (dış parametre) almamaktadır. Tüm veri bağımlılıkları iç hook'lar ve React Three Fiber bağlamı üzerinden sağlanır.

**Dönüş**: `JSX.Element` — `<group>` elemanı içinde 3B sahne grafı döndürür. Döndürülen grup, 2.5x2.5x2.5 ölçek faktörü ile [0, 0, 0] konumlandırılmıştır ve şu alt elemanları içerir: Box (gövde), FrontPanel (ön panel), heatl/heatr serili yan soğutma kanatları (3'er adet, sol ve sağ tarafta), knobRef referanslı döner düğme grubu (silindir + çizgi geometrisi), ledRef referanslı LED gösterge (primitive object pattern ile malzeme eklenmiş), ve logo mesh'i.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: @react-three/fiber::useFrame
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: react::useRef
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/SpeedControlModel.tsx::SpeedControlModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; `materials.boxMat`, `materials.matteBlack`, `materials.brushedAluminum` alanlarına JSX içinde erişilir
  - `knobRef` — `useRef<Group>(null)` ile oluşturulmuş ref; `knobRef.current.rotation.z` useFrame içinde atanır
  - `ledRef` — `useRef<MeshBasicMaterial>(null)` ile oluşturulmuş ref; `ledRef.current.color.setRGB()` useFrame içinde çağrılır
  - `ledMaterial` — `useMemo(() => new MeshBasicMaterial({ color: '#00ff00' }), [])` ile memoized MeshBasicMaterial; JSX'te `<primitive object={ledMaterial} ref={ledRef} attach="material" />` olarak kullanılır; useEffect cleanup'ta `ledMaterial.dispose()` çağrılır
  - `boxGeometry` — `useMemo(() => new BoxGeometry(0.8, 1, 0.3), [])` ile memoized BoxGeometry; JSX'te `<mesh name="Box" ... geometry={boxGeometry} />` olarak kullanılır; useEffect cleanup'ta `boxGeometry.dispose()` çağrılır
  - `frontPanelGeometry` — `useMemo(() => new PlaneGeometry(0.7, 0.9), [])` ile memoized PlaneGeometry; JSX'te `<mesh name="FrontPanel" ... geometry={frontPanelGeometry} />` olarak kullanılır; useEffect cleanup'ta `frontPanelGeometry.dispose()` çağrılır
  - `finGeometry` — `useMemo(() => new BoxGeometry(0.02, 0.1, 0.2), [])` ile memoized BoxGeometry; JSX'te sağ ve sol soğutma kanalları için `geometry={finGeometry}` olarak kullanılır; useEffect cleanup'ta `finGeometry.dispose()` çağrılır
  - `knobCylinderGeometry` — `useMemo(() => new CylinderGeometry(0.15, 0.15, 0.1, 32), [])` ile memoized CylinderGeometry; JSX'te düğme silindiri için `geometry={knobCylinderGeometry}` olarak kullanılır; useEffect cleanup'ta `knobCylinderGeometry.dispose()` çağrılır
  - `knobLineGeometry` — `useMemo(() => new BoxGeometry(0.02, 0.1, 0.02), [])` ile memoized BoxGeometry; JSX'te düğme çizgisi için `geometry={knobLineGeometry}` olarak kullanılır; useEffect cleanup'ta `knobLineGeometry.dispose()` çağrılır
  - `ledGeometry` — `useMemo(() => new CircleGeometry(0.03, 16), [])` ile memoized CircleGeometry; JSX'te `<mesh ... geometry={ledGeometry}>` olarak kullanılır; useEffect cleanup'ta `ledGeometry.dispose()` çağrılır
  - `logoGeometry` — `useMemo(() => new PlaneGeometry(0.2, 0.05), [])` ile memoized PlaneGeometry; JSX'te `<mesh ... geometry={logoGeometry} />` olarak kullanılır; useEffect cleanup'ta `logoGeometry.dispose()` çağrılır
- **Dönüş**: JSX elementi — `<group scale={[2.5, 2.5, 2.5]} position={[0, 0, 0]}>` kök elemanı

### [N2_NASIL] AST Pointer: src/components/products/3d/types/SpeedControlModel.tsx::useEffect cleanup fonksiyonu
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `ledMaterial` — dış scope'dan erişilen memoized malzeme; `ledMaterial.dispose()` çağrılır
  - `boxGeometry` — dış scope'dan erişilen memoized geometri; `boxGeometry.dispose()` çağrılır
  - `frontPanelGeometry` — dış scope'dan erişilen memoized geometri; `frontPanelGeometry.dispose()` çağrılır
  - `finGeometry` — dış scope'dan erişilen memoized geometri; `finGeometry.dispose()` çağrılır
  - `knobCylinderGeometry` — dış scope'dan erişilen memoized geometri; `knobCylinderGeometry.dispose()` çağrılır
  - `knobLineGeometry` — dış scope'dan erişilen memoized geometri; `knobLineGeometry.dispose()` çağrılır
  - `ledGeometry` — dış scope'dan erişilen memoized geometri; `ledGeometry.dispose()` çağrılır
  - `logoGeometry` — dış scope'dan erişilen memoized geometri; `logoGeometry.dispose()` çağrılır
- **Dönüş**: yok (VRAM temizleme yan etkisi)

### [N3_NASIL] AST Pointer: src/components/products/3d/types/SpeedControlModel.tsx::useFrame callback
- **params**: `state` — React Three Fiber frame state nesnesi
- **ic_degiskenler**:
  - `state` — frame state parametresi; `state.clock.elapsedTime` erişilir
  - `time` — `state.clock.elapsedTime` değeri; sinüs hesaplamalarında kullanılır
  - `knobRef` — dış scope'dan erişilen ref; `knobRef.current.rotation.z` atanır
  - `ledRef` — dış scope'dan erişilen ref; `ledRef.current.color.setRGB()` çağrılır
  - `intensity` — `Math.abs(Math.sin(time * 2))` hesaplanan LED parlaklık değeri
  - `greenValue` — `Math.floor(100 + intensity * 155)` hesaplanan yeşil kanal değeri
- **Dönüş**: yok (animasyon yan etkisi)

### [N4_NASIL] AST Pointer: src/components/products/3d/types/SpeedControlModel.tsx::sol soğutma kanalı map callback
- **params**: `y` — dizi elemanı (-0.3, 0 veya 0.3); `i` — dizi indeksi
- **ic_degiskenler**:
  - `y` — pozisyon y koordinatı; `position={[0.41, y, 0]}` içinde kullanılır
  - `i` — indeks; `key={\`heatl-${i}\`}` içinde kullanılır
  - `materials` — dış scope'dan erişilen malzeme nesnesi; `materials.matteBlack` kullanılır
  - `finGeometry` — dış scope'dan erişilen geometri; `geometry={finGeometry}` kullanılır
- **Dönüş**: JSX `<mesh>` elementi

### [N5_NASIL] AST Pointer: src/components/products/3d/types/SpeedControlModel.tsx::sağ soğutma kanalı map callback
- **params**: `y` — dizi elemanı (-0.3, 0 veya 0.3); `i` — dizi indeksi
- **ic_degiskenler**:
  - `y` — pozisyon y koordinatı; `position={[-0.41, y, 0]}` içinde kullanılır
  - `i` — indeks; `key={\`heatr-${i}\`}` içinde kullanılır
  - `materials` — dış scope'dan erişilen malzeme nesnesi; `materials.matteBlack` kullanılır
  - `finGeometry` — dış scope'dan erişilen geometri; `geometry={finGeometry}` kullanılır
- **Dönüş**: JSX `<mesh>` elementi

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SpeedControlModel.tsx
  function: src\components\products\3d\types\SpeedControlModel.tsx::SpeedControlModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: SpeedControlModel

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