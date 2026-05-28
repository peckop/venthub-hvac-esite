---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\FanRenderer.tsx
skeleton_hash: b26fb97ae335cca0
entity_hashes:
  func:FanRenderer: 6acd4deea60e5442
  overview: 4950f318713848c3
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:36:42Z
---

## Genel Bakış
FanRenderer.tsx, 3D fan modellerini görselleştiren bir React bileşenidir. Props olarak gelen slug, modelType, scale, explode ve onPartClick değerlerine göre modelin görünümünü ve etkileşimlerini ayarlar.

## Fonksiyon Grupları
### Ana Render Fonksiyonu
Bileşenin temel sorumluluğu, alınan parametreleri kullanarak 3D fan modelini ekrana çizdirmek ve kullanıcı tıklamalarını yakalamaktır.
- FanRenderer

---

## AXIOMS – Mimari Varsayımlar
Bu modülün doğru çalışması için aşağıdaki varsayımlar geçerlidir.

- Eğer **scale** prop’u verilmezse, varsayılan değer **1** kullanılır; aksi takdirde sağlanan değer etkili olur.  
- Eğer **explode** prop’u verilmezse, varsayılan değer **0** kullanılır; aksi takdirde sağlanan değer etkili olur.  
- Eğer **onPartClick** prop’u bir fonksiyon olarak sağlanmazsa, parça tıklama olayları işlenmez ve kullanıcı etkileşimi hiçbir eylem tetiklemez.  
- Eğer **slug** veya **modelType** prop’larından biri eksikse, bileşen hangi modelin render edileceğini belirleyemeyeceği için görüntüleme başarısız olur (boş veya hata durumu oluşur).  
- Eğer **MODEL_COMPONENTS** sabiti tanımlı değilse veya bu nesne, **modelType** prop’u ile eşleşen bir anahtar içermiyorsa, bileşen istenen modeli bulamayacak ve render işlemi başarısız olur.

---

## FONKSİYON DETAYLARI

### FanRenderer
**Ne yapar**: Belirtilen fan modelini (slug ve modelType ile) 3D ortamda render eder, ölçek ve patlama efektini ayarlar ve parçalara tıklandığında bir geri çağırma tetikler.  
**Nasıl yapar**: Bileşen, gelen `slug` ve `modelType` değerlerini kullanarak ilgili 3D modeli yükler, `scale` ile boyutunu, `explode` ile parçaların ayrılma miktarını ayarlar ve her bir parçaya `onPartClick` handler'ını bağlar. React'in fonksiyonel bileşen yapısıyla `React.FC<FanRendererProps>` tipini sağlar ve JSX döndürerek ekrana 3D fanı gösterir.  
**Parametreler**:
- slug: string — Hangi fan modelinin yükleneceğini tanımlayan benzersiz tanımlayıcı.
- modelType: string — Modelin varyantı veya kategorisi (örneğin, "axial", "centrifugal").
- scale: number — Modelin genel ölçek çarpanı; varsayılan değer 1.
- explode: number — Parçaların merkezden ne kadar uzakta görüneceğini kontrol eden patlama miktarı; varsayılan değer 0.
- onPartClick: (partId: string) => void — Bir parça tıklandığında çağrılacak fonksiyon; tıklanan parçanın kimliğini string olarak alır.
**Dönüş**: React.FC<FanRendererProps> — FanRendererProps tipindeki propsları alan ve 3D fanı render eden bir React fonksiyonel bileşeni.

---

## INTERFACES

### FanRendererProps
- `slug: string`
- `modelType?: string`
- `scale?: number`
- `explode?: number`
- `onPartClick?: (partName: string) => void`
- `selectedPart?: string | null`
- `isolatedPart?: string | null`
- `hiddenParts?: string[]`
- `displayStyle?: 'shaded' | 'shadedEdges' | 'wireframe' | 'hiddenLines'`
- `enableTooltip?: boolean`
- `position?: [number, number, number]`

### BaseModelProps
- `slug?: string`
- `scale?: number`
- `explode?: number`
- `onPartClick?: (partName: string) => void`
- `selectedPart?: string | null`
- `isolatedPart?: string | null`
- `hiddenParts?: string[]`
- `displayStyle?: 'shaded' | 'shadedEdges' | 'wireframe' | 'hiddenLines'`
- `enableTooltip?: boolean`
- `isHeated?: boolean`
- `showMixed?: boolean`

---

## SABİTLER
- **MODEL_COMPONENTS** (object) — `{
    'AxialFanModel': AxialFanModel as React.ComponentType<BaseModelProps>,...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\FanRenderer.tsx::FanRenderer
- **params**: slug, modelType, scale, explode, onPartClick, selectedPart, isolatedPart, hiddenParts, displayStyle, enableTooltip, position
- **ic_degiskenler**: 
  - `renderFan` — function that renders the appropriate fan model based on props
- **Dönüş**: React.FC<FanRendererProps> (JSX element)

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\FanRenderer.tsx::renderFan
- **params**: (none)
- **ic_degiskenler**: 
  - `s` — lowercased slug string
  - `ModelComponent` — component retrieved from MODEL_COMPONENTS by modelType
  - `extraProps` — partial props object for AirCurtainModel dynamic props
  - `isHeated` — boolean indicating if slug contains 'isitici' or 'elektrikli'
  - `isAmbient` — boolean indicating if slug contains 'ortam-havali' or 'naturel'
  - `showMixed` — boolean determining whether to show mixed air curtain props
- **Dönüş**: JSX.Element (various fan component JSX)

---

## NODE ID STANDARD

  file: src\components\products\3d\FanRenderer.tsx
  function: src\components\products\3d\FanRenderer.tsx::FanRenderer

---

## DISA AKTARILANLAR (EXPORTS)
  export: FanRenderer

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