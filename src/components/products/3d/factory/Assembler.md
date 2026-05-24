---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\Assembler.tsx
skeleton_hash: c8cc58b4d1c21209
generated_at: 2026-05-23T22:18:40Z
---

## Genel Bakış
Assembler.tsx, 3D ürün modellerini montaj ve görselleştirmek için kullanılan bir React bileşenidir. Blueprint verisini alır, parçaların patlama efekti, tıklama olayları ve seçili parça durumu gibi özellikleri yönetir.

## Fonksiyon Grupları
### Ana Render ve Etkileşim
Bileşen, gelen veriyi işleyerek 3D modeli oluşturur, kullanıcı etkileşimlerini yakalar ve gerekli görsel ayarları yapar.
- Assembler

---

## AXIOMS – Mimari Varsayımlar
Assembler component'ın render edilmesi ve etkileşim sağlanması için belirli prop'ların tanımlı ve beklenen tiplerde olması gerekir.

[Aksiyom 1]: Eğer **blueprint** prop'u tanımlı değilse, component rendersiz hata verir veya boş görüntülenir.  
[Aksiyom 2]: Eğer **onClickPart** prop'u tanımlı değilse, bir parça tıklandığında hiçbir işlem yapılmaz veya hata oluşur.  
[Aksiyom 3]: Eğer **selectedPart** prop'u tanımlı değilse, hiçbir parça seçili olarak gösterilmez (varsayılan olarak hiçbiri vurgulanmaz).  
[Aksiyom 4]: Eğer **explode** prop'u sayısal bir değer değilse, varsayılan değer 0 kullanılarak davranış beklenmedik olabilir.

---

## FONKSIYON DETAYLARI

### Assembler
**Ne yapar**: Verilen blueprint'e göre 3D ürün montajını render eder, parçaların etkileşimli seçimi ve patlama (explode) efekti sağlar.  
**Nasıl yapar**: Blueprint verisini işleyerek her bir parçayı uygun dönüşümlerle (explode miktarı uygulanarak) bir sahne üzerine yerleştirir; onPartClick callback'ini parçaların tıklama olaylarına bağlar ve selectedPart prop'u ile vurgulanmış parçayı stillendirir.  
**Parametreler**:  
- blueprint: object — Montajın yapılandırma ve geometri verisini içeren nesne (örn. parçaların model yolları, konumları, rotasyonlar).  
- explode: number — Parçaların merkezden ayrılma miktarı; 0 değeri montajı tam birleştirilmiş gösterir, pozitif değerler parçaları dışarı doğru dağıtır.  
- onClick: (partId: string) => void — Bir parça tıklandığında çağrılan fonksiyon; tıklanan parçanın kimliğini argüman olarak alır.  
- selectedPart: string | null — Şu anda vurgulanmış parçanın kimliği; null ise hiçbir parça vurgulanmaz.  
**Dönüş**: React.FC<AssemblerProps> — Assembler component'i, verilen props ile render edilerek etkileşimli 3D montaj görüntüsünü döndürür.

---

## INTERFACES

### PartConfig
- `name: string`
- `component: React.ElementType`
- `position?: [number, number, number]`
- `rotation?: [number, number, number]`
- `scale?: [number, number, number]`
- `props?: Record<string, unknown>`

### BluePrint
- `slug: string`
- `scale?: number`
- `parts: PartConfig[]`

### AssemblerProps
- `blueprint: BluePrint`
- `explode?: number`
- `onPartClick?: (partName: string) => void`
- `selectedPart?: string | null`
- `isolatedPart?: string | null`
- `hiddenParts?: string[]`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\Assembler.tsx::Assembler
- **params**: blueprint, explode, onPartClick, selectedPart, isolatedPart, hiddenParts
- **ic_degiskenler**: 
  - yok
- **Dönüş**: React.FC<AssemblerProps>

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\factory\Assembler.tsx::<anonymous>
- **params**: part, index
- **ic_degiskenler**: 
  - `Component` — tutar part.component değerini, React.createElement ile render edilecek bileşen referansı
  - `explodeOffset` — parçanın patlatılmış görünümü için hesaplanan [x, y, z] offset vektörü
- **Dönüş**: JSX.Element

---

## NODE ID STANDARD

  file: src\components\products\3d\factory\Assembler.tsx
  function: src\components\products\3d\factory\Assembler.tsx::Assembler

---

## DISA AKTARILANLAR (EXPORTS)
  export: Assembler