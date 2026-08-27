---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\parts\Motor.tsx
skeleton_hash: 45b2b306751b4478
entity_hashes:
  func:Motor: 7953538ac04d68b8
  overview: c8d15a8b96138db8
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:10:08Z
---

## Genel Bakış
Bu modül, 3D motor parçasının görsel temsilini oluşturan bir React fonksiyonel bileşeni tanımlar. Bileşen, ölçek, renk ve montaj parçalarının görünürlüğü gibi özellikleri kabul ederek motor modelinin farklı varyantlarını üretir.

## Fonksiyon Grupları
### Ana Bileşen
Motorun 3D modelini verilen özelliklere göre oluşturup render eden temel bileşeni içerir. Varsayılan değerlerle birlikte ölçek, renk ve montaj gösterimi kontrol edilebilir.
- Motor

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### Motor
**Ne yapar**: Motor adlı fonksiyon, scale, color ve showMount özelliklerini kabul eden bir React fonksiyonel bileşeni tanımlar. Bu bileşen, verilen özelliklere göre bir motor parçasının görsel temsili üretir.  
**Nasıl yapar**: Fonksiyon, ES6 parametre yıkımıyla varsayılan değerler (scale = 1, color = 'galvanized', showMount = false) alınan props objesini alır ve bu değerleri iç JSX'te kullanarak bileşenin çıktısını oluşturur. Return ifadesi, React.FC<MotorProps> türünde bir fonksiyon döndürür, yani bileşen JSX elementi üretir.  
**Parametreler**:  
- scale: number — motor modelinin boyut ölçeğini belirler; 1 varsayılan değeri orijinal boyutu temsil eder.  
- color: string — motorun rengini veya yüzey acabini tanımlar; varsayılan 'galvanized' değeri çinko kaplı bir görünüm sağlar.  
- showMount: boolean — motorun montaj parçalarının gösterilip gösterilmeyeceğini kontrol eder; false olduğunda bu parçalar gizlenir.  
**Dönüş**: React.FC<MotorProps> — fonksiyon, belirtilen props türüne uygun bir React fonksiyonel bileşeni döndürür; bu bileşen render edildiğinde motorun 3D görselleşmesini sağlayan JSX elementi üretir.

---

## İTHALATLAR (IMPORTS)
- import: ../core::useResolveMaterials
- import: react::React
- import: react::useEffect
- import: react::useMemo
- import: three

---

## INTERFACES

### MotorProps
- `scale?: number`
- `color?: 'galvanized' | 'ral7035' | 'blue'`
- `showMount?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/parts/Motor.tsx::Motor
- **params**:
  - `scale` — motor ölçeği, varsayılan değer 1
  - `color` — motor rengi, varsayılan değer `'galvanized'`
  - `showMount` — montaj ayağı gösterim durumu, varsayılan değer `false`
- **ic_degiskenler**:
  - `materials` — `useResolveMaterials()` hook'undan dönen malzeme nesnesi; `materials.industrialSteel`, `materials.ral7035`, `materials.ral5010`, `materials.matteBlack` alanlarına erişilir
  - `bodyGeom` — `useMemo` ile oluşturulan `THREE.CylinderGeometry(0.35, 0.35, 0.8, 32)`; motor ana gövde geometrisi
  - `capGeom` — `useMemo` ile oluşturulan `THREE.CylinderGeometry(0.36, 0.36, 0.05, 32)`; ön ve arka kapak geometrisi
  - `shaftGeom` — `useMemo` ile oluşturulan `THREE.CylinderGeometry(0.08, 0.08, 0.4, 16)`; mil geometrisi
  - `rearBumpGeom` — `useMemo` ile oluşturulan `THREE.CylinderGeometry(0.2, 0.2, 0.1, 16)`; arka çıkıntı geometrisi
  - `terminalBoxGeom` — `useMemo` ile oluşturulan `THREE.BoxGeometry(0.25, 0.1, 0.25)`; klemens kutusu geometrisi
  - `cableGlandGeom` — `useMemo` ile oluşturulan `THREE.CylinderGeometry(0.03, 0.03, 0.06, 8)`; kablo rakoru geometrisi
  - `mountGeom` — `useMemo` ile oluşturulan `THREE.BoxGeometry(0.6, 0.1, 0.4)`; montaj ayağı geometrisi
  - `bodyMaterial` — `color` parametresine göre `materials.industrialSteel`, `materials.ral7035` veya `materials.ral5010` döndüren `useMemo` ile hesaplanan malzeme
- **Dönüş**: JSX elementi — `<group scale={scale}>` içinde motor parçalarını (gövde, ön kapak, mil, arka kapak, klemens kutusu, kablo rakoru, opsiyonel montaj ayağı) render eden React bileşeni

### [N2_NASIL] AST Pointer: src/components/products/3d/parts/Motor.tsx::useEffect cleanup fonksiyonu
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `bodyGeom` — dispose edilen motor gövde geometrisi
  - `capGeom` — dispose edilen kapak geometrisi
  - `shaftGeom` — dispose edilen mil geometrisi
  - `rearBumpGeom` — dispose edilen arka çıkıntı geometrisi
  - `terminalBoxGeom` — dispose edilen klemens kutusu geometrisi
  - `cableGlandGeom` — dispose edilen kablo rakoru geometrisi
  - `mountGeom` — dispose edilen montaj ayağı geometrisi
- **Dönüş**: yok — bileşen unmount olduğunda tüm geometrilerin VRAM'den temizlenmesini sağlar

### [N3_NASIL] AST Pointer: src/components/products/3d/parts/Motor.tsx::bodyMaterial useMemo fonksiyonu
- **params**: (parametre yok — closure ile `color` ve `materials` değişkenlerine erişir)
- **ic_degiskenler**:
  - `color` — dış scope'dan gelen renk parametresi; `'galvanized'` ise `materials.industrialSteel`, `'ral7035'` ise `materials.ral7035`, diğer durumda `materials.ral5010` döner
  - `materials` — dış scope'dan gelen malzeme nesnesi; `materials.industrialSteel`, `materials.ral7035`, `materials.ral5010` alanlarına erişilir
- **Dönüş**: THREE.Material — `color` parametresine uygun malzeme nesnesi

---

## NODE ID STANDARD

  file: src\components\products\3d\parts\Motor.tsx
  function: src\components\products\3d\parts\Motor.tsx::Motor

---

## DISA AKTARILANLAR (EXPORTS)
  export: Motor

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