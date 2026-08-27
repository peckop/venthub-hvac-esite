---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\core\SceneLightingRig.tsx
skeleton_hash: ce22c292a1901b9c
entity_hashes:
  func:SceneLightingRig: 0b8be391d9cf4aa9
  overview: c682b535a83680d7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:06:01Z
---

## Genel Bakış
Bu modül, 3D ürün sahnesinin aydınlatma düzenini oluşturan bir React bileşenidir. Farklı ortam önayarlarına göre ışıklandırma yapılandırmasını yönetir. `src/components/products/3d/core` altında konumlandığından, 3D ürün görüntüleme sisteminin çekirdek altyapısının bir parçasıdır.

## Fonksiyon Grupları

### Sahne Aydınlatma Bileşeni
Ortam önayarı parametresine (`env`) bağlı olarak 3D sahne için aydınlatma düzenini tanımlar ve render eder. Varsayılan ortam değeri `'product'` olarak belirlenmiştir; `EnvPresetKey` tipiyle desteklenen diğer ortam değerleri farklı aydınlatma konfigürasyonlarına karşılık gelir.
- SceneLightingRig

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi sağlanmadığından, yalnızca imzadan çıkarılabilen varsayımlar belirlenebilir.

[Aksiyom 1]: Eğer `EnvPresetKey` tipi tanımlı değilse, bileşen derleme hatası verir.

[Aksiyom 2]: Eğer `RIG_INTENSITY` sabiti modül kapsamında mevcut değilse, bileşen çalışamaz.

[Aksiyom 3]: Eğer `env` parametresi sağlanmazsa, değer `'product'` olarak varsayılır.

---

## FONKSİYON DETAYLARI

### SceneLightingRig
**Ne yapar**: 3B sahne için gerçek zamanlı bir ışıklandırma donanımı (lighting rig) oluşturur. Ortam ışığı, anahtar (KEY), dolgu (FILL) ve görüntü tabanlı aydınlatma (IBL) katmanlarını bir araya getirerek ürün görselleştirmede dengeli, parlak ve gölgeleri doldurulmuş bir aydınlatma sağlar. Farklı ortam önayarlarına (`env`) göre ışık şiddetleri ölçeklenir.

**Nasıl yapar**: Fonksiyon, `RIG_INTENSITY` sabit nesnesinden verilen `env` parametresine karşılık gelen bir katsayı (`k`) okur. Bu katsayı, sahnedeki tüm ışık şiddetlerine çarpılarak ortam önayarına göre parlaklık ayarlaması yapılır. Dört katmanlı bir ışıklandırma mimarisi kurulur:

1. **Ambient ışık** (`ambientLight`): Genel ortam aydınlatması sağlar; mat ürünlerin karanlıkta kalmaması için belirgin düzeyde yüksek tutulur (şiddet: `0.85 * k`).

2. **KEY ışığı** (`directionalLight`, birinci): Ön-merkezden, hafif sağ-üstten gelen ana ışık kaynağıdır. Ürünün kameraya bakan ön yüzünü aydınlatır. Gölge oluşturur (`castShadow`), gölge haritası boyutu 1024 pikseldir. Pozisyon `[3, 5, 12]` ile önden ve hafif yandan gelir; tepeden gelen ışığın ön yüzü gölgede bırakma sorunu bu konumlandırma ile giderilmiştir. Şiddet: `1.8 * k`.

3. **FILL ışığı** (`directionalLight`, ikinci): Sol-ön taraftan gelen dolgu ışığıdır. Gölge oluşturmaz (maliyet düşük); ürünün gölge kalan yüzünü gerçek ışıkla doldurur. IBL'in mat yüzeyleri aydınlatamayacağı belirtildiğinden bu gerçek ışık kaynağı gereklidir. Şiddet: `1.0 * k`.

4. **IBL / Environment** (`Environment` bileşeni): Prosedürel bir stüdyo ortamı oluşturur; yalnızca metalik yüzeylerde yansıma ve parlaklık (pop) sağlar, mat aydınlatma yukarıdaki gerçek ışıklardan gelir. Çözünürlük 512, kare sayısı 1'dir. İçinde dört `Lightformer` tanımlıdır:
   - **KEY env**: Ön-sağda, hafif sıcak renkli (`#fff4e6`) dikdörtgen; şiddet `2.0 * k`, konum `[5, 4, 9]`, ölçek `[10, 10, 1]`.
   - **FILL env**: Ön-solda, soğuk renkli (`#dbeafe`) dikdörtgen; şiddet `1.6 * k`, konum `[-6, 2, 6]`, ölçek `[8, 8, 1]`.
   - **RIM/BACK**: Arkadan-üstten hafif kenar ışığı sağlayan beyaz dikdörtgen; şiddet `1.2 * k`, konum `[0, 6, -6]`, ölçek `[6, 2.5, 1]`.
   - **TOP**: Tepeden yumuşak, genel ortam aydınlatması sağlayan beyaz daire; şiddet `1.0 * k`, konum `[0, 8, 0]`, ölçek `[6, 6, 1]`.

Tüm bu bileşenler bir React fragment (`<>...</>`) içinde döndürülür.

**Parametreler**:
- `env`: `EnvPresetKey` — Ortam önayar anahtarı. `RIG_INTENSITY` nesnesinden bu anahtarla eşleşen katsayı okunur ve tüm ışık şiddetlerine çarpılır. Varsayılan değeri `'product'`'dur. Opsiyoneldir.

**Dönüş**: JSX elementi (React fragment). İçinde `ambientLight`, iki `directionalLight` ve bir `Environment` bileşeni (dört `Lightformer` ile birlikte) barındıran bir fragment döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @react-three/drei::Environment
- import: @react-three/drei::Lightformer

---

## TYPE ALIASES

### EnvPresetKey
```typescript
type EnvPresetKey = 'product' | 'showcase' | 'nav' | 'authority'
```

---

## SABİTLER
- **RIG_INTENSITY** (object) — `{
  product: 1,
  showcase: 1.2,
  nav: 0.7,
  authority: 1,
}`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: SceneLightingRig.tsx::SceneLightingRig
- **params**: `env` (varsayılan: `'product'`, tip: `EnvPresetKey`)
- **ic_degiskenler**:
  - `k` — `RIG_INTENSITY[env]` değerini tutar, tüm ışık şiddetlerinin çarpanı olarak kullanılır.
- **Dönüş**: JSX (React elementi)

---

## NODE ID STANDARD

  file: src\components\products\3d\core\SceneLightingRig.tsx
  function: src\components\products\3d\core\SceneLightingRig.tsx::SceneLightingRig

---

## DISA AKTARILANLAR (EXPORTS)
  export: EnvPresetKey
  export: SceneLightingRig

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