---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\types\SmokeExhaustFanModel.tsx
skeleton_hash: 44f5fafd7d5ad45e
entity_hashes:
  func:SmokeExhaustFanModel: c28c0967fe520092
  overview: 1eb1668eb0e6040c
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-10T09:50:31Z
---

## Genel Bakış
Bu modül, Venthub HVAC platformunda duman tahliye fanlarının 3 boyutlu modelinin tarayıcı ortamında render edilmesini sağlayan tekil bir React bileşenidir. Üçüncü parti 3B grafik kütüphaneleriyle entegre olarak, ürünlerin interaktif 3D görüntülenmesi için temel bir yapı taşı görevi görür.

## Fonksiyon Grupları
### 3D Fan Model Bileşeni
Bu grup, modülün tek ve temel bileşeni olan duman tahliye fanının 3D modelinin tüm render sürecini ve görünüm mantığını yönetir.
- SmokeExhaustFanModel

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

---

## FONKSİYON DETAYLARI

### SmokeExhaustFanModel

**Ne yapar**: Duman egzoz fanının (Smoke Exhaust Fan) tam 3D modelini render eden React Three Fiber bileşenidir. Fanın gövdesi, flanşları, rotoru (6 bıçaklı), motoru ve montaj ayaklarını oluşturan kapsamlı bir model bileşenidir.

**Nasıl yapar**: `useFanMaterials` hook'u ile malzemeleri alır, `useRef` ile rotor referansını tutar. `useFrame` hook'u her karede rotorun z-ekseninde sabit hızla dönmesini sağlar. Bıçak geometrisi, `useMemo` ile performans optimizasyonu yapılarak tek seferde oluşturulur. Bıçak şekli, bezier eğrileri ile "uzun kama" (Long Cleaver) formunda tanımlanır. Tüm 3D nesneler JSX yapısında hiyerarşik olarak render edilir.

**Parametreler**:
- Fonksiyon parametre almamaktadır (boş parametre listesi)

**Dönüş**:
- `JSX.Element` — Three.js sahnesine yerleştirilecek 3D fan modelini temsil eden React bileşeni döndürür. Bileşen `group` elemanı ile sarılmıştır ve genel ölçek `[0.65, 0.65, 0.65]`, döndürme `[0, -Math.PI / 4, 0]` değerleriyle ayarlanmıştır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\components\products\3d\types\SmokeExhaustFanModel.tsx::SmokeExhaustFanModel
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan dönen malzeme nesnesi, tüm mesh elemanlarında kullanılır (smokeCoating, castBladeMat, matteBlack, boltMaterial)
  - `rotorRef` — `useRef<Group>(null)` ile oluşturulan referans, rotor grubunu temsil eder, `useFrame` içinde döndürülür
  - `bladeGeometry` — `useMemo` ile memoize edilmiş `ExtrudeGeometry` nesnesi, fan bıçağı geometrisini oluşturur, JSX içinde bıçak mesh'lerine atanır
- **Dönüş**: JSX (React Three Fiber bileşeni) - Duman egzoz fanı 3D modelini render eden React bileşeni döner

---

## NODE ID STANDARD

  file: src\components\products\3d\types\SmokeExhaustFanModel.tsx
  function: src\components\products\3d\types\SmokeExhaustFanModel.tsx::SmokeExhaustFanModel

---

## DISA AKTARILANLAR (EXPORTS)
  export: SmokeExhaustFanModel

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