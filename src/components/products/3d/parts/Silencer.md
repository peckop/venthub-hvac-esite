---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\parts\Silencer.tsx
skeleton_hash: 0fef1b08fa4df660
entity_hashes:
  func:Silencer: b0d56de6b93be1bd
  overview: 82793f5cbf0c62b3
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:10:50Z
---

## Genel Bakış

Bu modül, HVAC ürünlerinin 3 boyutlu görselleştirilmesinde kullanılan silindirik bir susturucu parçasını temsil eden bir React bileşeni içerir. Bileşen, silindirin yarıçapı, uzunluğu ve 3D sahadaki konumu gibi temel geometrik parametreleri alarak yapılandırılabilir bir parça oluşturur. Modül, daha geniş bir 3D ürün sahnesi içinde tek bir parçayı temsil etmek üzere tasarlanmış yalın bir bileşendir.

## Fonksiyon Grupları

### Bileşen Tanımı ve Oluşturma

Bu grup, susturucu parçasının geometrisini ve 3D sahadaki konumunu tanımlayan tek bir React fonksiyonel bileşenini kapsar. Varsayılan değerlerle birlikte radius, length ve position parametreleri alır; geçersiz geometrik değerlerde (negatif veya sıfır) silindirik yapı tanımsız hale gelir. Bileşen, bir 3D sahne bağlamı dışında render edilirse görüntülenemez.

- Silencer

## Bağımlılıklar ve Mimari Notlar

- **İç bağımlılık yoktur**: Modül tek bir bileşenden oluşur, başka fonksiyon veya modül çağırmaz.
- **Dış bağımlılıklar**: Kaynakta açıkça belirtilmemiştir; ancak `React.FC` dönüş tipinden React bağımlılığı kesin, 3D render mekanizması bilinmiyor.
- **Dinamik/lazy yükleme**: Kaynakta bu yönde bir tanımlama bulunmamaktadır.
- **Mimari önem**: Bu bileşen, daha büyük bir 3D ürün sahnesinin alt parçası olarak konumlanır; tek sorumluluğu susturucu geometrisini parametreler aracılığıyla oluşturmaktır.

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Silencer
**Ne yapar**: Silencer bileşeni, HVAC sistemlerinde ses azaltma amacıyla kullanılan bir susturucu (silencer) modelini oluşturur. Silindir şeklinde bir dış kabuk ve iç kısmında delikli yüzey barındırarak gürültüyü düşürür.  
**Nasıl yapar**: Bileşen, verilen `radius`, `length` ve `position` parametrelerini kullanarak bir silindir geometrisi üretir; iç yüzeye delikli bir pattern ekleyerek ses emme özelliğini simüle eder ve bu geometriyi React üzerinden JSX olarak döndürür.  
**Parametreler**:
- radius: number — Silindirin yarıçapı (metre cinsinden), varsayılan değer 0.6  
- length: number — Silindirin uzunluğu (metre cinsinden), varsayılan değer 0.8  
- position: number[] — Silencerin 3D uzayda konumunu belirten [x, y, z] koordinatları, varsayılan değer [0, 0, 0]  
**Dönüş**: React.FC<SilencerProps> — Bir React fonksiyonel bileşeni döndürür; render edildiğinde silencerin 3D modelini ekrana çizer.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: three::BoxGeometry
- import: three::CylinderGeometry
- import: three::RingGeometry
- import: three::TorusGeometry

---

## INTERFACES

### SilencerProps
- `radius?: number`
- `length?: number`
- `position?: [number, number, number]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: Silencer.tsx::Silencer
- **params**: `radius` (varsayılan 0.6), `length` (varsayılan 0.8), `position` (varsayılan [0, 0, 0])
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; `materials.galvanizedSteel`, `materials.industrialSteel`, `materials.matteBlack` alanlarına erişilir
  - `geometries` — `useMemo` ile memoize edilmiş geometri nesnesi; `geometries.outerCasingGeo`, `geometries.flangeGeo`, `geometries.innerLinerGeo`, `geometries.perforationRingGeo`, `geometries.reinforcementRingGeo`, `geometries.bracketGeo` alanlarına erişilir
- **Dönüş**: JSX — `position` prop'u ile konumlandırılmış `<group>` elementi; dış kasa silindiri, flanşlar, iç delikli astar, perforasyon halkaları, yapısal takviye halkaları ve montaj braketlerini içerir

### [N2_NASIL] AST Pointer: Silencer.tsx::useMemo callback
- **params**: yok
- **ic_degiskenler**:
  - `outerCasingGeo` — `new CylinderGeometry(radius, radius, length, 64, 1, true)` ile oluşturulan açık uçlu dış kasa silindir geometrisi
  - `flangeGeo` — `new RingGeometry(radius * 0.9, radius, 32)` ile oluşturulan flanş halka geometrisi
  - `innerLinerGeo` — `new CylinderGeometry(radius * 0.85, radius * 0.85, length * 0.95, 48, 4, true)` ile oluşturulan iç astar silindir geometrisi
  - `perforationRingGeo` — `new RingGeometry(radius * 0.7, radius * 0.9, 32)` ile oluşturulan perforasyon halka geometrisi
  - `reinforcementRingGeo` — `new TorusGeometry(radius * 1.02, 0.015, 8, 32)` ile oluşturulan takviye torus geometrisi
  - `bracketGeo` — `new BoxGeometry(0.06, 0.08, 0.12)` ile oluşturulan montaj braketi kutu geometrisi
- **Dönüş**: nesne — altı geometri nesnesini içeren `{ outerCasingGeo, flangeGeo, innerLinerGeo, perforationRingGeo, reinforcementRingGeo, bracketGeo }`

### [N3_NASIL] AST Pointer: Silencer.tsx::useEffect callback
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: cleanup fonksiyonu — `geometries` nesnesindeki tüm geometrilerin `dispose()` metodunu çağırarak VRAM bellek sızıntısını önler

### [N4_NASIL] AST Pointer: Silencer.tsx::useEffect cleanup
- **params**: yok
- **ic_degiskenler**: yok
- **Dönüş**: yok — `Object.values(geometries).forEach(geo => geo.dispose())` ile her geometri nesnesinin dispose edilmesi işlemini yürütür

### [N5_NASIL] AST Pointer: Silencer.tsx::Array(6).fill(0).map callback
- **params**: `_` (kullanılmayan eleman), `i` (dizin)
- **ic_degiskenler**:
  - `zPos` — `-length / 2 + (i + 1) * (length / 7)` hesaplamasıyla elde edilen perforasyon halkasının uzunluk ekseni boyunca konumu
- **Dönüş**: JSX — `key={i}`, `position={[0, zPos, 0]}`, `rotation={[Math.PI / 2, 0, 0]}` ile konumlandırılmış, `geometries.perforationRingGeo` geometrisi ve `materials.matteBlack` malzemesi kullanılan `<mesh>` elementi

### [N6_NASIL] AST Pointer: Silencer.tsx::[-0.3, 0, 0.3].map callback
- **params**: `z` (z ekseni konum değeri), `i` (dizin)
- **ic_degiskenler**: yok
- **Dönüş**: JSX — `key={i}`, `position={[0, 0, z]}`, `rotation={[Math.PI / 2, 0, 0]}` ile konumlandırılmış, `geometries.reinforcementRingGeo` geometrisi ve `materials.industrialSteel` malzemesi kullanılan `<mesh>` elementi

### [N7_NASIL] AST Pointer: Silencer.tsx::[0, 120, 240].map callback
- **params**: `angle` (derece cinsinden açı), `i` (dizin)
- **ic_degiskenler**: yok
- **Dönüş**: JSX — `key={i}`, `rotation={[0, (angle * Math.PI) / 180, 0]}` ile döndürülmüş `<group>` içinde, `position={[radius + 0.04, 0, 0]}` konumunda, `geometries.bracketGeo` geometrisi ve `materials.galvanizedSteel` malzemesi kullanılan `<mesh>` elementi

---

## NODE ID STANDARD

  file: src\components\products\3d\parts\Silencer.tsx
  function: src\components\products\3d\parts\Silencer.tsx::Silencer

---

## DISA AKTARILANLAR (EXPORTS)
  export: Silencer

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