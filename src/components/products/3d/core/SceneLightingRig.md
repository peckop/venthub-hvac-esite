---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\core\SceneLightingRig.tsx
skeleton_hash: b19a37140ae44e77
entity_hashes:
  func:SceneLightingRig: 0b8be391d9cf4aa9
  overview: c682b535a83680d7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-20T05:01:25Z
---

## Genel Bakış
SceneLightingRig, 3D sahne ortamında farklı kullanım senaryolarına göre ışıklandırma düzenini kuran bir React bileşenidir. Ortam parametresiyle (örneğin ürün gösterimi veya genel kullanım) farklı ışıklandırma presetlerini aktif ederek sahnenin aydınlık ve gölge koşullarını belirler.

## Fonksiyon Grupları
### Sahne Işıklandırma Bileşeni
Sahne için gerekli ışık kaynaklarını ve ortam ayarlarını tanımlayan merkezi React bileşenidir.
- SceneLightingRig

---

## AXIOMS – Mimari Varsayımlar

Bu modül için aksiyonlar, fonksiyon imzası ve modül sabitleri üzerinden çıkarılmıştır.

**[Aksiyom 1]:** Eğer `env` parametresi `EnvPresetKey` tipinde bir değer değilse (geçersiz bir key girilirse), modülün hangi ışıklandırma preset'ini kullanacağı bilinmiyor olur.

**[Aksiyom 2]:** Eğer `env` parametresi geçirilmezse, bileşen `'product'` değerini varsayılan olarak kullanır ve ürün odaklı ışıklandırma düzeni (rig) ile çalışır.

**[Aksiyom 3]:** Eğer `RIG_INTENSITY` objesi tanımlı değilse veya beklenen yapıda (obje) değilse, ışıklandırma intensite değerlerine erişilemez ve sahne aydınlığı hatalı çalışır.

**[Aksiyom 4]:** Eğer `RIG_INTENSITY` objesinin içinde `env` parametresine karşılık gelen bir key yoksa, intensite değeri bilinmiyor olur ve ışıklandırma düzgün ayarlanamaz.

---

**Not:** Bu modül bir React bileşeni (TSX) olduğundan, doğru çalışması için bir 3D sahne ortamının (muhtemelen Three.js / React Three Fiber) mevcut olması gerekir; ancak bu bileşen imzasından çıkarılamadığı için aksiyom olarak listelenmemiştir.

---

## FONKSİYON DETAYLARI

### SceneLightingRig

**Ne yapar**: Verilen ortam (environment) ön ayarına göre 3D sahne için çok katmanlı bir aydınlatma düzeneği kurar. Ambient, key directional, fill directional, IBL environment ve birden fazla lightformer içeren复合 bir ışık sistemi oluşturarak hem mat hem metal yüzeylerin doğru aydınlatılmasını sağlar.

**Nasıl yapar**: Fonksiyon, `RIG_INTENSITY` adlı bir sözlükten ortam adına karşılık gelen intensity çarpanını (`k`) okur. Ardından JSX içinde sırasıyla: genel ortam aydınlatması (`ambientLight`), ana anahtar ışık (`directionalLight` — ön-merkez, hafif sağ-üst konumlu, gölge yayan), dolgu ışığı (`directionalLight` — sol-ön konumlu, gölge yüzünü dolduran) ve prosedürel stüdyo ortamı (`Environment` içine gömülü dört `Lightformer`) oluşturur. Her bir ışık intensity değeri `k` çarpanıyla çarpılarak farklı ortam presetlerinde farklı parlaklık seviyeleri elde edilir. JSDoc yorumlarında belirtildiği üzere, bu düzenleme v5 ve v6.iterasyonlarda mat yüzeylerin yeterince aydınlatılmaması sorununu çözmek için ambient değerinin artırılması (0.55→0.85), key ışığın konumunun ve gücünün ayarlanması ve gerçek ikinci bir fill directional eklenmesiyle geliştirilmiştir.

**Parametreler**:

- `env`: `EnvPresetKey` (opsiyonel, varsayılan: `'product'`) — Sahne için kullanılacak ortam aydınlatma ön ayarının anahtarı. Bu değer `RIG_INTENSITY` sözlüğünde aranarak tüm ışık kaynaklarının yoğunluğu için bir çarpan (`k`) elde edilir; böylece farklı ürün sahne türleri için aydınlatma profili tek parametreyle değiştirilebilir.

**Dönüş**: Bileşen JSX döndürür — `React.ReactNode` (React fragment içinde ambientLight, iki adet directionalLight ve Environment/Lightformer bileşenleri).

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
- **params**: (`{ env = 'product' }: { env?: EnvPresetKey }`)
  - `env` — Ortam preset anahtarı (varsayılan: 'product')
- **ic_degiskenler**:
  - `k` — `RIG_INTENSITY[env]` erişiminden elde edilen ışık yoğunluk çarpanı
- **Dönüş**: JSX (React Three Fiber sahne ışıklandırma bileşeni)
  - Ortam parametresine göre ölçeklenmiş ambient, key, fill ışıkları ve Environment/Lightformer JSX yapısını döndürür
- **API Kullanımları**:
  - `RIG_INTENSITY[env]` — Sabit objeden env parametresine göre yoğunluk değeri alınır
  - `Environment` — @react-three/drei'den import edilen ortam ışıklandırma bileşeni
  - `Lightformer` — @react-three/drei'den import edilen özel ışık forming bileşeni
- **JSX Yapısı**:
  - `<ambientLight>` — Ortam ışığı (0.85 * k yoğunluğunda)
  - `<directionalLight position={[3,5,12]}>` — Key ışığı (1.8 * k, gölgeli)
  - `<directionalLight position={[-7,4,9]}>` — Fill ışığı (1.0 * k)
  - `<Environment resolution={512} frames={1}>` — Prosedürel stüdyo ortamı
    - `<Lightformer>` — Key, fill, rim/back ve top ışıkları için 4 adet rect/circle lightformer

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