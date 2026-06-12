---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\3dModelOffsets.ts
skeleton_hash: daea88c8e1af2853
entity_hashes:
  func:getModelPlacement: 590e61b55bfb4fa0
  overview: ed4492b80664afe2
generated_at: 2026-05-28T22:38:44Z
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

**Ne yapar**: Verilen bir 3D model türü (veya ürün slug'ı) ve kullanım bağlamına göre, modelin 3D sahnedeki yerleştirilme yapılandırmasını (konum, rotasyon, ölçek) belirler. Fonksiyon, önce `modelType` parametresiyle doğrudan eşleşme arar; bulunamazsa `slug` parametresindeki alt dize eşleme stratejisiyle modeli otomatik olarak algılar.

**Nasıl yapar**: Fonksiyon iki aşamalı bir çözümleme stratejisi kullanır. Birinci aşamada `MODEL_CONFIGS` sözlüğünde `modelType` ile doğrudan eşleşme kontrol edilir ve bulunursa ilgili bağlama karşılık gelen yapılandırma döndürülür. İkinci aşamada, `modelType` bulunamadığında veya tanımsız olduğunda `slug` parametresi küçük harfe çevrilerek bir dizi `includes()` kontrolü gerçekleştirilir. Bu kontroller belirli bir öncelik sırasıyla (örneğin exproof modeller Roof ve Snail fanlardan önce kontrol edilir) çalışır ve eşleşen ilk kategoriye ait `MODEL_CONFIGS` girdisi seçilir. Hiçbir eşleşme bulunamazsa `DEFAULT_CONFIG` kullanılır. Seçilen yapılandırma nesnesinin ilgili bağlama (grounded, floating vb.) karşılık gelen alt nesnesinden position, rotation ve scale değerleri çıkarılarak bir `ModelPlacement` nesnesi döndürülür.

**Parametreler**:
- `modelType` : `string | undefined` — 3D model bileşeninin açıklayıcı tanımlayıcısıdır (örn. `'AirCurtainModel'`, `'JetFanModel'`). Bu değer doğrudan `MODEL_CONFIGS` sözlüğünde aranır; eğer geçerli bir tanımlayıcıysa slug tabanlı eşleme atlanır. Tanımsız bırakılabilir, bu durumda slug eşlemesine geçilir.
- `slug` : `string | undefined` — Ürün sayfasının URL dostu kısa adıdır (örn. `'perde-fani-atex'`, `'kanal-tipi-sessiz-fan'`). Fonksiyon bu dizgi içinde geçen belirli anahtar kelimeleri kontrol ederek hangi model yapılandırılmasının uygulanacağını çıkarım yoluyla belirler. `modelType` geçerli olmadığında birincil dayanak noktasıdır.
- `context` : `ModelContext` — Modelin render edileceği bağlamı belirtir (varsayılan değer `'grounded'`). Bu parametre, seçilen model yapılandırması içindeki hangi konum/rotasyon/ölçek varyantının kullanılacağını kontrol eder; örneğin model yerde mi duruyor, havada mı süzülüyor gibi senaryoları tanımlar.

**Dönüş**: `ModelPlacement` — Modelin 3D sahnedeki nihai yerleştirilme bilgisini içeren bir nesne döndürür. Bu nesne şu alanları içerir: `position` (modelin 3D koordinatlarındaki konumu, bir sayı dizisi), `rotasyon` (modelin eksene göre döndürme açıları, tanımsızsa `[0, 0, 0]` varsayılanı kullanılır) ve `scale` (modelin boyut çarpanı, tanımsızsa `1` yani orijinal boyut kullanılır). Dönüş değeri her zaman bu üç alanı barındırır ve çağrı tarafında modelin sahneye nasıl yerleştirileceğini doğrudan tanımlar.

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

### [N1_NASIL] AST Pointer: src/utils/3dModelOffsets.ts::getModelPlacement
- **params**: `modelType: string | undefined` — Ürünün model tipi (ör. 'DuctFanModel'), `slug: string | undefined` — Ürünün URL slug'ı, `context: ModelContext` — Yerleşim bağlamı, varsayılan 'grounded'
- **ic_degiskenler**:
  - `p` — MODEL_CONFIGS[modelType] objesinden verilen context'e karşılık gelen yerleşim verisi (position, rotation, scale)
  - `s` — Slug'un küçük harfe çevrilmiş hali; eşleştirme mantığında kullanılır, slug yoksa boş string olur
  - `config` — Seçilen modelin tüm context'lerini içeren ModelConfig objesi, başlangıçta DEFAULT_CONFIG olarak atanır
  - `placement` — Slug tabanlı eşleştirmeler sonucunda seçilen config objesinin verilen context'e karşılık gelen yerleşim verisi
- **Dönüş**: `ModelPlacement` — `{ position: [x,y,z], rotation: [x,y,z], scale: number }` yapısında model yerleşim bilgisi. Fonksiyon iki yol ile çalışır: (1) modelType doğrudan verilmişse MODEL_CONFIGS içinden direkt eşleşme, (2) eşleşme yoksa slug'daki anahtar kelimeler aracılığıyla hiyerarşik eşleştirme yapılarak uygun config seçilir. Her iki durumda da rotation tanımsızsa [0,0,0], scale tanımsızsa 1 olarak varsayılır.

---

## NODE ID STANDARD

  file: src\utils\3dModelOffsets.ts
  function: src\utils\3dModelOffsets.ts::getModelPlacement

---

## DISA AKTARILANLAR (EXPORTS)
  export: ModelContext
  export: ModelPlacement
  export: getModelPlacement