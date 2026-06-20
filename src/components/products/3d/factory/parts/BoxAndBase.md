---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\parts\BoxAndBase.tsx
skeleton_hash: da95a04dbfd26fb3
entity_hashes:
  func:BoxAndBase: af353be0b7cd10d8
  overview: 1776944b67282716
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:47:11Z
---

## Genel Bakış
Bu modül, 3B ürün görselleştirmelerinde kullanılan bir kutu ve taban parçası bileşenini tanımlayan bir React modülüdür. Bileşen, parçanın seçilmiş, izole veya gizli gibi görsel durumlarını; tıklama etkileşimi ve isteğe bağlı patlama efekti gibi dinamik davranışları yöneterek esnek ve etkileşimli bir render sağlar.

## Fonksiyon Grupları
### Bileşen Görselliği ve Etkileşimi
Bu grup, 3D parçanın temel görsel temsilini oluşturur ve dış prop değerlerine göre görünüm ile etkileşimlerini kontrol eder.
- BoxAndBase

---

## AXIOMS – Mimari Varsayımlar
Bu modül, 3B ürün görselleştirmesinde kutu ve taban bileşenini render eden bir React bileşenidir.

[Aksiyom 1]: Eğer `isSelected` boolean değer olarak sağlanmazsa, bileşen seçili durumunu doğru gösteremez.

[Aksiyom 2]: Eğer `isIsolated` boolean değer olarak sağlanmazsa, bileşen izole durumunu doğru gösteremez.

[Aksiyom 3]: Eğer `isHidden` boolean değer olarak sağlanmazsa, bileşen gizlilik durumunu doğru uygulayamaz.

[Aksiyom 4]: Eğer `onClick` fonksiyonu sağlanmazsa, kullanıcı tıklama etkileşiminde bulunamaz (bileşen tıklanamaz hale gelir).

[Aksiyom 5]: Eğer `explode` değeri verilmezse, varsayılan değer (bilinmiyor) kullanılır ve patlama efekti bu değere göre hesaplanır.

---

## FONKSİYON DETAYLARI

### BoxAndBase

**Ne yapar**: BoxAndBase, HVAC ürün görselleştirme sisteminde 3D sahnede bir kutu ve temel (base) birleşiğini temsil eden React bileşenidir. Bu bileşen, ürünün ana gövdesini ve üzerindeki kutu bölümünü three.js tabanlı 3D ortamda render eder.

**Nasıl yapar**: Bileşen, aldığı durum parametrelerine göre 3D nesnenin görünürlüğünü, izolasyon durumunu ve seçim durumunu kontrol eder. Explode parametresi ile bileşenlerin birbirinden ayrılma animasyonunu yönetir. Kullanıcı etkileşimi için onClick handler'ı ile tıklama olaylarını işler.

**Parametreler**:
- isSelected: boolean — Bileşenin şu anda seçili olup olmadığını belirtir. Seçili durumda görsel geri bildirim (highlight) uygulanır.
- isIsolated: boolean — Bileşenin izole modda olup olmadığını belirtir. İzole modda bileşen tek başına vurgulanarak gösterilir.
- isHidden: boolean — Bileşenin gizli olup olmadığını belirtir. true değerinde bileşen 3D sahneden kaldırılır.
- onClick: () => void — Bileşene tıklandığında tetiklenen geri çağırım fonksiyonu. Kullanıcı etkileşimini üst bileşene iletir.
- explode: number (varsayılan: 0) — Bileşenler arasındaki ayrılma mesafesini kontrol eden sayısal değer. 0'da bileşenler birleşik, artan değerlerde birbirinden uzaklaşır.

**Dönüş**: React.FC<BoxAndBaseProps> — BoxAndBaseProps arayüzü ile tanımlı özelliklere sahip React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ../../materials/useFanMaterials::useFanMaterials
- import: react::React

---

## INTERFACES

### BoxAndBaseProps
- `isSelected?: boolean`
- `isIsolated?: boolean`
- `isHidden?: boolean`
- `onClick?: () => void`
- `explode?: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/factory/parts/BoxAndBase.tsx::BoxAndBase
- **params**: isSelected, isIsolated, isHidden, onClick, explode
- **ic_degiskenler**:
  - `materials` — `useFanMaterials()` hook'undan dönen malzeme nesnesi (safetyOrange, matteBlack gibi renk özelliklerini içerir)
  - `boxMaterial` — `isSelected` true ise `materials.safetyOrange`, false ise `materials.matteBlack` değeri; grup üzerindeki junction box'ın materyalini belirler
- **Dönüş**: JSX.Element

### [N2_NASIL] AST Pointer: src/components/products/3d/factory/parts/BoxAndBase.tsx::(e) => { e.stopPropagation(); onClick?.() }
- **params**: e
- **ic_degiskenler**: (yok)
- **Dönüş**: void

---

## NODE ID STANDARD

  file: src\components\products\3d\factory\parts\BoxAndBase.tsx
  function: src\components\products\3d\factory\parts\BoxAndBase.tsx::BoxAndBase

---

## DISA AKTARILANLAR (EXPORTS)
  export: BoxAndBase

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