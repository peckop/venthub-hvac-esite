---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\types\RoundDuctFanModel.tsx
skeleton_hash: ec7f26710b712cd9
entity_hashes:
  func:RoundDuctFanModel: d2c6b37b5aca3633
  overview: b3f12c2afff10131
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:22:57Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin 3D ürün görselleştirme katmanında, yuvarlak kanal fanı tipine özel bir 3D model bileşeni barındırır. Modül, sadece bu spesifik fan tipinin üç boyutlu geometrisini oluşturup kullanıcı arayüzünde render etmekle sorumludur. Projenin genel 3D ürün sunum altyapısıyla entegre çalışacak şekilde tasarlanmıştır.

## Fonksiyon Grupları
### Yuvarlak Kanal Fanı 3D Model Bileşeni
Modülün tek sorumluluğunu üstlenen bu grup, yuvarlak kanal fanının 3D modelini oluşturan ve render eden React bileşenini içerir. Bileşen, ürünün 3D katmanında bu fan tipi için ayrılmış görselleştirme görevini yerine getirir.
- RoundDuctFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### RoundDuctFanModel
**Ne yapar**: VentHub HVAC projesinin ürün kategorisindeki yuvarlak kanallı fanların 3 boyutlu görselleştirmesini sağlamak amacıyla geliştirilmiş temel React bileşenidir. Proje içerisinde HVAC sistemleri bileşenlerinin 3D olarak kullanıcı arayüzünde sunulması sürecinde, sadece yuvarlak kanal fanı modelini render etmek için özel olarak tasarlanmıştır.
**Nasıl yapar**: Projenin src/components/products/3d/types dizininde tanımlanan bu fonksiyon, React ekosisteminin standart fonksiyonel bileşen standartlarına uygun olarak yapılandırılmıştır. Çağrıldığında projenin kullandığı 3D render altyapısıyla entegre çalışabilecek, fan modelini kullanıcı ekranına çizebilecek nitelikte bir React bileşeni oluşturur ve kullanıma sunar.
**Parametreler**:
- Bu ana fonksiyonun tanımında belirtilen herhangi bir giriş parametresi bulunmamaktadır. Fonksiyon kendisine ait herhangi bir parametre almaksızın çalışır.
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Döndürülen bu bileşen, projenin ilgili ürün sayfalarında veya diğer üst bileşenlerinde çağrılarak yuvarlak kanal fanının 3 boyutlu modelini kullanıcı arayüzünde başarıyla render etme görevini yerine getirir.

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
- import: three::type { Group }

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/types/RoundDuctFanModel.tsx::RoundDuctFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` çağrısından dönen malzeme nesnesi; `materials.ral7035`, `materials.matteBlack`, `materials.fanRed` olarak erişilir
  - `fanRef` — `useRef<Group>(null)` ile oluşturulan ref; fan pervane grubunun DOM referansını tutar, `useFrame` içinde `fanRef.current.rotation.z` güncellenir
  - `centralBodyGeom` — `useMemo(() => new CylinderGeometry(0.55, 0.55, 0.7, 32), [])` ile oluşturulan ana gövde silindir geometrisi
  - `clampGeom` — `useMemo(() => new CylinderGeometry(0.56, 0.56, 0.1, 32), [])` ile oluşturulan kelepçe silindir geometrisi
  - `coneGeom` — `useMemo(() => new CylinderGeometry(0.45, 0.55, 0.3, 32), [])` ile oluşturulan giriş/çıkış koni geometrisi
  - `spigotGeom` — `useMemo(() => new CylinderGeometry(0.45, 0.45, 0.2, 32), [])` ile oluşturulan kanal bağlantı ağzı geometrisi
  - `baseGeom` — `useMemo(() => new BoxGeometry(1.0, 0.1, 0.6), [])` ile oluşturulan montaj kaidesi kutu geometrisi
  - `armGeom` — `useMemo(() => new BoxGeometry(0.1, 0.6, 0.4), [])` ile oluşturulan kaide kolu kutu geometrisi
  - `terminalBoxGeom` — `useMemo(() => new BoxGeometry(0.3, 0.2, 0.3), [])` ile oluşturulan harici klemens kutusu geometrisi
  - `cableGlandGeom` — `useMemo(() => new CylinderGeometry(0.04, 0.04, 0.1, 16), [])` ile oluşturulan kablo rakoru silindir geometrisi
  - `fanHubGeom` — `useMemo(() => new CylinderGeometry(0.15, 0.15, 0.1, 32), [])` ile oluşturulan fan göbeği silindir geometrisi
  - `bladeGeom` — `useMemo(() => new BoxGeometry(0.25, 0.05, 0.4), [])` ile oluşturulan pervane kanadı kutu geometrisi
- **Dönüş**: JSX — `scale={[0.6, 0.6, 0.6]}` uygulanmış `<group>` içinde ana gövde, giriş/çıkış konileri, montaj kaidesi, klemens kutusu ve dönen pervane grubu render edilir

---

### [N2_NASIL] AST Pointer: src/components/products/3d/types/RoundDuctFanModel.tsx::useFrame callback
- **params**: `state`, `delta`
- **ic_degiskenler**:
  - `state` — React Three Fiber frame state nesnesi; bu fonksiyon gövdesinde doğrudan kullanılmaz
  - `delta` — iki kare arasındaki süre (saniye); `fanRef.current.rotation.z` güncellemesinde çarpan olarak kullanılır
  - `fanRef.current` — koşullu erişim (`if (fanRef.current)`) ile kontrol edilir; `.rotation.z` özelliği `delta * 15` kadar azaltılır (döndürme)
- **Dönüş**: yok

---

### [N3_NASIL] AST Pointer: src/components/products/3d/types/RoundDuctFanModel.tsx::useEffect cleanup factory
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `centralBodyGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
  - `clampGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
  - `coneGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
  - `spigotGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
  - `baseGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
  - `armGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
  - `terminalBoxGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
  - `cableGlandGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
  - `fanHubGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
  - `bladeGeom` — bağımlılık dizisinde yer alır; cleanup içinde `.dispose()` çağrılır
- **Dönüş**: cleanup fonksiyonu — tüm geometrilerin `.dispose()` metodunu çağıran temizleme fonksiyonu döndürür

---

### [N4_NASIL] AST Pointer: src/components/products/3d/types/RoundDuctFanModel.tsx::useEffect cleanup
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `centralBodyGeom` — `.dispose()` ile GPU belleği serbest bırakılır
  - `clampGeom` — `.dispose()` ile GPU belleği serbest bırakılır
  - `coneGeom` — `.dispose()` ile GPU belleği serbest bırakılır
  - `spigotGeom` — `.dispose()` ile GPU belleği serbest bırakılır
  - `baseGeom` — `.dispose()` ile GPU belleği serbest bırakılır
  - `armGeom` — `.dispose()` ile GPU belleği serbest bırakılır
  - `terminalBoxGeom` — `.dispose()` ile GPU belleği serbest bırakılır
  - `cableGlandGeom` — `.dispose()` ile GPU belleği serbest bırakılır
  - `fanHubGeom` — `.dispose()` ile GPU belleği serbest bırakılır
  - `bladeGeom` — `.dispose()` ile GPU belleği serbest bırakılır
- **Dönüş**: yok

---

### [N5_NASIL] AST Pointer: src/components/products/3d/types/RoundDuctFanModel.tsx::Array(9).fill(0).map callback
- **params**: `_`, `i`
- **ic_degiskenler**:
  - `_` — `Array(9).fill(0)` elemanı; kullanılmaz, atlanır
  - `i` — döngü indeksi (0–8); `key` prop'u olarak ve `(i / 9) * Math.PI * 2` formülüyle her kanadın Y ekseni rotasyonunu hesaplamak için kullanılır
  - `materials.fanRed` — dışarıdan erişilen malzeme; kanat mesh'inin `material` prop'una atanır
  - `bladeGeom` — dışarıdan erişilen geometri; kanat mesh'inin `geometry` prop'una atanır
- **Dönüş**: JSX — her iterasyonda `rotation={[0, (i / 9) * Math.PI * 2, 0]}`, `position={[0.25, 0, 0]}`, `rotation-y={0.5}` uygulanmış `<mesh>` döndürür

---

## NODE ID STANDARD

  file: src\components\products\3d\types\RoundDuctFanModel.tsx
  function: src\components\products\3d\types\RoundDuctFanModel.tsx::RoundDuctFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: RoundDuctFanModel

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