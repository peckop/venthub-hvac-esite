---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\FlexibleDuctModel.tsx
skeleton_hash: 31aa6bb1046bed18
entity_hashes:
  func:FlexibleDuctModel: 022fe00ec2478f53
  overview: e0034256dd24c9f4
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:45:55Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformu için esnek havalandırma kanallarının 3 boyutlu (3D) modellerini temsil eden bir React bileşenini tanımlar. Esnek kanalın geometrisini ve animasyonunu sahneye bağlayarak, ürünün 3D vitrinde görselleştirilmesini sağlar.

## Fonksiyon Grupları
### 3D Model Bileşeni
Esnek havalandırma kanalının 3D geometrisini, temel parametrelerini ve etkileşim mantığını yöneterek, ana sahneye entegre edilebilir bir bileşen halinde sunar.
- FlexibleDuctModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### FlexibleDuctModel

**Ne yapar**: Meksika dalgası animasyonlu, fiziksel tabanlı esnek hava kanalı modeli oluşturur. Three.js kütüphanesi kullanarak gerçek zamanlı animasyonlu 3B bir boru geometrisi ve spiral halka yapısı render eder.

**Nasıl yapar**: Her karede `useFrame` hook'u ile saat zamanına bağlı olarak sinüs dalgası içeren bir Catmull-Rom eğrisi hesaplanır. Bu eğri, `TubeGeometry` kullanılarak boru gövdesine dönüştürülür ve eski geometri atılarak yenisiyle değiştirilir. Ayrıca 20 adet torus halkası, eğrinin farklı noktalarına ve teğet yönüne hizalanarak spiral tel yapısı simüle edilir. `useMemo` ile başlangıç eğrisi önbelleklenir, `useFanMaterials` hook'u ile fan malzeme özellikleri alınır.

**Parametreler**:

Bu fonksiyon parametre almaz. Boş bir React bileşenidir.

**Dönüş**: JSX elementi (`JSX.Element`). `group` elemanı içinde 1.2x ölçeklendirilmiş iki ana alt eleman döner:
- Ana kanal gövdesi: renk `#b8c4ce`, `roughness: 0.2`, `metalness: 0.88` ile metalik bir `meshStandardMaterial` kullanır.
- Dış tel/spiro yapısı: 20 adet torus halkasından oluşan `group`, renk `#64748b`, `roughness: 0.5`, `metalness: 0.6` ile render edilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::FlexibleDuctModel
- **params**: (yok)
- **ic_degiskenler**:
  - `_materials` — useFanMaterials() hook'undan dönen fan malzeme seti, bu bileşende doğrudan JSX'te kullanılmıyor ancak bileşen içinde erişilebilir tutuluyor
  - `meshRef` — useRef<Mesh>(null), ana kanal gövdesi olan `<mesh>` elementine referans; useFrame içinde geometrisini güncellemek için kullanılır
  - `spiralRef` — useRef<Group>(null), spiral halkaların bulunduğu `<group>` elementine referans; useFrame içinde çocuklarının pozisyon/yönlendirme bilgilerini güncellemek için kullanılır
  - `createWaveCurve` — inner arrow function, verilen time parametresine göre sinüs dalga eğrisi (CatmullRomCurve3) oluşturan fonksiyon
  - `initialCurve` — useMemo(() => createWaveCurve(0), []) ile oluşturulmuş başlangıç eğrisi; JSX'te `<tubeGeometry>` argümanı olarak kullanılır
  - `spiralCount` — spiral halka adedi, sabit 20; JSX'te Array(spiralCount).fill(0).map ile halka mesh'lerini oluşturmak için kullanılır
- **Dönüş**: JSX (React Element) — scale=[1.2,1.2,1.2] boyutunda bir `<group>` içinde animasyonlu tubular kanal ve 20 adet torus spiral halka döner

### [N2_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::createWaveCurve
- **params**: `time` — number, animasyon zamanı (saniye cinsinden geçen süre)
- **ic_degiskenler**:
  - `points` — Vector3[] dizisi, CatmullRomCurve3'e verilecek eğri kontrol noktalarını tutar
  - `segments` — number, eğri分割 sayısı, sabit 30; döngüde 31 nokta (0 dahil) oluşturulur
  - `t` — number, for döngüsü içinde normalized parametre (0.0 - 1.0 arası), eğri üzerindeki konumu belirler
  - `x` — number, t değerinden türetilen x koordinatı; (t - 0.5) * 2.4 ile [-1.2, 1.2] aralığında değer alır
  - `wavePhase` — number, dalga faz açısı; t * Math.PI * 2 - time * 2 ile zamanla kaydırılmış dalga periyodu
  - `waveAmplitude` — number, dalga genliği; Math.sin(t * Math.PI) * 0.3 ile ortada maksimum, uçlarda sıfıra giden zarf
  - `y` — number, wavePhase ve waveAmplitude kullanılarak hesaplanan y koordinatı; sinüs dalgasının düşey sapması
- **Dönüş**: CatmullRomCurve3 — points dizisinden türetilmiş Catmull-Rom interpolasyon eğrisi

### [N3_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::useFrame_callback
- **params**: `state` — R3F frame state objesi; state.clock.elapsedTime ile geçen süreye erişilir
- **ic_degiskenler**:
  - `time` — number, state.clock.elapsedTime'dan alınan toplam geçen süre (saniye), dalga animasyonu için zaman girdisi
  - `curve` — CatmullRomCurve3, createWaveCurve(time) çağrısı ile o anki zamana göre oluşturulmuş dinamik eğri
  - `newGeometry` — TubeGeometry, curve eğrisi üzerine inşa edilmiş tüp geometrisi (radyal segments=64, tubular segments=24, yarıçap=0.28)
  - `spiralCount` — number, spiralRef.current.children.length ile elde edilen gerçek çocuk (halka) sayısı
  - `t` — number, for döngüsü içinde normalized parametre (0.0 - 1.0), eğri üzerindeki konu
  - `point` — Vector3, curve.getPoint(t) ile eğri üzerindeki t konumundaki 3D nokta; spiral halkanın pozisyonu olarak kullanılır
  - `tangent` — Vector3, curve.getTangent(t) ile eğri üzerindeki t konumundaki teğet vektörü; quaternion hesaplamak için kullanılır
  - `child` — Object3D, spiralRef.current.children[i] ile erişilen mevcut spiral halka mesh nesnesi; position ve quaternion'u güncellenir
  - `quaternion` — Quaternion, yeni Quaternion() ile oluşturulmuş sıfır döndürme; setFromUnitVectors ile Z ekseni (0,0,1) teğet vektörüne hizalanır
- **Dönüş**: yok (her frame çağrıldığında meshRef ve spiralRef üzerindeki geometri/pozisyon/yönlendirme değerlerini yan etki olarak günceller)

### [N4_NASIL] AST Pointer: src/components/products/3d/types/FlexibleDuctModel.tsx::JSX_map_callback
- **params**: `_` — unused, Array.map'in ilk parametresi (değer), kullanılmıyor; `i` — number, dizge içindeki indeks, mesh key'i olarak kullanılır
- **ic_degiskenler**: (yok)
- **Dönüş**: JSX — `<mesh>` elementi içinde `<torusGeometry args={[0.29, 0.018, 8, 24]}>` (dış yarıçap=0.29, tüp yarıçapı=0.018, 8×24 segment) ve `<meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.6}>` ile oluşturulmuş bir torus (halka) mesh'i

---

## NODE ID STANDARD

  file: src\components\products\3d\types\FlexibleDuctModel.tsx
  function: src\components\products\3d\types\FlexibleDuctModel.tsx::FlexibleDuctModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: FlexibleDuctModel

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