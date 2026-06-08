---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\parts\Motor.tsx
skeleton_hash: 6c17ea2e9332c593
entity_hashes:
  func:Motor: 7953538ac04d68b8
  overview: 16f2e6768a864156
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:09:30Z
---

## Genel Bakış
Bu modül, 3D motor parçalarını görselleştirmek için kullanılan bir React bileşenini tanımlar. Bileşen, ölçek, renk ve montaj gösterimi gibi özellikleri kabul ederek motorun farklı görsel varyantlarını üretir.

## Fonksiyon Grupları
### Ana Bileşen
Motorun 3D modelini oluşturup render eden temel işlevi yerine getirir.
- Motor

---

## AXIOMS – Mimari Varsayımlar
Bu modül için özel aksiyom tanımlanmamıştır.

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

## INTERFACES

### MotorProps
- `scale?: number`
- `color?: 'galvanized' | 'ral7035' | 'blue'`
- `showMount?: boolean`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/parts/Motor.tsx::Motor
- **params**: scale, color, showMount
- **ic_degiskenler**:
  - `materials` — result of the `useFanMaterials` hook; provides the material objects (e.g., `industrialSteel`, `matteBlack`, `ral7035`, `ral5010`) used throughout the component.
  - `bodyMaterial` — memoized value created by `useMemo`; selects the appropriate body material based on the `color` prop using the `materials` object.
- **Dönüş**: React element (JSX) representing the motor — a `<group>` containing meshes for the motor body, end caps, shaft, terminal box, and optional mount.

### [N2_NASIL] AST Pointer: src/components/products/3d/parts/Motor.tsx::useMemo callback (bodyMaterial selector)
- **params**: (none)
- **ic_degiskenler**:
  - `color` — the `color` prop passed to the `Motor` component; determines which material to return (`'galvanized'`, `'ral7035'`, or default).
  - `materials` — the material object returned by `useFanMaterials`; provides the specific material definitions accessed via property lookup.
- **Dönüş**: a material object (one of `materials.industrialSteel`, `materials.ral7035`, or `materials.ral5010`) that is used as the `material` prop for the motor’s body mesh.

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