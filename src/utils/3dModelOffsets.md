---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\3dModelOffsets.ts
skeleton_hash: b3a408f47684b4ab
entity_hashes:
  func:getModelPlacement: 52ef620921a90fe6
  overview: ed4492b80664afe2
generated_at: 2026-06-18T19:47:20Z
---

## Genel Bakış
Bu yardımcı modül, VentHub HVAC platformunda kullanılan 3B cihaz modellerinin sanal sahneye doğru ve tutarlı bir şekilde yerleştirilmesini sağlamakla sorumludur. Farklı model türleri ve kullanım bağlamaları için gerekli konum, ölçek ve offset (kaydırma) değerlerini merkezi olarak hesaplayarak tek bir yerleştirme nesnesi üretir. Tüm konumlandırma mantığını tek bir noktadan yöneterek modellerin sahnedaki doğru konumda görünmesini garanti altına alır.

## Fonksiyon Grupları
### 3B Model Yerleştirme Verisi Üretimi
Bu grup, modülün temel işlevini yerine getirir. Verilen model tanımlayıcıları (tür ve slug) ile kullanım bağlamını (ModelContext) işleyerek, ilgili 3B modelin sahnedaki doğru konumunu, ölçeğini ve rotasyonunu içeren eksiksiz yerleştirme verisini (ModelPlacement) hesaplar ve döndürür.
- getModelPlacement

---

## AXIOMS – Mimari Varsayımlar

Bu modül, 3D model yerleştirme konumlandırması için konfigürasyon tabanlı bir fallback mekanizmasına dayanır.

**[Aksiyom 1]:** Eğer `modelType` parametresi `undefined` olarak verilirse, modül `DEFAULT_CONFIG` yapılandırmasına geri döner ve model türüne özel konumlandırma yapılamaz.

**[Aksiyom 2]:** Eğer `slug` parametresi `undefined` olarak verilirse, modelin benzersiz tanımlayıcısı bilinmez ve yerleştirme verisi slug-bağımlı özelleştirmeleri içermez.

**[Aksiyom 3]:** Eğer `context` parametresi sağlanmazsa (zorunlu parametre, default değeri yok), fonksiyon çalışamaz çünkü modelin hangi kullanım bağlamında yerleştirileceği belirsizdir.

**[Aksiyom 4]:** Eğer verilen `modelType`, `MODEL_CONFIGS` nesnesinde tanımlı bir anahtar olarak mevcut değilse, `DEFAULT_CONFIG` değerleri kullanılarak genel bir yerleştirme verisi üretilir.

**[Aksiyom 5]:** Eğer `modelType` `MODEL_CONFIGS` içinde mevcutsa, o model türüne ait özel konumlandırma değerleri (offset, rotation, scale gibi) `DEFAULT_CONFIG` üzerine bindirilerek veya onun yerine kullanılarak yerleştirme verisi oluşturulur.

---

## FONKSİYON DETAYLARI

### getModelPlacement
**Ne yapar**: Verilen bir 3D model bileşeni için kesin yerleşim yapılandırmasını (pozisyon, döndürme ve ölçek faktörünü) belirler. Fonksiyon, modelin tipine veya ürün slug'ına göre uygun 3D yerleştirme parametrelerini hesaplar.

**Nasıl yapar**: Fonksiyon iki aşamalı bir arama stratejisi kullanır. Öncelikle, doğrudan `modelType` parametresini kullanarak `MODEL_CONFIGS` nesnesinde kesin bir eşleşme arar. Eğer bu eşleşme başarısız olursa, ikinci bir strateji olarak `slug` parametresinin küçük harfe çevrilmiş halini kullanarak karmaşık bir alt dize eşleştirmesi (substring matching) yürütür. Bu eşleştirmesi, Product3DViewer bileşeni ile birebir senkronize olan ve kategorilere göre tanımlanmış bir hiyerarşi izler. Eşleşme bulunduğunda, ilgili model yapılandırmasını (`MODEL_CONFIGS` içindeki bir `ModelConfig` nesnesini) alır ve ardından `context` parametresine göre (`'grounded'`, `'wall'` vb.) yerleştirme varyantını seçer. Son olarak, yapılandırma nesnesinden `position`, `rotation` (varsa) ve `scale` (varsa) değerlerini çıkararak standart bir `ModelPlacement` nesnesi döndürür.

**Parametreler**:
- `modelType`: `string | undefined` — 3D model bileşeninin açıklayıcı tanımlayıcısı (örn: 'AirCurtainModel'). Doğrudan model eşleştirmesi için kullanılır; eğer tanımlı ise slug tabanlı arama atlanır.
- `slug`: `string | undefined` — Ürünün URL uyumlu tanımlayıcısı. `modelType` başarısız olduğunda, modelin türünü tahmin etmek için alt dize eşleştirmesi bu parametre üzerinde yapılır.
- `context`: `ModelContext` — Modelin render edileceği bağlamı belirtir (örn: 'grounded', 'wall'). Fonksiyon, belirli bir model için bu bağlama karşılık gelen yerleşim varyantını seçer. Varsayılan değeri `'grounded'`'dir.

**Dönüş**: `ModelPlacement` — Resolve edilmiş model yerleşimini temsil eden bir nesne. İçerdiği alanlar: `position` (pozisyon koordinatları), `rotation` (döndürme açıları, varsayılan `[0, 0, 0]`) ve `scale` (ölçek faktörü, varsayılan `1`).

---

## INTERFACES

### ModelConfig
- `grounded: { position: ModelOffset; rotation?: ModelOffset; scale?: number }`
- `centered: { position: ModelOffset; rotation?: ModelOffset; scale?: number }`
- `orbital: { position: ModelOffset; rotation?: ModelOffset; scale?: number }`

### ModelPlacement
- `position: ModelOffset`
- `rotation: ModelOffset`
- `scale?: number`

---

## TYPE ALIASES

### ModelOffset
3D Model Offsets Utility Centralizes positioning logic for models in different contexts. Contexts: - 'grounded': Ürün Detay Sayfası (Model tabanı zemine oturur) - 'centered': Kategori Kartları / Overlay (Geometrik merkez y=0) - 'orbital':  Anasayfa Orbital Vitrin (Bağımsız ayarlanabilir)
```typescript
type ModelOffset = [number, number, number]
```

### ModelContext
```typescript
type ModelContext = 'grounded' | 'centered' | 'orbital'
```

---

## SABİTLER
- **DEFAULT_CONFIG** (object) — `{
    grounded: { position: [0, -0.55, 0], scale: 1 },
    centered: { posi...`
- **MODEL_CONFIGS** (object) — `{
    // ---------------------------------------------------------
    // 1...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: utils/3dModelOffsets.ts::getModelPlacement
- **params**: `(modelType: string | undefined, slug: string | undefined, context: ModelContext = 'grounded')`
- **ic_degiskenler**:
  - `p` — `MODEL_CONFIGS[modelType][context]` erişiminden dönen model yapılandırma nesnesi; explicit modelType eşleşmesinde pozisyon, rotasyon ve scale değerlerini barındırır
  - `s` — `slug` parametresinin lowercase'e çevrilmiş hali; tüm slug bazlı eşleştirme kontrollerinde kullanılır (null/undefined durumunda boş string fallback'i)
  - `config` — `DEFAULT_CONFIG` ile başlatılan `ModelConfig` değişkeni; slug içeriğine göre `MODEL_CONFIGs` içerisinden seçilen model yapılandırmasını tutar; her `if/else if` bloğunda farklı bir model ile güncellenir
  - `placement` — `config[context]` erişiminden dönen yerleştirme nesnesi; fonksiyonun nihai return değerini oluşturmak için position, rotation ve scale alanlarını sağlar
- **Dönüş**: `ModelPlacement` nesnesi — `{ position: [x, y, z], rotation: [x, y, z] (fallback: [0,0,0]), scale: number (fallback: 1) }`
- **Yan Etkileri**: Yok. Saf hesaplama (pure function).
- **Dinamik Erişimler**: `MODEL_CONFIGS[modelType]` — parametreye bağlı dinamik key erişimi; `MODEL_CONFIGS[modelType][context]` — iç içe dinamik key erişimi; `MODEL_CONFIGS['AirCurtainModel']`, `MODEL_CONFIGS['DuctFanModel']`, `MODEL_CONFIGS['JetFanModel']`, `MODEL_CONFIGS['ExproofFanModel']`, `MODEL_CONFIGS['RoofFanModel']`, `MODEL_CONFIGS['RectangularDuctFanModel']`, `MODEL_CONFIGS['WallMountedCompactFanModel']`, `MODEL_CONFIGS['DomesticFanModel']`, `MODEL_CONFIGS['AirPurifierModel']`, `MODEL_CONFIGS['SnailFanModel']`, `MODEL_CONFIGS['SmokeExhaustFanModel']`, `MODEL_CONFIGS['AxialFanModel']`, `MODEL_CONFIGS['PlugFanModel']`, `MODEL_CONFIGS['NicotraFanModel']`, `MODEL_CONFIGS['DehumidifierModel']`, `MODEL_CONFIGS['HRVModel']`, `MODEL_CONFIGS['FlexibleDuctModel']`, `MODEL_CONFIGS['AccessoryModel']`, `MODEL_CONFIGS['SpeedControlModel']` — sabit string key ile erişim; `config[context]` — parametreye bağlı dinamik key erişimi

---

## NODE ID STANDARD

  file: src\utils\3dModelOffsets.ts
  function: src\utils\3dModelOffsets.ts::getModelPlacement

---

## DISA AKTARILANLAR (EXPORTS)
  export: ModelContext
  export: ModelPlacement
  export: getModelPlacement