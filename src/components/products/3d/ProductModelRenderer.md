---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\ProductModelRenderer.tsx
skeleton_hash: b26390e1f1f52c7c
entity_hashes:
  func:ProductModelRenderer: 237b305d513f801a
  overview: 1442a4e9eb2d798e
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-20T04:59:31Z
---

## Genel Bakış
HVAC ürünlerinin 3D modellerini görüntülemek için kullanılan bir React bileşenidir. Ürünün parçalarını interaktif olarak gösterir, yakınlaştırma ve Exploded View (parçaları ayırma) desteği sunar. Kullanıcıların 3D model üzerindeki parçalara tıklayarak etkileşimde bulunmasını sağlar.

## Fonksiyon Grupları

### Ürün Modeli Görselleştirme
Ürünün 3D modelini belirtilen parametrelere göre tarayıcıda render eder. Model tipine ve ölçek değerine göre uygun 3D görüntüyü oluşturur.
- ProductModelRenderer

### Etkileşim Yönetimi
Kullanıcı etkileşimlerini işler; parçalara tıklama olaylarını üst bileşene iletir. Exploded View moduyla parçaların ayrılmasını kontrol eder.
- explode parametresi, onPartClick callback

---

## AXIOMS – Mimari Varsayımlar

Bu modül, ürün 3D modelini slug ve modelType parametrelerine göre render eden bir React bileşenidir. Aşağıdaki mimari varsayımlar fonksiyon imzası ve modül sabitlerinden çıkarılmıştır.

**[Aksiyom 1]:** Eğer `slug` prop'u sağlanmamışsa, modül hangi ürünün render edileceğini bilemez ve bileşen çalışamaz.

**[Aksiyom 2]:** Eğer `modelType` prop'u sağlanmamışsa, `MODEL_COMPONENTS` objesinden eşleşecek bileşen bulunamaz ve render başarısız olur.

**[Aksiyom 3]:** Eğer `modelType` değeri `MODEL_COMPONENTS` objesinin bir key'i olarak mevcut değilse, bileşen render edilemez. `MODEL_COMPONENTS`'in mevcut anahtarı bilinmiyor; bu nedenle geçerli `modelType` değerlerinin listesi bilinmiyor.

**[Aksiyom 4]:** Eğer `onPartClick` callback fonksiyonu sağlanmamışsa, kullanıcı 3D modelde bir parçaya tıkladığında tetiklenecek bir işleyici olmaz ve tıklama olayı işlenemez.

**[Aksiyom 5]:** Eğer `scale` prop'u negatif veya sıfırdan küçük bir değer olarak verilirse, 3D modelin boyutlandırılmasında beklenmedik sonuçlar oluşabilir (varsayılan değer: `1`).

**[Aksiyom 6]:** Eğer `explode` prop'u beklenen aralık dışinda bir değer olarak verilirse, parçaların ayrılma mesafesi anlamsız olabilir (varsayılan değer: `0`, yani explode kapalı).

---

## FONKSİYON DETAYLARI

### ProductModelRenderer

**Ne yapar**: HVAC ürünlerinin 3D model görselleştirilmesini sağlayan React bileşenidir. Verilen ürün slug'ı ve model türüne göre interaktif bir 3D model render eder ve kullanıcının parçalar üzerinde etkileşimde bulunmasına olanak tanır.

**Nasıl yapar**: Bileşen, product slug ve modelType parametrelerini kullanarak ilgili 3D model dosyasını yükler. Scale parametresi ile modelin boyutunu, explode parametresi ile parçaların ayrılma (patlatılmış görünüm) mesafesini kontrol eder. Parçalara tıklandığında onPartClick callback fonksiyonunu çağırarak üst bileşene bilgi aktarır. Bu bileşen, 3D sahne yönetimini ve model animasyonlarını dahili olarak yönetir.

**Parametreler**:

- `slug`: `string` — Ürünün benzersiz tanımlayıcısı. 3D model dosyasının hangi ürüne ait olduğunu belirler. Örnek: "ahu-3000" veya "chiller-x200".

- `modelType`: `string` — Render edilecek 3D modelin türünü belirtir. Aynı ürünün farklı model varyasyonlarını (örn: iç görünüm, dış görünüm, teknik çizim) göstermek için kullanılır.

- `scale`: `number` — Varsayılan değeri `1` olan sayısal değer. 3D modelin ölçek çarpanını belirler. Değerin artması modeli büyütür, azaltması küçültür. Ekran boyutuna veya kullanım bağlamına göre modelin görünümünü ayarlamak için kullanılır.

- `explode`: `number` — Varsayılan değeri `0` olan sayısal değer. Parçaların birbirinden ne kadar uzakta olacağını kontrol eder. `0` değeri parçaların montajlı durumda olduğunu, pozitif değerler parçaların birbirinden ayrıldığı "patlatılmış görünüm"ü temsil eder. Bakım ve eğitim amaçlı parçaları göstermek için idealdir.

- `onPartClick`: `(partId: string) => void` — 3D model üzerinde herhangi bir parçaya tıklandığında tetiklenen callback fonksiyonu. Tıklanan parçanın benzersiz kimliğini (partId) üst bileşene iletir. Parça detay gösterimi, seçim durumu yönetimi veya navigasyon için kullanılır.

**Dönüş**: `React.FC<ProductModelRendererProps>` — Bileşen, ProductModelRendererProps arayüzüne uygun özelliklerle oluşturulmuş bir fonksiyonel React bileşeni döndürür. Bu bileşen, 3D canvas nộierikli interaktif bir model görüntüleyici olarak sayfada render edilir.

---

## İTHALATLAR (IMPORTS)
- import: ./factory/VorticeLineoModel::VorticeLineoModel
- import: ./types/AccessoryModel::AccessoryModel
- import: ./types/AirCurtainModel::AirCurtainModel
- import: ./types/AirPurifierModel::AirPurifierModel
- import: ./types/AxialFanModel::AxialFanModel
- import: ./types/CentrifugalFanModel::CentrifugalFanModel
- import: ./types/DehumidifierModel::DehumidifierModel
- import: ./types/DomesticFanModel::DomesticFanModel
- import: ./types/DuctFanModel::DuctFanModel
- import: ./types/DuctFanModel::RectangularDuctFanModel
- import: ./types/ExproofFanModel::ExproofFanModel
- import: ./types/FlexibleDuctModel::FlexibleDuctModel
- import: ./types/HRVModel::HRVModel
- import: ./types/JetFanModel::JetFanModel
- import: ./types/NicotraFanModel::NicotraFanModel
- import: ./types/PlugFanModel::PlugFanModel
- import: ./types/RoofFanModel::RoofFanModel
- import: ./types/RoundDuctFanModel::RoundDuctFanModel
- import: ./types/SilentChannelFanModel::SilentChannelFanModel
- import: ./types/SmokeExhaustFanModel::SmokeExhaustFanModel
- import: ./types/SnailFanModel::SnailFanModel
- import: ./types/SpeedControlModel::SpeedControlModel
- import: ./types/WallMountedCompactFanModel::WallMountedCompactFanModel
- import: react::React

---

## INTERFACES

### ProductModelRendererProps
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

### [N1_NASIL] AST Pointer: components/products/3d/ProductModelRenderer.tsx::ProductModelRenderer
- **params**: (slug, modelType, scale = 1, explode = 0, onPartClick, selectedPart, isolatedPart, hiddenParts = [], displayStyle = 'shaded', enableTooltip = true, position = [0, 0, 0])
- **ic_degiskenler**:
  - `renderModel` — React fonksiyon bileşeni içinde, model tipine göre hangi 3D model component'ini render edeceğini belirleyen iç içe bir fonksiyon.
- **Dönüş**: JSX elementi (`<group>` ile sarılmış `renderModel()` çağrı sonucu).

### [N2_NASIL] AST Pointer: components/products/3d/ProductModelRenderer.tsx::renderModel
- **params**: (yok)
- **ic_degiskenler**:
  - `s` — `slug` parametresinin küçük harfli hali; tüm model seçimi koşulları bu değişken üzerinde `includes()` kontrolü yapılarak çalışır.
  - `modelType` — Fonksiyon parametresi; `MODEL_COMPONENTS` objesinde model component'ini aramak için kullanılır.
  - `ModelComponent` — `modelType` ile `MODEL_COMPONENTS` objesinden eşleşen React component'i; bu bileşen return edilmeden önce değişken olarak atanır.
  - `extraProps` — `AirCurtainModel` component'ine özel, dinamik olarak eklenen prop'ları tutan partial obje; `isHeated` ve `showMixed` prop'ları burada tanımlanır.
  - `isHeated` — Boolean değişken; slug içinde `isitici` veya `elektrikli` geçiyorsa `true` olur; `extraProps.isHeated` ve `AirCurtainModel` prop'u olarak kullanılır.
  - `isAmbient` — Boolean değişken; slug içinde `ortam-havali` veya `naturel` geçiyorsa `true` olur; `extraProps.showMixed` hesaplamasında ve `AirCurtainModel` prop'u olarak kullanılır.
  - `showMixed` — Boolean değişken; `isHeated` ve `isAmbient`'e göre `AirCurtainModel`'e gönderilecek karışık tip gösterim prop'u.
- **Dönüş**: Seçilen model component'ine ait JSX elementi.

---

## NODE ID STANDARD

  file: src\components\products\3d\ProductModelRenderer.tsx
  function: src\components\products\3d\ProductModelRenderer.tsx::ProductModelRenderer

---

## DISA AKTARILANLAR (EXPORTS)
  export: ProductModelRenderer

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