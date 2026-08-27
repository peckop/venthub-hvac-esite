---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\DehumidifierModel.tsx
skeleton_hash: e1a5bf73c6af946a
entity_hashes:
  func:DehumidifierModel: 2c43127eab258a17
  overview: 2f7f0e2906ed1b2d
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:14:28Z
---

## Genel Bakış
Bu modül, VentHub HVAC uygulaması için üç boyutlu bir nemlendirici (kurutucu) ürün modelini temsil eden bir React Three Fiber bileşenidir. Bileşen, cihazın görsel yapısını ve dönen fan tekerleği animasyonunu tanımlayarak ürünün etkileşimli 3B gösterimini sağlar. Parametre almaz; kendi içinde sabit geometri ve malzeme tanımlarıyla çalışır.

## Fonksiyon Grupları
### 3D Model Bileşeni
Modülün tek bileşeni olup, nemlendiricinin geometrik yapısını, malzemelerini ve fan tekerleğinin sürekli döndüğü animasyon mantığını tanımlayarak JSX formatında bir 3B model döndürür. `useRef` ile fan pervanesi referansı oluşturur, `useFanMaterials` hook'undan malzeme nesneleri alır ve `useFrame` ile animasyon döngüsünü yönetir.
- DehumidifierModel

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, fonksiyon gövdesinden türetilen özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### DehumidifierModel
**Ne yapar**: Nem alıcı (dehumidifier) cihazının 3D modelini React Three Fiber (R3F) kullanarak oluşturan bir React fonksiyon bileşenidir. Gövde, üst panel, ekran, su tankı, havalandırma ızgaraları, dönen fan çarkı ve tekerlekler dahil olmak üzere cihazın tüm parçalarını üç boyutlu olarak sahneye yerleştirir.

**Nasıl yapar**: Fonksiyon, `useRef` ile fan çarkı için bir referans oluşturur ve `useResolveMaterials` özel hook'u ile modelde kullanılacak tüm materyalleri (boxMat, matteBlack, chassisInnerMat, castIron, industrialSteel, rubber) çözümler. `useFrame` hook'u ile her karede fan çarkının Y ekseninde sürekli dönmesini sağlar (delta * 6 hızıyla). `useMemo` kullanarak tüm geometrileri (BoxGeometry, PlaneGeometry, CylinderGeometry) yalnızca bir kez hesaplar ve performans kazancı sağlar. `useEffect` ile bileşen kaldırıldığında tüm geometri nesnelerini `dispose()` ederek bellek sızıntısını önler. JSX dönüşünde, `group` elemanı içinde ölçek `[1, 1, 1]` ve konum `[0, -0.5, 0]` ile tüm parçalar `mesh` elemanları olarak yerleştirilir; fan çarkı `ref` ile referanslanarak animasyona tabi tutulur, tekerlekler ise `map` fonksiyonuyla ikişerli gruplar halinde oluşturulur.

**Parametreler**: Bu fonksiyon herhangi bir parametre almaz.

**Dönüş**: JSX elemanı döndürür. Dönen yapı, `group` içinde konumlandırılmış çok sayıda `mesh` ve iç içe `group` elemanlarından oluşan bir Three.js sahne hiyerarşisidir. Bileşen, React Three Fiber ortamında doğrudan render edilebilir bir 3D model sunar.

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
- import: three::PlaneGeometry
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/DehumidifierModel.tsx::DehumidifierModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `fanWheelRef` — `useRef<Group>(null)` ile oluşturulmuş ref; fan çarkı grubunun DOM referansını tutar, `useFrame` içinde `rotation.y` güncellemesinde kullanılır
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; JSX içinde `boxMat`, `matteBlack`, `chassisInnerMat`, `castIron`, `industrialSteel`, `rubber` alanlarına erişilir
  - `geometries` — `useMemo(() => {...}, [])` ile oluşturulan ve boş bağımlılık dizisi sayesinde yalnızca bir kez hesaplanan geometri nesnesi; şu alanları içerir:
    - `geometries.bodyGeo` — `new BoxGeometry(1.5, 2.5, 1)` ile oluşturulmuş gövde kutu geometrisi
    - `geometries.topPanelGeo` — `new BoxGeometry(1.4, 0.05, 0.9)` ile oluşturulmuş üst panel kutu geometrisi
    - `geometries.screenGeo` — `new PlaneGeometry(0.6, 0.3)` ile oluşturulmuş ekran düzlem geometrisi
    - `geometries.waterTankGeo` — `new BoxGeometry(1.2, 0.6, 0.1)` ile oluşturulmuş su tankı kutu geometrisi
    - `geometries.topVentGeo` — `new PlaneGeometry(0.8, 0.5)` ile oluşturulmuş üst havalandırma düzlem geometrisi
    - `geometries.fanWheelGeo` — `new CylinderGeometry(0.3, 0.3, 0.02, 16)` ile oluşturulmuş fan çarkı silindir geometrisi
    - `geometries.barGeo` — `new BoxGeometry(0.85, 0.02, 0.02)` ile oluşturulmuş çubuk kutu geometrisi
    - `geometries.sideVentGeo` — `new PlaneGeometry(0.6, 1.2)` ile oluşturulmuş yan havalandırma düzlem geometrisi
    - `geometries.wheelGeo` — `new CylinderGeometry(0.1, 0.1, 0.05, 16)` ile oluşturulmuş tekerlek silindir geometrisi
  - `useFrame` callback parametreleri:
    - `state` — React Three Fiber frame durumu; bu fonksiyonda doğrudan kullanılmaz
    - `delta` — çerçeve süresi (saniye); `fanWheelRef.current.rotation.y` artışında `delta * 6` çarpanı olarak kullanılır
  - `useEffect` cleanup fonksiyonu — `Object.values(geometries).forEach(geo => geo.dispose())` çağrısıyla tüm geometri nesnelerini bellekten temizler
  - JSX map callback parametreleri:
    - `x` — tekerlek pozisyonu için x ekseni değeri (ilk döngüde `-0.5` ve `0.5`)
    - `i` — map dizin değeri; `key` prop'u olarak `` `lg1-${i}` `` ve `` `lg2-${i}` `` ifadelerinde kullanılır
- **Dönüş**: JSX — `<group scale={[1, 1, 1]} position={[0, -0.5, 0]}>` kök elemanı; alt elemanlar olarak `Body`, `TopPanel`, `Screen`, `WaterTank`, `SideVent` adlı mesh'ler, üst havalandırma grubu (topVentGeo, fanWheelGeo, barGeo x3) ve alt tekerlek grubu (wheelGeo x4) içerir

---

## NODE ID STANDARD

  file: src\components\products\3d\types\DehumidifierModel.tsx
  function: src\components\products\3d\types\DehumidifierModel.tsx::DehumidifierModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: DehumidifierModel

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