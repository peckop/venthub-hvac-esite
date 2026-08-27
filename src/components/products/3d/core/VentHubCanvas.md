---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-urun-comp\src\components\products\3d\core\VentHubCanvas.tsx
skeleton_hash: 71e305d731ad866f
entity_hashes:
  func:VentHubCanvas: 4908f485b830ec98
  overview: 17c94d72d1b419fe
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-08-27T07:06:01Z
---

## Genel Bakış
VentHubCanvas, 3D ürün görselleştirme için kullanılan bir React bileşenidir. Modül, `VentHubCanvasProps` arayüzüyle tanımlanan yapılandırma seçenekleri alır ve çocuk bileşenleri bir 3D canvas ortamında render eder. `preset` parametresi varsayılan olarak `'product'` değerine sahiptir.

## Fonksiyon Grupları

### Ana Bileşen
VentHubCanvas, 3D canvas alanını oluşturan ve yapılandırılabilir bir ortam sağlayan temel bileşendir. `children`, `preset`, `environment`, `tenantId` ve `frameloop` parametrelerini kabul eder.
- VentHubCanvas

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden, yalnızca imzadan ve sabitlerden çıkarılabilecek varsayımlar belirlenmiştir.

[Aksiyom 1]: Eğer `preset` parametresi çağrıda belirtilmezse, varsayılan olarak `'product'` değeri kullanılır.

[Aksiyom 2]: Eğer `PRESET_ENV` sabitinde `preset` değerine karşılık gelen bir `environment` eşlemesi yoksa, hangi environment'ın kullanılacağı bilinmiyor.

[Aksiyom 3]: Eğer `VentHubCanvasProps` tipinde beklenen `frameloop` parametresi sağlanmazsa, bileşenin nasıl davranacağı fonksiyon gövdesi verilmediğinden bilinmiyor.

---

## FONKSİYON DETAYLARI

### VentHubCanvas

**Ne yapar**: Uygulamanın tek geçerli 3D Canvas/renderer dayanıklılık kabuğudur. SSOT §1 / A5 kapsamında tanımlanmıştır. Ham `<Canvas>` bileşeninin başka bir yerde kullanılması YASAKTIR (INV-3D-2/4). Belirtilen katman sırası load-bearing (yük taşıyıcı) niteliğindedir ve sırasıyla: `ResilientCanvasBoundary` (DOM, Canvas-DIŞI) > `Canvas` > `ContextLossRecovery` + prosedürel `SceneLightingRig` (dosya YOK) + `TenantSceneProvider` > `children` şeklindedir.

**Nasıl yapar**: Fonksiyon, aldığı props'lardan `dpr` değerini `useDeviceDpr` hook'u ile hesaplar. `environment` parametresi verilmezse `PRESET_ENV` haritasından `preset` anahtarıyla eşleştirilen değer kullanılır. `tenantId` verilmezse `DEFAULT_TENANT_ID` sabiti devreye girer. Dıştan içe doğru katmanlı bir yapı kurar: En dışta `ResilientCanvasBoundary` bileşeni DOM seviyesinde hata yakalama sağlar; bu bileşenin `fallback` prop'u verilmezse varsayılan olarak `<Static3DFallback />` kullanılır. İçeride `Canvas` bileşeni `shadows="percentage"`, `frameloop`, `dpr`, `camera`, `className` props'larını alır. WebGL bağlamı `alpha: true`, `powerPreference: 'high-performance'`, `failIfMajorPerformanceCaveat: false` seçenekleriyle yapılandırılır. `onCreated` callback'inde sRGB çıktı ve ACESFilmic ton mapping tek bir merkezi noktadan ayarlanır (C2 standardı); ACES'in sahneyi koyulaştırma etkisini telafi etmek için `toneMappingExposure` 1.35 değerine sabitlenir (standart §C2 aralığı: 1.3–1.5; önceki varsayılan 1.0 sahnenin kök karanlık olmasına sebep oluyordu). Canvas içinde sırasıyla `ContextLossRecovery`, `SceneLightingRig` ve `TenantSceneProvider` bileşenleri render edilir; `children` en iç katmanda `TenantSceneProvider` tarafından sarılır.

**Parametreler**:
- children: React.ReactNode — Canvas içinde render edilecek alt bileşenler. `TenantSceneProvider` tarafından sarılarak tenant bağlamı sağlanır.
- preset: string — Ortam ön ayarı anahtarı. Varsayılan değeri `'product'`. `environment` parametresi verilmediğinde `PRESET_ENV` haritasından bu değerle eşleştirilen ortam anahtarı kullanılır.
- environment: string | undefined — Açıkça belirtilen ortam anahtarı. Verilmezse `preset` üzerinden çözümlenir.
- tenantId: string | undefined — Kiracı tanımlayıcısı. Verilmezse `DEFAULT_TENANT_ID` sabiti kullanılır.
- frameloop: VentHubCanvasProps'tan türü türetilir — Canvas'ın çerçeve döngüsü modu. Varsayılan değeri `'demand'`.
- camera: VentHubCanvasProps'tan türü türetilir — Three.js kamera yapılandırması. Doğrudan `Canvas` bileşeninin `camera` prop'una aktarılır.
- dprCap: VentHubCanvasProps'tan türü türetilir — Cihaz piksel oranı (device pixel ratio) üst sınırı. `useDeviceDpr` hook'u tarafından `dpr` hesaplamasında kullanılır.
- className: VentHubCanvasProps'tan türü türetilir — Canvas bileşenine uygulanacak CSS sınıf adı.
- fallback: React.ReactNode — `ResilientCanvasBoundary` hata yakalama sınırı çöktüğünde gösterilecek yedek bileşen. Verilmezse `<Static3DFallback />` kullanılır.

**Dönüş**: JSX.Element — Katmanlı hata yakalama sınırları, WebGL Canvas, sahne ışıklandırması, tenant bağlamı ve alt bileşenlerden oluşan bir React bileşen ağacı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ./ContextLossRecovery::ContextLossRecovery
- import: ./ResilientCanvasBoundary::ResilientCanvasBoundary
- import: ./ResilientCanvasBoundary::Static3DFallback
- import: ./SceneLightingRig::SceneLightingRig
- import: ./SceneLightingRig::type EnvPresetKey
- import: ./tenantScene::TenantSceneProvider
- import: ./useDeviceDpr::type DprCap
- import: ./useDeviceDpr::useDeviceDpr
- import: @/utils/tenantConstants::DEFAULT_TENANT_ID
- import: @react-three/fiber::Canvas
- import: react::React
- import: three::ACESFilmicToneMapping
- import: three::SRGBColorSpace

---

## INTERFACES

### VentHubCanvasProps
- `children: React.ReactNode`
- `preset?: 'product' | 'showcase' | 'nav' | 'authority'`
- `environment?: EnvPresetKey`
- `tenantId?: string`
- `frameloop?: CanvasProps['frameloop']`
- `camera?: CanvasProps['camera']`
- `dprCap?: Partial<DprCap>`
- `className?: string`
- `fallback?: React.ReactNode`

---

## TYPE ALIASES

### CanvasProps
```typescript
type CanvasProps = React.ComponentProps<typeof Canvas>
```

---

## SABİTLER
- **PRESET_ENV** (object) — `{
  product: 'product',
  showcase: 'showcase',
  nav: 'nav',
  authority...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/3d/core/VentHubCanvas.tsx::VentHubCanvas
- **params**:
  - `children` — Canvas içine yerleştirilecek alt bileşenler (React node)
  - `preset` — Ortam ön ayarı anahtarı, varsayılan değeri `'product'`; `PRESET_ENV` objesinde indeks olarak kullanılır
  - `environment` — Ortam anahtarı; verilmezse `PRESET_ENV[preset]` ile çözümlenir
  - `tenantId` — Kiracı kimliği; verilmezse `DEFAULT_TENANT_ID` kullanılır
  - `frameloop` — Canvas kare döngüsü modu, varsayılan değeri `'demand'`
  - `camera` — Three.js kamera yapılandırması
  - `dprCap` — Cihaz piksel oranı üst sınırı; `useDeviceDpr` hook'una iletilir
  - `className` — Canvas kapsayıcısına uygulanacak CSS sınıfı
  - `fallback` — Canvas yüklenemezken gösterilecek yedek bileşen
- **ic_degiskenler**:
  - `dpr` — `useDeviceDpr(dprCap)` hook çağrısından dönen cihaz piksel oranı; Canvas'ın `dpr` prop'una atanır
  - `envKey` — `environment ?? PRESET_ENV[preset]` ifadesiyle çözümlenen ortam anahtarı; `environment` parametresi tanımlıysa onu kullanır, değilse `PRESET_ENV` objesinden `preset` anahtarıyla alınan değeri kullanır; `SceneLightingRig` bileşeninin `env` prop'una iletilir
  - `resolvedTenantId` — `tenantId ?? DEFAULT_TENANT_ID` ifadesiyle çözümlenen kiracı kimliği; `tenantId` parametresi tanımlıysa onu kullanır, değilse `DEFAULT_TENANT_ID` sabitini kullanır; `TenantSceneProvider` bileşeninin `tenantId` prop'una iletilir
  - `state` — `onCreated` callback parametresi; Canvas oluşturma anındaki durum nesnesi
  - `state.gl` — `state` nesnesinin WebGL renderer alanı
  - `state.gl.toneMapping` — Ton eşleme modu; `ACESFilmicToneMapping` sabitine atanır
  - `state.gl.outputColorSpace` — Çıktı renk alanı; `SRGBColorSpace` sabitine atanır
  - `state.gl.toneMappingExposure` — Ton eşleme pozlama değeri; `1.35` sabitine atanır (ACES'in sahneyi koyulaştırmasını telafi etmek için)
- **Dönüş**: JSX — `ResilientCanvasBoundary` ile sarılmış `Canvas` bileşeni; `fallback` prop'u verilmezse `<Static3DFallback />` kullanılır. Canvas içinde `ContextLossRecovery`, `SceneLightingRig` ve `TenantSceneProvider` bileşenleri yer alır; `children` `TenantSceneProvider` içine yerleştirilir.

---

## NODE ID STANDARD

  file: src\components\products\3d\core\VentHubCanvas.tsx
  function: src\components\products\3d\core\VentHubCanvas.tsx::VentHubCanvas

---

## DISA AKTARILANLAR (EXPORTS)
  export: VentHubCanvas
  export: VentHubCanvasProps

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