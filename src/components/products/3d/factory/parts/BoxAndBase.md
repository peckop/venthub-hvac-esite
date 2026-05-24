---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\parts\BoxAndBase.tsx
skeleton_hash: 4168a44472e1f65d
generated_at: 2026-05-23T22:19:01Z
---

## Genel Bakış
Bu modül, 3B ürün görselleştirme bağlamında bir kutunun ve tabanının bileşenini tanımlayan bir React bileşeni sağlar. Bileşen, görsel durumları (seçilmiş, izole edilmiş, gizli) ve kullanıcı etkileşimlerini (tıklama, patlama efekti) yöneterek ürün parçasının dinamik bir şekilde render edilmesini sağlar.

## Fonksiyon Grupları
### Görünüm ve Etkileşim Yönetimi
Bu grup, bileşenin görsel temsilini oluşturur ve dışardan gelen özelliklere göre durumunu günceller.
- BoxAndBase

---

## AXIOMS – Mimari Varsayımlar
[Bu modül için özel aksiyom tanımlanmamıştır.]

[Aksiyom 1]: Eğer `isSelected` prop'u verilmezse, component beklenen şekilde render edilmez veya hata oluşur.  
[Aksiyom 2]: Eğer `isIsolated` prop'u verilmezse, component beklenen şekilde render edilmez veya hata oluşur.  
[Aksiyom 3]: Eğer `isHidden` prop'u verilmezse, component beklenen şekilde render edilmez veya hata oluşur.  
[Aksiyom 4]: Eğer `onClick` prop'u verilmezse, component üzerindeki tıklama etkileşimi çalışmaz.  
[Aksiyom 5]: Eğer `explode` prop'u verilmezse, bu parametre için varsayılan değer belirtilmediği için davranış belirsizdir.

---

## FONKSIYON DETAYLARI

### BoxAndBase
**Ne yapar**: BoxAndBase, bir 3D kutusu ve taban parçasını görselleştiren bir React bileşenidir. Seçim, izolasyon, görünürlük, tıklama olayları ve isteğe bağlı patlama efekti gibi etkileşim durumlarını yönetir.

**Nasıl yapar**: Bileşen, gelen prop değerlerine dayalı olarak sınıf ve stil tanımlamalarını ayarlayarak kutunun ve tabanın render edilmesini sağlar. `onClick` prop’u üzerinden tıklama olayını yakalar, `explode` prop’u belirli bir eşik değeri aşarsa patlama animasyonunu tetikler (animasyon mantığı dışarıdaki bir kütüphane veya CSS ile gerçekleştirilir). `isSelected`, `isIsolated` ve `isHidden` bayrakları, öğenin görünürlüğü ve vurgulanma durumunu dinamik olarak değiştirir.

**Parametreler**:
- isSelected: boolean — Bileşenin şu anda seçili olup olmadığını gösterir.
- isIsolated: boolean — Bileşenin izole edilip edilmediğini (tekil görünüm) belirtir.
- isHidden: boolean — Bileşenin gizlenip gizlenmediğini belirler.
- onClick: function — Bileşene tıklandığında çağrılan geri çağırım fonksiyonu.
- explode: (type?) — Patlama animasyonunu tetikleyen isteğe bağlı bayrak; varsayılan değeri kod parçacığında belirtilmemiştir.

**Dönüş**: React.FC<BoxAndBaseProps> türünde bir işlev döndürür; bu işlev, verilen prop’lara göre BoxAndBase bileşenini render eder ve JSX çıktısı üretir.

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